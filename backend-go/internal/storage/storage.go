// Package storage defines the persistence interfaces the HTTP layer depends on.
//
// Phase 0 ships a single MongoDB implementation (package mongostore). The
// interfaces exist so Phase 1 can add a Postgres implementation and a dual
// store that reads/writes both during a gradual, migration-free transition.
package storage

import (
	"context"
	"errors"
	"time"

	"github.com/VicarTeam/vicar-backend/internal/models"
	"go.mongodb.org/mongo-driver/bson"
)

// ErrNotFound is returned when a requested document does not exist (or an id is
// malformed, so handlers can uniformly answer 404).
var ErrNotFound = errors.New("storage: not found")

// ErrConflict signals a uniqueness violation (e.g. a taken skill-tree code).
var ErrConflict = errors.New("storage: conflict")

// Provider bundles every store so the server can hold one dependency.
type Provider interface {
	Users() UserStore
	RefreshTokens() RefreshTokenStore
	Characters() CharacterStore
	SkillTrees() SkillTreeStore
	Folders() FolderStore
	Close(ctx context.Context) error
}

// Migrator is implemented by providers that can move a legacy (Mongo) character
// to the new (Postgres) store on demand. Optional — the split store provides it.
type Migrator interface {
	// MigrateCharacter moves the character from the legacy store to the new one.
	// Idempotent: a no-op if the character is not in the legacy store.
	MigrateCharacter(ctx context.Context, id string) error
	// LegacyCharacterIDs returns the ids of characters still in the legacy store
	// (for a bulk sweep). Owner-scoped when ownerID is non-empty.
	LegacyCharacterIDs(ctx context.Context, ownerID string) ([]string, error)
}

type UserStore interface {
	FindByID(ctx context.Context, id string) (*models.User, error)
	FindByUsernameCI(ctx context.Context, username string) (*models.User, error)
	FindByUsername(ctx context.Context, username string) (*models.User, error)
	FindByDiscordID(ctx context.Context, discordID string) (*models.User, error)
	FindByFvttToken(ctx context.Context, token string) (*models.User, error)
	FindByIDs(ctx context.Context, ids []string) ([]models.User, error)
	All(ctx context.Context) ([]models.User, error)
	Create(ctx context.Context, u *models.User) error
	Update(ctx context.Context, u *models.User) error
	Delete(ctx context.Context, id string) error
}

type RefreshTokenStore interface {
	Create(ctx context.Context, t *models.RefreshToken) error
	FindByTokenAndUser(ctx context.Context, token, userID string) (*models.RefreshToken, error)
	FindActiveByToken(ctx context.Context, token string) (*models.RefreshToken, error)
	Update(ctx context.Context, t *models.RefreshToken) error
	RevokeByToken(ctx context.Context, token string) error
	DeleteByUser(ctx context.Context, userID string) error
	DeleteRevokedBefore(ctx context.Context, userID string, before time.Time) error
}

type CharacterStore interface {
	// OwnedSummaries / SharedSummaries return the projected card fields only.
	OwnedSummaries(ctx context.Context, userID string) ([]models.Character, error)
	SharedSummaries(ctx context.Context, userID string) ([]models.Character, error)
	// GetForRead returns the full document if the user owns it OR may view it.
	GetForRead(ctx context.Context, id, userID string) (*models.Character, error)
	// GetOwned returns the full document only if the user owns it.
	GetOwned(ctx context.Context, id, userID string) (*models.Character, error)
	// Get returns the document regardless of ownership (admin only).
	Get(ctx context.Context, id string) (*models.Character, error)
	Create(ctx context.Context, userID string, data bson.M) (string, error)
	// Insert stores a character with a caller-supplied id (used by the dual store
	// to keep the same id in both databases, and for lazy backfill). Idempotent.
	Insert(ctx context.Context, c *models.Character) error
	ReplaceData(ctx context.Context, id string, data bson.M) error
	Save(ctx context.Context, c *models.Character) error
	Delete(ctx context.Context, id string) error
	CountByUser(ctx context.Context, userID string) (int64, error)
	DeleteByUser(ctx context.Context, userID string) error
	// OwnedMini returns {name, game, avatar} projections for the admin panel.
	OwnedMini(ctx context.Context, userID string) ([]models.Character, error)
}

type SkillTreeStore interface {
	FindByUser(ctx context.Context, userID string) ([]models.SkillTree, error)
	FindByCode(ctx context.Context, code string) (*models.SkillTree, error)
	FindByCodeExcluding(ctx context.Context, code, excludeID string) (*models.SkillTree, error)
	GetOwned(ctx context.Context, id, userID string) (*models.SkillTree, error)
	Create(ctx context.Context, t *models.SkillTree) (string, error)
	Save(ctx context.Context, t *models.SkillTree) error
	Delete(ctx context.Context, id string) error
}

type FolderStore interface {
	FindByUser(ctx context.Context, userID string) ([]models.Folder, error)
	GetOwned(ctx context.Context, id, userID string) (*models.Folder, error)
	Create(ctx context.Context, f *models.Folder) (string, error)
	Save(ctx context.Context, f *models.Folder) error
	Delete(ctx context.Context, id string) error
}
