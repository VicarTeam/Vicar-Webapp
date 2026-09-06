// Command server is the Phase-0 Go backend: it reproduces the legacy Bun/Express
// HTTP surface 1:1 against the existing MongoDB. Realtime (FVTT bridge + fx) and
// Postgres arrive in later phases.
package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/VicarTeam/vicar-backend/internal/auth"
	"github.com/VicarTeam/vicar-backend/internal/config"
	"github.com/VicarTeam/vicar-backend/internal/discord"
	"github.com/VicarTeam/vicar-backend/internal/httpapi"
	"github.com/VicarTeam/vicar-backend/internal/realtime"
	"github.com/VicarTeam/vicar-backend/internal/storage"
	"github.com/VicarTeam/vicar-backend/internal/storage/dualstore"
	"github.com/VicarTeam/vicar-backend/internal/storage/mongostore"
	"github.com/VicarTeam/vicar-backend/internal/storage/postgres"
	"github.com/VicarTeam/vicar-backend/internal/storage/splitstore"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config: %v", err)
	}

	if err := os.MkdirAll(cfg.CDNDir, 0o755); err != nil {
		log.Fatalf("cdn dir: %v", err)
	}

	ctx := context.Background()
	store, err := buildStore(ctx, cfg)
	if err != nil {
		log.Fatalf("storage: %v", err)
	}

	authSvc := auth.NewService(cfg.JWTSecret, store.Users(), store.RefreshTokens())
	dc := discord.New(cfg.DiscordClientID, cfg.DiscordClientSecret, cfg.DiscordRedirectURI)
	hub := realtime.New(store, authSvc)
	srv := httpapi.New(cfg, store, authSvc, dc, hub.Handler())

	httpServer := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           srv.Handler(),
		ReadHeaderTimeout: 10 * time.Second,
	}

	go func() {
		log.Printf("Server is running on port %s", cfg.Port)
		if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %v", err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_ = httpServer.Shutdown(shutdownCtx)
	hub.Close()
	_ = store.Close(shutdownCtx)
	log.Println("Server stopped")
}

// buildStore wires the storage provider for the configured DB_MODE.
func buildStore(ctx context.Context, cfg *config.Config) (storage.Provider, error) {
	mode := cfg.DBMode
	needMongo := mode != "pg_only"
	needPG := mode != "mongo_only"

	var mongoStore *mongostore.Store
	var pgStore *postgres.Store
	var err error

	if needMongo {
		if cfg.MongoURI == "" {
			return nil, fmt.Errorf("MONGO_URI is required for DB_MODE=%s", mode)
		}
		if mongoStore, err = mongostore.Connect(ctx, cfg.MongoURI, cfg.MongoDB); err != nil {
			return nil, fmt.Errorf("mongo: %w", err)
		}
		log.Printf("Connected to MongoDB (db=%s)", cfg.MongoDB)
	}
	if needPG {
		if cfg.PostgresURL == "" {
			return nil, fmt.Errorf("POSTGRES_URL is required for DB_MODE=%s", mode)
		}
		if pgStore, err = postgres.Connect(ctx, cfg.PostgresURL); err != nil {
			return nil, fmt.Errorf("postgres: %w", err)
		}
		log.Print("Connected to PostgreSQL")
	}

	switch mode {
	case "mongo_only":
		log.Print("DB_MODE=mongo_only")
		return mongoStore, nil
	case "pg_only":
		log.Print("DB_MODE=pg_only")
		return pgStore, nil
	case "dual_write_mongo_primary":
		log.Print("DB_MODE=dual_write_mongo_primary (Mongo authoritative, Postgres shadow)")
		return dualstore.New(mongoStore, pgStore, dualstore.MongoPrimary), nil
	case "dual_write_pg_primary":
		log.Print("DB_MODE=dual_write_pg_primary (Postgres authoritative, Mongo fallback+backup)")
		return dualstore.New(mongoStore, pgStore, dualstore.PGPrimary), nil
	case "split":
		log.Print("DB_MODE=split (legacy characters on Mongo, new on Postgres; on-demand migration)")
		return splitstore.New(mongoStore, pgStore), nil
	default:
		return nil, fmt.Errorf("unknown DB_MODE %q", mode)
	}
}
