package httpapi

import (
	"context"
	"crypto/rand"
	"errors"
	"log"
	"math/big"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"time"

	"github.com/VicarTeam/vicar-backend/internal/auth"
	"github.com/VicarTeam/vicar-backend/internal/models"
	"github.com/VicarTeam/vicar-backend/internal/onyx"
	"github.com/VicarTeam/vicar-backend/internal/storage"
	"github.com/go-chi/chi/v5"
)

const (
	onyxStateCookie = "vicar_onyx_state"
	onyxStateTTL    = 10 * time.Minute
	onyxClaimTTL    = 15 * time.Minute
	onyxModeLogin   = "login"
	onyxModeLink    = "link"
)

var (
	errOnyxTaken         = errors.New("onyx account already linked to another user")
	errOnyxOtherIdentity = errors.New("user already linked to another onyx account")
)

type onyxFlow struct {
	mode     string
	verifier string
	userID   string
	redirect string
	profile  *onyx.Profile
	expires  time.Time
}

type onyxFlowCache struct {
	mutex sync.Mutex
	items map[string]onyxFlow
}

func newOnyxFlowCache() *onyxFlowCache {
	return &onyxFlowCache{items: map[string]onyxFlow{}}
}

func (c *onyxFlowCache) put(key string, flow onyxFlow) {
	c.mutex.Lock()
	defer c.mutex.Unlock()
	now := time.Now()
	for existing, item := range c.items {
		if now.After(item.expires) {
			delete(c.items, existing)
		}
	}
	c.items[key] = flow
}

func (c *onyxFlowCache) take(key string) (onyxFlow, bool) {
	c.mutex.Lock()
	defer c.mutex.Unlock()
	flow, ok := c.items[key]
	if !ok {
		return onyxFlow{}, false
	}
	delete(c.items, key)
	if time.Now().After(flow.expires) {
		return onyxFlow{}, false
	}
	return flow, true
}

func (s *Server) mountOnyx(r chi.Router) {
	r.Get("/auth/onyx/login", s.onyxLogin)
	r.Get("/auth/onyx/callback", s.onyxCallback)
	r.Get("/auth/onyx/register", s.onyxRegister)
}

func (s *Server) mountOnyxAccount(r chi.Router) {
	r.Post("/auth/onyx/link", s.onyxLink)
	r.Post("/auth/onyx/claim", s.onyxClaim)
}

func (s *Server) frontendRedirect(w http.ResponseWriter, r *http.Request, path string, values url.Values) {
	target := s.cfg.FrontendURL + path
	if len(values) > 0 {
		target += "?" + values.Encode()
	}
	http.Redirect(w, r, target, http.StatusFound)
}

func (s *Server) startOnyxFlow(w http.ResponseWriter, flow onyxFlow) string {
	state := onyx.RandomString()
	flow.verifier = onyx.RandomString()
	flow.expires = time.Now().Add(onyxStateTTL)
	s.onyxFlow.put("state:"+state, flow)
	http.SetCookie(w, &http.Cookie{
		Name:     onyxStateCookie,
		Value:    state,
		Path:     "/",
		MaxAge:   int(onyxStateTTL.Seconds()),
		HttpOnly: true,
		Secure:   strings.HasPrefix(s.cfg.FrontendURL, "https://"),
		SameSite: http.SameSiteLaxMode,
	})
	return s.onyx.AuthorizeURL(state, flow.verifier)
}

func (s *Server) onyxLogin(w http.ResponseWriter, r *http.Request) {
	if !s.onyx.Enabled() {
		text(w, http.StatusNotFound, "Not found")
		return
	}
	target := s.startOnyxFlow(w, onyxFlow{mode: onyxModeLogin, redirect: r.URL.Query().Get("r")})
	http.Redirect(w, r, target, http.StatusFound)
}

