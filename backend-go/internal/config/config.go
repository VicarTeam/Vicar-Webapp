// Package config loads runtime configuration from the environment (and an
// optional .env file), matching the keys used by the legacy Bun backend.
package config

import (
	"os"
	"strings"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/x/mongo/driver/connstring"
)

type Config struct {
	Port                string
	MongoURI            string
	MongoDB             string
	DiscordClientID     string
	DiscordClientSecret string
	DiscordRedirectURI  string
	FrontendURL         string
	BackendURL          string
	JWTSecret           string
	CDNDir              string
	DevMode             bool

	// DBMode selects the storage backend during the Mongo→Postgres transition:
	// mongo_only | dual_write_mongo_primary | dual_write_pg_primary | pg_only.
	DBMode      string
	PostgresURL string
}

// Load reads configuration. A .env in the working directory is loaded if present
// (it never overrides already-set environment variables).
func Load() (*Config, error) {
	_ = godotenv.Load()

	c := &Config{
		Port:                env("PORT", "6660"),
		MongoURI:            os.Getenv("MONGO_URI"),
		MongoDB:             os.Getenv("MONGO_DB"),
		DiscordClientID:     os.Getenv("DISCORD_CLIENT_ID"),
		DiscordClientSecret: os.Getenv("DISCORD_CLIENT_SECRET"),
		DiscordRedirectURI:  os.Getenv("DISCORD_REDIRECT_URI"),
		FrontendURL:         os.Getenv("FRONTEND_URL"),
		BackendURL:          os.Getenv("BACKEND_URL"),
		// Same fallback secret as the legacy backend so existing sessions stay valid.
		JWTSecret:   env("JWT_SECRET", "82FD43545DE86D765DC9286B419CF"),
		CDNDir:      env("CDN_DIR", "./cdn-data"),
		DevMode:     os.Getenv("DEV_MODE") == "true" || os.Getenv("NODE_ENV") == "development",
		DBMode:      env("DB_MODE", "mongo_only"),
		PostgresURL: env("POSTGRES_URL", os.Getenv("DATABASE_URL")),
	}

	// Derive the database name from the connection string if not given explicitly
	// (Mongoose connects to the DB embedded in MONGO_URI).
	if c.MongoDB == "" && c.MongoURI != "" {
		if cs, err := connstring.ParseAndValidate(c.MongoURI); err == nil && cs.Database != "" {
			c.MongoDB = cs.Database
		}
	}
	if c.MongoDB == "" {
		c.MongoDB = "test"
	}

	return c, nil
}

func env(key, fallback string) string {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		return v
	}
	return fallback
}
