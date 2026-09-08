// Package dualstore reads/writes both MongoDB and PostgreSQL during the gradual,
// migration-free transition. One store is primary (authoritative), the other is
// a best-effort mirror. In pg-primary mode, reads that miss in Postgres fall back
// to Mongo and lazily backfill Postgres; list reads union both so not-yet-migrated
// characters still appear.
package dualstore

import (
	"context"
	"errors"
	"log"
	"time"

	"github.com/VicarTeam/vicar-backend/internal/models"
	"github.com/VicarTeam/vicar-backend/internal/storage"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Mode string

const (
	MongoPrimary Mode = "dual_write_mongo_primary"
	PGPrimary    Mode = "dual_write_pg_primary"
)

type Store struct {
	primary   storage.Provider
	secondary storage.Provider
	fallback  bool // read fallback + backfill + list-union from secondary (pg-primary only)

	users   *dualUsers
	refresh *dualRefresh
	chars   *dualChars
	trees   *dualTrees
	folders *dualFolders
}

// New builds a dual store. mongo and pg are the two underlying providers.
func New(mongo, pg storage.Provider, mode Mode) *Store {
	s := &Store{}
	if mode == PGPrimary {
		s.primary, s.secondary, s.fallback = pg, mongo, true
	} else {
		s.primary, s.secondary, s.fallback = mongo, pg, false
	}
	s.users = &dualUsers{s}
	s.refresh = &dualRefresh{s}
	s.chars = &dualChars{s}
	s.trees = &dualTrees{s}
	s.folders = &dualFolders{s}
	return s
}

func (s *Store) Users() storage.UserStore                 { return s.users }
func (s *Store) RefreshTokens() storage.RefreshTokenStore { return s.refresh }
func (s *Store) Characters() storage.CharacterStore       { return s.chars }
func (s *Store) SkillTrees() storage.SkillTreeStore       { return s.trees }
func (s *Store) Folders() storage.FolderStore             { return s.folders }

func (s *Store) Close(ctx context.Context) error {
	e1 := s.primary.Close(ctx)
	e2 := s.secondary.Close(ctx)
	if e1 != nil {
		return e1
	}
	return e2
}

func logErr(op string, err error) {
	if err != nil {
		log.Printf("dualstore: %s: %v", op, err)
	}
}

func isNotFound(err error) bool { return errors.Is(err, storage.ErrNotFound) }

// ============================== users ==============================

type dualUsers struct{ s *Store }

func (d *dualUsers) find(ctx context.Context, primary func(storage.UserStore) (*models.User, error)) (*models.User, error) {
	u, err := primary(d.s.primary.Users())
	if err == nil {
		return u, nil
	}
	if !isNotFound(err) || !d.s.fallback {
		return nil, err
	}
	u2, err2 := primary(d.s.secondary.Users())
	if err2 != nil {
		return nil, err
	}
	logErr("backfill user", d.s.primary.Users().Create(ctx, cloneUser(u2)))
	return u2, nil
}

func (d *dualUsers) FindByID(ctx context.Context, id string) (*models.User, error) {
	return d.find(ctx, func(u storage.UserStore) (*models.User, error) { return u.FindByID(ctx, id) })
}
func (d *dualUsers) FindByUsernameCI(ctx context.Context, username string) (*models.User, error) {
	return d.find(ctx, func(u storage.UserStore) (*models.User, error) { return u.FindByUsernameCI(ctx, username) })
}
func (d *dualUsers) FindByUsername(ctx context.Context, username string) (*models.User, error) {
	return d.find(ctx, func(u storage.UserStore) (*models.User, error) { return u.FindByUsername(ctx, username) })
}
func (d *dualUsers) FindByDiscordID(ctx context.Context, discordID string) (*models.User, error) {
	return d.find(ctx, func(u storage.UserStore) (*models.User, error) { return u.FindByDiscordID(ctx, discordID) })
}
func (d *dualUsers) FindByFvttToken(ctx context.Context, token string) (*models.User, error) {
	return d.find(ctx, func(u storage.UserStore) (*models.User, error) { return u.FindByFvttToken(ctx, token) })
}

func (d *dualUsers) FindByIDs(ctx context.Context, ids []string) ([]models.User, error) {
	return d.s.primary.Users().FindByIDs(ctx, ids)
}
func (d *dualUsers) All(ctx context.Context) ([]models.User, error) {
	return d.s.primary.Users().All(ctx)
}

func (d *dualUsers) Create(ctx context.Context, u *models.User) error {
	if u.ID.IsZero() {
		u.ID = primitive.NewObjectID()
	}
	if err := d.s.primary.Users().Create(ctx, u); err != nil {
		return err
	}
	logErr("secondary user create", d.s.secondary.Users().Create(ctx, cloneUser(u)))
	return nil
}

func (d *dualUsers) Update(ctx context.Context, u *models.User) error {
	if err := d.s.primary.Users().Update(ctx, u); err != nil {
		return err
	}
	logErr("secondary user update", d.s.secondary.Users().Update(ctx, cloneUser(u)))
	return nil
}

func (d *dualUsers) Delete(ctx context.Context, id string) error {
	if err := d.s.primary.Users().Delete(ctx, id); err != nil {
		return err
	}
	logErr("secondary user delete", d.s.secondary.Users().Delete(ctx, id))
	return nil
}

// ========================== refresh tokens ==========================

type dualRefresh struct{ s *Store }

func (d *dualRefresh) Create(ctx context.Context, t *models.RefreshToken) error {
	if t.ID.IsZero() {
		t.ID = primitive.NewObjectID()
	}
	if err := d.s.primary.RefreshTokens().Create(ctx, t); err != nil {
		return err
	}
	logErr("secondary rt create", d.s.secondary.RefreshTokens().Create(ctx, cloneRefresh(t)))
	return nil
}

func (d *dualRefresh) FindByTokenAndUser(ctx context.Context, token, userID string) (*models.RefreshToken, error) {
	t, err := d.s.primary.RefreshTokens().FindByTokenAndUser(ctx, token, userID)
	if err == nil {
		return t, nil
	}
	if !isNotFound(err) || !d.s.fallback {
		return nil, err
	}
	t2, err2 := d.s.secondary.RefreshTokens().FindByTokenAndUser(ctx, token, userID)
	if err2 != nil {
		return nil, err
	}
	logErr("backfill rt", d.s.primary.RefreshTokens().Create(ctx, cloneRefresh(t2)))
	return t2, nil
}

func (d *dualRefresh) FindActiveByToken(ctx context.Context, token string) (*models.RefreshToken, error) {
	t, err := d.s.primary.RefreshTokens().FindActiveByToken(ctx, token)
	if err == nil {
		return t, nil
	}
	if !isNotFound(err) || !d.s.fallback {
		return nil, err
	}
	return d.s.secondary.RefreshTokens().FindActiveByToken(ctx, token)
}

func (d *dualRefresh) Update(ctx context.Context, t *models.RefreshToken) error {
	if err := d.s.primary.RefreshTokens().Update(ctx, t); err != nil {
		return err
	}
	logErr("secondary rt update", d.s.secondary.RefreshTokens().Update(ctx, cloneRefresh(t)))
	return nil
}

func (d *dualRefresh) RevokeByToken(ctx context.Context, token string) error {
	if err := d.s.primary.RefreshTokens().RevokeByToken(ctx, token); err != nil {
		return err
	}
	logErr("secondary rt revoke", d.s.secondary.RefreshTokens().RevokeByToken(ctx, token))
	return nil
}

func (d *dualRefresh) DeleteByUser(ctx context.Context, userID string) error {
	if err := d.s.primary.RefreshTokens().DeleteByUser(ctx, userID); err != nil {
		return err
	}
	logErr("secondary rt delete", d.s.secondary.RefreshTokens().DeleteByUser(ctx, userID))
	return nil
}

func (d *dualRefresh) DeleteRevokedBefore(ctx context.Context, userID string, before time.Time) error {
	if err := d.s.primary.RefreshTokens().DeleteRevokedBefore(ctx, userID, before); err != nil {
		return err
	}
	logErr("secondary rt gc", d.s.secondary.RefreshTokens().DeleteRevokedBefore(ctx, userID, before))
	return nil
}

// ============================ characters ============================

type dualChars struct{ s *Store }

func (d *dualChars) get(ctx context.Context, primary func(storage.CharacterStore) (*models.Character, error)) (*models.Character, error) {
	c, err := primary(d.s.primary.Characters())
	if err == nil {
		return c, nil
	}
	if !isNotFound(err) || !d.s.fallback {
		return nil, err
	}
	c2, err2 := primary(d.s.secondary.Characters())
	if err2 != nil {
		return nil, err
	}
	logErr("backfill character", d.s.primary.Characters().Insert(ctx, cloneChar(c2)))
	return c2, nil
}

func (d *dualChars) GetForRead(ctx context.Context, id, userID string) (*models.Character, error) {
	return d.get(ctx, func(c storage.CharacterStore) (*models.Character, error) { return c.GetForRead(ctx, id, userID) })
}
func (d *dualChars) GetOwned(ctx context.Context, id, userID string) (*models.Character, error) {
	return d.get(ctx, func(c storage.CharacterStore) (*models.Character, error) { return c.GetOwned(ctx, id, userID) })
}
func (d *dualChars) Get(ctx context.Context, id string) (*models.Character, error) {
	return d.get(ctx, func(c storage.CharacterStore) (*models.Character, error) { return c.Get(ctx, id) })
}

func (d *dualChars) OwnedSummaries(ctx context.Context, userID string) ([]models.Character, error) {
	p, err := d.s.primary.Characters().OwnedSummaries(ctx, userID)
	if err != nil || !d.s.fallback {
		return p, err
	}
	sec, _ := d.s.secondary.Characters().OwnedSummaries(ctx, userID)
	return mergeChars(p, sec), nil
}

func (d *dualChars) SharedSummaries(ctx context.Context, userID string) ([]models.Character, error) {
	p, err := d.s.primary.Characters().SharedSummaries(ctx, userID)
	if err != nil || !d.s.fallback {
		return p, err
	}
	sec, _ := d.s.secondary.Characters().SharedSummaries(ctx, userID)
	return mergeChars(p, sec), nil
}

func (d *dualChars) OwnedMini(ctx context.Context, userID string) ([]models.Character, error) {
	p, err := d.s.primary.Characters().OwnedMini(ctx, userID)
	if err != nil || !d.s.fallback {
		return p, err
	}
	sec, _ := d.s.secondary.Characters().OwnedMini(ctx, userID)
	return mergeChars(p, sec), nil
}

func (d *dualChars) Create(ctx context.Context, userID string, data bson.M) (string, error) {
	c := &models.Character{ID: primitive.NewObjectID(), UserID: userID, Viewers: []string{}, Data: data}
	if err := d.s.primary.Characters().Insert(ctx, c); err != nil {
		return "", err
	}
	logErr("secondary character create", d.s.secondary.Characters().Insert(ctx, cloneChar(c)))
	return c.IDHex(), nil
}

func (d *dualChars) Insert(ctx context.Context, c *models.Character) error {
	if c.ID.IsZero() {
		c.ID = primitive.NewObjectID()
	}
	if err := d.s.primary.Characters().Insert(ctx, c); err != nil {
		return err
	}
	logErr("secondary character insert", d.s.secondary.Characters().Insert(ctx, cloneChar(c)))
	return nil
}

func (d *dualChars) ReplaceData(ctx context.Context, id string, data bson.M) error {
	if err := d.s.primary.Characters().ReplaceData(ctx, id, data); err != nil {
		return err
	}
	logErr("secondary character replace", d.ensureSecondary(ctx, id, data))
	return nil
}

// ensureSecondary updates the character in the secondary store; if it does not
// exist there yet (not migrated), it is inserted so the two stay in sync.
func (d *dualChars) ensureSecondary(ctx context.Context, id string, data bson.M) error {
	if err := d.s.secondary.Characters().ReplaceData(ctx, id, data); err != nil {
		return err
	}
	return nil
}

func (d *dualChars) Save(ctx context.Context, c *models.Character) error {
	if err := d.s.primary.Characters().Save(ctx, c); err != nil {
		return err
	}
	logErr("secondary character save", d.s.secondary.Characters().Save(ctx, cloneChar(c)))
	return nil
}

func (d *dualChars) Delete(ctx context.Context, id string) error {
	if err := d.s.primary.Characters().Delete(ctx, id); err != nil {
		return err
	}
	logErr("secondary character delete", d.s.secondary.Characters().Delete(ctx, id))
	return nil
}

func (d *dualChars) CountByUser(ctx context.Context, userID string) (int64, error) {
	return d.s.primary.Characters().CountByUser(ctx, userID)
}

func (d *dualChars) DeleteByUser(ctx context.Context, userID string) error {
	if err := d.s.primary.Characters().DeleteByUser(ctx, userID); err != nil {
		return err
	}
	logErr("secondary character delete-by-user", d.s.secondary.Characters().DeleteByUser(ctx, userID))
	return nil
}

// ============================ skill trees ============================

type dualTrees struct{ s *Store }

func (d *dualTrees) FindByUser(ctx context.Context, userID string) ([]models.SkillTree, error) {
	p, err := d.s.primary.SkillTrees().FindByUser(ctx, userID)
	if err != nil || !d.s.fallback {
		return p, err
	}
	sec, _ := d.s.secondary.SkillTrees().FindByUser(ctx, userID)
	return mergeTrees(p, sec), nil
}

func (d *dualTrees) FindByCode(ctx context.Context, code string) (*models.SkillTree, error) {
	t, err := d.s.primary.SkillTrees().FindByCode(ctx, code)
	if err == nil {
		return t, nil
	}
	if !isNotFound(err) || !d.s.fallback {
		return nil, err
	}
	t2, err2 := d.s.secondary.SkillTrees().FindByCode(ctx, code)
	if err2 != nil {
		return nil, err
	}
	logErr("backfill tree", d.s.primary.SkillTrees().Save(ctx, cloneTree(t2)))
	return t2, nil
}

func (d *dualTrees) FindByCodeExcluding(ctx context.Context, code, excludeID string) (*models.SkillTree, error) {
	t, err := d.s.primary.SkillTrees().FindByCodeExcluding(ctx, code, excludeID)
	if err == nil {
		return t, nil
	}
	if !isNotFound(err) || !d.s.fallback {
		return nil, err
	}
	return d.s.secondary.SkillTrees().FindByCodeExcluding(ctx, code, excludeID)
}

func (d *dualTrees) GetOwned(ctx context.Context, id, userID string) (*models.SkillTree, error) {
	t, err := d.s.primary.SkillTrees().GetOwned(ctx, id, userID)
	if err == nil {
		return t, nil
	}
	if !isNotFound(err) || !d.s.fallback {
		return nil, err
	}
	t2, err2 := d.s.secondary.SkillTrees().GetOwned(ctx, id, userID)
	if err2 != nil {
		return nil, err
	}
	logErr("backfill tree", d.s.primary.SkillTrees().Save(ctx, cloneTree(t2)))
	return t2, nil
}

func (d *dualTrees) Create(ctx context.Context, t *models.SkillTree) (string, error) {
	if t.ID.IsZero() {
		t.ID = primitive.NewObjectID()
	}
	if _, err := d.s.primary.SkillTrees().Create(ctx, t); err != nil {
		return "", err
	}
	logErr("secondary tree create", secondErr(d.s.secondary.SkillTrees().Create(ctx, cloneTree(t))))
	return t.IDHex(), nil
}

func (d *dualTrees) Save(ctx context.Context, t *models.SkillTree) error {
	if err := d.s.primary.SkillTrees().Save(ctx, t); err != nil {
		return err
	}
	logErr("secondary tree save", d.s.secondary.SkillTrees().Save(ctx, cloneTree(t)))
	return nil
}

func (d *dualTrees) Delete(ctx context.Context, id string) error {
	if err := d.s.primary.SkillTrees().Delete(ctx, id); err != nil {
		return err
	}
	logErr("secondary tree delete", d.s.secondary.SkillTrees().Delete(ctx, id))
	return nil
}

func secondErr(_ string, err error) error { return err }

// ============================ folders ============================

type dualFolders struct{ s *Store }

func (d *dualFolders) FindByUser(ctx context.Context, userID string) ([]models.Folder, error) {
	p, err := d.s.primary.Folders().FindByUser(ctx, userID)
	if err != nil || !d.s.fallback {
		return p, err
	}
	sec, _ := d.s.secondary.Folders().FindByUser(ctx, userID)
	return mergeFolders(p, sec), nil
}

func (d *dualFolders) GetOwned(ctx context.Context, id, userID string) (*models.Folder, error) {
	f, err := d.s.primary.Folders().GetOwned(ctx, id, userID)
	if err == nil {
		return f, nil
	}
	if !isNotFound(err) || !d.s.fallback {
		return nil, err
	}
	f2, err2 := d.s.secondary.Folders().GetOwned(ctx, id, userID)
	if err2 != nil {
		return nil, err
	}
	logErr("backfill folder", d.s.primary.Folders().Save(ctx, cloneFolder(f2)))
	return f2, nil
}

func (d *dualFolders) Create(ctx context.Context, f *models.Folder) (string, error) {
	if f.ID.IsZero() {
		f.ID = primitive.NewObjectID()
	}
	if _, err := d.s.primary.Folders().Create(ctx, f); err != nil {
		return "", err
	}
	logErr("secondary folder create", secondErr(d.s.secondary.Folders().Create(ctx, cloneFolder(f))))
	return f.IDHex(), nil
}

func (d *dualFolders) Save(ctx context.Context, f *models.Folder) error {
	if err := d.s.primary.Folders().Save(ctx, f); err != nil {
		return err
	}
	logErr("secondary folder save", d.s.secondary.Folders().Save(ctx, cloneFolder(f)))
	return nil
}

func (d *dualFolders) Delete(ctx context.Context, id string) error {
	if err := d.s.primary.Folders().Delete(ctx, id); err != nil {
		return err
	}
	logErr("secondary folder delete", d.s.secondary.Folders().Delete(ctx, id))
	return nil
}

// ---- merge + clone helpers ----

func mergeChars(primary, secondary []models.Character) []models.Character {
	seen := make(map[string]bool, len(primary))
	out := make([]models.Character, 0, len(primary)+len(secondary))
	for i := range primary {
		seen[primary[i].IDHex()] = true
		out = append(out, primary[i])
	}
	for i := range secondary {
		if !seen[secondary[i].IDHex()] {
			out = append(out, secondary[i])
		}
	}
	return out
}

func mergeTrees(primary, secondary []models.SkillTree) []models.SkillTree {
	seen := make(map[string]bool, len(primary))
	out := make([]models.SkillTree, 0, len(primary)+len(secondary))
	for i := range primary {
		seen[primary[i].IDHex()] = true
		out = append(out, primary[i])
	}
	for i := range secondary {
		if !seen[secondary[i].IDHex()] {
			out = append(out, secondary[i])
		}
	}
	return out
}

func mergeFolders(primary, secondary []models.Folder) []models.Folder {
	seen := make(map[string]bool, len(primary))
	out := make([]models.Folder, 0, len(primary)+len(secondary))
	for i := range primary {
		seen[primary[i].IDHex()] = true
		out = append(out, primary[i])
	}
	for i := range secondary {
		if !seen[secondary[i].IDHex()] {
			out = append(out, secondary[i])
		}
	}
	return out
}

func cloneUser(u *models.User) *models.User                    { c := *u; return &c }
func cloneRefresh(t *models.RefreshToken) *models.RefreshToken { c := *t; return &c }
func cloneChar(c *models.Character) *models.Character          { cp := *c; return &cp }
func cloneTree(t *models.SkillTree) *models.SkillTree          { c := *t; return &c }
func cloneFolder(f *models.Folder) *models.Folder              { c := *f; return &c }
