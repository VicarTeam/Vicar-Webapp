package postgres

import (
	"context"

	"github.com/VicarTeam/vicar-backend/internal/models"
	"github.com/VicarTeam/vicar-backend/internal/storage"
	"github.com/VicarTeam/vicar-backend/internal/storage/postgres/gen"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type skillTreeStore struct{ q *gen.Queries }

func toSkillTree(g gen.SkillTree) *models.SkillTree {
	return &models.SkillTree{
		ID:        oid(g.ID),
		BonusCode: g.BonusCode,
		UserID:    g.UserID,
		Data:      bsonFromJSON(g.Data),
	}
}

func (s *skillTreeStore) FindByUser(ctx context.Context, userID string) ([]models.SkillTree, error) {
	rows, err := s.q.FindSkillTreesByUser(ctx, userID)
	if err != nil {
		return nil, err
	}
	out := make([]models.SkillTree, 0, len(rows))
	for _, g := range rows {
		out = append(out, *toSkillTree(g))
	}
	return out, nil
}

func (s *skillTreeStore) FindByCode(ctx context.Context, code string) (*models.SkillTree, error) {
	g, err := s.q.FindSkillTreeByCode(ctx, code)
	return skillTreeOrErr(g, err)
}

func (s *skillTreeStore) FindByCodeExcluding(ctx context.Context, code, excludeID string) (*models.SkillTree, error) {
	g, err := s.q.FindSkillTreeByCodeExcluding(ctx, gen.FindSkillTreeByCodeExcludingParams{BonusCode: code, ID: excludeID})
	return skillTreeOrErr(g, err)
}

func (s *skillTreeStore) GetOwned(ctx context.Context, id, userID string) (*models.SkillTree, error) {
	g, err := s.q.GetSkillTreeOwned(ctx, gen.GetSkillTreeOwnedParams{ID: id, UserID: userID})
	return skillTreeOrErr(g, err)
}

func (s *skillTreeStore) Create(ctx context.Context, t *models.SkillTree) (string, error) {
	if t.ID.IsZero() {
		t.ID = primitive.NewObjectID()
	}
	if err := s.upsert(ctx, t); err != nil {
		return "", err
	}
	return t.IDHex(), nil
}

func (s *skillTreeStore) Save(ctx context.Context, t *models.SkillTree) error {
	return s.upsert(ctx, t)
}

func (s *skillTreeStore) upsert(ctx context.Context, t *models.SkillTree) error {
	return s.q.UpsertSkillTree(ctx, gen.UpsertSkillTreeParams{
		ID:        t.IDHex(),
		BonusCode: t.BonusCode,
		UserID:    t.UserID,
		Data:      jsonFromBson(t.Data),
	})
}

func (s *skillTreeStore) Delete(ctx context.Context, id string) error {
	return s.q.DeleteSkillTree(ctx, id)
}

func skillTreeOrErr(g gen.SkillTree, err error) (*models.SkillTree, error) {
	if err != nil {
		if notFound(err) {
			return nil, storage.ErrNotFound
		}
		return nil, err
	}
	return toSkillTree(g), nil
}
