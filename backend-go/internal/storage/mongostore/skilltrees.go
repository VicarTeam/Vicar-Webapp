package mongostore

import (
	"context"
	"errors"

	"github.com/VicarTeam/vicar-backend/internal/models"
	"github.com/VicarTeam/vicar-backend/internal/storage"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type skillTreeStore struct{ col *mongo.Collection }

func (s *skillTreeStore) one(ctx context.Context, filter bson.M) (*models.SkillTree, error) {
	var t models.SkillTree
	if err := s.col.FindOne(ctx, filter).Decode(&t); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, storage.ErrNotFound
		}
		return nil, err
	}
	return &t, nil
}

func (s *skillTreeStore) FindByUser(ctx context.Context, userID string) ([]models.SkillTree, error) {
	cur, err := s.col.Find(ctx, bson.M{"userId": userID})
	if err != nil {
		return nil, err
	}
	var out []models.SkillTree
	if err := cur.All(ctx, &out); err != nil {
		return nil, err
	}
	return out, nil
}

func (s *skillTreeStore) FindByCode(ctx context.Context, code string) (*models.SkillTree, error) {
	return s.one(ctx, bson.M{"bonusCode": code})
}

func (s *skillTreeStore) FindByCodeExcluding(ctx context.Context, code, excludeID string) (*models.SkillTree, error) {
	o, err := oid(excludeID)
	if err != nil {
		return nil, err
	}
	return s.one(ctx, bson.M{"bonusCode": code, "_id": bson.M{"$ne": o}})
}

func (s *skillTreeStore) GetOwned(ctx context.Context, id, userID string) (*models.SkillTree, error) {
	o, err := oid(id)
	if err != nil {
		return nil, err
	}
	return s.one(ctx, bson.M{"_id": o, "userId": userID})
}

func (s *skillTreeStore) Create(ctx context.Context, t *models.SkillTree) (string, error) {
	res, err := s.col.InsertOne(ctx, t)
	if err != nil {
		return "", err
	}
	id := res.InsertedID.(primitive.ObjectID)
	t.ID = id
	return id.Hex(), nil
}

func (s *skillTreeStore) Save(ctx context.Context, t *models.SkillTree) error {
	_, err := s.col.ReplaceOne(ctx, bson.M{"_id": t.ID}, t)
	return err
}

func (s *skillTreeStore) Delete(ctx context.Context, id string) error {
	o, err := oid(id)
	if err != nil {
		return err
	}
	_, err = s.col.DeleteOne(ctx, bson.M{"_id": o})
	return err
}
