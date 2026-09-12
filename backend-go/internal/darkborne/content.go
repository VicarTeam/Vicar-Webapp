package darkborne

import (
	"crypto/sha256"
	"embed"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io/fs"
	"sort"
	"sync"
)

//go:embed data/*.json
var contentFS embed.FS

type Attribute struct {
	Key         string `json:"key"`
	Name        string `json:"name"`
	Category    string `json:"category"`
	Kind        string `json:"kind"`
	Description string `json:"description"`
}

type Skill struct {
	Key         string `json:"key"`
	Name        string `json:"name"`
	Category    string `json:"category"`
	Description string `json:"description"`
}

type ArtLevel struct {
	Depth    int      `json:"depth"`
	Examples []string `json:"examples"`
}

type ArtForm struct {
	Key        string `json:"key"`
	ArtKey     string `json:"artKey,omitempty"`
	Name       string `json:"name"`
	Level      int    `json:"level"`
	Difficulty int    `json:"difficulty"`
	Cost       int    `json:"cost"`
	Effect     string `json:"effect"`
	Limits     string `json:"limits"`
}

type Art struct {
	Key               string     `json:"key"`
	Name              string     `json:"name"`
	ShortName         string     `json:"shortName"`
	Principle         string     `json:"principle"`
	Summary           string     `json:"summary"`
	IsPrimal          bool       `json:"isPrimal"`
	CounterKey        string     `json:"counterKey"`
	TypicalAttributes []string   `json:"typicalAttributes"`
	Limits            []string   `json:"limits"`
	Levels            []ArtLevel `json:"levels"`
	Forms             []ArtForm  `json:"forms"`
}

type ArtPairEffect struct {
	Name     string `json:"name"`
	Effect   string `json:"effect"`
	Severity string `json:"severity"`
}

type ArtPair struct {
	Key      string          `json:"key"`
	ArtA     string          `json:"artA"`
	ArtB     string          `json:"artB"`
	Question string          `json:"question"`
	Effects  []ArtPairEffect `json:"effects"`
}

type HouseAnathema struct {
	InfluenceKey string `json:"influenceKey"`
	Level        string `json:"level"`
	Note         string `json:"note"`
}

type BloodScar struct {
	Key             string   `json:"key"`
	Name            string   `json:"name"`
	Summary         string   `json:"summary"`
	Triggers        []string `json:"triggers"`
	PermanentEffect string   `json:"permanentEffect"`
	Compulsions     []string `json:"compulsions"`
}

type House struct {
	Key         string          `json:"key"`
	Name        string          `json:"name"`
	Epithet     string          `json:"epithet"`
	OriginName  string          `json:"originName"`
	OriginTitle string          `json:"originTitle"`
	Idea        string          `json:"idea"`
	Reputation  string          `json:"reputation"`
	Description string          `json:"description"`
	Scar        BloodScar       `json:"scar"`
	Anathema    []HouseAnathema `json:"anathema"`
}

type Influence struct {
	Key       string `json:"key"`
	Name      string `json:"name"`
	Kind      string `json:"kind"`
	BaseLevel string `json:"baseLevel"`
	Note      string `json:"note"`
}

type AnathemaLevel struct {
	Level    string `json:"level"`
	Name     string `json:"name"`
	Physical string `json:"physical"`
	Symbolic string `json:"symbolic"`
	Order    int    `json:"order"`
}

type Depth struct {
	Depth   int    `json:"depth"`
	Name    string `json:"name"`
	Meaning string `json:"meaning"`
	Target  string `json:"target"`
	Scale   string `json:"scale"`
}

type Increase struct {
	Key          string `json:"key"`
	Name         string `json:"name"`
	Mundane      string `json:"mundane"`
	Supernatural string `json:"supernatural"`
}

type BloodStrengthLevel struct {
	Level         int      `json:"level"`
	MaxDepth      int      `json:"maxDepth"`
	Reserve       int      `json:"reserve"`
	Upkeep        int      `json:"upkeep"`
	FreeIncreases int      `json:"freeIncreases"`
	Notes         []string `json:"notes"`
}

type StartAge struct {
	Key                 string `json:"key"`
	Name                string `json:"name"`
	BloodAge            string `json:"bloodAge"`
	BloodStrength       int    `json:"bloodStrength"`
	MaxDepth            int    `json:"maxDepth"`
	LearnSteps          int    `json:"learnSteps"`
	BonusXP             int    `json:"bonusXp"`
	HumanAnchors        int    `json:"humanAnchors"`
	NightAnchors        int    `json:"nightAnchors"`
	HumanTraitReduction int    `json:"humanTraitReduction"`
	Burdens             string `json:"burdens"`
	Alienation          bool   `json:"alienation"`
	Description         string `json:"description"`
}

type HumanTraitLevel struct {
	Value       int    `json:"value"`
	Description string `json:"description"`
}

