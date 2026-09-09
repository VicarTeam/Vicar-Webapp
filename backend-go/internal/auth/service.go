// Package auth reproduces the legacy JWT/bcrypt session logic (HS256 access +
// rotating refresh tokens with a grace window) so existing sessions keep working
// after the Bun→Go cutover.
package auth

import (
	"context"
	"errors"
	"time"

	"github.com/VicarTeam/vicar-backend/internal/models"
	"github.com/VicarTeam/vicar-backend/internal/storage"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

const (
	accessTokenExpiry  = 60 * 15           // 15 minutes (seconds)
	refreshTokenExpiry = 60 * 60 * 24 * 90 // 90 days (seconds)
	refreshGrace       = 60 * time.Second
	issuer             = "VicarWebApp"
)

// Token mirrors the legacy shape: exp is in milliseconds.
type Token struct {
	Token string `json:"token"`
	Exp   int64  `json:"exp"`
}

type TokenPair struct {
	AccessToken  Token
	RefreshToken Token
}

// DiscordUser is the subset of the Discord profile we persist.
type DiscordUser struct {
	ID       string
	Username string
}

type claims struct {
	Type string `json:"type"`
	jwt.RegisteredClaims
}

type Service struct {
	secret []byte
	users  storage.UserStore
	tokens storage.RefreshTokenStore
}

func NewService(secret string, users storage.UserStore, tokens storage.RefreshTokenStore) *Service {
	return &Service{secret: []byte(secret), users: users, tokens: tokens}
}

func (s *Service) createToken(userID, typ string, expiresIn int64) (Token, error) {
	now := time.Now()
	c := claims{
		Type: typ,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   userID,
			Issuer:    issuer,
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(time.Duration(expiresIn) * time.Second)),
		},
	}
	signed, err := jwt.NewWithClaims(jwt.SigningMethodHS256, c).SignedString(s.secret)
	if err != nil {
		return Token{}, err
	}
	return Token{Token: signed, Exp: now.UnixMilli() + expiresIn*1000}, nil
}

func (s *Service) createTokens(userID string) (TokenPair, error) {
	at, err := s.createToken(userID, "access", accessTokenExpiry)
	if err != nil {
		return TokenPair{}, err
	}
	rt, err := s.createToken(userID, "refresh", refreshTokenExpiry)
	if err != nil {
		return TokenPair{}, err
	}
	return TokenPair{AccessToken: at, RefreshToken: rt}, nil
}

func (s *Service) parse(tokenStr string, ignoreExpiration bool) (*claims, error) {
	var opts []jwt.ParserOption
	opts = append(opts, jwt.WithValidMethods([]string{"HS256"}))
	if ignoreExpiration {
		opts = append(opts, jwt.WithoutClaimsValidation())
	}
	var c claims
	_, err := jwt.ParseWithClaims(tokenStr, &c, func(t *jwt.Token) (any, error) {
		return s.secret, nil
	}, opts...)
	if err != nil {
		return nil, err
	}
	return &c, nil
}

// Authenticated validates an access token and returns its user, or nil.
func (s *Service) Authenticated(ctx context.Context, token string) *models.User {
	c, err := s.parse(token, false)
	if err != nil || c.Type != "access" {
		return nil
	}
	user, err := s.users.FindByID(ctx, c.Subject)
	if err != nil {
		return nil
	}
	return user
}

// GetUserIDRegardlessOfExpired reads the subject even from an expired token.
func (s *Service) GetUserIDRegardlessOfExpired(token string) (string, bool) {
	c, err := s.parse(token, true)
	if err != nil {
		return "", false
	}
	if c.Type != "access" && c.Type != "refresh" {
		return "", false
	}
	return c.Subject, true
}

func (s *Service) AuthenticateByPassword(ctx context.Context, username, password string) (*TokenPair, error) {
	user, err := s.users.FindByUsernameCI(ctx, username)
	if errors.Is(err, storage.ErrNotFound) {
		// Unknown username → create the account on first login (legacy behaviour).
		hash, herr := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		if herr != nil {
			return nil, herr
		}
		user = &models.User{
			Username:  username,
			Password:  string(hash),
			DiscordID: "local:" + uuid.NewString(),
		}
		if cerr := s.users.Create(ctx, user); cerr != nil {
			return nil, cerr
		}
	} else if err != nil {
		return nil, err
	} else if user.Password == "" {
		hash, herr := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		if herr != nil {
			return nil, herr
		}
		user.Password = string(hash)
		if uerr := s.users.Update(ctx, user); uerr != nil {
			return nil, uerr
		}
	} else if bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)) != nil {
		return nil, nil // password mismatch
	}

	return s.issueSession(ctx, user.IDHex())
}

