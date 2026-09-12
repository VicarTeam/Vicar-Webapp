// Package httpapi wires the HTTP routes, reproducing the legacy Bun/Express
// surface 1:1 (including the /+/api dual-mount for the Coolify proxy quirk).
package httpapi

import (
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/VicarTeam/vicar-backend/internal/auth"
	"github.com/VicarTeam/vicar-backend/internal/config"
	"github.com/VicarTeam/vicar-backend/internal/discord"
	"github.com/VicarTeam/vicar-backend/internal/storage"
	"github.com/go-chi/chi/v5"
)

type Server struct {
	cfg      *config.Config
	store    storage.Provider
	auth     *auth.Service
	discord  *discord.Client
	realtime http.Handler
	preAuth  *preAuthCache
}

func New(cfg *config.Config, store storage.Provider, authSvc *auth.Service, dc *discord.Client, realtime http.Handler) *Server {
	return &Server{
		cfg:      cfg,
		store:    store,
		auth:     authSvc,
		discord:  dc,
		realtime: realtime,
		preAuth:  newPreAuthCache(),
	}
}

// Handler builds the full router with the /+/api dual-mount.
func (s *Server) Handler() http.Handler {
	api := chi.NewRouter()
	api.Use(corsMiddleware)
	api.Use(corpMiddleware)

	api.Get("/health", func(w http.ResponseWriter, _ *http.Request) { text(w, http.StatusOK, "ok") })

	// Public routes (no auth), registered before the auth guard.
	s.mountAuth(api)
	s.mountData(api)
	s.mountDarkborne(api)
	s.mountCdnStatic(api)

	// Realtime (socket.io): FoundryVTT bridge + GM fx. Authenticates via its own
	// `authenticate` event / fvttToken handshake, so it sits outside the HTTP guard.
	if s.realtime != nil {
		api.Handle("/socket.io/*", s.realtime)
	}

	// Everything else requires a valid Bearer access token.
	api.Group(func(r chi.Router) {
		r.Use(s.auth.Middleware)
		s.mountCharacters(r)
		s.mountDarkborneCharacters(r)
		s.mountUsers(r)
		s.mountSkillTrees(r)
		s.mountFolders(r)
		s.mountCdnUpload(r)
		s.mountAdmin(r)
	})

	return dualMount(api)
}

// dualMount serves the same handler under both "/" and "/api" (Coolify strips
// the /api prefix inconsistently).
func dualMount(api http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/api" || strings.HasPrefix(r.URL.Path, "/api/") {
			r2 := r.Clone(r.Context())
			r2.URL.Path = strings.TrimPrefix(r.URL.Path, "/api")
			if r2.URL.Path == "" {
				r2.URL.Path = "/"
			}
			api.ServeHTTP(w, r2)
			return
		}
		api.ServeHTTP(w, r)
	})
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Authorization,Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// corpMiddleware mirrors helmet's crossOriginResourcePolicy: cross-origin.
func corpMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Cross-Origin-Resource-Policy", "cross-origin")
		next.ServeHTTP(w, r)
	})
}

// preAuthCache stores the post-login redirect target keyed by OAuth state.
type preAuthCache struct {
	mu    sync.Mutex
	items map[string]preAuthItem
}

type preAuthItem struct {
	value   string
	expires time.Time
}

func newPreAuthCache() *preAuthCache {
	return &preAuthCache{items: make(map[string]preAuthItem)}
}

func (c *preAuthCache) store(key, value string, ttl time.Duration) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.items[key] = preAuthItem{value: value, expires: time.Now().Add(ttl)}
}

func (c *preAuthCache) take(key string) (string, bool) {
	c.mu.Lock()
	defer c.mu.Unlock()
	it, ok := c.items[key]
	if !ok {
		return "", false
	}
	delete(c.items, key)
	if time.Now().After(it.expires) {
		return "", false
	}
	return it.value, true
}
