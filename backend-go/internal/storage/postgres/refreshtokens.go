package postgres

import (
	"context"
	"time"

	"github.com/VicarTeam/vicar-backend/internal/models"
	"github.com/VicarTeam/vicar-backend/internal/storage"
	"github.com/VicarTeam/vicar-backend/internal/storage/postgres/gen"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type refreshTokenStore struct{ q *gen.Queries }

func toRefreshToken(g gen.RefreshToken) *models.RefreshToken {
	return &models.RefreshToken{
		ID:              oid(g.ID),
		UserID:          g.UserID,
		Token:           g.Token,
		IsRevoked:       g.IsRevoked,
		ReplacedByToken: g.ReplacedByToken,
		RevokedAt:       ptrFromTs(g.RevokedAt),
	}
}

func (s *refreshTokenStore) Create(ctx context.Context, t *models.RefreshToken) error {
	if t.ID.IsZero() {
		t.ID = primitive.NewObjectID()
	}
	return s.q.InsertRefreshToken(ctx, gen.InsertRefreshTokenParams{
		ID:              t.IDHex(),
		UserID:          t.UserID,
		Token:           t.Token,
		IsRevoked:       t.IsRevoked,
		ReplacedByToken: t.ReplacedByToken,
		RevokedAt:       tsFromPtr(t.RevokedAt),
	})
}

func (s *refreshTokenStore) FindByTokenAndUser(ctx context.Context, token, userID string) (*models.RefreshToken, error) {
	g, err := s.q.GetRefreshTokenByTokenAndUser(ctx, gen.GetRefreshTokenByTokenAndUserParams{Token: token, UserID: userID})
	return refreshOrErr(g, err)
}

func (s *refreshTokenStore) FindActiveByToken(ctx context.Context, token string) (*models.RefreshToken, error) {
	g, err := s.q.GetActiveRefreshTokenByToken(ctx, token)
	return refreshOrErr(g, err)
}

func (s *refreshTokenStore) Update(ctx context.Context, t *models.RefreshToken) error {
	return s.q.UpdateRefreshToken(ctx, gen.UpdateRefreshTokenParams{
		ID:              t.IDHex(),
		IsRevoked:       t.IsRevoked,
		ReplacedByToken: t.ReplacedByToken,
		RevokedAt:       tsFromPtr(t.RevokedAt),
	})
}

func (s *refreshTokenStore) RevokeByToken(ctx context.Context, token string) error {
	return s.q.RevokeRefreshTokenByToken(ctx, token)
}

func (s *refreshTokenStore) DeleteByUser(ctx context.Context, userID string) error {
	return s.q.DeleteRefreshTokensByUser(ctx, userID)
}

func (s *refreshTokenStore) DeleteRevokedBefore(ctx context.Context, userID string, before time.Time) error {
	return s.q.DeleteRevokedRefreshTokensBefore(ctx, gen.DeleteRevokedRefreshTokensBeforeParams{
		UserID:    userID,
		RevokedAt: pgTs(before),
	})
}

func refreshOrErr(g gen.RefreshToken, err error) (*models.RefreshToken, error) {
	if err != nil {
		if notFound(err) {
			return nil, storage.ErrNotFound
		}
		return nil, err
	}
	return toRefreshToken(g), nil
}
