package postgres

import (
	"context"
	"sync"

	"github.com/VicarTeam/vicar-backend/internal/darkborne"
	"github.com/jackc/pgx/v5"
)

type darkborneCache struct {
	mu       sync.RWMutex
	revision string
	content  *darkborne.Content
}

var contentCache darkborneCache

func (s *darkborneStore) Content(ctx context.Context) (*darkborne.Content, error) {
	revision, err := s.Revision(ctx)
	if err != nil {
		return nil, err
	}
	contentCache.mu.RLock()
	cached := contentCache.content
	cachedRevision := contentCache.revision
	contentCache.mu.RUnlock()
	if cached != nil && cachedRevision == revision {
		return cached, nil
	}

	content, err := s.readContent(ctx, revision)
	if err != nil {
		return nil, err
	}
	contentCache.mu.Lock()
	contentCache.content = content
	contentCache.revision = revision
	contentCache.mu.Unlock()
	return content, nil
}

func (s *darkborneStore) readContent(ctx context.Context, revision string) (*darkborne.Content, error) {
	c := &darkborne.Content{Revision: revision}

	if err := s.collect(ctx, `SELECT key, name, category, kind, description FROM dark_attributes ORDER BY position`,
		func(rows pgx.Rows) error {
			var a darkborne.Attribute
			if err := rows.Scan(&a.Key, &a.Name, &a.Category, &a.Kind, &a.Description); err != nil {
				return err
			}
			c.Attributes = append(c.Attributes, a)
			return nil
		}); err != nil {
		return nil, err
	}

	if err := s.collect(ctx, `SELECT key, name, category, description FROM dark_skills ORDER BY position`,
		func(rows pgx.Rows) error {
			var sk darkborne.Skill
			if err := rows.Scan(&sk.Key, &sk.Name, &sk.Category, &sk.Description); err != nil {
				return err
			}
			c.Skills = append(c.Skills, sk)
			return nil
		}); err != nil {
		return nil, err
	}

	artIndex := map[string]int{}
	if err := s.collect(ctx, `SELECT key, name, short_name, principle, summary, is_primal,
		coalesce(counter_key, ''), typical_attributes, limits FROM dark_arts ORDER BY position`,
		func(rows pgx.Rows) error {
			var art darkborne.Art
			if err := rows.Scan(&art.Key, &art.Name, &art.ShortName, &art.Principle, &art.Summary,
				&art.IsPrimal, &art.CounterKey, &art.TypicalAttributes, &art.Limits); err != nil {
				return err
			}
			artIndex[art.Key] = len(c.Arts)
			c.Arts = append(c.Arts, art)
			return nil
		}); err != nil {
		return nil, err
	}

	if err := s.collect(ctx, `SELECT art_key, depth, examples FROM dark_art_levels ORDER BY art_key, depth`,
		func(rows pgx.Rows) error {
			var artKey string
			var level darkborne.ArtLevel
			if err := rows.Scan(&artKey, &level.Depth, &level.Examples); err != nil {
				return err
			}
			if i, ok := artIndex[artKey]; ok {
				c.Arts[i].Levels = append(c.Arts[i].Levels, level)
			}
			return nil
		}); err != nil {
		return nil, err
	}

	if err := s.collect(ctx, `SELECT key, art_key, name, level, difficulty, cost, effect, limits
		FROM dark_art_forms ORDER BY art_key, position`,
		func(rows pgx.Rows) error {
			var form darkborne.ArtForm
			if err := rows.Scan(&form.Key, &form.ArtKey, &form.Name, &form.Level, &form.Difficulty,
				&form.Cost, &form.Effect, &form.Limits); err != nil {
				return err
			}
			if i, ok := artIndex[form.ArtKey]; ok {
				c.Arts[i].Forms = append(c.Arts[i].Forms, form)
			}
			return nil
		}); err != nil {
		return nil, err
	}

	pairIndex := map[string]int{}
	if err := s.collect(ctx, `SELECT key, art_a, art_b, question FROM dark_art_pairs ORDER BY position`,
		func(rows pgx.Rows) error {
			var pair darkborne.ArtPair
			if err := rows.Scan(&pair.Key, &pair.ArtA, &pair.ArtB, &pair.Question); err != nil {
				return err
			}
			pairIndex[pair.Key] = len(c.ArtPairs)
			c.ArtPairs = append(c.ArtPairs, pair)
			return nil
		}); err != nil {
		return nil, err
	}

	if err := s.collect(ctx, `SELECT pair_key, name, effect, severity FROM dark_art_pair_effects ORDER BY pair_key, position`,
		func(rows pgx.Rows) error {
			var pairKey string
			var effect darkborne.ArtPairEffect
			if err := rows.Scan(&pairKey, &effect.Name, &effect.Effect, &effect.Severity); err != nil {
				return err
			}
			if i, ok := pairIndex[pairKey]; ok {
				c.ArtPairs[i].Effects = append(c.ArtPairs[i].Effects, effect)
			}
			return nil
		}); err != nil {
		return nil, err
	}

	if err := s.collect(ctx, `SELECT level, name, physical, symbolic, ord FROM dark_anathema_levels ORDER BY ord`,
		func(rows pgx.Rows) error {
			var level darkborne.AnathemaLevel
			if err := rows.Scan(&level.Level, &level.Name, &level.Physical, &level.Symbolic, &level.Order); err != nil {
				return err
			}
			c.AnathemaLevels = append(c.AnathemaLevels, level)
			return nil
		}); err != nil {
		return nil, err
	}

	if err := s.collect(ctx, `SELECT key, name, kind, base_level, note FROM dark_influences ORDER BY position`,
		func(rows pgx.Rows) error {
			var inf darkborne.Influence
			if err := rows.Scan(&inf.Key, &inf.Name, &inf.Kind, &inf.BaseLevel, &inf.Note); err != nil {
				return err
			}
			c.Influences = append(c.Influences, inf)
			return nil
		}); err != nil {
		return nil, err
	}

	houseIndex := map[string]int{}
	if err := s.collect(ctx, `SELECT key, name, epithet, origin_name, origin_title, idea, reputation, description,
		scar_key, scar_name, scar_summary, scar_triggers, scar_permanent_effect, scar_compulsions
		FROM dark_houses ORDER BY position`,
		func(rows pgx.Rows) error {
			var h darkborne.House
			if err := rows.Scan(&h.Key, &h.Name, &h.Epithet, &h.OriginName, &h.OriginTitle, &h.Idea,
				&h.Reputation, &h.Description, &h.Scar.Key, &h.Scar.Name, &h.Scar.Summary,
				&h.Scar.Triggers, &h.Scar.PermanentEffect, &h.Scar.Compulsions); err != nil {
				return err
			}
			houseIndex[h.Key] = len(c.Houses)
			c.Houses = append(c.Houses, h)
			return nil
		}); err != nil {
		return nil, err
	}

	if err := s.collect(ctx, `SELECT house_key, influence_key, level, note FROM dark_house_anathema ORDER BY house_key, position, influence_key`,
		func(rows pgx.Rows) error {
			var houseKey string
			var entry darkborne.HouseAnathema
			if err := rows.Scan(&houseKey, &entry.InfluenceKey, &entry.Level, &entry.Note); err != nil {
				return err
			}
			if i, ok := houseIndex[houseKey]; ok {
				c.Houses[i].Anathema = append(c.Houses[i].Anathema, entry)
			}
			return nil
		}); err != nil {
		return nil, err
	}

	if err := s.collect(ctx, `SELECT depth, name, meaning, target, scale FROM dark_depths ORDER BY depth`,
		func(rows pgx.Rows) error {
			var d darkborne.Depth
			if err := rows.Scan(&d.Depth, &d.Name, &d.Meaning, &d.Target, &d.Scale); err != nil {
				return err
			}
			c.Depths = append(c.Depths, d)
			return nil
		}); err != nil {
		return nil, err
	}

	if err := s.collect(ctx, `SELECT key, name, mundane, supernatural FROM dark_increases ORDER BY position`,
		func(rows pgx.Rows) error {
			var inc darkborne.Increase
			if err := rows.Scan(&inc.Key, &inc.Name, &inc.Mundane, &inc.Supernatural); err != nil {
				return err
			}
			c.Increases = append(c.Increases, inc)
			return nil
		}); err != nil {
		return nil, err
	}

	if err := s.collect(ctx, `SELECT level, max_depth, reserve, upkeep, free_increases, notes FROM dark_blood_strength ORDER BY level`,
		func(rows pgx.Rows) error {
			var row darkborne.BloodStrengthLevel
			if err := rows.Scan(&row.Level, &row.MaxDepth, &row.Reserve, &row.Upkeep, &row.FreeIncreases, &row.Notes); err != nil {
				return err
			}
			c.BloodStrength = append(c.BloodStrength, row)
			return nil
		}); err != nil {
		return nil, err
	}

	if err := s.collect(ctx, `SELECT key, name, blood_age, blood_strength, max_depth, learn_steps, bonus_xp,
		human_anchors, night_anchors, human_trait_reduction, burdens, alienation, description
		FROM dark_start_ages ORDER BY position`,
		func(rows pgx.Rows) error {
			var age darkborne.StartAge
			if err := rows.Scan(&age.Key, &age.Name, &age.BloodAge, &age.BloodStrength, &age.MaxDepth,
				&age.LearnSteps, &age.BonusXP, &age.HumanAnchors, &age.NightAnchors,
				&age.HumanTraitReduction, &age.Burdens, &age.Alienation, &age.Description); err != nil {
				return err
			}
			c.StartAges = append(c.StartAges, age)
			return nil
		}); err != nil {
		return nil, err
	}

	traitIndex := map[string]int{}
	if err := s.collect(ctx, `SELECT key, name, description FROM dark_human_traits ORDER BY position`,
		func(rows pgx.Rows) error {
			var t darkborne.HumanTrait
			if err := rows.Scan(&t.Key, &t.Name, &t.Description); err != nil {
				return err
			}
			traitIndex[t.Key] = len(c.HumanTraits)
			c.HumanTraits = append(c.HumanTraits, t)
			return nil
		}); err != nil {
		return nil, err
	}

	if err := s.collect(ctx, `SELECT trait_key, value, description FROM dark_human_trait_levels ORDER BY trait_key, value DESC`,
		func(rows pgx.Rows) error {
			var traitKey string
			var level darkborne.HumanTraitLevel
			if err := rows.Scan(&traitKey, &level.Value, &level.Description); err != nil {
				return err
			}
			if i, ok := traitIndex[traitKey]; ok {
				c.HumanTraits[i].Levels = append(c.HumanTraits[i].Levels, level)
			}
			return nil
		}); err != nil {
		return nil, err
	}

	if err := s.collect(ctx, `SELECT key, kind, name, effect, severity FROM dark_effects ORDER BY kind, position`,
		func(rows pgx.Rows) error {
			var e darkborne.Effect
			if err := rows.Scan(&e.Key, &e.Kind, &e.Name, &e.Effect, &e.Severity); err != nil {
				return err
			}
			if e.Kind == "instability" {
				c.Effects.Instability = append(c.Effects.Instability, e)
			} else {
				c.Effects.Hunger = append(c.Effects.Hunger, e)
			}
			return nil
		}); err != nil {
		return nil, err
	}

	if err := s.collect(ctx, `SELECT key, name, attribute_key, skill_key, difficulty, note FROM dark_hunt_methods ORDER BY position`,
		func(rows pgx.Rows) error {
			var m darkborne.HuntMethod
			if err := rows.Scan(&m.Key, &m.Name, &m.Attribute, &m.Skill, &m.Difficulty, &m.Note); err != nil {
				return err
			}
			c.Hunt.Methods = append(c.Hunt.Methods, m)
			return nil
		}); err != nil {
		return nil, err
	}

	if err := s.collect(ctx, `SELECT key, name, cruor, note FROM dark_blood_sources ORDER BY position`,
		func(rows pgx.Rows) error {
			var src darkborne.BloodSource
			if err := rows.Scan(&src.Key, &src.Name, &src.Cruor, &src.Note); err != nil {
				return err
			}
			c.Hunt.Sources = append(c.Hunt.Sources, src)
			return nil
		}); err != nil {
		return nil, err
	}

	bgIndex := map[string]int{}
	if err := s.collect(ctx, `SELECT key, name, description FROM dark_backgrounds ORDER BY position`,
		func(rows pgx.Rows) error {
			var bg darkborne.Background
			if err := rows.Scan(&bg.Key, &bg.Name, &bg.Description); err != nil {
				return err
			}
			bgIndex[bg.Key] = len(c.Backgrounds)
			c.Backgrounds = append(c.Backgrounds, bg)
			return nil
		}); err != nil {
		return nil, err
	}

	if err := s.collect(ctx, `SELECT background_key, level, description FROM dark_background_levels ORDER BY background_key, level`,
		func(rows pgx.Rows) error {
			var key string
			var level darkborne.BackgroundLevel
			if err := rows.Scan(&key, &level.Level, &level.Description); err != nil {
				return err
			}
			if i, ok := bgIndex[key]; ok {
				c.Backgrounds[i].Levels = append(c.Backgrounds[i].Levels, level)
			}
			return nil
		}); err != nil {
		return nil, err
	}

	if err := s.collect(ctx, `SELECT level, name, rights, bonus FROM dark_court_ranks ORDER BY level`,
		func(rows pgx.Rows) error {
			var rank darkborne.CourtRank
			if err := rows.Scan(&rank.Level, &rank.Name, &rank.Rights, &rank.Bonus); err != nil {
				return err
			}
			c.Court.Ranks = append(c.Court.Ranks, rank)
			return nil
		}); err != nil {
		return nil, err
	}

	if err := s.collect(ctx, `SELECT key, name, task, rule FROM dark_court_offices ORDER BY position`,
		func(rows pgx.Rows) error {
			var office darkborne.CourtOffice
			if err := rows.Scan(&office.Key, &office.Name, &office.Task, &office.Rule); err != nil {
				return err
			}
			c.Court.Offices = append(c.Court.Offices, office)
			return nil
		}); err != nil {
		return nil, err
	}

	if err := s.collect(ctx, `SELECT key, name, description FROM dark_debt_sizes ORDER BY position`,
		func(rows pgx.Rows) error {
			var debt darkborne.DebtSize
			if err := rows.Scan(&debt.Key, &debt.Name, &debt.Description); err != nil {
				return err
			}
			c.Court.Debts = append(c.Court.Debts, debt)
			return nil
		}); err != nil {
		return nil, err
	}

	if err := s.collect(ctx, `SELECT key, name, effect FROM dark_judgements ORDER BY position`,
		func(rows pgx.Rows) error {
			var j darkborne.Judgement
			if err := rows.Scan(&j.Key, &j.Name, &j.Effect); err != nil {
				return err
			}
			c.Court.Judgements = append(c.Court.Judgements, j)
			return nil
		}); err != nil {
		return nil, err
	}

	if err := s.collect(ctx, `SELECT key, name, boxes, covenant, consequence FROM dark_awareness_stages ORDER BY position`,
		func(rows pgx.Rows) error {
			var stage darkborne.AwarenessStage
			if err := rows.Scan(&stage.Key, &stage.Name, &stage.Boxes, &stage.Covenant, &stage.Consequence); err != nil {
				return err
			}
			c.Court.Awareness = append(c.Court.Awareness, stage)
			return nil
		}); err != nil {
		return nil, err
	}

	if err := s.collect(ctx, `SELECT key, name, motto, description FROM dark_orders ORDER BY position`,
		func(rows pgx.Rows) error {
			var o darkborne.Order
			if err := rows.Scan(&o.Key, &o.Name, &o.Motto, &o.Description); err != nil {
				return err
			}
			c.Orders = append(c.Orders, o)
			return nil
		}); err != nil {
		return nil, err
	}

	if err := s.collect(ctx, `SELECT key, name, formula, scope FROM dark_xp_costs ORDER BY position`,
		func(rows pgx.Rows) error {
			var cost darkborne.XPCost
			if err := rows.Scan(&cost.Key, &cost.Name, &cost.Formula, &cost.Scope); err != nil {
				return err
			}
			c.XPCosts = append(c.XPCosts, cost)
			return nil
		}); err != nil {
		return nil, err
	}

	if err := s.collect(ctx, `SELECT key, name, title, house_key, role, motivation, ideal, description,
		after_awakening, humans, scions, cruor_trait, ur_scar, fate, fate_detail, question
		FROM dark_firsts ORDER BY position`,
		func(rows pgx.Rows) error {
			var f darkborne.First
			if err := rows.Scan(&f.Key, &f.Name, &f.Title, &f.HouseKey, &f.Role, &f.Motivation, &f.Ideal,
				&f.Description, &f.AfterAwakening, &f.Humans, &f.Scions, &f.CruorTrait, &f.UrScar,
				&f.Fate, &f.FateDetail, &f.Question); err != nil {
				return err
			}
			c.Firsts = append(c.Firsts, f)
			return nil
		}); err != nil {
		return nil, err
	}

	if err := s.collect(ctx, `SELECT key, value FROM dark_covenant`,
		func(rows pgx.Rows) error {
			var key, value string
			if err := rows.Scan(&key, &value); err != nil {
				return err
			}
			switch key {
			case "title":
				c.Covenant.Title = value
			case "subtitle":
				c.Covenant.Subtitle = value
			case "preamble":
				c.Covenant.Preamble = value
			case "oath":
				c.Covenant.Oath = value
			}
			return nil
		}); err != nil {
		return nil, err
	}

	if err := s.collect(ctx, `SELECT key, number, name, title, body FROM dark_covenant_articles ORDER BY position`,
		func(rows pgx.Rows) error {
			var article darkborne.CovenantArticle
			if err := rows.Scan(&article.Key, &article.Number, &article.Name, &article.Title, &article.Body); err != nil {
				return err
			}
			c.Covenant.Articles = append(c.Covenant.Articles, article)
			return nil
		}); err != nil {
		return nil, err
	}

	if err := s.collect(ctx, `SELECT key, name, description FROM dark_court_types ORDER BY position`,
		func(rows pgx.Rows) error {
			var t darkborne.CourtType
			if err := rows.Scan(&t.Key, &t.Name, &t.Description); err != nil {
				return err
			}
			c.CourtTypes = append(c.CourtTypes, t)
			return nil
		}); err != nil {
		return nil, err
	}

	if err := s.collect(ctx, `SELECT key, name, description FROM dark_court_mandates ORDER BY position`,
		func(rows pgx.Rows) error {
			var m darkborne.CourtMandate
			if err := rows.Scan(&m.Key, &m.Name, &m.Description); err != nil {
				return err
			}
			c.CourtMandates = append(c.CourtMandates, m)
			return nil
		}); err != nil {
		return nil, err
	}

	if err := s.collect(ctx, `SELECT key, name, description FROM dark_court_structures ORDER BY position`,
		func(rows pgx.Rows) error {
			var st darkborne.CourtStructure
			if err := rows.Scan(&st.Key, &st.Name, &st.Description); err != nil {
				return err
			}
			c.CourtStructs = append(c.CourtStructs, st)
			return nil
		}); err != nil {
		return nil, err
	}

	if err := s.collect(ctx, `SELECT pair_key, situation, art_a, art_b, text_a, text_b
		FROM dark_art_boundaries ORDER BY pair_key, position`,
		func(rows pgx.Rows) error {
			var b darkborne.ArtBoundary
			if err := rows.Scan(&b.PairKey, &b.Situation, &b.ArtA, &b.ArtB, &b.TextA, &b.TextB); err != nil {
				return err
			}
			c.ArtBoundaries = append(c.ArtBoundaries, b)
			return nil
		}); err != nil {
		return nil, err
	}

	if err := s.collect(ctx, `SELECT key, house_a, house_b, description FROM dark_house_relations ORDER BY position`,
		func(rows pgx.Rows) error {
			var r darkborne.HouseRelation
			if err := rows.Scan(&r.Key, &r.HouseA, &r.HouseB, &r.Description); err != nil {
				return err
			}
			c.HouseRelations = append(c.HouseRelations, r)
			return nil
		}); err != nil {
		return nil, err
	}

	lexicon, err := s.Lexicon(ctx, darkborne.Gameline)
	if err != nil {
		return nil, err
	}
	c.Lexicon = lexicon
	return c, nil
}

func (s *darkborneStore) Lexicon(ctx context.Context, gameline string) ([]darkborne.LexiconEntry, error) {
	entries := make([]darkborne.LexiconEntry, 0, 64)
	err := s.collect(ctx, `SELECT key, gameline, section, coalesce(parent_key, ''), title, body, tags, position, section_position
		FROM dark_lexicon_entries WHERE gameline = $1 ORDER BY section_position, position, key`,
		func(rows pgx.Rows) error {
			var e darkborne.LexiconEntry
			if err := rows.Scan(&e.Key, &e.Gameline, &e.Section, &e.ParentKey, &e.Title, &e.Body, &e.Tags,
				&e.Position, &e.SectionPosition); err != nil {
				return err
			}
			entries = append(entries, e)
			return nil
		}, gameline)
	if err != nil {
		return nil, err
	}
	return entries, nil
}

func (s *darkborneStore) collect(ctx context.Context, query string, scan func(pgx.Rows) error, args ...any) error {
	rows, err := s.pool.Query(ctx, query, args...)
	if err != nil {
		return err
	}
	defer rows.Close()
	for rows.Next() {
		if err := scan(rows); err != nil {
			return err
		}
	}
	return rows.Err()
}