type HumanTrait struct {
	Key         string            `json:"key"`
	Name        string            `json:"name"`
	Description string            `json:"description"`
	Levels      []HumanTraitLevel `json:"levels"`
}

type Effect struct {
	Key      string `json:"key"`
	Kind     string `json:"kind,omitempty"`
	Name     string `json:"name"`
	Effect   string `json:"effect"`
	Severity string `json:"severity"`
}

type Effects struct {
	Hunger      []Effect `json:"hunger"`
	Instability []Effect `json:"instability"`
}

type HuntMethod struct {
	Key        string `json:"key"`
	Name       string `json:"name"`
	Attribute  string `json:"attribute"`
	Skill      string `json:"skill"`
	Difficulty int    `json:"difficulty"`
	Note       string `json:"note"`
}

type BloodSource struct {
	Key   string `json:"key"`
	Name  string `json:"name"`
	Cruor int    `json:"cruor"`
	Note  string `json:"note"`
}

type HuntIncrease struct {
	Key    string `json:"key"`
	Effect string `json:"effect"`
}

type Hunt struct {
	Methods   []HuntMethod   `json:"methods"`
	Sources   []BloodSource  `json:"sources"`
	Increases []HuntIncrease `json:"increases"`
}

type BackgroundLevel struct {
	Level       int    `json:"level"`
	Description string `json:"description"`
}

type Background struct {
	Key         string            `json:"key"`
	Name        string            `json:"name"`
	Description string            `json:"description"`
	Levels      []BackgroundLevel `json:"levels"`
}

type CourtRank struct {
	Level  int    `json:"level"`
	Name   string `json:"name"`
	Rights string `json:"rights"`
	Bonus  int    `json:"bonus"`
}

type CourtOffice struct {
	Key  string `json:"key"`
	Name string `json:"name"`
	Task string `json:"task"`
	Rule string `json:"rule"`
}

