package httpapi

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"github.com/VicarTeam/vicar-backend/internal/auth"
	"github.com/VicarTeam/vicar-backend/internal/storage"
	"github.com/go-chi/chi/v5"
	"go.mongodb.org/mongo-driver/bson"
)

func (s *Server) mountCharacters(r chi.Router) {
	r.Get("/characters", s.getCharacters)
	r.Get("/characters/{id}", s.getCharacter)
	r.Post("/characters", s.createCharacter)
	r.Put("/characters/{id}", s.updateCharacter)
	r.Patch("/characters/{id}/directory", s.updateCharacterDirectory)
	r.Delete("/characters/{id}", s.deleteCharacter)
	r.Post("/characters/{id}/share", s.shareCharacter)
	r.Get("/characters/{id}/viewers", s.getCharacterViewers)
	r.Delete("/characters/{id}/viewers/{viewerId}", s.deleteCharacterViewer)
	r.Get("/characters/{id}/export", s.exportCharacter)
	r.Post("/characters/{id}/migrate", s.migrateCharacter)
}

// exportCharacter streams the full character as a downloadable JSON file
// ("download as JSON"), usable for backup and manual migration.
func (s *Server) exportCharacter(w http.ResponseWriter, r *http.Request) {
	userID := auth.UserID(r)
	id := chi.URLParam(r, "id")
	c, err := s.store.Characters().GetForRead(r.Context(), id, userID)
	if err != nil {
		text(w, http.StatusNotFound, "Not found")
		return
	}
	name := "character"
	if n, ok := c.Data["name"].(string); ok && strings.TrimSpace(n) != "" {
		name = n
	}
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Content-Disposition", `attachment; filename="`+sanitizeFilename(name)+`.json"`)
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(spread(c.Data, map[string]any{"id": c.IDHex()}))
}

// migrateCharacter moves an owned legacy (Mongo) character to Postgres. Only
// meaningful in split mode; other modes report that migration is unavailable.
func (s *Server) migrateCharacter(w http.ResponseWriter, r *http.Request) {
	userID := auth.UserID(r)
	id := chi.URLParam(r, "id")
	if _, err := s.store.Characters().GetOwned(r.Context(), id, userID); err != nil {
		text(w, http.StatusNotFound, "Not found")
		return
	}
	migrator, ok := s.store.(storage.Migrator)
	if !ok {
		text(w, http.StatusBadRequest, "Migration not available in this mode")
		return
	}
	if err := migrator.MigrateCharacter(r.Context(), id); err != nil {
		text(w, http.StatusInternalServerError, "Migration failed")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"message": "OK", "migrated": true})
}

func sanitizeFilename(name string) string {
	repl := func(r rune) rune {
		switch r {
		case '/', '\\', ':', '*', '?', '"', '<', '>', '|', '\n', '\r':
			return '_'
		}
		return r
	}
	out := strings.Map(repl, strings.TrimSpace(name))
	if out == "" {
		return "character"
	}
	return out
}

func (s *Server) getCharacters(w http.ResponseWriter, r *http.Request) {
	userID := auth.UserID(r)
	owned, err := s.store.Characters().OwnedSummaries(r.Context(), userID)
	if err != nil {
		text(w, http.StatusInternalServerError, "error")
		return
	}
	shared, err := s.store.Characters().SharedSummaries(r.Context(), userID)
	if err != nil {
		text(w, http.StatusInternalServerError, "error")
		return
	}

	characters := make([]map[string]any, 0, len(owned))
	for i := range owned {
		characters = append(characters, spread(owned[i].Data, map[string]any{"id": owned[i].IDHex(), "legacy": owned[i].Legacy}))
	}
	sharedOut := make([]map[string]any, 0, len(shared))
	for i := range shared {
		sharedOut = append(sharedOut, spread(shared[i].Data, map[string]any{"id": shared[i].IDHex(), "justViewing": true}))
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"characters":       characters,
		"sharedCharacters": sharedOut,
	})
}

func (s *Server) getCharacter(w http.ResponseWriter, r *http.Request) {
	userID := auth.UserID(r)
	id := chi.URLParam(r, "id")
	c, err := s.store.Characters().GetForRead(r.Context(), id, userID)
	if err != nil {
		text(w, http.StatusNotFound, "Not found")
		return
	}
	writeJSON(w, http.StatusOK, spread(c.Data, map[string]any{
		"id":          c.IDHex(),
		"justViewing": c.UserID != userID,
	}))
}

func (s *Server) createCharacter(w http.ResponseWriter, r *http.Request) {
	userID := auth.UserID(r)
	var data bson.M
	if err := readJSON(w, r, &data); err != nil {
		text(w, http.StatusBadRequest, "Invalid body")
		return
	}
	id, err := s.store.Characters().Create(r.Context(), userID, data)
	if err != nil {
		text(w, http.StatusInternalServerError, "error")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"id": id})
}

