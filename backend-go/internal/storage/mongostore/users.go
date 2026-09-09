package mongostore

import (
	"context"
	"errors"
	"regexp"

	"github.com/VicarTeam/vicar-backend/internal/models"
	"github.com/VicarTeam/vicar-backend/internal/storage"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type userStore struct{ col *mongo.Collection }

func (s *userStore) one(ctx context.Context, filter bson.M) (*models.User, error) {
	var u models.User
	if err := s.col.FindOne(ctx, filter).Decode(&u); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, storage.ErrNotFound
		}
		return nil, err
	}
	return &u, nil
}

func (s *userStore) FindByID(ctx context.Context, id string) (*models.User, error) {
	o, err := oid(id)
	if err != nil {
		return nil, err
	}
	return s.one(ctx, bson.M{"_id": o})
}

func (s *userStore) FindByUsernameCI(ctx context.Context, username string) (*models.User, error) {
	pattern := "^" + regexp.QuoteMeta(username) + "$"
	return s.one(ctx, bson.M{"username": primitive.Regex{Pattern: pattern, Options: "i"}})
}

func (s *userStore) FindByUsername(ctx context.Context, username string) (*models.User, error) {
	return s.one(ctx, bson.M{"username": username})
}

func (s *userStore) FindByDiscordID(ctx context.Context, discordID string) (*models.User, error) {
	return s.one(ctx, bson.M{"discordId": discordID})
}

func (s *userStore) FindByFvttToken(ctx context.Context, token string) (*models.User, error) {
	return s.one(ctx, bson.M{"fvttToken": token})
}

func (s *userStore) FindByAgentToken(ctx context.Context, token string) (*models.User, error) {
	return s.one(ctx, bson.M{"agentToken": token})
}

func (s *userStore) FindByIDs(ctx context.Context, ids []string) ([]models.User, error) {
	oids := make([]primitive.ObjectID, 0, len(ids))
	for _, id := range ids {
		if o, err := primitive.ObjectIDFromHex(id); err == nil {
			oids = append(oids, o)
		}
	}
	cur, err := s.col.Find(ctx, bson.M{"_id": bson.M{"$in": oids}})
	if err != nil {
		return nil, err
	}
	var out []models.User
	if err := cur.All(ctx, &out); err != nil {
		return nil, err
	}
	return out, nil
}

func (s *userStore) All(ctx context.Context) ([]models.User, error) {
	cur, err := s.col.Find(ctx, bson.M{}, options.Find().SetSort(bson.D{{Key: "username", Value: 1}}))
	if err != nil {
		return nil, err
	}
	var out []models.User
	if err := cur.All(ctx, &out); err != nil {
		return nil, err
	}
	return out, nil
}

func (s *userStore) Create(ctx context.Context, u *models.User) error {
	res, err := s.col.InsertOne(ctx, u)
	if err != nil {
		return err
	}
	u.ID = res.InsertedID.(primitive.ObjectID)
	return nil
}

func (s *userStore) Update(ctx context.Context, u *models.User) error {
	_, err := s.col.ReplaceOne(ctx, bson.M{"_id": u.ID}, u)
	return err
}

func (s *userStore) Delete(ctx context.Context, id string) error {
	o, err := oid(id)
	if err != nil {
		return err
	}
	_, err = s.col.DeleteOne(ctx, bson.M{"_id": o})
	return err
}
