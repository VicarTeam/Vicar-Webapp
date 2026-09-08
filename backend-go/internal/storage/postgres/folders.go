package postgres

import (
	"context"

	"github.com/VicarTeam/vicar-backend/internal/models"
	"github.com/VicarTeam/vicar-backend/internal/storage"
	"github.com/VicarTeam/vicar-backend/internal/storage/postgres/gen"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type folderStore struct{ q *gen.Queries }

func toFolder(g gen.Folder) *models.Folder {
	chars := g.Characters
	if chars == nil {
		chars = []string{}
	}
	return &models.Folder{
		ID:         oid(g.ID),
		UserID:     g.UserID,
		Name:       g.Name,
		ParentID:   g.ParentID,
		Position:   g.Position,
		Characters: chars,
	}
}

func (s *folderStore) FindByUser(ctx context.Context, userID string) ([]models.Folder, error) {
	rows, err := s.q.FindFoldersByUser(ctx, userID)
	if err != nil {
		return nil, err
	}
	out := make([]models.Folder, 0, len(rows))
	for _, g := range rows {
		out = append(out, *toFolder(g))
	}
	return out, nil
}

func (s *folderStore) GetOwned(ctx context.Context, id, userID string) (*models.Folder, error) {
	g, err := s.q.GetFolderOwned(ctx, gen.GetFolderOwnedParams{ID: id, UserID: userID})
	if err != nil {
		if notFound(err) {
			return nil, storage.ErrNotFound
		}
		return nil, err
	}
	return toFolder(g), nil
}

func (s *folderStore) Create(ctx context.Context, f *models.Folder) (string, error) {
	if f.ID.IsZero() {
		f.ID = primitive.NewObjectID()
	}
	if err := s.upsert(ctx, f); err != nil {
		return "", err
	}
	return f.IDHex(), nil
}

func (s *folderStore) Save(ctx context.Context, f *models.Folder) error {
	return s.upsert(ctx, f)
}

func (s *folderStore) upsert(ctx context.Context, f *models.Folder) error {
	chars := f.Characters
	if chars == nil {
		chars = []string{}
	}
	return s.q.UpsertFolder(ctx, gen.UpsertFolderParams{
		ID:         f.IDHex(),
		UserID:     f.UserID,
		Name:       f.Name,
		ParentID:   f.ParentID,
		Position:   f.Position,
		Characters: chars,
	})
}

func (s *folderStore) Delete(ctx context.Context, id string) error {
	return s.q.DeleteFolder(ctx, id)
}
