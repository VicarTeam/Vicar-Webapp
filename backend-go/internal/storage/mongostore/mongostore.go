// Package mongostore implements the storage interfaces against the existing
// MongoDB, using the exact collection names Mongoose produced.
package mongostore

import (
	"context"
	"time"

	"github.com/VicarTeam/vicar-backend/internal/storage"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Store is the MongoDB-backed storage.Provider.
type Store struct {
	client *mongo.Client
	db     *mongo.Database

	users         *userStore
	refreshTokens *refreshTokenStore
	characters    *characterStore
	skillTrees    *skillTreeStore
	folders       *folderStore
}

// Connect dials MongoDB and returns a ready Store.
func Connect(ctx context.Context, uri, dbName string) (*Store, error) {
	ctx, cancel := context.WithTimeout(ctx, 15*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		return nil, err
	}
	if err := client.Ping(ctx, nil); err != nil {
		return nil, err
	}

	db := client.Database(dbName)
	s := &Store{client: client, db: db}
	// Mongoose pluralises+lowercases model names.
	s.users = &userStore{col: db.Collection("users")}
	s.refreshTokens = &refreshTokenStore{col: db.Collection("refreshtokens")}
	s.characters = &characterStore{col: db.Collection("characters")}
	s.skillTrees = &skillTreeStore{col: db.Collection("skilltrees")}
	s.folders = &folderStore{col: db.Collection("folders")}
	return s, nil
}

func (s *Store) Users() storage.UserStore                 { return s.users }
func (s *Store) RefreshTokens() storage.RefreshTokenStore { return s.refreshTokens }
func (s *Store) Characters() storage.CharacterStore       { return s.characters }
func (s *Store) SkillTrees() storage.SkillTreeStore       { return s.skillTrees }
func (s *Store) Folders() storage.FolderStore             { return s.folders }

func (s *Store) Close(ctx context.Context) error { return s.client.Disconnect(ctx) }

// oid parses a hex id, mapping malformed ids to ErrNotFound so handlers answer
// 404 instead of 500 (matches the legacy isValidObjectId guard).
func oid(id string) (primitive.ObjectID, error) {
	o, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return primitive.NilObjectID, storage.ErrNotFound
	}
	return o, nil
}
