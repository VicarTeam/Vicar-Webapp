// Package models holds the persisted domain entities. They mirror the legacy
// Mongoose schemas 1:1 so the Go backend can talk to the existing MongoDB, while
// staying storage-agnostic enough for the upcoming Postgres implementation.
package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// User mirrors the Mongoose "users" collection.
type User struct {
	ID                 primitive.ObjectID `bson:"_id,omitempty"`
	DiscordID          string             `bson:"discordId"`
	Username           string             `bson:"username"`
	Password           string             `bson:"password,omitempty"`
	ShortCode          string             `bson:"shortCode,omitempty"`
	InstalledHomebrew  bson.M             `bson:"installedHomebrew,omitempty"`
	CurrentAccessToken string             `bson:"currentAccessToken,omitempty"`
	IsAdmin            bool               `bson:"isAdmin"`
	FvttToken          string             `bson:"fvttToken,omitempty"`
}

// IDHex returns the hex representation used as `id` by the frontend.
func (u *User) IDHex() string { return u.ID.Hex() }

// RefreshToken mirrors the Mongoose "refreshtokens" collection.
type RefreshToken struct {
	ID              primitive.ObjectID `bson:"_id,omitempty"`
	UserID          string             `bson:"userId"`
	Token           string             `bson:"token"`
	IsRevoked       bool               `bson:"isRevoked"`
	ReplacedByToken string             `bson:"replacedByToken,omitempty"`
	RevokedAt       *time.Time         `bson:"revokedAt,omitempty"`
}

// IDHex returns the hex representation of the token's id.
func (t *RefreshToken) IDHex() string { return t.ID.Hex() }

// Character mirrors the Mongoose "characters" collection. Data is the schemaless
// sheet blob (kept verbatim during the Mongo→Postgres transition).
type Character struct {
	ID      primitive.ObjectID `bson:"_id,omitempty"`
	UserID  string             `bson:"userId"`
	Viewers []string           `bson:"viewers"`
	Data    bson.M             `bson:"data"`
	// Legacy is a transient flag (never persisted): set by the split store for
	// characters still living in MongoDB, so the API can tell the frontend which
	// characters can still be migrated to Postgres.
	Legacy bool `bson:"-"`
}

// IDHex returns the hex representation used as `id` by the frontend.
func (c *Character) IDHex() string { return c.ID.Hex() }

// SkillTree mirrors the Mongoose "skilltrees" collection.
type SkillTree struct {
	ID        primitive.ObjectID `bson:"_id,omitempty"`
	BonusCode string             `bson:"bonusCode"`
	UserID    string             `bson:"userId"`
	Data      bson.M             `bson:"data"`
}

// IDHex returns the hex representation used as `id` by the frontend.
func (s *SkillTree) IDHex() string { return s.ID.Hex() }

// Folder is a first-class, nestable character folder. Unlike the legacy
// `directory` string on the character sheet, a folder is its own entity: it
// carries a parent (for nesting), a sibling position (for free ordering) and
// the ordered ids of the characters it contains. Character sheets are never
// modified by this — the folder owns the membership.
type Folder struct {
	ID         primitive.ObjectID `bson:"_id,omitempty"`
	UserID     string             `bson:"userId"`
	Name       string             `bson:"name"`
	ParentID   string             `bson:"parentId"`
	Position   float64            `bson:"position"`
	Characters []string           `bson:"characters"`
}

// IDHex returns the hex representation used as `id` by the frontend.
func (f *Folder) IDHex() string { return f.ID.Hex() }