type DebtSize struct {
	Key         string `json:"key"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

type Judgement struct {
	Key    string `json:"key"`
	Name   string `json:"name"`
	Effect string `json:"effect"`
}

type AwarenessStage struct {
	Key         string `json:"key"`
	Name        string `json:"name"`
	Boxes       string `json:"boxes"`
	Covenant    string `json:"covenant"`
	Consequence string `json:"consequence"`
}

type Court struct {
	Ranks      []CourtRank      `json:"ranks"`
	Offices    []CourtOffice    `json:"offices"`
	Debts      []DebtSize       `json:"debts"`
	Judgements []Judgement      `json:"judgements"`
	Awareness  []AwarenessStage `json:"awareness"`
}

type Order struct {
	Key         string `json:"key"`
	Name        string `json:"name"`
	Motto       string `json:"motto"`
	Description string `json:"description"`
}

type XPCost struct {
	Key     string `json:"key"`
	Name    string `json:"name"`
	Formula string `json:"formula"`
	Scope   string `json:"scope"`
}

type First struct {
	Key            string `json:"key"`
	Name           string `json:"name"`
	Title          string `json:"title"`
	HouseKey       string `json:"houseKey"`
	Role           string `json:"role"`
	Motivation     string `json:"motivation"`
	Ideal          string `json:"ideal"`
	Description    string `json:"description"`
	AfterAwakening string `json:"afterAwakening"`
	Humans         string `json:"humans"`
	Scions         string `json:"scions"`
	CruorTrait     string `json:"cruorTrait"`
	UrScar         string `json:"urScar"`
	Fate           string `json:"fate"`
	FateDetail     string `json:"fateDetail"`
	Question       string `json:"question"`
}

type CovenantArticle struct {
	Key    string `json:"key"`
	Number int    `json:"number"`
	Name   string `json:"name"`
	Title  string `json:"title"`
	Body   string `json:"body"`
}

type Covenant struct {
	Title    string            `json:"title"`
	Subtitle string            `json:"subtitle"`
	Preamble string            `json:"preamble"`
	Articles []CovenantArticle `json:"articles"`
	Oath     string            `json:"oath"`
}

type CourtType struct {
	Key         string `json:"key"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

type CourtMandate struct {
	Key         string `json:"key"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

type CourtStructure struct {
	Key         string `json:"key"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

type ArtBoundary struct {
	PairKey   string `json:"pairKey"`
	Situation string `json:"situation"`
	ArtA      string `json:"artA"`
	ArtB      string `json:"artB"`
	TextA     string `json:"textA"`
	TextB     string `json:"textB"`
}

type HouseRelation struct {
	Key         string `json:"key"`
	HouseA      string `json:"houseA"`
	HouseB      string `json:"houseB"`
	Description string `json:"description"`
}

type LexiconEntry struct {
	Key             string   `json:"key"`
	Gameline        string   `json:"gameline"`
	Section         string   `json:"section"`
	SectionPosition int      `json:"sectionPosition"`
	ParentKey       string   `json:"parentKey"`
	Title           string   `json:"title"`
	Body            string   `json:"body"`
	Tags            []string `json:"tags"`
	Position        int      `json:"position"`
}

type Content struct {
	Revision       string               `json:"revision"`
	Attributes     []Attribute          `json:"attributes"`
	Skills         []Skill              `json:"skills"`
	Arts           []Art                `json:"arts"`
	ArtPairs       []ArtPair            `json:"artPairs"`
	Houses         []House              `json:"houses"`
	Influences     []Influence          `json:"influences"`
	AnathemaLevels []AnathemaLevel      `json:"anathemaLevels"`
	Depths         []Depth              `json:"depths"`
	Increases      []Increase           `json:"increases"`
	BloodStrength  []BloodStrengthLevel `json:"bloodStrength"`
	StartAges      []StartAge           `json:"startAges"`
	HumanTraits    []HumanTrait         `json:"humanTraits"`
	Effects        Effects              `json:"effects"`
	Hunt           Hunt                 `json:"hunt"`
	Backgrounds    []Background         `json:"backgrounds"`
	Court          Court                `json:"court"`
	Orders         []Order              `json:"orders"`
	XPCosts        []XPCost             `json:"xpCosts"`
	Firsts         []First              `json:"firsts"`
	Covenant       Covenant             `json:"covenant"`
	CourtTypes     []CourtType          `json:"courtTypes"`
	CourtMandates  []CourtMandate       `json:"courtMandates"`
	CourtStructs   []CourtStructure     `json:"courtStructures"`
	ArtBoundaries  []ArtBoundary        `json:"artBoundaries"`
	HouseRelations []HouseRelation      `json:"houseRelations"`
	Lexicon        []LexiconEntry       `json:"lexicon"`
}

var (
	embeddedOnce sync.Once
	embedded     *Content
	embeddedErr  error
)

func Embedded() (*Content, error) {
	embeddedOnce.Do(func() {
		embedded, embeddedErr = loadEmbedded()
	})
	return embedded, embeddedErr
}

func loadEmbedded() (*Content, error) {
	c := &Content{}
	files := map[string]any{
		"attributes.json":       &c.Attributes,
		"skills.json":           &c.Skills,
		"arts.json":             &c.Arts,
		"art-pairs.json":        &c.ArtPairs,
		"houses.json":           &c.Houses,
		"influences.json":       &c.Influences,
		"anathema-levels.json":  &c.AnathemaLevels,
		"depths.json":           &c.Depths,
		"increases.json":        &c.Increases,
		"blood-strength.json":   &c.BloodStrength,
		"start-ages.json":       &c.StartAges,
		"human-traits.json":     &c.HumanTraits,
		"effects.json":          &c.Effects,
		"hunt.json":             &c.Hunt,
		"backgrounds.json":      &c.Backgrounds,
		"court.json":            &c.Court,
		"orders.json":           &c.Orders,
		"xp-costs.json":         &c.XPCosts,
		"firsts.json":           &c.Firsts,
		"covenant.json":         &c.Covenant,
		"court-types.json":      &c.CourtTypes,
		"court-mandates.json":   &c.CourtMandates,
		"court-structures.json": &c.CourtStructs,
		"art-boundaries.json":   &c.ArtBoundaries,
		"house-relations.json":  &c.HouseRelations,
		"lexicon.json":          &c.Lexicon,
	}
	names := make([]string, 0, len(files))
	for name := range files {
		names = append(names, name)
	}
	sort.Strings(names)

	sum := sha256.New()
	for _, name := range names {
		raw, err := fs.ReadFile(contentFS, "data/"+name)
		if err != nil {
			return nil, fmt.Errorf("darkborne: read %s: %w", name, err)
		}
		if err := json.Unmarshal(raw, files[name]); err != nil {
			return nil, fmt.Errorf("darkborne: parse %s: %w", name, err)
		}
		sum.Write([]byte(name))
		sum.Write(raw)
	}
	c.Revision = hex.EncodeToString(sum.Sum(nil))[:16]
	for i := range c.Arts {
		for j := range c.Arts[i].Forms {
			c.Arts[i].Forms[j].ArtKey = c.Arts[i].Key
		}
	}
	for i := range c.Effects.Hunger {
		c.Effects.Hunger[i].Kind = "hunger"
	}
	for i := range c.Effects.Instability {
		c.Effects.Instability[i].Kind = "instability"
	}
	assignLexiconSections(c)
	return c, nil
}

func assignLexiconSections(c *Content) {
	order := map[string]int{}
	next := 0
	for i := range c.Lexicon {
		section := c.Lexicon[i].Section
		if _, ok := order[section]; !ok {
			order[section] = next
			next += 10
		}
		c.Lexicon[i].SectionPosition = order[section]
	}
}
