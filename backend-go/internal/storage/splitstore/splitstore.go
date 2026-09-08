// Package splitstore keeps legacy characters on MongoDB and brand-new ones on
// PostgreSQL, without dual-writing: each character lives in exactly one database.
// Reads check Postgres first, then Mongo; lists union both. New characters are
// created in Postgres; edits to an existing character go to whichever database
// it already lives in. A character can be migrated Mongo→Postgres on demand.
package splitstore

import (
	"context"
	"errors"
	"log"
	"time"

	"github.com/VicarTeam/vicar-backend/internal/models"
	"github.com/VicarTeam/vicar-backend/internal/storage"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Store struct {
	mongo storage.Provider // legacy
	pg    storage.Provider // new

	users   *splitUsers
	refresh *splitRefresh
	chars   *splitChars
	trees   *splitTrees
	folders *splitFolders
}

func New(mongo, pg storage.Provider) *Store {
	s := &Store{mongo: mongo, pg: pg}
	s.users = &splitUsers{s}
	s.refresh = &splitRefresh{s}
	s.chars = &splitChars{s}
	s.trees = &splitTrees{s}
	s.folders = &splitFolders{s}
	return s
}

func (s *Store) Users() storage.UserStore                 { return s.users }
func (s *Store) RefreshTokens() storage.RefreshTokenStore { return s.refresh }
func (s *Store) Characters() storage.CharacterStore       { return s.chars }
func (s *Store) SkillTrees() storage.SkillTreeStore       { return s.trees }
func (s *Store) Folders() storage.FolderStore             { return s.folders }

func (s *Store) Close(ctx context.Context) error {
	e1 := s.pg.Close(ctx)
	e2 := s.mongo.Close(ctx)
	if e1 != nil {
		return e1
	}
	return e2
}

// MigrateCharacter moves one character from Mongo to Postgres (idempotent).
func (s *Store) MigrateCharacter(ctx context.Context, id string) error {
	c, err := s.mongo.Characters().Get(ctx, id)
	if err != nil {
		if errors.Is(err, storage.ErrNotFound) {
			return nil // already migrated / not legacy
		}
		return err
	}
	if err := s.pg.Characters().Insert(ctx, c); err != nil {
		return err
	}
	return s.mongo.Characters().Delete(ctx, id)
}

// LegacyCharacterIDs lists character ids still in Mongo (optionally per owner).
func (s *Store) LegacyCharacterIDs(ctx context.Context, ownerID string) ([]string, error) {
	src, ok := s.mongo.Characters().(interface {
		AllIDs(ctx context.Context, ownerID string) ([]string, error)
	})
	if !ok {
		return nil, errors.New("splitstore: legacy store does not support AllIDs")
	}
	return src.AllIDs(ctx, ownerID)
}

func logErr(op string, err error) {
	if err != nil {
		log.Printf("splitstore: %s: %v", op, err)
	}
}

func isNotFound(err error) bool { return errors.Is(err, storage.ErrNotFound) }

// ============================== users ==============================

type splitUsers struct{ s *Store }

func (d *splitUsers) find(fn func(storage.UserStore) (*models.User, error)) (*models.User, error) {
	u, err := fn(d.s.pg.Users())
	if err == nil {
		return u, nil
	}
	if !isNotFound(err) {
		return nil, err
	}
	return fn(d.s.mongo.Users())
}

func (d *splitUsers) FindByID(ctx context.Context, id string) (*models.User, error) {
	return d.find(func(u storage.UserStore) (*models.User, error) { return u.FindByID(ctx, id) })
}
func (d *splitUsers) FindByUsernameCI(ctx context.Context, username string) (*models.User, error) {
	return d.find(func(u storage.UserStore) (*models.User, error) { return u.FindByUsernameCI(ctx, username) })
}
func (d *splitUsers) FindByUsername(ctx context.Context, username string) (*models.User, error) {
	return d.find(func(u storage.UserStore) (*models.User, error) { return u.FindByUsername(ctx, username) })
}
func (d *splitUsers) FindByDiscordID(ctx context.Context, discordID string) (*models.User, error) {
	return d.find(func(u storage.UserStore) (*models.User, error) { return u.FindByDiscordID(ctx, discordID) })
}
func (d *splitUsers) FindByFvttToken(ctx context.Context, token string) (*models.User, error) {
	return d.find(func(u storage.UserStore) (*models.User, error) { return u.FindByFvttToken(ctx, token) })
}

func (d *splitUsers) FindByIDs(ctx context.Context, ids []string) ([]models.User, error) {
	p, err := d.s.pg.Users().FindByIDs(ctx, ids)
	if err != nil {
		return nil, err
	}
	m, _ := d.s.mongo.Users().FindByIDs(ctx, ids)
	return mergeUsers(p, m), nil
}

func (d *splitUsers) All(ctx context.Context) ([]models.User, error) {
	p, err := d.s.pg.Users().All(ctx)
	if err != nil {
		return nil, err
	}
	m, _ := d.s.mongo.Users().All(ctx)
	return mergeUsers(p, m), nil
}

func (d *splitUsers) Create(ctx context.Context, u *models.User) error {
	return d.s.pg.Users().Create(ctx, u) // new users → Postgres
}

func (d *splitUsers) Update(ctx context.Context, u *models.User) error {
	if d.inPG(ctx, u.IDHex()) {
		return d.s.pg.Users().Update(ctx, u)
	}
	return d.s.mongo.Users().Update(ctx, u)
}

func (d *splitUsers) Delete(ctx context.Context, id string) error {
	logErr("pg user delete", d.s.pg.Users().Delete(ctx, id))
	logErr("mongo user delete", d.s.mongo.Users().Delete(ctx, id))
	return nil
}

func (d *splitUsers) inPG(ctx context.Context, id string) bool {
	_, err := d.s.pg.Users().FindByID(ctx, id)
	return err == nil
}

// ========================== refresh tokens ==========================

type splitRefresh struct{ s *Store }

func (d *splitRefresh) Create(ctx context.Context, t *models.RefreshToken) error {
	return d.s.pg.RefreshTokens().Create(ctx, t) // new sessions → Postgres
}

func (d *splitRefresh) FindByTokenAndUser(ctx context.Context, token, userID string) (*models.RefreshToken, error) {
	t, err := d.s.pg.RefreshTokens().FindByTokenAndUser(ctx, token, userID)
	if err == nil {
		return t, nil
	}
	if !isNotFound(err) {
		return nil, err
	}
	return d.s.mongo.RefreshTokens().FindByTokenAndUser(ctx, token, userID)
}

func (d *splitRefresh) FindActiveByToken(ctx context.Context, token string) (*models.RefreshToken, error) {
	t, err := d.s.pg.RefreshTokens().FindActiveByToken(ctx, token)
	if err == nil {
		return t, nil
	}
	if !isNotFound(err) {
		return nil, err
	}
	return d.s.mongo.RefreshTokens().FindActiveByToken(ctx, token)
}

// The remaining refresh writes are non-upserting UPDATE/DELETEs, so applying them
// to both stores is safe (a no-op wherever the row is absent).
func (d *splitRefresh) Update(ctx context.Context, t *models.RefreshToken) error {
	logErr("pg rt update", d.s.pg.RefreshTokens().Update(ctx, t))
	logErr("mongo rt update", d.s.mongo.RefreshTokens().Update(ctx, t))
	return nil
}
func (d *splitRefresh) RevokeByToken(ctx context.Context, token string) error {
	logErr("pg rt revoke", d.s.pg.RefreshTokens().RevokeByToken(ctx, token))
	logErr("mongo rt revoke", d.s.mongo.RefreshTokens().RevokeByToken(ctx, token))
	return nil
}
func (d *splitRefresh) DeleteByUser(ctx context.Context, userID string) error {
	logErr("pg rt delete", d.s.pg.RefreshTokens().DeleteByUser(ctx, userID))
	logErr("mongo rt delete", d.s.mongo.RefreshTokens().DeleteByUser(ctx, userID))
	return nil
}
func (d *splitRefresh) DeleteRevokedBefore(ctx context.Context, userID string, before time.Time) error {
	logErr("pg rt gc", d.s.pg.RefreshTokens().DeleteRevokedBefore(ctx, userID, before))
	logErr("mongo rt gc", d.s.mongo.RefreshTokens().DeleteRevokedBefore(ctx, userID, before))
	return nil
}

// ============================ characters ============================

type splitChars struct{ s *Store }

func (d *splitChars) origin(ctx context.Context, id string) storage.CharacterStore {
	if _, err := d.s.pg.Characters().Get(ctx, id); err == nil {
		return d.s.pg.Characters()
	}
	return d.s.mongo.Characters()
}

func (d *splitChars) get(fn func(storage.CharacterStore) (*models.Character, error)) (*models.Character, error) {
	c, err := fn(d.s.pg.Characters())
	if err == nil {
		return c, nil
	}
	if !isNotFound(err) {
		return nil, err
	}
	return fn(d.s.mongo.Characters())
}

func (d *splitChars) GetForRead(ctx context.Context, id, userID string) (*models.Character, error) {
	return d.get(func(c storage.CharacterStore) (*models.Character, error) { return c.GetForRead(ctx, id, userID) })
}
func (d *splitChars) GetOwned(ctx context.Context, id, userID string) (*models.Character, error) {
	return d.get(func(c storage.CharacterStore) (*models.Character, error) { return c.GetOwned(ctx, id, userID) })
}
func (d *splitChars) Get(ctx context.Context, id string) (*models.Character, error) {
	return d.get(func(c storage.CharacterStore) (*models.Character, error) { return c.Get(ctx, id) })
}

func (d *splitChars) OwnedSummaries(ctx context.Context, userID string) ([]models.Character, error) {
	p, err := d.s.pg.Characters().OwnedSummaries(ctx, userID)
	if err != nil {
		return nil, err
	}
	m, _ := d.s.mongo.Characters().OwnedSummaries(ctx, userID)
	return mergeChars(p, m), nil
}
func (d *splitChars) SharedSummaries(ctx context.Context, userID string) ([]models.Character, error) {
	p, err := d.s.pg.Characters().SharedSummaries(ctx, userID)
	if err != nil {
		return nil, err
	}
	m, _ := d.s.mongo.Characters().SharedSummaries(ctx, userID)
	return mergeChars(p, m), nil
}
func (d *splitChars) OwnedMini(ctx context.Context, userID string) ([]models.Character, error) {
	p, err := d.s.pg.Characters().OwnedMini(ctx, userID)
	if err != nil {
		return nil, err
	}
	m, _ := d.s.mongo.Characters().OwnedMini(ctx, userID)
	return mergeChars(p, m), nil
}

func (d *splitChars) Create(ctx context.Context, userID string, data bson.M) (string, error) {
	return d.s.pg.Characters().Create(ctx, userID, data) // new characters → Postgres
}

func (d *splitChars) Insert(ctx context.Context, c *models.Character) error {
	if c.ID.IsZero() {
		c.ID = primitive.NewObjectID()
	}
	return d.s.pg.Characters().Insert(ctx, c)
}

func (d *splitChars) ReplaceData(ctx context.Context, id string, data bson.M) error {
	return d.origin(ctx, id).ReplaceData(ctx, id, data)
}
func (d *splitChars) Save(ctx context.Context, c *models.Character) error {
	return d.origin(ctx, c.IDHex()).Save(ctx, c)
}
func (d *splitChars) Delete(ctx context.Context, id string) error {
	return d.origin(ctx, id).Delete(ctx, id)
}

func (d *splitChars) CountByUser(ctx context.Context, userID string) (int64, error) {
	p, err := d.s.pg.Characters().CountByUser(ctx, userID)
	if err != nil {
		return 0, err
	}
	m, _ := d.s.mongo.Characters().CountByUser(ctx, userID)
	return p + m, nil
}

func (d *splitChars) DeleteByUser(ctx context.Context, userID string) error {
	logErr("pg char delete-by-user", d.s.pg.Characters().DeleteByUser(ctx, userID))
	logErr("mongo char delete-by-user", d.s.mongo.Characters().DeleteByUser(ctx, userID))
	return nil
}

// ============================ skill trees ============================

type splitTrees struct{ s *Store }

func (d *splitTrees) FindByUser(ctx context.Context, userID string) ([]models.SkillTree, error) {
	p, err := d.s.pg.SkillTrees().FindByUser(ctx, userID)
	if err != nil {
		return nil, err
	}
	m, _ := d.s.mongo.SkillTrees().FindByUser(ctx, userID)
	return mergeTrees(p, m), nil
}

func (d *splitTrees) tree(fn func(storage.SkillTreeStore) (*models.SkillTree, error)) (*models.SkillTree, error) {
	t, err := fn(d.s.pg.SkillTrees())
	if err == nil {
		return t, nil
	}
	if !isNotFound(err) {
		return nil, err
	}
	return fn(d.s.mongo.SkillTrees())
}

func (d *splitTrees) FindByCode(ctx context.Context, code string) (*models.SkillTree, error) {
	return d.tree(func(t storage.SkillTreeStore) (*models.SkillTree, error) { return t.FindByCode(ctx, code) })
}
func (d *splitTrees) FindByCodeExcluding(ctx context.Context, code, excludeID string) (*models.SkillTree, error) {
	return d.tree(func(t storage.SkillTreeStore) (*models.SkillTree, error) {
		return t.FindByCodeExcluding(ctx, code, excludeID)
	})
}
func (d *splitTrees) GetOwned(ctx context.Context, id, userID string) (*models.SkillTree, error) {
	return d.tree(func(t storage.SkillTreeStore) (*models.SkillTree, error) { return t.GetOwned(ctx, id, userID) })
}

func (d *splitTrees) Create(ctx context.Context, t *models.SkillTree) (string, error) {
	return d.s.pg.SkillTrees().Create(ctx, t) // new trees → Postgres
}

func (d *splitTrees) Save(ctx context.Context, t *models.SkillTree) error {
	if _, err := d.s.pg.SkillTrees().GetOwned(ctx, t.IDHex(), t.UserID); err == nil {
		return d.s.pg.SkillTrees().Save(ctx, t)
	}
	return d.s.mongo.SkillTrees().Save(ctx, t)
}

func (d *splitTrees) Delete(ctx context.Context, id string) error {
	logErr("pg tree delete", d.s.pg.SkillTrees().Delete(ctx, id))
	logErr("mongo tree delete", d.s.mongo.SkillTrees().Delete(ctx, id))
	return nil
}

// ---- merge helpers (Postgres wins on id collision) ----

func mergeChars(primary, secondary []models.Character) []models.Character {
	seen := make(map[string]bool, len(primary))
	out := make([]models.Character, 0, len(primary)+len(secondary))
	for i := range primary {
		seen[primary[i].IDHex()] = true
		out = append(out, primary[i])
	}
	for i := range secondary {
		if !seen[secondary[i].IDHex()] {
			out = append(out, secondary[i])
		}
	}
	return out
}

func mergeTrees(primary, secondary []models.SkillTree) []models.SkillTree {
	seen := make(map[string]bool, len(primary))
	out := make([]models.SkillTree, 0, len(primary)+len(secondary))
	for i := range primary {
		seen[primary[i].IDHex()] = true
		out = append(out, primary[i])
	}
	for i := range secondary {
		if !seen[secondary[i].IDHex()] {
			out = append(out, secondary[i])
		}
	}
	return out
}

func mergeUsers(primary, secondary []models.User) []models.User {
	seen := make(map[string]bool, len(primary))
	out := make([]models.User, 0, len(primary)+len(secondary))
	for i := range primary {
		seen[primary[i].IDHex()] = true
		out = append(out, primary[i])
	}
	for i := range secondary {
		if !seen[secondary[i].IDHex()] {
			out = append(out, secondary[i])
		}
	}
	return out
}

// ============================ folders ============================
//
// Folders are a new feature with no legacy Mongo data, so they live entirely in
// Postgres regardless of a character's storage location.

type splitFolders struct{ s *Store }

func (d *splitFolders) FindByUser(ctx context.Context, userID string) ([]models.Folder, error) {
	return d.s.pg.Folders().FindByUser(ctx, userID)
}

func (d *splitFolders) GetOwned(ctx context.Context, id, userID string) (*models.Folder, error) {
	return d.s.pg.Folders().GetOwned(ctx, id, userID)
}

func (d *splitFolders) Create(ctx context.Context, f *models.Folder) (string, error) {
	return d.s.pg.Folders().Create(ctx, f)
}

func (d *splitFolders) Save(ctx context.Context, f *models.Folder) error {
	return d.s.pg.Folders().Save(ctx, f)
}

func (d *splitFolders) Delete(ctx context.Context, id string) error {
	return d.s.pg.Folders().Delete(ctx, id)
}
