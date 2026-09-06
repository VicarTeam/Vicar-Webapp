// Command sweep bulk-migrates legacy characters from MongoDB to PostgreSQL
// (the "auto extract" bulk path for split mode). It moves each Mongo character
// into Postgres and removes it from Mongo. Idempotent and resumable.
//
// Usage:
//
//	sweep [-user <ownerId>] [-dry-run]
package main

import (
	"context"
	"flag"
	"log"

	"github.com/VicarTeam/vicar-backend/internal/config"
	"github.com/VicarTeam/vicar-backend/internal/storage/mongostore"
	"github.com/VicarTeam/vicar-backend/internal/storage/postgres"
	"github.com/VicarTeam/vicar-backend/internal/storage/splitstore"
)

func main() {
	owner := flag.String("user", "", "migrate only this owner's characters (default: everyone)")
	dryRun := flag.Bool("dry-run", false, "list what would be migrated without changing anything")
	flag.Parse()

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config: %v", err)
	}
	if cfg.MongoURI == "" || cfg.PostgresURL == "" {
		log.Fatal("both MONGO_URI and POSTGRES_URL are required")
	}

	ctx := context.Background()
	mongo, err := mongostore.Connect(ctx, cfg.MongoURI, cfg.MongoDB)
	if err != nil {
		log.Fatalf("mongo: %v", err)
	}
	defer mongo.Close(ctx)
	pg, err := postgres.Connect(ctx, cfg.PostgresURL)
	if err != nil {
		log.Fatalf("postgres: %v", err)
	}
	defer pg.Close(ctx)

	split := splitstore.New(mongo, pg)

	ids, err := split.LegacyCharacterIDs(ctx, *owner)
	if err != nil {
		log.Fatalf("list legacy characters: %v", err)
	}
	log.Printf("legacy characters to migrate: %d", len(ids))

	if *dryRun {
		for _, id := range ids {
			log.Printf("[dry-run] would migrate %s", id)
		}
		log.Print("dry-run complete")
		return
	}

	migrated, failed := 0, 0
	for _, id := range ids {
		if err := split.MigrateCharacter(ctx, id); err != nil {
			log.Printf("migrate %s FAILED: %v", id, err)
			failed++
			continue
		}
		migrated++
		if migrated%50 == 0 {
			log.Printf("migrated %d/%d …", migrated, len(ids))
		}
	}
	log.Printf("done: %d migrated, %d failed", migrated, failed)
}
