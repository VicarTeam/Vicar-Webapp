package httpapi

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/VicarTeam/vicar-backend/internal/config"
	"github.com/VicarTeam/vicar-backend/internal/darkborne"
	"github.com/VicarTeam/vicar-backend/internal/storage/postgres"
)

func testServer(t *testing.T) http.Handler {
	t.Helper()
	url := os.Getenv("DARKBORNE_TEST_DB")
	if url == "" {
		t.Skip("DARKBORNE_TEST_DB is not set")
	}
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	store, err := postgres.Connect(ctx, url)
	if err != nil {
		t.Fatalf("connect: %v", err)
	}
	t.Cleanup(func() { _ = store.Close(context.Background()) })
	return New(&config.Config{}, store, nil, nil, nil).Handler()
}

func TestDarkborneRevisionEndpoint(t *testing.T) {
	handler := testServer(t)
	embedded, err := darkborne.Embedded()
	if err != nil {
		t.Fatalf("embedded: %v", err)
	}

	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/darkborne/revision", nil))
	if rec.Code != http.StatusOK {
		t.Fatalf("status %d: %s", rec.Code, rec.Body.String())
	}
	var body struct {
		Revision string `json:"revision"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if body.Revision != embedded.Revision {
		t.Fatalf("revision %q, want %q", body.Revision, embedded.Revision)
	}
}

func TestDarkborneContentEndpoint(t *testing.T) {
	handler := testServer(t)

	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/darkborne/content", nil))
	if rec.Code != http.StatusOK {
		t.Fatalf("status %d: %s", rec.Code, rec.Body.String())
	}
	var content darkborne.Content
	if err := json.Unmarshal(rec.Body.Bytes(), &content); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if len(content.Arts) != 15 || len(content.Houses) != 9 || len(content.Lexicon) == 0 {
		t.Fatalf("unexpected payload: %d arts, %d houses, %d lexicon entries",
			len(content.Arts), len(content.Houses), len(content.Lexicon))
	}
	if content.Arts[0].Levels == nil || len(content.Arts[0].Forms) == 0 {
		t.Fatal("nested art data is missing from the payload")
	}

	etag := rec.Header().Get("ETag")
	if etag == "" {
		t.Fatal("content endpoint must send an ETag")
	}
	cached := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/darkborne/content", nil)
	req.Header.Set("If-None-Match", etag)
	handler.ServeHTTP(cached, req)
	if cached.Code != http.StatusNotModified {
		t.Fatalf("cached request returned %d, want 304", cached.Code)
	}
}

func TestDarkborneLexiconEndpoint(t *testing.T) {
	handler := testServer(t)

	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/darkborne/lexicon", nil))
	if rec.Code != http.StatusOK {
		t.Fatalf("status %d: %s", rec.Code, rec.Body.String())
	}
	var body struct {
		Gameline string                   `json:"gameline"`
		Entries  []darkborne.LexiconEntry `json:"entries"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if body.Gameline != darkborne.Gameline {
		t.Fatalf("gameline %q, want %q", body.Gameline, darkborne.Gameline)
	}
	if len(body.Entries) == 0 {
		t.Fatal("no lexicon entries returned")
	}
	for _, entry := range body.Entries {
		if entry.Title == "" || entry.Section == "" {
			t.Fatalf("incomplete entry %q", entry.Key)
		}
	}

	empty := httptest.NewRecorder()
	handler.ServeHTTP(empty, httptest.NewRequest(http.MethodGet, "/darkborne/lexicon?gameline=v5", nil))
	if empty.Code != http.StatusOK {
		t.Fatalf("status %d for an unknown gameline", empty.Code)
	}
}

func TestDarkborneRoutesAreAlsoMountedUnderApi(t *testing.T) {
	handler := testServer(t)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/api/darkborne/revision", nil))
	if rec.Code != http.StatusOK {
		t.Fatalf("status %d under the /api mount", rec.Code)
	}
}
