package postgres

import (
	"context"

	"github.com/VicarTeam/vicar-backend/internal/models"
	"github.com/VicarTeam/vicar-backend/internal/storage"
	"github.com/VicarTeam/vicar-backend/internal/storage/postgres/gen"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type characterStore struct{ q *gen.Queries }

// summaryFields is the flat projected form used to rebuild the card shape.
type summaryFields struct {
	id, game, name, avatar, avatarOrientation, sex, concept string
	clanName, clanSlogan, clanNickname                      string
	tribeName, auspiceName, traditionName, creedName        string
	generation                                              int32
	generationEra                                           string
	hasCainsMark                                            bool
	chronicle                                               string
	exp                                                     int32
	directory, dataVersion                                  string
}

// buildSummary rebuilds the projected subdocument the frontend card expects
// (nested discriminator objects only when present), matching Mongo's projection.
func buildSummary(f summaryFields) bson.M {
	m := bson.M{
		"name":              f.name,
		"avatar":            f.avatar,
		"avatarOrientation": f.avatarOrientation,
		"sex":               f.sex,
		"concept":           f.concept,
		"generation":        f.generation,
		"generationEra":     f.generationEra,
		"hasCainsMark":      f.hasCainsMark,
		"chronicle":         f.chronicle,
		"exp":               f.exp,
		"game":              f.game,
	}
	if f.directory != "" {
		m["directory"] = f.directory
	}
	if f.dataVersion != "" {
		m["version"] = f.dataVersion
	}
	if f.clanName != "" {
		m["clan"] = bson.M{"name": f.clanName, "slogan": f.clanSlogan, "nickname": f.clanNickname}
	}
	if f.tribeName != "" {
		m["tribe"] = bson.M{"name": f.tribeName}
	}
	if f.auspiceName != "" {
		m["auspice"] = bson.M{"name": f.auspiceName}
	}
	if f.traditionName != "" {
		m["tradition"] = bson.M{"name": f.traditionName}
	}
	if f.creedName != "" {
		m["creed"] = bson.M{"name": f.creedName}
	}
	return m
}

func summaryChar(f summaryFields) models.Character {
	return models.Character{ID: oid(f.id), Data: buildSummary(f)}
}

func (s *characterStore) OwnedSummaries(ctx context.Context, userID string) ([]models.Character, error) {
	rows, err := s.q.ListOwnedSummaries(ctx, userID)
	if err != nil {
		return nil, err
	}
	out := make([]models.Character, 0, len(rows))
	for _, r := range rows {
		out = append(out, summaryChar(summaryFields{
			id: r.ID, game: r.Game.String, name: r.Name.String, avatar: r.Avatar.String,
			avatarOrientation: r.AvatarOrientation.String, sex: r.Sex.String, concept: r.Concept.String,
			clanName: r.ClanName.String, clanSlogan: r.ClanSlogan.String, clanNickname: r.ClanNickname.String,
			tribeName: r.TribeName.String, auspiceName: r.AuspiceName.String, traditionName: r.TraditionName.String,
			creedName: r.CreedName.String, generation: r.Generation.Int32, generationEra: r.GenerationEra.String,
			hasCainsMark: r.HasCainsMark.Bool, chronicle: r.Chronicle.String, exp: r.Exp.Int32,
			directory: r.Directory.String, dataVersion: r.DataVersion.String,
		}))
	}
	return out, nil
}

func (s *characterStore) SharedSummaries(ctx context.Context, userID string) ([]models.Character, error) {
	rows, err := s.q.ListSharedSummaries(ctx, userID)
	if err != nil {
		return nil, err
	}
	out := make([]models.Character, 0, len(rows))
	for _, r := range rows {
		out = append(out, summaryChar(summaryFields{
			id: r.ID, game: r.Game.String, name: r.Name.String, avatar: r.Avatar.String,
			avatarOrientation: r.AvatarOrientation.String, sex: r.Sex.String, concept: r.Concept.String,
			clanName: r.ClanName.String, clanSlogan: r.ClanSlogan.String, clanNickname: r.ClanNickname.String,
			tribeName: r.TribeName.String, auspiceName: r.AuspiceName.String, traditionName: r.TraditionName.String,
			creedName: r.CreedName.String, generation: r.Generation.Int32, generationEra: r.GenerationEra.String,
			hasCainsMark: r.HasCainsMark.Bool, chronicle: r.Chronicle.String, exp: r.Exp.Int32,
			directory: r.Directory.String, dataVersion: r.DataVersion.String,
		}))
	}
	return out, nil
}

func (s *characterStore) OwnedMini(ctx context.Context, userID string) ([]models.Character, error) {
	rows, err := s.q.ListOwnedMini(ctx, userID)
	if err != nil {
		return nil, err
	}
	out := make([]models.Character, 0, len(rows))
	for _, r := range rows {
		out = append(out, models.Character{
			ID:   oid(r.ID),
			Data: bson.M{"name": r.Name.String, "game": r.Game.String, "avatar": r.Avatar.String},
		})
	}
	return out, nil
}

func (s *characterStore) GetForRead(ctx context.Context, id, userID string) (*models.Character, error) {
	r, err := s.q.GetCharacterForRead(ctx, gen.GetCharacterForReadParams{ID: id, UserID: userID})
	if err != nil {
		return nil, mapErr(err)
	}
	return &models.Character{ID: oid(r.ID), UserID: r.UserID, Viewers: r.Viewers, Data: bsonFromJSON(r.Data)}, nil
}

func (s *characterStore) GetOwned(ctx context.Context, id, userID string) (*models.Character, error) {
	r, err := s.q.GetCharacterOwned(ctx, gen.GetCharacterOwnedParams{ID: id, UserID: userID})
	if err != nil {
		return nil, mapErr(err)
	}
	return &models.Character{ID: oid(r.ID), UserID: r.UserID, Viewers: r.Viewers, Data: bsonFromJSON(r.Data)}, nil
}

func (s *characterStore) Get(ctx context.Context, id string) (*models.Character, error) {
	r, err := s.q.GetCharacter(ctx, id)
	if err != nil {
		return nil, mapErr(err)
	}
	return &models.Character{ID: oid(r.ID), UserID: r.UserID, Viewers: r.Viewers, Data: bsonFromJSON(r.Data)}, nil
}

func (s *characterStore) Create(ctx context.Context, userID string, data bson.M) (string, error) {
	c := &models.Character{ID: primitive.NewObjectID(), UserID: userID, Viewers: []string{}, Data: data}
	if err := s.Insert(ctx, c); err != nil {
		return "", err
	}
	return c.IDHex(), nil
}

func (s *characterStore) Insert(ctx context.Context, c *models.Character) error {
	if c.ID.IsZero() {
		c.ID = primitive.NewObjectID()
	}
	viewers := c.Viewers
	if viewers == nil {
		viewers = []string{}
	}
	// InsertCharacter is ON CONFLICT DO NOTHING; ReplaceData afterwards makes the
	// call an idempotent upsert of the blob (needed for backfill/dual-write).
	if err := s.q.InsertCharacter(ctx, gen.InsertCharacterParams{
		ID: c.IDHex(), UserID: c.UserID, Viewers: viewers, Data: jsonFromBson(c.Data),
	}); err != nil {
		return err
	}
	if err := s.q.UpdateCharacterData(ctx, gen.UpdateCharacterDataParams{ID: c.IDHex(), Data: jsonFromBson(c.Data)}); err != nil {
		return err
	}
	return s.q.UpdateCharacterViewers(ctx, gen.UpdateCharacterViewersParams{ID: c.IDHex(), Viewers: viewers})
}

func (s *characterStore) ReplaceData(ctx context.Context, id string, data bson.M) error {
	return s.q.UpdateCharacterData(ctx, gen.UpdateCharacterDataParams{ID: id, Data: jsonFromBson(data)})
}

func (s *characterStore) Save(ctx context.Context, c *models.Character) error {
	viewers := c.Viewers
	if viewers == nil {
		viewers = []string{}
	}
	return s.q.UpdateCharacterViewers(ctx, gen.UpdateCharacterViewersParams{ID: c.IDHex(), Viewers: viewers})
}

func (s *characterStore) Delete(ctx context.Context, id string) error {
	return s.q.DeleteCharacter(ctx, id)
}

func (s *characterStore) CountByUser(ctx context.Context, userID string) (int64, error) {
	return s.q.CountCharactersByUser(ctx, userID)
}

func (s *characterStore) DeleteByUser(ctx context.Context, userID string) error {
	return s.q.DeleteCharactersByUser(ctx, userID)
}

func mapErr(err error) error {
	if notFound(err) {
		return storage.ErrNotFound
	}
	return err
}