func (s *Service) Authenticate(ctx context.Context, du DiscordUser) (*TokenPair, error) {
	user, err := s.getOrRegister(ctx, du)
	if err != nil {
		return nil, err
	}
	return s.issueSession(ctx, user.IDHex())
}

// IssueSessionForUser issues a fresh access/refresh token pair for a known user
// id (used by the agent-token login, which resolves the user out of band).
func (s *Service) IssueSessionForUser(ctx context.Context, userID string) (*TokenPair, error) {
	return s.issueSession(ctx, userID)
}

func (s *Service) issueSession(ctx context.Context, userID string) (*TokenPair, error) {
	tokens, err := s.createTokens(userID)
	if err != nil {
		return nil, err
	}
	if err := s.tokens.Create(ctx, &models.RefreshToken{UserID: userID, Token: tokens.RefreshToken.Token}); err != nil {
		return nil, err
	}
	return &tokens, nil
}

func (s *Service) getOrRegister(ctx context.Context, du DiscordUser) (*models.User, error) {
	existing, err := s.users.FindByDiscordID(ctx, du.ID)
	if err == nil {
		return existing, nil
	}
	if !errors.Is(err, storage.ErrNotFound) {
		return nil, err
	}
	user := &models.User{DiscordID: du.ID, Username: du.Username}
	if cerr := s.users.Create(ctx, user); cerr != nil {
		return nil, cerr
	}
	return user, nil
}

func (s *Service) SetUserPassword(ctx context.Context, userID, password, oldPassword string) (bool, error) {
	user, err := s.users.FindByID(ctx, userID)
	if err != nil {
		return false, nil
	}
	if user.Password != "" {
		if oldPassword == "" || bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(oldPassword)) != nil {
			return false, nil
		}
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return false, err
	}
	user.Password = string(hash)
	if err := s.users.Update(ctx, user); err != nil {
		return false, err
	}
	return true, nil
}

// Refresh rotates a refresh token (with the legacy grace window) and returns a
// fresh pair, or nil if the token is invalid/expired.
func (s *Service) Refresh(ctx context.Context, refreshTokenStr string) (*TokenPair, error) {
	c, err := s.parse(refreshTokenStr, false)
	if err != nil || c.Type != "refresh" {
		return nil, nil
	}
	userID := c.Subject

	existing, err := s.tokens.FindByTokenAndUser(ctx, refreshTokenStr, userID)
	if errors.Is(err, storage.ErrNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	if existing.IsRevoked {
		if existing.ReplacedByToken != "" && existing.RevokedAt != nil &&
			time.Since(*existing.RevokedAt) < refreshGrace {
			replacement, rerr := s.tokens.FindActiveByToken(ctx, existing.ReplacedByToken)
			if rerr == nil {
				at, aerr := s.createToken(userID, "access", accessTokenExpiry)
				if aerr != nil {
					return nil, aerr
				}
				return &TokenPair{
					AccessToken:  at,
					RefreshToken: Token{Token: replacement.Token, Exp: time.Now().UnixMilli() + refreshTokenExpiry*1000},
				}, nil
			}
		}
		return nil, nil
	}

	newTokens, err := s.createTokens(userID)
	if err != nil {
		return nil, err
	}
	if err := s.tokens.Create(ctx, &models.RefreshToken{UserID: userID, Token: newTokens.RefreshToken.Token}); err != nil {
		return nil, err
	}

	now := time.Now()
	existing.IsRevoked = true
	existing.ReplacedByToken = newTokens.RefreshToken.Token
	existing.RevokedAt = &now
	if err := s.tokens.Update(ctx, existing); err != nil {
		return nil, err
	}

	_ = s.tokens.DeleteRevokedBefore(ctx, userID, now.Add(-refreshGrace))

	return &newTokens, nil
}

func (s *Service) RevokeRefreshToken(ctx context.Context, token string) error {
	return s.tokens.RevokeByToken(ctx, token)
}

func (s *Service) DestroyUserSession(ctx context.Context, userID string) error {
	if err := s.tokens.DeleteByUser(ctx, userID); err != nil {
		return err
	}
	user, err := s.users.FindByID(ctx, userID)
	if err == nil {
		user.CurrentAccessToken = ""
		_ = s.users.Update(ctx, user)
	}
	return nil
}
