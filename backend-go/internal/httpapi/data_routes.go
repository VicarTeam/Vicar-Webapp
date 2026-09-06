package httpapi

import (
	"encoding/base64"
	"io"
	"net/http"

	"github.com/go-chi/chi/v5"
)

const (
	checksumURL = "https://github.com/VicarTeam/VicarData/releases/latest/download/checksum.sha256"
	bundleURL   = "https://github.com/VicarTeam/VicarData/releases/latest/download/bundle.zip"
)

func (s *Server) mountData(r chi.Router) {
	r.Get("/data/checksum", s.getChecksum)
	r.Get("/data/bundle", s.getBundle)
}

func (s *Server) getChecksum(w http.ResponseWriter, r *http.Request) {
	resp, err := http.Get(checksumURL)
	if err != nil {
		text(w, http.StatusBadGateway, "error")
		return
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		text(w, http.StatusBadGateway, "error")
		return
	}
	_, _ = w.Write(body)
}

func (s *Server) getBundle(w http.ResponseWriter, r *http.Request) {
	resp, err := http.Get(bundleURL)
	if err != nil {
		text(w, http.StatusBadGateway, "error")
		return
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		text(w, http.StatusBadGateway, "error")
		return
	}
	_, _ = w.Write([]byte(base64.StdEncoding.EncodeToString(body)))
}