func (s *Server) onyxLink(w http.ResponseWriter, r *http.Request) {
	if !s.onyx.Enabled() {
		text(w, http.StatusNotFound, "Not found")
		return
	}
	target := s.startOnyxFlow(w, onyxFlow{mode: onyxModeLink, userID: auth.UserID(r)})
	writeJSON(w, http.StatusOK, map[string]string{"url": target})
}

func (s *Server) onyxCallback(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	state := query.Get("state")
	http.SetCookie(w, &http.Cookie{Name: onyxStateCookie, Value: "", Path: "/", MaxAge: -1, HttpOnly: true})

	flow, ok := s.onyxFlow.take("state:" + state)
	if state == "" || !ok {
		s.frontendRedirect(w, r, "/login", url.Values{"onyx": {"expired"}})
		return
	}
	failurePath := "/login"
	if flow.mode == onyxModeLink {
		failurePath = "/"
	}
	if flow.mode == onyxModeLogin {
		cookie, err := r.Cookie(onyxStateCookie)
		if err != nil || cookie.Value != state {
			s.frontendRedirect(w, r, failurePath, url.Values{"onyx": {"expired"}})
			return
		}
	}
	if query.Get("error") != "" || query.Get("code") == "" {
		s.frontendRedirect(w, r, failurePath, url.Values{"onyx": {"cancelled"}})
		return
	}
	profile, err := s.onyx.Identify(r.Context(), query.Get("code"), flow.verifier)
	if err != nil {
		log.Printf("onyx: identify failed: %v", err)
		s.frontendRedirect(w, r, failurePath, url.Values{"onyx": {"failed"}})
		return
	}

	if flow.mode == onyxModeLink {
		user, err := s.store.Users().FindByID(r.Context(), flow.userID)
		if err != nil {
			s.frontendRedirect(w, r, "/", url.Values{"onyx": {"failed"}})
			return
		}
		s.frontendRedirect(w, r, "/", url.Values{"onyx": {s.linkResult(r.Context(), user, profile)}})
		return
	}

	user, err := s.store.Users().FindByOnyxID(r.Context(), profile.ID)
	if errors.Is(err, storage.ErrNotFound) {
		claim := onyx.RandomString()
		s.onyxFlow.put("claim:"+claim, onyxFlow{profile: profile, redirect: flow.redirect, expires: time.Now().Add(onyxClaimTTL)})
		values := url.Values{"onyx_claim": {claim}, "onyx_user": {profile.Username}}
		if flow.redirect != "" {
			values.Set("r", flow.redirect)
		}
		s.frontendRedirect(w, r, "/login", values)
		return
	}
	if err != nil {
		log.Printf("onyx: user lookup failed: %v", err)
		s.frontendRedirect(w, r, "/login", url.Values{"onyx": {"failed"}})
		return
	}
	s.syncOnyxUsername(r.Context(), user, profile.Username)
	pair, err := s.auth.IssueSessionForUser(r.Context(), user.IDHex())
	if err != nil || pair == nil {
		s.frontendRedirect(w, r, "/login", url.Values{"onyx": {"failed"}})
		return
	}
	s.redirectLoggedIn(w, r, pair, flow.redirect)
}

func (s *Server) onyxClaim(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Claim string `json:"claim"`
	}
	if err := readJSON(w, r, &body); err != nil || body.Claim == "" {
		text(w, http.StatusBadRequest, "Claim missing")
		return
	}
	flow, ok := s.onyxFlow.take("claim:" + body.Claim)
	if !ok || flow.profile == nil {
		writeJSON(w, http.StatusOK, map[string]string{"result": "expired"})
		return
	}
	user, err := s.store.Users().FindByID(r.Context(), auth.UserID(r))
	if err != nil {
		text(w, http.StatusNotFound, "Not found")
		return
	}
	result := s.linkResult(r.Context(), user, flow.profile)
	writeJSON(w, http.StatusOK, map[string]string{"result": result, "username": user.Username})
}

