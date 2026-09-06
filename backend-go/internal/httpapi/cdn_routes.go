package httpapi

import (
	"encoding/base64"
	"net/http"
	"os"
	"regexp"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

var mimeExt = map[string]string{
	"image/png":     "png",
	"image/jpeg":    "jpg",
	"image/jpg":     "jpg",
	"image/webp":    "webp",
	"image/gif":     "gif",
	"image/svg+xml": "svg",
}

const cdnMaxBytes = 5 * 1024 * 1024 // 5 MB

var dataURLRe = regexp.MustCompile(`^data:([^;]+);base64,(.+)$`)

// mountCdnStatic serves uploaded assets (public GET, 7d immutable cache).
func (s *Server) mountCdnStatic(r chi.Router) {
	fs := http.StripPrefix("/cdn/", http.FileServer(http.Dir(s.cfg.CDNDir)))
	handler := func(w http.ResponseWriter, req *http.Request) {
		w.Header().Set("Cache-Control", "public, max-age=604800, immutable")
		fs.ServeHTTP(w, req)
	}
	r.Get("/cdn/*", handler)
	r.Head("/cdn/*", handler)
}

// mountCdnUpload handles authenticated image uploads (data-URL → file).
func (s *Server) mountCdnUpload(r chi.Router) {
	r.Post("/cdn/upload", s.uploadImage)
}

func (s *Server) uploadImage(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Data string `json:"data"`
	}
	if err := readJSON(w, r, &body); err != nil || body.Data == "" {
		text(w, http.StatusBadRequest, "Missing image data")
		return
	}
	m := dataURLRe.FindStringSubmatch(body.Data)
	if m == nil {
		text(w, http.StatusBadRequest, "Invalid data URL")
		return
	}
	ext, ok := mimeExt[m[1]]
	if !ok {
		text(w, http.StatusUnsupportedMediaType, "Unsupported image type")
		return
	}
	buf, err := base64.StdEncoding.DecodeString(m[2])
	if err != nil {
		text(w, http.StatusBadRequest, "Invalid data URL")
		return
	}
	if len(buf) == 0 {
		text(w, http.StatusBadRequest, "Empty image")
		return
	}
	if len(buf) > cdnMaxBytes {
		text(w, http.StatusRequestEntityTooLarge, "Image too large")
		return
	}
	filename := uuid.NewString() + "." + ext
	if err := os.WriteFile(s.cfg.CDNDir+"/"+filename, buf, 0o644); err != nil {
		text(w, http.StatusInternalServerError, "error")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"url": "/cdn/" + filename})
}
