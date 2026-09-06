package mongostore

import (
	"context"
	"errors"

	"github.com/VicarTeam/vicar-backend/internal/models"
	"github.com/VicarTeam/vicar-backend/internal/storage"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type characterStore struct{ col *mongo.Collection }

// summaryProjection matches the legacy SUMMARY_PROJECTION: only the fields the
// character card renders, so the app-start list never ships the whole blob.
var summaryProjection = bson.M{
	"data.name":              1,
	"data.avatar":            1,
	"data.avatarOrientation": 1,
	"data.sex":               1,
	"data.concept":           1,
	"data.clan.name":         1,
	"data.clan.slogan":       1,
	"data.clan.nickname":     1,
	"data.tribe.name":        1,
	"data.auspice.name":      1,
	"data.tradition.name":    1,
	"data.creed.name":        1,
	"data.generation":        1,
	"data.generationEra":     1,
	"data.hasCainsMark":      1,
	"data.chronicle":         1,
	"data.exp":               1,
	"data.game":              1,
	"data.directory":         1,
	"data.version":           1,
}

var miniProjection = bson.M{"data.name": 1, "data.game": 1, "data.avatar": 1}

func (s *characterStore) find(ctx context.Context, filter, projection bson.M) ([]models.Character, error) {
	opts := options.Find()
	if projection != nil {
		opts.SetProjection(projection)
	}
	cur, err := s.col.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	var out []models.Character
	if err := cur.All(ctx, &out); err != nil {
		return nil, err
	}
	return out, nil
}

func (s *characterStore) one(ctx context.Context, filter bson.M) (*models.Character, error) {
	var c models.Character
	if err := s.col.FindOne(ctx, filter).Decode(&c); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, storage.ErrNotFound
		}
		return nil, err
	}
	return &c, nil
}

func (s *characterStore) OwnedSummaries(ctx context.Context, userID string) ([]models.Character, error) {
	return s.find(ctx, bson.M{"userId": userID}, summaryProjection)
}

func (s *characterStore) SharedSummaries(ctx context.Context, userID string) ([]models.Character, error) {
	return s.find(ctx, bson.M{"viewers": userID}, summaryProjection)
}

func (s *characterStore) OwnedMini(ctx context.Context, userID string) ([]models.Character, error) {
	return s.find(ctx, bson.M{"userId": userID}, miniProjection)
}

func (s *characterStore) GetForRead(ctx context.Context, id, userID string) (*models.Character, error) {
	o, err := oid(id)
	if err != nil {
		return nil, err
	}
	return s.one(ctx, bson.M{"_id": o, "$or": bson.A{bson.M{"userId": userID}, bson.M{"viewers": userID}}})
}

func (s *characterStore) GetOwned(ctx context.Context, id, userID string) (*models.Character, error) {
	o, err := oid(id)
	if err != nil {
		return nil, err
	}
	return s.one(ctx, bson.M{"_id": o, "userId": userID})
}

func (s *characterStore) Get(ctx context.Context, id string) (*models.Character, error) {
	o, err := oid(id)
	if err != nil {
		return nil, err
	}
	return s.one(ctx, bson.M{"_id": o})
}

func (s *characterStore) Create(ctx context.Context, userID string, data bson.M) (string, error) {
	id := primitive.NewObjectID()
	c := &models.Character{ID: id, UserID: userID, Viewers: []string{}, Data: data}
	if err := s.Insert(ctx, c); err != nil {
		return "", err
	}
	return id.Hex(), nil
}

// Insert upserts a character under its explicit id (idempotent).
func (s *characterStore) Insert(ctx context.Context, c *models.Character) error {
	id := c.ID
	if id.IsZero() {
		id = primitive.NewObjectID()
		c.ID = id
	}
	viewers := c.Viewers
	if viewers == nil {
		viewers = []string{}
	}
	doc := bson.M{"userId": c.UserID, "viewers": viewers, "data": c.Data}
	opts := options.Replace().SetUpsert(true)
	_, err := s.col.ReplaceOne(ctx, bson.M{"_id": id}, doc, opts)
	return err
}

func (s *characterStore) ReplaceData(ctx context.Context, id string, data bson.M) error {
	o, err := oid(id)
	if err != nil {
		return err
	}
	_, err = s.col.UpdateOne(ctx, bson.M{"_id": o}, bson.M{"$set": bson.M{"data": data}})
	return err
}

func (s *characterStore) Save(ctx context.Context, c *models.Character) error {
	_, err := s.col.ReplaceOne(ctx, bson.M{"_id": c.ID}, c)
	return err
}

func (s *characterStore) Delete(ctx context.Context, id string) error {
	o, err := oid(id)
	if err != nil {
		return err
	}
	_, err = s.col.DeleteOne(ctx, bson.M{"_id": o})
	return err
}

func (s *characterStore) CountByUser(ctx context.Context, userID string) (int64, error) {
	return s.col.CountDocuments(ctx, bson.M{"userId": userID})
}

func (s *characterStore) DeleteByUser(ctx context.Context, userID string) error {
	_, err := s.col.DeleteMany(ctx, bson.M{"userId": userID})
	return err
}

// AllIDs returns the ids of all characters (optionally scoped to an owner). Used
// by the split store's bulk migration sweeper.
func (s *characterStore) AllIDs(ctx context.Context, ownerID string) ([]string, error) {
	filter := bson.M{}
	if ownerID != "" {
		filter["userId"] = ownerID
	}
	cur, err := s.col.Find(ctx, filter, options.Find().SetProjection(bson.M{"_id": 1}))
	if err != nil {
		return nil, err
	}
	var docs []struct {
		ID primitive.ObjectID `bson:"_id"`
	}
	if err := cur.All(ctx, &docs); err != nil {
		return nil, err
	}
	ids := make([]string, 0, len(docs))
	for _, d := range docs {
		ids = append(ids, d.ID.Hex())
	}
	return ids, nil
}