func (s *Server) onyxRegister(w http.ResponseWriter, r *http.Request) {
	flow, ok := s.onyxFlow.take("claim:" + r.URL.Query().Get("claim"))
	if !ok || flow.profile == nil {
		s.frontendRedirect(w, r, "/login", url.Values{"onyx": {"expired"}})
		return
	}
	ctx := r.Context()
	if existing, err := s.store.Users().FindByOnyxID(ctx, flow.profile.ID); err == nil {
		pair, err := s.auth.IssueSessionForUser(ctx, existing.IDHex())
		if err != nil || pair == nil {
			s.frontendRedirect(w, r, "/login", url.Values{"onyx": {"failed"}})
			return
		}
		s.redirectLoggedIn(w, r, pair, flow.redirect)
		return
	}
	username, err := s.freeUsername(ctx, flow.profile.Username)
	if err != nil {
		log.Printf("onyx: no free username: %v", err)
		s.frontendRedirect(w, r, "/login", url.Values{"onyx": {"failed"}})
		return
	}
	user := &models.User{
		Username:  username,
		DiscordID: "onyx:" + flow.profile.ID,
		OnyxID:    flow.profile.ID,
	}
	if err := s.store.Users().Create(ctx, user); err != nil {
		log.Printf("onyx: create user failed: %v", err)
		s.frontendRedirect(w, r, "/login", url.Values{"onyx": {"failed"}})
		return
	}
	pair, err := s.auth.IssueSessionForUser(ctx, user.IDHex())
	if err != nil || pair == nil {
		s.frontendRedirect(w, r, "/login", url.Values{"onyx": {"failed"}})
		return
	}
	s.redirectLoggedIn(w, r, pair, flow.redirect)
}

func (s *Server) linkResult(ctx context.Context, user *models.User, profile *onyx.Profile) string {
	err := s.linkOnyx(ctx, user, profile)
	switch {
	case errors.Is(err, errOnyxTaken):
		return "taken"
	case errors.Is(err, errOnyxOtherIdentity):
		return "other"
	case err != nil:
		log.Printf("onyx: link failed: %v", err)
		return "failed"
	}
	return "linked"
}

func (s *Server) linkOnyx(ctx context.Context, user *models.User, profile *onyx.Profile) error {
	owner, err := s.store.Users().FindByOnyxID(ctx, profile.ID)
	if err == nil && owner.IDHex() != user.IDHex() {
		return errOnyxTaken
	}
	if err != nil && !errors.Is(err, storage.ErrNotFound) {
		return err
	}
	if user.OnyxID != "" && user.OnyxID != profile.ID {
		return errOnyxOtherIdentity
	}
	user.OnyxID = profile.ID
	if s.usernameAvailable(ctx, profile.Username, user.IDHex()) {
		user.Username = profile.Username
	}
	return s.store.Users().Update(ctx, user)
}

func (s *Server) syncOnyxUsername(ctx context.Context, user *models.User, username string) {
	if username == "" || username == user.Username || !s.usernameAvailable(ctx, username, user.IDHex()) {
		return
	}
	user.Username = username
	if err := s.store.Users().Update(ctx, user); err != nil {
		log.Printf("onyx: username sync failed: %v", err)
	}
}

func (s *Server) usernameAvailable(ctx context.Context, username, ownerID string) bool {
	existing, err := s.store.Users().FindByUsernameCI(ctx, username)
	if errors.Is(err, storage.ErrNotFound) {
		return true
	}
	return err == nil && existing.IDHex() == ownerID
}

func (s *Server) freeUsername(ctx context.Context, preferred string) (string, error) {
	candidate := preferred
	for attempt := 0; attempt < 20; attempt++ {
		if s.usernameAvailable(ctx, candidate, "") {
			return candidate, nil
		}
		number, err := rand.Int(rand.Reader, big.NewInt(10000))
		if err != nil {
			return "", err
		}
		candidate = preferred + "-" + leftPad(number.String(), 4)
	}
	return "", errors.New("all username candidates are taken")
}

func leftPad(value string, length int) string {
	for len(value) < length {
		value = "0" + value
	}
	return value
}