func (s *Server) updateCharacter(w http.ResponseWriter, r *http.Request) {
	userID := auth.UserID(r)
	id := chi.URLParam(r, "id")
	if _, err := s.store.Characters().GetOwned(r.Context(), id, userID); err != nil {
		text(w, http.StatusNotFound, "Not found")
		return
	}
	var data bson.M
	if err := readJSON(w, r, &data); err != nil {
		text(w, http.StatusBadRequest, "Invalid body")
		return
	}
	if err := s.store.Characters().ReplaceData(r.Context(), id, data); err != nil {
		text(w, http.StatusInternalServerError, "error")
		return
	}
	ok(w)
}

func (s *Server) updateCharacterDirectory(w http.ResponseWriter, r *http.Request) {
	userID := auth.UserID(r)
	id := chi.URLParam(r, "id")
	c, err := s.store.Characters().GetOwned(r.Context(), id, userID)
	if err != nil {
		text(w, http.StatusNotFound, "Not found")
		return
	}
	var body struct {
		Directory string `json:"directory"`
	}
	if err := readJSON(w, r, &body); err != nil {
		text(w, http.StatusBadRequest, "Invalid body")
		return
	}
	data := c.Data
	if data == nil {
		data = bson.M{}
	}
	if body.Directory != "" {
		data["directory"] = body.Directory
	} else {
		delete(data, "directory")
	}
	if err := s.store.Characters().ReplaceData(r.Context(), id, data); err != nil {
		text(w, http.StatusInternalServerError, "error")
		return
	}
	ok(w)
}

func (s *Server) deleteCharacter(w http.ResponseWriter, r *http.Request) {
	userID := auth.UserID(r)
	id := chi.URLParam(r, "id")
	c, err := s.store.Characters().Get(r.Context(), id)
	if err != nil {
		text(w, http.StatusNotFound, "Not found")
		return
	}
	if c.UserID == userID {
		_ = s.store.Characters().Delete(r.Context(), id)
	} else if contains(c.Viewers, userID) {
		c.Viewers = remove(c.Viewers, userID)
		_ = s.store.Characters().Save(r.Context(), c)
	}
	ok(w)
}

func (s *Server) shareCharacter(w http.ResponseWriter, r *http.Request) {
	userID := auth.UserID(r)
	id := chi.URLParam(r, "id")
	c, err := s.store.Characters().GetOwned(r.Context(), id, userID)
	if err != nil {
		text(w, http.StatusNotFound, "Not found")
		return
	}
	var body struct {
		Username string `json:"username"`
	}
	if err := readJSON(w, r, &body); err != nil {
		text(w, http.StatusBadRequest, "Invalid body")
		return
	}
	viewer, err := s.store.Users().FindByUsername(r.Context(), body.Username)
	if errors.Is(err, storage.ErrNotFound) {
		text(w, http.StatusNotFound, "Viewer not found")
		return
	}
	if err != nil {
		text(w, http.StatusInternalServerError, "error")
		return
	}
	c.Viewers = append(c.Viewers, viewer.IDHex())
	if err := s.store.Characters().Save(r.Context(), c); err != nil {
		text(w, http.StatusInternalServerError, "error")
		return
	}
	ok(w)
}

func (s *Server) getCharacterViewers(w http.ResponseWriter, r *http.Request) {
	userID := auth.UserID(r)
	id := chi.URLParam(r, "id")
	c, err := s.store.Characters().GetOwned(r.Context(), id, userID)
	if err != nil {
		text(w, http.StatusNotFound, "Not found")
		return
	}
	viewers, err := s.store.Users().FindByIDs(r.Context(), c.Viewers)
	if err != nil {
		text(w, http.StatusInternalServerError, "error")
		return
	}
	out := make([]map[string]any, 0, len(viewers))
	for i := range viewers {
		out = append(out, map[string]any{"id": viewers[i].IDHex(), "username": viewers[i].Username})
	}
	writeJSON(w, http.StatusOK, out)
}

func (s *Server) deleteCharacterViewer(w http.ResponseWriter, r *http.Request) {
	userID := auth.UserID(r)
	id := chi.URLParam(r, "id")
	viewerID := chi.URLParam(r, "viewerId")
	c, err := s.store.Characters().GetOwned(r.Context(), id, userID)
	if err != nil {
		text(w, http.StatusNotFound, "Not found")
		return
	}
	if !contains(c.Viewers, viewerID) {
		text(w, http.StatusNotFound, "Viewer not found")
		return
	}
	c.Viewers = remove(c.Viewers, viewerID)
	if err := s.store.Characters().Save(r.Context(), c); err != nil {
		text(w, http.StatusInternalServerError, "error")
		return
	}
	ok(w)
}
