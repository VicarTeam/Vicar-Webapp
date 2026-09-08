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

type folderStore struct{ col *mongo.Collection }

func (s *folderStore) FindByUser(ctx context.Context, userID string) ([]models.Folder, error) {
	cur, err := s.col.Find(ctx, bson.M{"userId": userID})
	if err != nil {
		return nil, err
	}
	var out []models.Folder
	if err := cur.All(ctx, &out); err != nil {
		return nil, err
	}
	return out, nil
}

func (s *folderStore) GetOwned(ctx context.Context, id, userID string) (*models.Folder, error) {
	o, err := oid(id)
	if err != nil {
		return nil, err
	}
	var f models.Folder
	if err := s.col.FindOne(ctx, bson.M{"_id": o, "userId": userID}).Decode(&f); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, storage.ErrNotFound
		}
		return nil, err
	}
	return &f, nil
}

func (s *folderStore) Create(ctx context.Context, f *models.Folder) (string, error) {
	if f.Characters == nil {
		f.Characters = []string{}
	}
	res, err := s.col.InsertOne(ctx, f)
	if err != nil {
		return "", err
	}
	id := res.InsertedID.(primitive.ObjectID)
	f.ID = id
	return id.Hex(), nil
}

func (s *folderStore) Save(ctx context.Context, f *models.Folder) error {
	if f.Characters == nil {
		f.Characters = []string{}
	}
	_, err := s.col.ReplaceOne(ctx, bson.M{"_id": f.ID}, f)
	return err
}

func (s *folderStore) Delete(ctx context.Context, id string) error {
	o, err := oid(id)
	if err != nil {
		return err
	}
	_, err = s.col.DeleteOne(ctx, bson.M{"_id": o})
	return err
}
