package httpapi

import (
	"encoding/json"
	"net/http"

	"go.mongodb.org/mongo-driver/bson"
)

const maxBodyBytes = 100 << 20 // 100 MB (matches express.json limit)

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func text(w http.ResponseWriter, status int, msg string) {
	http.Error(w, msg, status)
}

func ok(w http.ResponseWriter) {
	writeJSON(w, http.StatusOK, map[string]string{"message": "OK"})
}

// readJSON decodes the (size-limited) request body into dst.
func readJSON(w http.ResponseWriter, r *http.Request, dst any) error {
	r.Body = http.MaxBytesReader(w, r.Body, maxBodyBytes)
	return json.NewDecoder(r.Body).Decode(dst)
}

// spread merges the stored sheet blob with extra top-level fields (id, …), the
// way the legacy handlers returned `{...data, id}`.
func spread(data bson.M, extra map[string]any) map[string]any {
	out := make(map[string]any, len(data)+len(extra))
	for k, v := range data {
		out[k] = v
	}
	for k, v := range extra {
		out[k] = v
	}
	return out
}

func contains(list []string, v string) bool {
	for _, s := range list {
		if s == v {
			return true
		}
	}
	return false
}

func remove(list []string, v string) []string {
	out := make([]string, 0, len(list))
	for _, s := range list {
		if s != v {
			out = append(out, s)
		}
	}
	return out
}
