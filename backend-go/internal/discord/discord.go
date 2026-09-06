// Package discord implements the small slice of the Discord OAuth2 flow the
// legacy backend used: code→token exchange, profile fetch, and token revoke.
package discord

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/url"
	"strings"
	"time"
)

type Client struct {
	clientID     string
	clientSecret string
	redirectURI  string
	http         *http.Client
}

type Profile struct {
	ID       string
	Username string
}

func New(clientID, clientSecret, redirectURI string) *Client {
	return &Client{
		clientID:     clientID,
		clientSecret: clientSecret,
		redirectURI:  redirectURI,
		http:         &http.Client{Timeout: 15 * time.Second},
	}
}

// AuthorizeURL builds the Discord consent URL.
func (c *Client) AuthorizeURL(state string) string {
	return "https://discord.com/oauth2/authorize?response_type=code&client_id=" + url.QueryEscape(c.clientID) +
		"&scope=identify&state=" + url.QueryEscape(state) +
		"&redirect_uri=" + url.QueryEscape(c.redirectURI) + "&prompt=consent"
}

func (c *Client) Exchange(ctx context.Context, code string) (string, error) {
	form := url.Values{
		"client_id":     {c.clientID},
		"client_secret": {c.clientSecret},
		"grant_type":    {"authorization_code"},
		"code":          {code},
		"redirect_uri":  {c.redirectURI},
		"scope":         {"identify"},
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost,
		"https://discord.com/api/oauth2/token", strings.NewReader(form.Encode()))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	resp, err := c.http.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return "", errors.New("discord: token exchange failed")
	}
	var body struct {
		AccessToken string `json:"access_token"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		return "", err
	}
	return body.AccessToken, nil
}

func (c *Client) Me(ctx context.Context, accessToken string) (Profile, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, "https://discord.com/api/users/@me", nil)
	if err != nil {
		return Profile{}, err
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)
	resp, err := c.http.Do(req)
	if err != nil {
		return Profile{}, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return Profile{}, errors.New("discord: profile fetch failed")
	}
	var body struct {
		ID       string `json:"id"`
		Username string `json:"username"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		return Profile{}, err
	}
	return Profile{ID: body.ID, Username: body.Username}, nil
}

// Revoke best-effort revokes the short-lived Discord access token.
func (c *Client) Revoke(accessToken string) {
	form := url.Values{
		"token":         {accessToken},
		"client_id":     {c.clientID},
		"client_secret": {c.clientSecret},
	}
	req, err := http.NewRequest(http.MethodPost, "https://discord.com/api/oauth2/token/revoke", strings.NewReader(form.Encode()))
	if err != nil {
		return
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	go func() {
		resp, err := c.http.Do(req)
		if err == nil {
			resp.Body.Close()
		}
	}()
}
