package postgres

import (
	"context"
	"encoding/json"

	"github.com/VicarTeam/vicar-backend/internal/darkborne"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var darkborneSheetTables = []string{
	"dark_character_level_history",
	"dark_character_damage",
	"dark_character_debts",
	"dark_character_backgrounds",
	"dark_character_anathema",
	"dark_character_human_traits",
	"dark_character_anchors",
	"dark_character_forms",
	"dark_character_arts",
	"dark_character_specializations",
	"dark_character_skills",
	"dark_character_attributes",
}

func (s *darkborneStore) SaveSheet(ctx context.Context, characterID string, data map[string]any) error {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	if err := saveDarkborneSheet(ctx, tx, characterID, data); err != nil {
		return err
	}
	return tx.Commit(ctx)
}

func saveDarkborneSheet(ctx context.Context, tx pgx.Tx, characterID string, data map[string]any) error {
	sheet := darkborne.SheetFromData(data)
	extra, err := json.Marshal(sheet.Extra)
	if err != nil {
		return err
	}

	if _, err := tx.Exec(ctx, `
		INSERT INTO dark_characters (character_id, sire, former_life, death, start_age_key, blood_age, blood_strength, glied,
			house_key, bloodline_key, sire_art_key, affinity_art_key, varyss_anathema, court, court_rank, office_key,
			order_key, cruor, hunger, wille, wille_pool, health, alienation, learn_steps_used, extra, updated_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25, now())
		ON CONFLICT (character_id) DO UPDATE SET
			sire = EXCLUDED.sire, former_life = EXCLUDED.former_life, death = EXCLUDED.death, start_age_key = EXCLUDED.start_age_key,
			blood_age = EXCLUDED.blood_age, blood_strength = EXCLUDED.blood_strength, glied = EXCLUDED.glied,
			house_key = EXCLUDED.house_key, bloodline_key = EXCLUDED.bloodline_key, sire_art_key = EXCLUDED.sire_art_key,
			affinity_art_key = EXCLUDED.affinity_art_key, varyss_anathema = EXCLUDED.varyss_anathema,
			court = EXCLUDED.court, court_rank = EXCLUDED.court_rank, office_key = EXCLUDED.office_key,
			order_key = EXCLUDED.order_key, cruor = EXCLUDED.cruor, hunger = EXCLUDED.hunger, wille = EXCLUDED.wille,
			wille_pool = EXCLUDED.wille_pool, health = EXCLUDED.health, alienation = EXCLUDED.alienation,
			learn_steps_used = EXCLUDED.learn_steps_used, extra = EXCLUDED.extra, updated_at = now()`,
		characterID, sheet.Sire, sheet.FormerLife, sheet.Death, sheet.StartAgeKey, sheet.BloodAge, sheet.BloodStrength, sheet.Glied,
		sheet.HouseKey, sheet.BloodlineKey, sheet.SireArtKey, sheet.AffinityArtKey, sheet.VaryssAnathema, sheet.Court,
		sheet.CourtRank, sheet.OfficeKey, sheet.OrderKey, sheet.Cruor, sheet.Hunger, sheet.Wille, sheet.WillePool,
		sheet.Health, sheet.Alienation, sheet.LearnStepsUsed, json.RawMessage(extra)); err != nil {
		return err
	}

	for _, table := range darkborneSheetTables {
		if _, err := tx.Exec(ctx, "DELETE FROM "+table+" WHERE character_id = $1", characterID); err != nil {
			return err
		}
	}

	batch := &pgx.Batch{}
	for _, kv := range sheet.Attributes {
		batch.Queue(`INSERT INTO dark_character_attributes (character_id, attribute_key, value) VALUES ($1,$2,$3)`,
			characterID, kv.Key, kv.Value)
	}
	for _, kv := range sheet.Skills {
		batch.Queue(`INSERT INTO dark_character_skills (character_id, skill_key, value) VALUES ($1,$2,$3)`,
			characterID, kv.Key, kv.Value)
	}
	for i, spec := range sheet.Specializations {
		batch.Queue(`INSERT INTO dark_character_specializations (character_id, skill_key, name, position) VALUES ($1,$2,$3,$4)`,
			characterID, spec.SkillKey, spec.Name, i)
	}
	for _, art := range sheet.Arts {
		batch.Queue(`INSERT INTO dark_character_arts (character_id, art_key, depth, is_affinity) VALUES ($1,$2,$3,$4)`,
			characterID, art.Key, art.Depth, art.Affinity)
	}
	for i, form := range sheet.Forms {
		batch.Queue(`INSERT INTO dark_character_forms (character_id, art_key, form_key, name, level, kind, effect, limits, position)
			VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
			characterID, form.ArtKey, form.FormKey, form.Name, form.Level, form.Kind, form.Effect, form.Limits, i)
	}
	for _, anchor := range sheet.Anchors {
		batch.Queue(`INSERT INTO dark_character_anchors (character_id, slot, kind, label, state, forced) VALUES ($1,$2,$3,$4,$5,$6)`,
			characterID, anchor.Slot, anchor.Kind, anchor.Label, anchor.State, anchor.Forced)
	}
	for _, kv := range sheet.HumanTraits {
		batch.Queue(`INSERT INTO dark_character_human_traits (character_id, trait_key, value) VALUES ($1,$2,$3)`,
			characterID, kv.Key, kv.Value)
	}
	for _, entry := range sheet.Anathema {
		batch.Queue(`INSERT INTO dark_character_anathema (character_id, influence_key, level, source, note) VALUES ($1,$2,$3,$4,$5)`,
			characterID, entry.InfluenceKey, entry.Level, entry.Source, entry.Note)
	}
	for _, bg := range sheet.Backgrounds {
		batch.Queue(`INSERT INTO dark_character_backgrounds (character_id, background_key, level, note) VALUES ($1,$2,$3,$4)`,
			characterID, bg.Key, bg.Level, bg.Note)
	}
	for i, debt := range sheet.Debts {
		batch.Queue(`INSERT INTO dark_character_debts (character_id, direction, size_key, party, note, position) VALUES ($1,$2,$3,$4,$5,$6)`,
			characterID, debt.Direction, debt.SizeKey, debt.Party, debt.Note, i)
	}
	for _, box := range sheet.Damage {
		batch.Queue(`INSERT INTO dark_character_damage (character_id, box, kind) VALUES ($1,$2,$3)`,
			characterID, box.Box, box.Kind)
	}
	for i, entry := range sheet.LevelHistory {
		batch.Queue(`INSERT INTO dark_character_level_history (character_id, type, date, text, exp_used, exp_before, exp_after, position)
			VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
			characterID, entry.Type, entry.Date, entry.Text, entry.ExpUsed, entry.ExpBefore, entry.ExpAfter, i)
	}
	if batch.Len() == 0 {
		return nil
	}
	results := tx.SendBatch(ctx, batch)
	for i := 0; i < batch.Len(); i++ {
		if _, err := results.Exec(); err != nil {
			results.Close()
			return err
		}
	}
	return results.Close()
}

func (s *darkborneStore) LoadSheet(ctx context.Context, characterID string) (map[string]any, error) {
	sheet := &darkborne.Sheet{Extra: map[string]any{}}
	var extra []byte
	err := s.pool.QueryRow(ctx, `SELECT sire, former_life, death, start_age_key, blood_age, blood_strength, glied,
		house_key, bloodline_key, sire_art_key, affinity_art_key, varyss_anathema, court, court_rank, office_key,
		order_key, cruor, hunger, wille, wille_pool, health, alienation, learn_steps_used, extra
		FROM dark_characters WHERE character_id = $1`, characterID).Scan(
		&sheet.Sire, &sheet.FormerLife, &sheet.Death, &sheet.StartAgeKey, &sheet.BloodAge, &sheet.BloodStrength, &sheet.Glied,
		&sheet.HouseKey, &sheet.BloodlineKey, &sheet.SireArtKey, &sheet.AffinityArtKey, &sheet.VaryssAnathema,
		&sheet.Court, &sheet.CourtRank, &sheet.OfficeKey, &sheet.OrderKey, &sheet.Cruor, &sheet.Hunger,
		&sheet.Wille, &sheet.WillePool, &sheet.Health, &sheet.Alienation, &sheet.LearnStepsUsed, &extra)
	if err != nil {
		return nil, mapErr(err)
	}
	if len(extra) > 0 {
		if err := json.Unmarshal(extra, &sheet.Extra); err != nil {
			return nil, err
		}
	}

	if err := s.collect(ctx, `SELECT attribute_key, value FROM dark_character_attributes WHERE character_id = $1 ORDER BY attribute_key`,
		func(rows pgx.Rows) error {
			var kv darkborne.KeyValue
			if err := rows.Scan(&kv.Key, &kv.Value); err != nil {
				return err
			}
			sheet.Attributes = append(sheet.Attributes, kv)
			return nil
		}, characterID); err != nil {
		return nil, err
	}

	if err := s.collect(ctx, `SELECT skill_key, value FROM dark_character_skills WHERE character_id = $1 ORDER BY skill_key`,
		func(rows pgx.Rows) error {
			var kv darkborne.KeyValue
			if err := rows.Scan(&kv.Key, &kv.Value); err != nil {
				return err
			}
			sheet.Skills = append(sheet.Skills, kv)
			return nil
		}, characterID); err != nil {
		return nil, err
	}

	if err := s.collect(ctx, `SELECT trait_key, value FROM dark_character_human_traits WHERE character_id = $1 ORDER BY trait_key`,
		func(rows pgx.Rows) error {
			var kv darkborne.KeyValue
			if err := rows.Scan(&kv.Key, &kv.Value); err != nil {
				return err
			}
			sheet.HumanTraits = append(sheet.HumanTraits, kv)
			return nil
		}, characterID); err != nil {
		return nil, err
	}

	if err := s.collect(ctx, `SELECT skill_key, name FROM dark_character_specializations WHERE character_id = $1 ORDER BY position, id`,
		func(rows pgx.Rows) error {
			var spec darkborne.Specialization
			if err := rows.Scan(&spec.SkillKey, &spec.Name); err != nil {
				return err
			}
			sheet.Specializations = append(sheet.Specializations, spec)
			return nil
		}, characterID); err != nil {
		return nil, err
	}

	if err := s.collect(ctx, `SELECT art_key, depth, is_affinity FROM dark_character_arts WHERE character_id = $1 ORDER BY art_key`,
		func(rows pgx.Rows) error {
			var art darkborne.CharacterArt
			if err := rows.Scan(&art.Key, &art.Depth, &art.Affinity); err != nil {
				return err
			}
			sheet.Arts = append(sheet.Arts, art)
			return nil
		}, characterID); err != nil {
		return nil, err
	}

	if err := s.collect(ctx, `SELECT art_key, form_key, name, level, kind, effect, limits FROM dark_character_forms
		WHERE character_id = $1 ORDER BY position, id`,
		func(rows pgx.Rows) error {
			var form darkborne.CharacterForm
			if err := rows.Scan(&form.ArtKey, &form.FormKey, &form.Name, &form.Level, &form.Kind, &form.Effect, &form.Limits); err != nil {
				return err
			}
			sheet.Forms = append(sheet.Forms, form)
			return nil
		}, characterID); err != nil {
		return nil, err
	}

	if err := s.collect(ctx, `SELECT slot, kind, label, state, forced FROM dark_character_anchors WHERE character_id = $1 ORDER BY slot`,
		func(rows pgx.Rows) error {
			var anchor darkborne.Anchor
			if err := rows.Scan(&anchor.Slot, &anchor.Kind, &anchor.Label, &anchor.State, &anchor.Forced); err != nil {
				return err
			}
			sheet.Anchors = append(sheet.Anchors, anchor)
			return nil
		}, characterID); err != nil {
		return nil, err
	}

	if err := s.collect(ctx, `SELECT influence_key, level, source, note FROM dark_character_anathema WHERE character_id = $1 ORDER BY influence_key`,
		func(rows pgx.Rows) error {
			var entry darkborne.CharacterAnathema
			if err := rows.Scan(&entry.InfluenceKey, &entry.Level, &entry.Source, &entry.Note); err != nil {
				return err
			}
			sheet.Anathema = append(sheet.Anathema, entry)
			return nil
		}, characterID); err != nil {
		return nil, err
	}

	if err := s.collect(ctx, `SELECT background_key, level, note FROM dark_character_backgrounds WHERE character_id = $1 ORDER BY background_key`,
		func(rows pgx.Rows) error {
			var bg darkborne.CharacterBackground
			if err := rows.Scan(&bg.Key, &bg.Level, &bg.Note); err != nil {
				return err
			}
			sheet.Backgrounds = append(sheet.Backgrounds, bg)
			return nil
		}, characterID); err != nil {
		return nil, err
	}

	if err := s.collect(ctx, `SELECT direction, size_key, party, note FROM dark_character_debts WHERE character_id = $1 ORDER BY position, id`,
		func(rows pgx.Rows) error {
			var debt darkborne.Debt
			if err := rows.Scan(&debt.Direction, &debt.SizeKey, &debt.Party, &debt.Note); err != nil {
				return err
			}
			sheet.Debts = append(sheet.Debts, debt)
			return nil
		}, characterID); err != nil {
		return nil, err
	}

	if err := s.collect(ctx, `SELECT box, kind FROM dark_character_damage WHERE character_id = $1 ORDER BY box`,
		func(rows pgx.Rows) error {
			var box darkborne.DamageBox
			if err := rows.Scan(&box.Box, &box.Kind); err != nil {
				return err
			}
			sheet.Damage = append(sheet.Damage, box)
			return nil
		}, characterID); err != nil {
		return nil, err
	}

	if err := s.collect(ctx, `SELECT type, date, text, exp_used, exp_before, exp_after FROM dark_character_level_history
		WHERE character_id = $1 ORDER BY position, id`,
		func(rows pgx.Rows) error {
			var entry darkborne.LevelChange
			if err := rows.Scan(&entry.Type, &entry.Date, &entry.Text, &entry.ExpUsed, &entry.ExpBefore, &entry.ExpAfter); err != nil {
				return err
			}
			sheet.LevelHistory = append(sheet.LevelHistory, entry)
			return nil
		}, characterID); err != nil {
		return nil, err
	}

	return sheet.ToData(), nil
}

func (s *darkborneStore) DeleteSheet(ctx context.Context, characterID string) error {
	_, err := s.pool.Exec(ctx, `DELETE FROM dark_characters WHERE character_id = $1`, characterID)
	return err
}

func newDarkborneStore(pool *pgxpool.Pool) *darkborneStore {
	return &darkborneStore{pool: pool}
}
