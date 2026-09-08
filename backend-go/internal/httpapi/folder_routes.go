package httpapi

import (
	"net/http"
	"strings"

	"github.com/VicarTeam/vicar-backend/internal/auth"
	"github.com/VicarTeam/vicar-backend/internal/models"
	"github.com/go-chi/chi/v5"
)

func (s *Server) mountFolders(r chi.Router) {
	r.Get("/folders", s.getFolders)
	r.Post("/folders", s.createFolder)
	r.Put("/folders/{id}", s.updateFolder)
	r.Delete("/folders/{id}", s.deleteFolder)
}

func serializeFolder(f *models.Folder) map[string]any {
	chars := f.Characters
	if chars == nil {
		chars = []string{}
	}
	return map[string]any{
		"id":         f.IDHex(),
		"name":       f.Name,
		"parentId":   f.ParentID,
		"position":   f.Position,
		"characters": chars,
	}
}

func (s *Server) getFolders(w http.ResponseWriter, r *http.Request) {
	folders, err := s.store.Folders().FindByUser(r.Context(), auth.UserID(r))
	if err != nil {
		text(w, http.StatusInternalServerError, "error")
		return
	}
	out := make([]map[string]any, 0, len(folders))
	for i := range folders {
		out = append(out, serializeFolder(&folders[i]))
	}
	writeJSON(w, http.StatusOK, out)
}

type folderBody struct {
	Name       string   `json:"name"`
	ParentID   string   `json:"parentId"`
	Position   float64  `json:"position"`
	Characters []string `json:"characters"`
}

func (s *Server) createFolder(w http.ResponseWriter, r *http.Request) {
	var body folderBody
	if err := readJSON(w, r, &body); err != nil {
		text(w, http.StatusBadRequest, "Invalid body")
		return
	}
	name := strings.TrimSpace(body.Name)
	if name == "" {
		text(w, http.StatusBadRequest, "Missing name")
		return
	}
	folder := &models.Folder{
		UserID:     auth.UserID(r),
		Name:       name,
		ParentID:   strings.TrimSpace(body.ParentID),
		Position:   body.Position,
		Characters: normalizeIDs(body.Characters),
	}
	if _, err := s.store.Folders().Create(r.Context(), folder); err != nil {
		text(w, http.StatusInternalServerError, "error")
		return
	}
	writeJSON(w, http.StatusOK, serializeFolder(folder))
}

func (s *Server) updateFolder(w http.ResponseWriter, r *http.Request) {
	userID := auth.UserID(r)
	id := chi.URLParam(r, "id")
	folder, err := s.store.Folders().GetOwned(r.Context(), id, userID)
	if err != nil {
		text(w, http.StatusNotFound, "Not found")
		return
	}
	var body folderBody
	if err := readJSON(w, r, &body); err != nil {
		text(w, http.StatusBadRequest, "Invalid body")
		return
	}
	if name := strings.TrimSpace(body.Name); name != "" {
		folder.Name = name
	}
	folder.ParentID = strings.TrimSpace(body.ParentID)
	folder.Position = body.Position
	folder.Characters = normalizeIDs(body.Characters)
	if err := s.store.Folders().Save(r.Context(), folder); err != nil {
		text(w, http.StatusInternalServerError, "error")
		return
	}
	writeJSON(w, http.StatusOK, serializeFolder(folder))
}

func (s *Server) deleteFolder(w http.ResponseWriter, r *http.Request) {
	userID := auth.UserID(r)
	id := chi.URLParam(r, "id")
	folder, err := s.store.Folders().GetOwned(r.Context(), id, userID)
	if err != nil {
		text(w, http.StatusNotFound, "Not found")
		return
	}
	if err := s.store.Folders().Delete(r.Context(), folder.IDHex()); err != nil {
		text(w, http.StatusInternalServerError, "error")
		return
	}
	ok(w)
}

// normalizeIDs trims and drops empty character ids, never returning nil.
func normalizeIDs(ids []string) []string {
	out := make([]string, 0, len(ids))
	for _, id := range ids {
		if id = strings.TrimSpace(id); id != "" {
			out = append(out, id)
		}
	}
	return out
}
