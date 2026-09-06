package postgres

import (
	"context"

	"github.com/VicarTeam/vicar-backend/internal/models"
	"github.com/VicarTeam/vicar-backend/internal/storage"
	"github.com/VicarTeam/vicar-backend/internal/storage/postgres/gen"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type userStore struct{ q *gen.Queries }

func toUser(g gen.User) *models.User {
	return &models.User{
		ID:                 oid(g.ID),
		DiscordID:          g.DiscordID,
		Username:           g.Username,
		Password:           g.Password,
		ShortCode:          g.ShortCode,
		InstalledHomebrew:  bsonFromJSON(g.InstalledHomebrew),
		CurrentAccessToken: g.CurrentAccessToken,
		IsAdmin:            g.IsAdmin,
		FvttToken:          g.FvttToken,
	}
}

func upsertUserParams(u *models.User) gen.UpsertUserParams {
	return gen.UpsertUserParams{
		ID:                 u.IDHex(),
		DiscordID:          u.DiscordID,
		Username:           u.Username,
		Password:           u.Password,
		ShortCode:          u.ShortCode,
		InstalledHomebrew:  jsonFromBson(u.InstalledHomebrew),
		CurrentAccessToken: u.CurrentAccessToken,
		IsAdmin:            u.IsAdmin,
		FvttToken:          u.FvttToken,
	}
}

func (s *userStore) FindByID(ctx context.Context, id string) (*models.User, error) {
	g, err := s.q.GetUserByID(ctx, id)
	return userOrErr(g, err)
}

func (s *userStore) FindByUsernameCI(ctx context.Context, username string) (*models.User, error) {
	g, err := s.q.GetUserByUsernameCI(ctx, username)
	return userOrErr(g, err)
}

func (s *userStore) FindByUsername(ctx context.Context, username string) (*models.User, error) {
	g, err := s.q.GetUserByUsername(ctx, username)
	return userOrErr(g, err)
}

func (s *userStore) FindByDiscordID(ctx context.Context, discordID string) (*models.User, error) {
	g, err := s.q.GetUserByDiscordID(ctx, discordID)
	return userOrErr(g, err)
}

func (s *userStore) FindByFvttToken(ctx context.Context, token string) (*models.User, error) {
	g, err := s.q.GetUserByFvttToken(ctx, token)
	return userOrErr(g, err)
}

func (s *userStore) FindByIDs(ctx context.Context, ids []string) ([]models.User, error) {
	rows, err := s.q.ListUsersByIDs(ctx, ids)
	if err != nil {
		return nil, err
	}
	out := make([]models.User, 0, len(rows))
	for _, g := range rows {
		out = append(out, *toUser(g))
	}
	return out, nil
}

func (s *userStore) All(ctx context.Context) ([]models.User, error) {
	rows, err := s.q.ListUsers(ctx)
	if err != nil {
		return nil, err
	}
	out := make([]models.User, 0, len(rows))
	for _, g := range rows {
		out = append(out, *toUser(g))
	}
	return out, nil
}

func (s *userStore) Create(ctx context.Context, u *models.User) error {
	if u.ID.IsZero() {
		u.ID = primitive.NewObjectID()
	}
	return s.q.UpsertUser(ctx, upsertUserParams(u))
}

func (s *userStore) Update(ctx context.Context, u *models.User) error {
	return s.q.UpsertUser(ctx, upsertUserParams(u))
}

func (s *userStore) Delete(ctx context.Context, id string) error {
	return s.q.DeleteUser(ctx, id)
}

func userOrErr(g gen.User, err error) (*models.User, error) {
	if err != nil {
		if notFound(err) {
			return nil, storage.ErrNotFound
		}
		return nil, err
	}
	return toUser(g), nil
}
