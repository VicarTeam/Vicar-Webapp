package auth

import (
	"context"
	"net/http"
	"strings"

	"github.com/VicarTeam/vicar-backend/internal/models"
)

type ctxKey int

const (
	userKey ctxKey = iota
	userIDKey
)

// Middleware requires a valid Bearer access token and injects the user into the
// request context. Matches the legacy global auth guard (401 "Unauthorized").
func (s *Service) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authz := r.Header.Get("Authorization")
		if authz == "" {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		token := strings.TrimPrefix(authz, "Bearer ")
		user := s.Authenticated(r.Context(), token)
		if user == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		ctx := context.WithValue(r.Context(), userKey, user)
		ctx = context.WithValue(ctx, userIDKey, user.IDHex())
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// CurrentUser returns the authenticated user from the request context.
func CurrentUser(r *http.Request) *models.User {
	u, _ := r.Context().Value(userKey).(*models.User)
	return u
}

// UserID returns the authenticated user's id (hex) from the request context.
func UserID(r *http.Request) string {
	id, _ := r.Context().Value(userIDKey).(string)
	return id
}
