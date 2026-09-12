package postgres

import (
	"context"

	"github.com/VicarTeam/vicar-backend/internal/darkborne"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

const darkborneRevisionKey = "content_revision"

const darkborneSeedLockID = int64(0x6461726b626f726e)

type darkborneStore struct {
	pool *pgxpool.Pool
}

var darkborneContentTables = []string{
	"dark_lexicon_entries",
	"dark_house_relations",
	"dark_art_boundaries",
	"dark_court_structures",
	"dark_court_mandates",
	"dark_court_types",
	"dark_covenant_articles",
	"dark_covenant",
	"dark_firsts",
	"dark_xp_costs",
	"dark_orders",
	"dark_awareness_stages",
	"dark_judgements",
	"dark_debt_sizes",
	"dark_court_offices",
	"dark_court_ranks",
	"dark_background_levels",
	"dark_backgrounds",
	"dark_blood_sources",
	"dark_hunt_methods",
	"dark_effects",
	"dark_human_trait_levels",
	"dark_human_traits",
	"dark_start_ages",
	"dark_blood_strength",
	"dark_increases",
	"dark_depths",
	"dark_house_anathema",
	"dark_houses",
	"dark_influences",
	"dark_anathema_levels",
	"dark_art_pair_effects",
	"dark_art_pairs",
	"dark_art_forms",
	"dark_art_levels",
	"dark_arts",
	"dark_skills",
	"dark_attributes",
}

func (s *darkborneStore) Revision(ctx context.Context) (string, error) {
	var revision string
	err := s.pool.QueryRow(ctx, `SELECT value FROM dark_content_meta WHERE key = $1`, darkborneRevisionKey).Scan(&revision)
	if err != nil {
		if notFound(err) {
			return "", nil
		}
		return "", err
	}
	return revision, nil
}

func (s *darkborneStore) Seed(ctx context.Context, content *darkborne.Content) error {
	current, err := s.Revision(ctx)
	if err != nil {
		return err
	}
	if current == content.Revision {
		return nil
	}

	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	if _, err := tx.Exec(ctx, `SELECT pg_advisory_xact_lock($1)`, darkborneSeedLockID); err != nil {
		return err
	}

	if err := tx.QueryRow(ctx, `SELECT value FROM dark_content_meta WHERE key = $1`, darkborneRevisionKey).Scan(&current); err != nil {
		if !notFound(err) {
			return err
		}
		current = ""
	}
	if current == content.Revision {
		return tx.Commit(ctx)
	}

	for _, table := range darkborneContentTables {
		if _, err := tx.Exec(ctx, "DELETE FROM "+table); err != nil {
			return err
		}
	}

	batch := &pgx.Batch{}
	queueDarkborneContent(batch, content)
	results := tx.SendBatch(ctx, batch)
	for i := 0; i < batch.Len(); i++ {
		if _, err := results.Exec(); err != nil {
			results.Close()
			return err
		}
	}
	if err := results.Close(); err != nil {
		return err
	}

	if _, err := tx.Exec(ctx, `
		INSERT INTO dark_content_meta (key, value) VALUES ($1, $2)
		ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
	`, darkborneRevisionKey, content.Revision); err != nil {
		return err
	}
	return tx.Commit(ctx)
}

func queueDarkborneContent(batch *pgx.Batch, c *darkborne.Content) {
	for i, a := range c.Attributes {
		batch.Queue(`INSERT INTO dark_attributes (key, name, category, kind, description, position) VALUES ($1,$2,$3,$4,$5,$6)`,
			a.Key, a.Name, a.Category, a.Kind, a.Description, i)
	}
	for i, sk := range c.Skills {
		batch.Queue(`INSERT INTO dark_skills (key, name, category, description, position) VALUES ($1,$2,$3,$4,$5)`,
			sk.Key, sk.Name, sk.Category, sk.Description, i)
	}
	for i, art := range c.Arts {
		batch.Queue(`INSERT INTO dark_arts (key, name, short_name, principle, summary, is_primal, counter_key, typical_attributes, limits, position)
			VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
			art.Key, art.Name, art.ShortName, art.Principle, art.Summary, art.IsPrimal,
			nullable(art.CounterKey), art.TypicalAttributes, art.Limits, i)
		for _, level := range art.Levels {
			batch.Queue(`INSERT INTO dark_art_levels (art_key, depth, examples) VALUES ($1,$2,$3)`,
				art.Key, level.Depth, level.Examples)
		}
		for j, form := range art.Forms {
			batch.Queue(`INSERT INTO dark_art_forms (key, art_key, name, level, difficulty, cost, effect, limits, position)
				VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
				form.Key, art.Key, form.Name, form.Level, form.Difficulty, form.Cost, form.Effect, form.Limits, j)
		}
	}
	for i, pair := range c.ArtPairs {
		batch.Queue(`INSERT INTO dark_art_pairs (key, art_a, art_b, question, position) VALUES ($1,$2,$3,$4,$5)`,
			pair.Key, pair.ArtA, pair.ArtB, pair.Question, i)
		for j, effect := range pair.Effects {
			batch.Queue(`INSERT INTO dark_art_pair_effects (pair_key, name, effect, severity, position) VALUES ($1,$2,$3,$4,$5)`,
				pair.Key, effect.Name, effect.Effect, effect.Severity, j)
		}
	}
	for _, level := range c.AnathemaLevels {
		batch.Queue(`INSERT INTO dark_anathema_levels (level, name, physical, symbolic, ord) VALUES ($1,$2,$3,$4,$5)`,
			level.Level, level.Name, level.Physical, level.Symbolic, level.Order)
	}
	for i, inf := range c.Influences {
		batch.Queue(`INSERT INTO dark_influences (key, name, kind, base_level, note, position) VALUES ($1,$2,$3,$4,$5,$6)`,
			inf.Key, inf.Name, inf.Kind, inf.BaseLevel, inf.Note, i)
	}
	for i, house := range c.Houses {
		batch.Queue(`INSERT INTO dark_houses (key, name, epithet, origin_name, origin_title, idea, reputation, description,
			scar_key, scar_name, scar_summary, scar_triggers, scar_permanent_effect, scar_compulsions, position)
			VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
			house.Key, house.Name, house.Epithet, house.OriginName, house.OriginTitle, house.Idea,
			house.Reputation, house.Description, house.Scar.Key, house.Scar.Name, house.Scar.Summary,
			house.Scar.Triggers, house.Scar.PermanentEffect, house.Scar.Compulsions, i)
		for j, entry := range house.Anathema {
			batch.Queue(`INSERT INTO dark_house_anathema (house_key, influence_key, level, note, position) VALUES ($1,$2,$3,$4,$5)
				ON CONFLICT (house_key, influence_key) DO UPDATE SET level = EXCLUDED.level, note = EXCLUDED.note, position = EXCLUDED.position`,
				house.Key, entry.InfluenceKey, entry.Level, entry.Note, j)
		}
	}
	for _, depth := range c.Depths {
		batch.Queue(`INSERT INTO dark_depths (depth, name, meaning, target, scale) VALUES ($1,$2,$3,$4,$5)`,
			depth.Depth, depth.Name, depth.Meaning, depth.Target, depth.Scale)
	}
	for i, inc := range c.Increases {
		batch.Queue(`INSERT INTO dark_increases (key, name, mundane, supernatural, position) VALUES ($1,$2,$3,$4,$5)`,
			inc.Key, inc.Name, inc.Mundane, inc.Supernatural, i)
	}
	for _, row := range c.BloodStrength {
		batch.Queue(`INSERT INTO dark_blood_strength (level, max_depth, reserve, upkeep, free_increases, notes) VALUES ($1,$2,$3,$4,$5,$6)`,
			row.Level, row.MaxDepth, row.Reserve, row.Upkeep, row.FreeIncreases, row.Notes)
	}
	for i, age := range c.StartAges {
		batch.Queue(`INSERT INTO dark_start_ages (key, name, blood_age, blood_strength, max_depth, learn_steps, bonus_xp,
			human_anchors, night_anchors, human_trait_reduction, burdens, alienation, description, position)
			VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
			age.Key, age.Name, age.BloodAge, age.BloodStrength, age.MaxDepth, age.LearnSteps, age.BonusXP,
			age.HumanAnchors, age.NightAnchors, age.HumanTraitReduction, age.Burdens, age.Alienation, age.Description, i)
	}
	for i, trait := range c.HumanTraits {
		batch.Queue(`INSERT INTO dark_human_traits (key, name, description, position) VALUES ($1,$2,$3,$4)`,
			trait.Key, trait.Name, trait.Description, i)
		for _, level := range trait.Levels {
			batch.Queue(`INSERT INTO dark_human_trait_levels (trait_key, value, description) VALUES ($1,$2,$3)`,
				trait.Key, level.Value, level.Description)
		}
	}
	for i, effect := range c.Effects.Hunger {
		batch.Queue(`INSERT INTO dark_effects (key, kind, name, effect, severity, position) VALUES ($1,'hunger',$2,$3,$4,$5)`,
			effect.Key, effect.Name, effect.Effect, effect.Severity, i)
	}
	for i, effect := range c.Effects.Instability {
		batch.Queue(`INSERT INTO dark_effects (key, kind, name, effect, severity, position) VALUES ($1,'instability',$2,$3,$4,$5)`,
			effect.Key, effect.Name, effect.Effect, effect.Severity, i)
	}
	for i, method := range c.Hunt.Methods {
		batch.Queue(`INSERT INTO dark_hunt_methods (key, name, attribute_key, skill_key, difficulty, note, position) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
			method.Key, method.Name, method.Attribute, method.Skill, method.Difficulty, method.Note, i)
	}
	for i, source := range c.Hunt.Sources {
		batch.Queue(`INSERT INTO dark_blood_sources (key, name, cruor, note, position) VALUES ($1,$2,$3,$4,$5)`,
			source.Key, source.Name, source.Cruor, source.Note, i)
	}
	for i, bg := range c.Backgrounds {
		batch.Queue(`INSERT INTO dark_backgrounds (key, name, description, position) VALUES ($1,$2,$3,$4)`,
			bg.Key, bg.Name, bg.Description, i)
		for _, level := range bg.Levels {
			batch.Queue(`INSERT INTO dark_background_levels (background_key, level, description) VALUES ($1,$2,$3)`,
				bg.Key, level.Level, level.Description)
		}
	}
	for _, rank := range c.Court.Ranks {
		batch.Queue(`INSERT INTO dark_court_ranks (level, name, rights, bonus) VALUES ($1,$2,$3,$4)`,
			rank.Level, rank.Name, rank.Rights, rank.Bonus)
	}
	for i, office := range c.Court.Offices {
		batch.Queue(`INSERT INTO dark_court_offices (key, name, task, rule, position) VALUES ($1,$2,$3,$4,$5)`,
			office.Key, office.Name, office.Task, office.Rule, i)
	}
	for i, debt := range c.Court.Debts {
		batch.Queue(`INSERT INTO dark_debt_sizes (key, name, description, position) VALUES ($1,$2,$3,$4)`,
			debt.Key, debt.Name, debt.Description, i)
	}
	for i, judgement := range c.Court.Judgements {
		batch.Queue(`INSERT INTO dark_judgements (key, name, effect, position) VALUES ($1,$2,$3,$4)`,
			judgement.Key, judgement.Name, judgement.Effect, i)
	}
	for i, stage := range c.Court.Awareness {
		batch.Queue(`INSERT INTO dark_awareness_stages (key, name, boxes, covenant, consequence, position) VALUES ($1,$2,$3,$4,$5,$6)`,
			stage.Key, stage.Name, stage.Boxes, stage.Covenant, stage.Consequence, i)
	}
	for i, order := range c.Orders {
		batch.Queue(`INSERT INTO dark_orders (key, name, motto, description, position) VALUES ($1,$2,$3,$4,$5)`,
			order.Key, order.Name, order.Motto, order.Description, i)
	}
	for i, cost := range c.XPCosts {
		batch.Queue(`INSERT INTO dark_xp_costs (key, name, formula, scope, position) VALUES ($1,$2,$3,$4,$5)`,
			cost.Key, cost.Name, cost.Formula, cost.Scope, i)
	}
	for i, first := range c.Firsts {
		batch.Queue(`INSERT INTO dark_firsts (key, name, title, house_key, role, motivation, ideal, description,
			after_awakening, humans, scions, cruor_trait, ur_scar, fate, fate_detail, question, position)
			VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
			first.Key, first.Name, first.Title, first.HouseKey, first.Role, first.Motivation, first.Ideal,
			first.Description, first.AfterAwakening, first.Humans, first.Scions, first.CruorTrait,
			first.UrScar, first.Fate, first.FateDetail, first.Question, i)
	}
	for key, value := range map[string]string{
		"title":    c.Covenant.Title,
		"subtitle": c.Covenant.Subtitle,
		"preamble": c.Covenant.Preamble,
		"oath":     c.Covenant.Oath,
	} {
		batch.Queue(`INSERT INTO dark_covenant (key, value) VALUES ($1,$2)`, key, value)
	}
	for i, article := range c.Covenant.Articles {
		batch.Queue(`INSERT INTO dark_covenant_articles (key, number, name, title, body, position) VALUES ($1,$2,$3,$4,$5,$6)`,
			article.Key, article.Number, article.Name, article.Title, article.Body, i)
	}
	for i, courtType := range c.CourtTypes {
		batch.Queue(`INSERT INTO dark_court_types (key, name, description, position) VALUES ($1,$2,$3,$4)`,
			courtType.Key, courtType.Name, courtType.Description, i)
	}
	for i, mandate := range c.CourtMandates {
		batch.Queue(`INSERT INTO dark_court_mandates (key, name, description, position) VALUES ($1,$2,$3,$4)`,
			mandate.Key, mandate.Name, mandate.Description, i)
	}
	for i, structure := range c.CourtStructs {
		batch.Queue(`INSERT INTO dark_court_structures (key, name, description, position) VALUES ($1,$2,$3,$4)`,
			structure.Key, structure.Name, structure.Description, i)
	}
	for i, boundary := range c.ArtBoundaries {
		batch.Queue(`INSERT INTO dark_art_boundaries (pair_key, situation, art_a, art_b, text_a, text_b, position)
			VALUES ($1,$2,$3,$4,$5,$6,$7)`,
			boundary.PairKey, boundary.Situation, boundary.ArtA, boundary.ArtB, boundary.TextA, boundary.TextB, i)
	}
	for i, relation := range c.HouseRelations {
		batch.Queue(`INSERT INTO dark_house_relations (key, house_a, house_b, description, position) VALUES ($1,$2,$3,$4,$5)`,
			relation.Key, relation.HouseA, relation.HouseB, relation.Description, i)
	}
	for _, entry := range c.Lexicon {
		gameline := entry.Gameline
		if gameline == "" {
			gameline = darkborne.Gameline
		}
		batch.Queue(`INSERT INTO dark_lexicon_entries (key, gameline, section, parent_key, title, body, tags, position, section_position)
			VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
			entry.Key, gameline, entry.Section, nullable(entry.ParentKey), entry.Title, entry.Body, entry.Tags,
			entry.Position, entry.SectionPosition)
	}
}

func nullable(value string) any {
	if value == "" {
		return nil
	}
	return value
}
