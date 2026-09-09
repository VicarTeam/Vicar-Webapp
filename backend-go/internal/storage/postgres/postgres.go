// Package postgres implements the storage interfaces against PostgreSQL using
// sqlc-generated queries (pgx/v5). The hybrid model keeps the full sheet in a
// `data jsonb` column; queryable summary fields are GENERATED columns.
package postgres

import (
	"context"
	_ "embed"
	"encoding/json"
	"time"

	"errors"
	"github.com/VicarTeam/vicar-backend/internal/storage"
	"github.com/VicarTeam/vicar-backend/internal/storage/postgres/gen"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

//go:embed sql/schema.sql
var schemaSQL string

//go:embed sql/folders.sql
var foldersSQL string

//go:embed sql/users_agent_token.sql
var usersAgentTokenSQL string

// Store is the PostgreSQL-backed storage.Provider.
type Store struct {
	pool *pgxpool.Pool
	q    *gen.Queries

	users         *userStore
	refreshTokens *refreshTokenStore
	characters    *characterStore
	skillTrees    *skillTreeStore
	folders       *folderStore
}

// Connect dials Postgres, applies the schema once, and returns a ready Store.
func Connect(ctx context.Context, url string) (*Store, error) {
	ctx, cancel := context.WithTimeout(ctx, 15*time.Second)
	defer cancel()

	pool, err := pgxpool.New(ctx, url)
	if err != nil {
		return nil, err
	}
	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, err
	}
	if err := migrate(ctx, pool); err != nil {
		pool.Close()
		return nil, err
	}

	q := gen.New(pool)
	s := &Store{pool: pool, q: q}
	s.users = &userStore{q: q}
	s.refreshTokens = &refreshTokenStore{q: q}
	s.characters = &characterStore{q: q}
	s.skillTrees = &skillTreeStore{q: q}
	s.folders = &folderStore{q: q}
	return s, nil
}

func (s *Store) Users() storage.UserStore                 { return s.users }
func (s *Store) RefreshTokens() storage.RefreshTokenStore { return s.refreshTokens }
func (s *Store) Characters() storage.CharacterStore       { return s.characters }
func (s *Store) SkillTrees() storage.SkillTreeStore       { return s.skillTrees }
func (s *Store) Folders() storage.FolderStore             { return s.folders }

func (s *Store) Close(context.Context) error { s.pool.Close(); return nil }

// migrate applies each versioned migration step exactly once, tracked in
// schema_migrations. Steps are ordered and idempotent per version, so adding a
// new one (e.g. the folders table) upgrades existing databases in place.
func migrate(ctx context.Context, pool *pgxpool.Pool) error {
	if _, err := pool.Exec(ctx, `CREATE TABLE IF NOT EXISTS schema_migrations (version text PRIMARY KEY)`); err != nil {
		return err
	}
	steps := []struct {
		version string
		sql     string
	}{
		{"0001", schemaSQL},
		{"0002", foldersSQL},
		{"0003", usersAgentTokenSQL},
	}
	for _, step := range steps {
		if err := applyMigration(ctx, pool, step.version, step.sql); err != nil {
			return err
		}
	}
	return nil
}

func applyMigration(ctx context.Context, pool *pgxpool.Pool, version, sql string) error {
	var exists bool
	if err := pool.QueryRow(ctx, `SELECT EXISTS (SELECT 1 FROM schema_migrations WHERE version = $1)`, version).Scan(&exists); err != nil {
		return err
	}
	if exists {
		return nil
	}
	tx, err := pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	if _, err := tx.Exec(ctx, sql); err != nil {
		return err
	}
	if _, err := tx.Exec(ctx, `INSERT INTO schema_migrations (version) VALUES ($1)`, version); err != nil {
		return err
	}
	return tx.Commit(ctx)
}

// ---- conversion helpers ----

func jsonFromBson(m bson.M) json.RawMessage {
	if m == nil {
		return json.RawMessage("{}")
	}
	b, err := json.Marshal(m)
	if err != nil || len(b) == 0 {
		return json.RawMessage("{}")
	}
	return b
}

func bsonFromJSON(raw json.RawMessage) bson.M {
	if len(raw) == 0 {
		return bson.M{}
	}
	var m bson.M
	if err := json.Unmarshal(raw, &m); err != nil || m == nil {
		return bson.M{}
	}
	return m
}

func tsFromPtr(t *time.Time) pgtype.Timestamptz {
	if t == nil {
		return pgtype.Timestamptz{Valid: false}
	}
	return pgtype.Timestamptz{Time: *t, Valid: true}
}

func pgTs(t time.Time) pgtype.Timestamptz {
	return pgtype.Timestamptz{Time: t, Valid: true}
}

func ptrFromTs(ts pgtype.Timestamptz) *time.Time {
	if !ts.Valid {
		return nil
	}
	t := ts.Time
	return &t
}

// oid parses a hex id back into an ObjectID (all ids are ObjectId hex strings,
// shared with MongoDB).
func oid(hex string) primitive.ObjectID {
	o, _ := primitive.ObjectIDFromHex(hex)
	return o
}

// notFound reports whether err is pgx's no-rows error.
func notFound(err error) bool {
	return errors.Is(err, pgx.ErrNoRows)
}
