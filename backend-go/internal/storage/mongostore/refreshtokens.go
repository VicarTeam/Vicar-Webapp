package mongostore

import (
	"context"
	"errors"
	"time"

	"github.com/VicarTeam/vicar-backend/internal/models"
	"github.com/VicarTeam/vicar-backend/internal/storage"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type refreshTokenStore struct{ col *mongo.Collection }

func (s *refreshTokenStore) one(ctx context.Context, filter bson.M) (*models.RefreshToken, error) {
	var t models.RefreshToken
	if err := s.col.FindOne(ctx, filter).Decode(&t); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, storage.ErrNotFound
		}
		return nil, err
	}
	return &t, nil
}

func (s *refreshTokenStore) Create(ctx context.Context, t *models.RefreshToken) error {
	res, err := s.col.InsertOne(ctx, t)
	if err != nil {
		return err
	}
	t.ID = res.InsertedID.(primitive.ObjectID)
	return nil
}

func (s *refreshTokenStore) FindByTokenAndUser(ctx context.Context, token, userID string) (*models.RefreshToken, error) {
	return s.one(ctx, bson.M{"token": token, "userId": userID})
}

func (s *refreshTokenStore) FindActiveByToken(ctx context.Context, token string) (*models.RefreshToken, error) {
	return s.one(ctx, bson.M{"token": token, "isRevoked": false})
}

func (s *refreshTokenStore) Update(ctx context.Context, t *models.RefreshToken) error {
	_, err := s.col.ReplaceOne(ctx, bson.M{"_id": t.ID}, t)
	return err
}

func (s *refreshTokenStore) RevokeByToken(ctx context.Context, token string) error {
	now := time.Now()
	_, err := s.col.UpdateOne(ctx, bson.M{"token": token},
		bson.M{"$set": bson.M{"isRevoked": true, "revokedAt": now}})
	return err
}

func (s *refreshTokenStore) DeleteByUser(ctx context.Context, userID string) error {
	_, err := s.col.DeleteMany(ctx, bson.M{"userId": userID})
	return err
}

func (s *refreshTokenStore) DeleteRevokedBefore(ctx context.Context, userID string, before time.Time) error {
	_, err := s.col.DeleteMany(ctx, bson.M{
		"userId":    userID,
		"isRevoked": true,
		"revokedAt": bson.M{"$lt": before},
	})
	return err
}
