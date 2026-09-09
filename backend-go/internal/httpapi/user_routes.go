package httpapi

import (
	"net/http"
	"strings"

	"github.com/VicarTeam/vicar-backend/internal/auth"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

func (s *Server) mountUsers(r chi.Router) {
	r.Get("/users/@me", s.getMe)
	r.Patch("/users/@me/password", s.changePassword)
	r.Get("/users/@me/fvtt-token", s.getFvttToken)
	r.Post("/users/@me/fvtt-token", s.createFvttToken)
	r.Delete("/users/@me/fvtt-token", s.deleteFvttToken)
	r.Get("/users/@me/agent-token", s.getAgentToken)
	r.Post("/users/@me/agent-token", s.createAgentToken)
	r.Delete("/users/@me/agent-token", s.deleteAgentToken)
}

func (s *Server) getMe(w http.ResponseWriter, r *http.Request) {
	u := auth.CurrentUser(r)
	if u == nil {
		text(w, http.StatusNotFound, "Not found")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"id":       u.IDHex(),
		"username": u.Username,
		"isAdmin":  u.IsAdmin,
	})
}

func (s *Server) changePassword(w http.ResponseWriter, r *http.Request) {
	userID := auth.UserID(r)
	var body struct {
		Password    string `json:"password"`
		OldPassword string `json:"oldPassword"`
	}
	if err := readJSON(w, r, &body); err != nil {
		text(w, http.StatusBadRequest, "Password invalid")
		return
	}
	if len(body.Password) < 6 {
		text(w, http.StatusBadRequest, "Password invalid")
		return
	}
	ok, err := s.auth.SetUserPassword(r.Context(), userID, body.Password, body.OldPassword)
	if err != nil || !ok {
		text(w, http.StatusBadRequest, "Failed to set password")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) getFvttToken(w http.ResponseWriter, r *http.Request) {
	u, err := s.store.Users().FindByID(r.Context(), auth.UserID(r))
	if err != nil {
		text(w, http.StatusNotFound, "Not found")
		return
	}
	var tok any
	if u.FvttToken != "" {
		tok = u.FvttToken
	}
	writeJSON(w, http.StatusOK, map[string]any{"token": tok})
}

func (s *Server) createFvttToken(w http.ResponseWriter, r *http.Request) {
	u, err := s.store.Users().FindByID(r.Context(), auth.UserID(r))
	if err != nil {
		text(w, http.StatusNotFound, "Not found")
		return
	}
	u.FvttToken = strings.ReplaceAll(uuid.NewString()+uuid.NewString(), "-", "")
	if err := s.store.Users().Update(r.Context(), u); err != nil {
		text(w, http.StatusInternalServerError, "error")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"token": u.FvttToken})
}

func (s *Server) deleteFvttToken(w http.ResponseWriter, r *http.Request) {
	u, err := s.store.Users().FindByID(r.Context(), auth.UserID(r))
	if err != nil {
		text(w, http.StatusNotFound, "Not found")
		return
	}
	u.FvttToken = ""
	if err := s.store.Users().Update(r.Context(), u); err != nil {
		text(w, http.StatusInternalServerError, "error")
		return
	}
	ok(w)
}

func (s *Server) getAgentToken(w http.ResponseWriter, r *http.Request) {
	u, err := s.store.Users().FindByID(r.Context(), auth.UserID(r))
	if err != nil {
		text(w, http.StatusNotFound, "Not found")
		return
	}
	var tok any
	if u.AgentToken != "" {
		tok = u.AgentToken
	}
	writeJSON(w, http.StatusOK, map[string]any{"token": tok})
}

func (s *Server) createAgentToken(w http.ResponseWriter, r *http.Request) {
	u, err := s.store.Users().FindByID(r.Context(), auth.UserID(r))
	if err != nil {
		text(w, http.StatusNotFound, "Not found")
		return
	}
	u.AgentToken = strings.ReplaceAll(uuid.NewString()+uuid.NewString(), "-", "")
	if err := s.store.Users().Update(r.Context(), u); err != nil {
		text(w, http.StatusInternalServerError, "error")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"token": u.AgentToken})
}

func (s *Server) deleteAgentToken(w http.ResponseWriter, r *http.Request) {
	u, err := s.store.Users().FindByID(r.Context(), auth.UserID(r))
	if err != nil {
		text(w, http.StatusNotFound, "Not found")
		return
	}
	u.AgentToken = ""
	if err := s.store.Users().Update(r.Context(), u); err != nil {
		text(w, http.StatusInternalServerError, "error")
		return
	}
	ok(w)
}
