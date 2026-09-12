package httpapi

import (
	"net/http"
	"strings"

	"github.com/VicarTeam/vicar-backend/internal/auth"
	"github.com/VicarTeam/vicar-backend/internal/darkborne"
	"github.com/VicarTeam/vicar-backend/internal/storage"
	"github.com/go-chi/chi/v5"
)

func (s *Server) mountDarkborne(r chi.Router) {
	r.Get("/darkborne/revision", s.getDarkborneRevision)
	r.Get("/darkborne/content", s.getDarkborneContent)
	r.Get("/darkborne/lexicon", s.getDarkborneLexicon)
}

func (s *Server) mountDarkborneCharacters(r chi.Router) {
	r.Get("/characters/{id}/darkborne", s.getDarkborneSheet)
}

func (s *Server) darkborneStore() storage.DarkborneStore {
	provider, ok := s.store.(storage.DarkborneProvider)
	if !ok {
		return nil
	}
	return provider.Darkborne()
}

func (s *Server) getDarkborneRevision(w http.ResponseWriter, r *http.Request) {
	store := s.darkborneStore()
	if store == nil {
		text(w, http.StatusServiceUnavailable, "Darkborne data requires the Postgres store")
		return
	}
	revision, err := store.Revision(r.Context())
	if err != nil {
		text(w, http.StatusInternalServerError, "error")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"revision": revision})
}

func (s *Server) getDarkborneContent(w http.ResponseWriter, r *http.Request) {
	store := s.darkborneStore()
	if store == nil {
		text(w, http.StatusServiceUnavailable, "Darkborne data requires the Postgres store")
		return
	}
	content, err := store.Content(r.Context())
	if err != nil {
		text(w, http.StatusInternalServerError, "error")
		return
	}
	etag := `"` + content.Revision + `"`
	if match := r.Header.Get("If-None-Match"); match != "" && strings.Contains(match, content.Revision) {
		w.Header().Set("ETag", etag)
		w.WriteHeader(http.StatusNotModified)
		return
	}
	w.Header().Set("ETag", etag)
	w.Header().Set("Cache-Control", "no-cache")
	writeJSON(w, http.StatusOK, content)
}

func (s *Server) getDarkborneLexicon(w http.ResponseWriter, r *http.Request) {
	store := s.darkborneStore()
	if store == nil {
		text(w, http.StatusServiceUnavailable, "Darkborne data requires the Postgres store")
		return
	}
	gameline := r.URL.Query().Get("gameline")
	if gameline == "" {
		gameline = darkborne.Gameline
	}
	entries, err := store.Lexicon(r.Context(), gameline)
	if err != nil {
		text(w, http.StatusInternalServerError, "error")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"gameline": gameline, "entries": entries})
}

func (s *Server) getDarkborneSheet(w http.ResponseWriter, r *http.Request) {
	store := s.darkborneStore()
	if store == nil {
		text(w, http.StatusServiceUnavailable, "Darkborne data requires the Postgres store")
		return
	}
	userID := auth.UserID(r)
	id := chi.URLParam(r, "id")
	if _, err := s.store.Characters().GetForRead(r.Context(), id, userID); err != nil {
		text(w, http.StatusNotFound, "Not found")
		return
	}
	data, err := store.LoadSheet(r.Context(), id)
	if err != nil {
		text(w, http.StatusNotFound, "Not found")
		return
	}
	writeJSON(w, http.StatusOK, spread(data, map[string]any{"id": id}))
}
