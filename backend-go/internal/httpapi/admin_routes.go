package httpapi

import (
	"net/http"
	"strings"

	"github.com/VicarTeam/vicar-backend/internal/auth"
	"github.com/go-chi/chi/v5"
	"go.mongodb.org/mongo-driver/bson"
)

func (s *Server) mountAdmin(r chi.Router) {
	r.Route("/admin", func(ar chi.Router) {
		ar.Use(s.requireAdmin)
		ar.Get("/users", s.adminListUsers)
		ar.Patch("/users/{id}", s.adminUpdateUser)
		ar.Delete("/users/{id}", s.adminDeleteUser)
		ar.Get("/users/{id}/characters", s.adminUserCharacters)
		ar.Get("/characters/{id}", s.adminGetCharacter)
		ar.Put("/characters/{id}", s.adminUpdateCharacter)
		ar.Delete("/characters/{id}", s.adminDeleteCharacter)
	})
}

func (s *Server) requireAdmin(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		u := auth.CurrentUser(r)
		if u == nil || !u.IsAdmin {
			text(w, http.StatusForbidden, "Forbidden")
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (s *Server) adminListUsers(w http.ResponseWriter, r *http.Request) {
	users, err := s.store.Users().All(r.Context())
	if err != nil {
		text(w, http.StatusInternalServerError, "error")
		return
	}
	out := make([]map[string]any, 0, len(users))
	for i := range users {
		count, _ := s.store.Characters().CountByUser(r.Context(), users[i].IDHex())
		out = append(out, map[string]any{
			"id":             users[i].IDHex(),
			"username":       users[i].Username,
			"discordId":      users[i].DiscordID,
			"isAdmin":        users[i].IsAdmin,
			"characterCount": count,
		})
	}
	writeJSON(w, http.StatusOK, out)
}

func (s *Server) adminUpdateUser(w http.ResponseWriter, r *http.Request) {
	user, err := s.store.Users().FindByID(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		text(w, http.StatusNotFound, "Not found")
		return
	}
	var body struct {
		IsAdmin  *bool   `json:"isAdmin"`
		Username *string `json:"username"`
	}
	if err := readJSON(w, r, &body); err != nil {
		text(w, http.StatusBadRequest, "Invalid body")
		return
	}
	if body.IsAdmin != nil {
		user.IsAdmin = *body.IsAdmin
	}
	if body.Username != nil && strings.TrimSpace(*body.Username) != "" {
		user.Username = strings.TrimSpace(*body.Username)
	}
	if err := s.store.Users().Update(r.Context(), user); err != nil {
		text(w, http.StatusInternalServerError, "error")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"id":       user.IDHex(),
		"username": user.Username,
		"isAdmin":  user.IsAdmin,
	})
}

func (s *Server) adminDeleteUser(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	user, err := s.store.Users().FindByID(r.Context(), id)
	if err != nil {
		text(w, http.StatusNotFound, "Not found")
		return
	}
	_ = s.store.Characters().DeleteByUser(r.Context(), user.IDHex())
	_ = s.store.RefreshTokens().DeleteByUser(r.Context(), user.IDHex())
	_ = s.store.Users().Delete(r.Context(), user.IDHex())
	ok(w)
}

func (s *Server) adminUserCharacters(w http.ResponseWriter, r *http.Request) {
	chars, err := s.store.Characters().OwnedMini(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		text(w, http.StatusInternalServerError, "error")
		return
	}
	out := make([]map[string]any, 0, len(chars))
	for i := range chars {
		data := chars[i].Data
		out = append(out, map[string]any{
			"id":     chars[i].IDHex(),
			"name":   data["name"],
			"game":   data["game"],
			"avatar": data["avatar"],
		})
	}
	writeJSON(w, http.StatusOK, out)
}

func (s *Server) adminGetCharacter(w http.ResponseWriter, r *http.Request) {
	c, err := s.store.Characters().Get(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		text(w, http.StatusNotFound, "Not found")
		return
	}
	writeJSON(w, http.StatusOK, spread(c.Data, map[string]any{"id": c.IDHex(), "userId": c.UserID}))
}

func (s *Server) adminUpdateCharacter(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	c, err := s.store.Characters().Get(r.Context(), id)
	if err != nil {
		text(w, http.StatusNotFound, "Not found")
		return
	}
	var body bson.M
	if err := readJSON(w, r, &body); err != nil {
		text(w, http.StatusBadRequest, "Invalid character data")
		return
	}
	if _, ok := body["name"].(string); body == nil || !ok {
		text(w, http.StatusBadRequest, "Invalid character data")
		return
	}
	delete(body, "id")
	delete(body, "userId")
	if err := s.store.Characters().ReplaceData(r.Context(), c.IDHex(), body); err != nil {
		text(w, http.StatusInternalServerError, "error")
		return
	}
	ok(w)
}

func (s *Server) adminDeleteCharacter(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if _, err := s.store.Characters().Get(r.Context(), id); err != nil {
		text(w, http.StatusNotFound, "Not found")
		return
	}
	if err := s.store.Characters().Delete(r.Context(), id); err != nil {
		text(w, http.StatusInternalServerError, "error")
		return
	}
	ok(w)
}
