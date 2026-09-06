package httpapi

import (
	"errors"
	"net/http"
	"strings"

	"github.com/VicarTeam/vicar-backend/internal/auth"
	"github.com/VicarTeam/vicar-backend/internal/models"
	"github.com/VicarTeam/vicar-backend/internal/storage"
	"github.com/go-chi/chi/v5"
	"go.mongodb.org/mongo-driver/bson"
)

func (s *Server) mountSkillTrees(r chi.Router) {
	r.Get("/skilltrees/mine", s.getMySkillTrees)
	r.Post("/skilltrees", s.createSkillTree)
	r.Put("/skilltrees/{id}", s.updateSkillTree)
	r.Delete("/skilltrees/{id}", s.deleteSkillTree)
	r.Get("/skilltrees/redeem/{code}", s.redeemSkillTree)
}

func serializeTree(t *models.SkillTree) map[string]any {
	return spread(t.Data, map[string]any{"id": t.IDHex()})
}

func (s *Server) getMySkillTrees(w http.ResponseWriter, r *http.Request) {
	trees, err := s.store.SkillTrees().FindByUser(r.Context(), auth.UserID(r))
	if err != nil {
		text(w, http.StatusInternalServerError, "error")
		return
	}
	out := make([]map[string]any, 0, len(trees))
	for i := range trees {
		out = append(out, serializeTree(&trees[i]))
	}
	writeJSON(w, http.StatusOK, out)
}

func (s *Server) createSkillTree(w http.ResponseWriter, r *http.Request) {
	userID := auth.UserID(r)
	var body bson.M
	if err := readJSON(w, r, &body); err != nil {
		text(w, http.StatusBadRequest, "Invalid body")
		return
	}
	code := codeFromBody(body["bonusCode"])
	if code == "" {
		text(w, http.StatusBadRequest, "Missing bonus code")
		return
	}
	if _, err := s.store.SkillTrees().FindByCode(r.Context(), code); err == nil {
		text(w, http.StatusConflict, "Bonus code already in use")
		return
	} else if !errors.Is(err, storage.ErrNotFound) {
		text(w, http.StatusInternalServerError, "error")
		return
	}
	body["bonusCode"] = code
	tree := &models.SkillTree{BonusCode: code, UserID: userID, Data: body}
	if _, err := s.store.SkillTrees().Create(r.Context(), tree); err != nil {
		text(w, http.StatusInternalServerError, "error")
		return
	}
	writeJSON(w, http.StatusOK, serializeTree(tree))
}

func (s *Server) updateSkillTree(w http.ResponseWriter, r *http.Request) {
	userID := auth.UserID(r)
	id := chi.URLParam(r, "id")
	tree, err := s.store.SkillTrees().GetOwned(r.Context(), id, userID)
	if err != nil {
		text(w, http.StatusNotFound, "Not found")
		return
	}
	var body bson.M
	if err := readJSON(w, r, &body); err != nil {
		text(w, http.StatusBadRequest, "Invalid body")
		return
	}
	code := codeFromBody(body["bonusCode"])
	if code == "" {
		text(w, http.StatusBadRequest, "Missing bonus code")
		return
	}
	if _, err := s.store.SkillTrees().FindByCodeExcluding(r.Context(), code, id); err == nil {
		text(w, http.StatusConflict, "Bonus code already in use")
		return
	} else if !errors.Is(err, storage.ErrNotFound) {
		text(w, http.StatusInternalServerError, "error")
		return
	}
	body["bonusCode"] = code
	tree.BonusCode = code
	tree.Data = body
	if err := s.store.SkillTrees().Save(r.Context(), tree); err != nil {
		text(w, http.StatusInternalServerError, "error")
		return
	}
	writeJSON(w, http.StatusOK, serializeTree(tree))
}

func (s *Server) deleteSkillTree(w http.ResponseWriter, r *http.Request) {
	userID := auth.UserID(r)
	id := chi.URLParam(r, "id")
	tree, err := s.store.SkillTrees().GetOwned(r.Context(), id, userID)
	if err != nil {
		text(w, http.StatusNotFound, "Not found")
		return
	}
	if err := s.store.SkillTrees().Delete(r.Context(), tree.IDHex()); err != nil {
		text(w, http.StatusInternalServerError, "error")
		return
	}
	ok(w)
}

func (s *Server) redeemSkillTree(w http.ResponseWriter, r *http.Request) {
	code := strings.TrimSpace(chi.URLParam(r, "code"))
	if code == "" {
		text(w, http.StatusBadRequest, "Missing bonus code")
		return
	}
	tree, err := s.store.SkillTrees().FindByCode(r.Context(), code)
	if err != nil {
		text(w, http.StatusNotFound, "Not found")
		return
	}
	writeJSON(w, http.StatusOK, serializeTree(tree))
}

func codeFromBody(v any) string {
	if s, ok := v.(string); ok {
		return strings.TrimSpace(s)
	}
	return ""
}
