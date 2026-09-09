package httpapi

import (
	"encoding/base64"
	"encoding/json"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/VicarTeam/vicar-backend/internal/auth"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

func (s *Server) mountAuth(r chi.Router) {
	r.Get("/auth/login", s.authLogin)
	r.Get("/auth/callback", s.authCallback)
	r.Post("/auth/logout", s.authLogout)
	r.Post("/auth/refresh", s.authRefresh)
	r.Get("/auth/login/password", s.authLoginPassword)
	r.Get("/auth/login/dev", s.authLoginDev)
	r.Get("/auth/login/agent", s.authLoginAgent)
}

// authLoginAgent exchanges a long-lived agent token for a browser session, so an
// automation browser (MCP) can log in as the token's owner. Mirrors the dev/OAuth
// redirect flow, but is gated by a valid agent token instead of DEV_MODE.
func (s *Server) authLoginAgent(w http.ResponseWriter, r *http.Request) {
	token := strings.TrimSpace(r.URL.Query().Get("token"))
	if token == "" {
		text(w, http.StatusBadRequest, "Missing token")
		return
	}
	u, err := s.store.Users().FindByAgentToken(r.Context(), token)
	if err != nil {
		text(w, http.StatusUnauthorized, "Invalid token")
		return
	}
	pair, err := s.auth.IssueSessionForUser(r.Context(), u.IDHex())
	if err != nil || pair == nil {
		text(w, http.StatusInternalServerError, "error")
		return
	}
	s.redirectLoggedIn(w, r, pair, r.URL.Query().Get("r"))
}

func (s *Server) redirectLoggedIn(w http.ResponseWriter, r *http.Request, pair *auth.TokenPair, rParam string) {
	u, err := url.Parse(s.cfg.FrontendURL + "/logged-in")
	if err != nil {
		text(w, http.StatusInternalServerError, "error")
		return
	}
	q := u.Query()
	q.Set("s_atk", pair.AccessToken.Token)
	q.Set("s_rtk", pair.RefreshToken.Token)
	q.Set("s_exp", strconv.FormatInt(pair.AccessToken.Exp, 10))
	if rParam != "" {
		q.Set("r", rParam)
	}
	u.RawQuery = q.Encode()
	http.Redirect(w, r, u.String(), http.StatusFound)
}

func (s *Server) authLogin(w http.ResponseWriter, r *http.Request) {
	rParam := r.URL.Query().Get("r")
	state := uuid.NewString()
	if rParam != "" {
		s.preAuth.store(state, rParam, 5*time.Minute)
	}
	http.Redirect(w, r, s.discord.AuthorizeURL(state), http.StatusFound)
}

func (s *Server) authCallback(w http.ResponseWriter, r *http.Request) {
	rParam := ""
	if state := r.URL.Query().Get("state"); state != "" {
		if v, ok := s.preAuth.take(state); ok {
			rParam = v
		}
	}
	code := r.URL.Query().Get("code")
	accessToken, err := s.discord.Exchange(r.Context(), code)
	if err != nil {
		text(w, http.StatusInternalServerError, "Failed to authorize")
		return
	}
	profile, err := s.discord.Me(r.Context(), accessToken)
	if err != nil {
		text(w, http.StatusInternalServerError, "Failed to authorize")
		return
	}
	pair, err := s.auth.Authenticate(r.Context(), auth.DiscordUser{ID: profile.ID, Username: profile.Username})
	if err != nil || pair == nil {
		text(w, http.StatusInternalServerError, "Failed to authorize")
		return
	}
	s.redirectLoggedIn(w, r, pair, rParam)
	s.discord.Revoke(accessToken)
}

func (s *Server) authLogout(w http.ResponseWriter, r *http.Request) {
	authz := r.Header.Get("Authorization")
	if authz == "" {
		text(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	token := strings.TrimPrefix(authz, "Bearer ")
	userID, ok := s.auth.GetUserIDRegardlessOfExpired(token)
	if !ok {
		text(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	if rtk := r.URL.Query().Get("rtk"); rtk != "" {
		_ = s.auth.RevokeRefreshToken(r.Context(), rtk)
	} else {
		_ = s.auth.DestroyUserSession(r.Context(), userID)
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "Logged out successfully"})
}

func (s *Server) authRefresh(w http.ResponseWriter, r *http.Request) {
	rtk := r.URL.Query().Get("rtk")
	if rtk == "" {
		text(w, http.StatusBadRequest, "Refresh token is required")
		return
	}
	pair, err := s.auth.Refresh(r.Context(), rtk)
	if err != nil {
		text(w, http.StatusInternalServerError, "Failed to refresh tokens")
		return
	}
	if pair == nil {
		text(w, http.StatusUnauthorized, "Invalid or expired refresh token")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"accessToken":  pair.AccessToken.Token,
		"refreshToken": pair.RefreshToken.Token,
		"exp":          pair.AccessToken.Exp,
	})
}

func (s *Server) authLoginPassword(w http.ResponseWriter, r *http.Request) {
	failureURL := s.cfg.FrontendURL + "/login"
	d := r.URL.Query().Get("d")
	rParam := r.URL.Query().Get("r")
	if d == "" {
		http.Redirect(w, r, failureURL, http.StatusFound)
		return
	}
	raw, err := decodeBase64Lenient(d)
	if err != nil {
		http.Redirect(w, r, failureURL, http.StatusFound)
		return
	}
	var creds struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := json.Unmarshal(raw, &creds); err != nil || creds.Username == "" || creds.Password == "" {
		http.Redirect(w, r, failureURL, http.StatusFound)
		return
	}
	pair, err := s.auth.AuthenticateByPassword(r.Context(), creds.Username, creds.Password)
	if err != nil || pair == nil {
		http.Redirect(w, r, failureURL, http.StatusFound)
		return
	}
	s.redirectLoggedIn(w, r, pair, rParam)
}

func (s *Server) authLoginDev(w http.ResponseWriter, r *http.Request) {
	if !s.cfg.DevMode {
		text(w, http.StatusNotFound, "Not found")
		return
	}
	rParam := r.URL.Query().Get("r")
	pair, err := s.auth.Authenticate(r.Context(), auth.DiscordUser{ID: "dev-local-user", Username: "dev"})
	if err != nil || pair == nil {
		text(w, http.StatusInternalServerError, "error")
		return
	}
	s.redirectLoggedIn(w, r, pair, rParam)
}

// decodeBase64Lenient accepts standard and URL-safe base64, padded or not.
func decodeBase64Lenient(s string) ([]byte, error) {
	for _, enc := range []*base64.Encoding{
		base64.StdEncoding, base64.RawStdEncoding, base64.URLEncoding, base64.RawURLEncoding,
	} {
		if b, err := enc.DecodeString(s); err == nil {
			return b, nil
		}
	}
	return nil, base64.CorruptInputError(0)
}
