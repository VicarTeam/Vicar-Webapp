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
