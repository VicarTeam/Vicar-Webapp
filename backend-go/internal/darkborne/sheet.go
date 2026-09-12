package darkborne

import (
	"encoding/json"
	"reflect"
	"sort"
)

const Gameline = "db"

var sheetKeys = []string{
	"sire", "formerLife", "death", "startAge", "bloodAge", "bloodStrength", "glied",
	"house", "bloodline", "sireArt", "affinityArt", "varyssAnathema",
	"court", "courtRank", "office", "order",
	"cruor", "hunger", "wille", "willePool", "health", "alienation", "learnStepsUsed",
	"attributes", "skills", "specializations", "arts", "forms", "anchors",
	"humanTraits", "anathema", "backgrounds", "debts", "damage", "levelHistory",
}

type KeyValue struct {
	Key   string
	Value int
}

type Specialization struct {
	SkillKey string
	Name     string
}

type CharacterArt struct {
	Key      string
	Depth    int
	Affinity bool
}

type CharacterForm struct {
	ArtKey  string
	FormKey string
	Name    string
	Level   int
	Kind    string
	Effect  string
	Limits  string
}

type Anchor struct {
	Slot   int
	Kind   string
	Label  string
	State  string
	Forced bool
}

type CharacterAnathema struct {
	InfluenceKey string
	Level        string
	Source       string
	Note         string
}

type CharacterBackground struct {
	Key   string
	Level int
	Note  string
}

type Debt struct {
	Direction string
	SizeKey   string
	Party     string
	Note      string
}

type DamageBox struct {
	Box  int
	Kind string
}

type LevelChange struct {
	Type      string
	Date      string
	Text      string
	ExpUsed   int
	ExpBefore int
	ExpAfter  int
}

type Sheet struct {
	Sire            string
	FormerLife      string
	Death           string
	StartAgeKey     string
	BloodAge        int
	BloodStrength   int
	Glied           int
	HouseKey        string
	BloodlineKey    string
	SireArtKey      string
	AffinityArtKey  string
	VaryssAnathema  string
	Court           string
	CourtRank       int
	OfficeKey       string
	OrderKey        string
	Cruor           int
	Hunger          int
	Wille           int
	WillePool       int
	Health          int
	Alienation      bool
	LearnStepsUsed  int
	Attributes      []KeyValue
	Skills          []KeyValue
	Specializations []Specialization
	Arts            []CharacterArt
	Forms           []CharacterForm
	Anchors         []Anchor
	HumanTraits     []KeyValue
	Anathema        []CharacterAnathema
	Backgrounds     []CharacterBackground
	Debts           []Debt
	Damage          []DamageBox
	LevelHistory    []LevelChange
	Extra           map[string]any
}

func IsDeathborne(data map[string]any) bool {
	game, _ := data["game"].(string)
	return game == Gameline
}

func SheetFromData(data map[string]any) *Sheet {
	s := &Sheet{Extra: map[string]any{}}
	for k, v := range data {
		if !isSheetKey(k) {
			s.Extra[k] = v
		}
	}
	s.Sire = str(data["sire"])
	s.FormerLife = str(data["formerLife"])
	s.Death = str(data["death"])
	s.StartAgeKey = str(data["startAge"])
	s.BloodAge = num(data["bloodAge"])
	s.BloodStrength = num(data["bloodStrength"])
	s.Glied = num(data["glied"])
	s.HouseKey = str(data["house"])
	s.BloodlineKey = str(data["bloodline"])
	s.SireArtKey = str(data["sireArt"])
	s.AffinityArtKey = str(data["affinityArt"])
	s.VaryssAnathema = str(data["varyssAnathema"])
	s.Court = str(data["court"])
	s.CourtRank = num(data["courtRank"])
	s.OfficeKey = str(data["office"])
	s.OrderKey = str(data["order"])
	s.Cruor = num(data["cruor"])
	s.Hunger = num(data["hunger"])
	s.Wille = num(data["wille"])
	s.WillePool = num(data["willePool"])
	s.Health = num(data["health"])
	s.Alienation = boolean(data["alienation"])
	s.LearnStepsUsed = num(data["learnStepsUsed"])
	s.Attributes = keyValues(data["attributes"])
	s.Skills = keyValues(data["skills"])
	s.HumanTraits = keyValues(data["humanTraits"])

	for _, row := range list(data["specializations"]) {
		s.Specializations = append(s.Specializations, Specialization{
			SkillKey: str(row["skill"]), Name: str(row["name"]),
		})
	}
	for _, row := range list(data["arts"]) {
		s.Arts = append(s.Arts, CharacterArt{
			Key: str(row["key"]), Depth: num(row["depth"]), Affinity: boolean(row["affinity"]),
		})
	}
	for _, row := range list(data["forms"]) {
		s.Forms = append(s.Forms, CharacterForm{
			ArtKey: str(row["art"]), FormKey: str(row["key"]), Name: str(row["name"]),
			Level: num(row["level"]), Kind: str(row["kind"]),
			Effect: str(row["effect"]), Limits: str(row["limits"]),
		})
	}
	for i, row := range list(data["anchors"]) {
		slot := num(row["slot"])
		if _, ok := row["slot"]; !ok {
			slot = i
		}
		s.Anchors = append(s.Anchors, Anchor{
			Slot: slot, Kind: str(row["kind"]), Label: str(row["label"]),
			State: str(row["state"]), Forced: boolean(row["forced"]),
		})
	}
	for _, row := range list(data["anathema"]) {
		s.Anathema = append(s.Anathema, CharacterAnathema{
			InfluenceKey: str(row["influence"]), Level: str(row["level"]),
			Source: str(row["source"]), Note: str(row["note"]),
		})
	}
	for _, row := range list(data["backgrounds"]) {
		s.Backgrounds = append(s.Backgrounds, CharacterBackground{
			Key: str(row["key"]), Level: num(row["level"]), Note: str(row["note"]),
		})
	}
	for _, row := range list(data["debts"]) {
		s.Debts = append(s.Debts, Debt{
			Direction: str(row["direction"]), SizeKey: str(row["size"]),
			Party: str(row["party"]), Note: str(row["note"]),
		})
	}
	for i, v := range anySlice(data["damage"]) {
		kind := str(v)
		if kind == "" {
			continue
		}
		s.Damage = append(s.Damage, DamageBox{Box: i, Kind: kind})
	}
	for _, row := range list(data["levelHistory"]) {
		exp := anyMap(row["exp"])
		s.LevelHistory = append(s.LevelHistory, LevelChange{
			Type: str(row["type"]), Date: str(row["date"]), Text: str(row["text"]),
			ExpUsed: num(exp["used"]), ExpBefore: num(exp["before"]), ExpAfter: num(exp["after"]),
		})
	}
	return s
}

func (s *Sheet) ToData() map[string]any {
	out := map[string]any{}
	for k, v := range s.Extra {
		out[k] = v
	}
	out["sire"] = s.Sire
	out["formerLife"] = s.FormerLife
	out["death"] = s.Death
	out["startAge"] = s.StartAgeKey
	out["bloodAge"] = s.BloodAge
	out["bloodStrength"] = s.BloodStrength
	out["glied"] = s.Glied
	out["house"] = s.HouseKey
	out["bloodline"] = s.BloodlineKey
	out["sireArt"] = s.SireArtKey
	out["affinityArt"] = s.AffinityArtKey
	out["varyssAnathema"] = s.VaryssAnathema
	out["court"] = s.Court
	out["courtRank"] = s.CourtRank
	out["office"] = s.OfficeKey
	out["order"] = s.OrderKey
	out["cruor"] = s.Cruor
	out["hunger"] = s.Hunger
	out["wille"] = s.Wille
	out["willePool"] = s.WillePool
	out["health"] = s.Health
	out["alienation"] = s.Alienation
	out["learnStepsUsed"] = s.LearnStepsUsed
	out["attributes"] = keyValueMap(s.Attributes)
	out["skills"] = keyValueMap(s.Skills)
	out["humanTraits"] = keyValueMap(s.HumanTraits)

	specs := make([]any, 0, len(s.Specializations))
	for _, sp := range s.Specializations {
		specs = append(specs, map[string]any{"skill": sp.SkillKey, "name": sp.Name})
	}
	out["specializations"] = specs

	arts := make([]any, 0, len(s.Arts))
	for _, a := range s.Arts {
		arts = append(arts, map[string]any{"key": a.Key, "depth": a.Depth, "affinity": a.Affinity})
	}
	out["arts"] = arts

	forms := make([]any, 0, len(s.Forms))
	for _, f := range s.Forms {
		forms = append(forms, map[string]any{
			"art": f.ArtKey, "key": f.FormKey, "name": f.Name, "level": f.Level,
			"kind": f.Kind, "effect": f.Effect, "limits": f.Limits,
		})
	}
	out["forms"] = forms

	anchors := make([]any, 0, len(s.Anchors))
	for _, a := range s.Anchors {
		anchors = append(anchors, map[string]any{
			"slot": a.Slot, "kind": a.Kind, "label": a.Label, "state": a.State, "forced": a.Forced,
		})
	}
	out["anchors"] = anchors

	anathema := make([]any, 0, len(s.Anathema))
	for _, a := range s.Anathema {
		anathema = append(anathema, map[string]any{
			"influence": a.InfluenceKey, "level": a.Level, "source": a.Source, "note": a.Note,
		})
	}
	out["anathema"] = anathema

	backgrounds := make([]any, 0, len(s.Backgrounds))
	for _, b := range s.Backgrounds {
		backgrounds = append(backgrounds, map[string]any{"key": b.Key, "level": b.Level, "note": b.Note})
	}
	out["backgrounds"] = backgrounds

	debts := make([]any, 0, len(s.Debts))
	for _, d := range s.Debts {
		debts = append(debts, map[string]any{
			"direction": d.Direction, "size": d.SizeKey, "party": d.Party, "note": d.Note,
		})
	}
	out["debts"] = debts

	size := 0
	for _, d := range s.Damage {
		if d.Box+1 > size {
			size = d.Box + 1
		}
	}
	if s.Health > size {
		size = s.Health
	}
	damage := make([]any, size)
	for i := range damage {
		damage[i] = ""
	}
	for _, d := range s.Damage {
		if d.Box >= 0 && d.Box < size {
			damage[d.Box] = d.Kind
		}
	}
	out["damage"] = damage

	history := make([]any, 0, len(s.LevelHistory))
	for _, h := range s.LevelHistory {
		history = append(history, map[string]any{
			"type": h.Type, "date": h.Date, "text": h.Text,
			"exp": map[string]any{"used": h.ExpUsed, "before": h.ExpBefore, "after": h.ExpAfter},
		})
	}
	out["levelHistory"] = history
	return out
}

func isSheetKey(key string) bool {
	for _, k := range sheetKeys {
		if k == key {
			return true
		}
	}
	return false
}

func str(v any) string {
	s, _ := v.(string)
	return s
}

func boolean(v any) bool {
	b, _ := v.(bool)
	return b
}

func num(v any) int {
	switch n := v.(type) {
	case int:
		return n
	case int32:
		return int(n)
	case int64:
		return int(n)
	case float32:
		return int(n)
	case float64:
		return int(n)
	case json.Number:
		i, err := n.Int64()
		if err != nil {
			return 0
		}
		return int(i)
	default:
		return 0
	}
}

func anySlice(v any) []any {
	if items, ok := v.([]any); ok {
		return items
	}
	if v == nil {
		return nil
	}
	rv := reflect.ValueOf(v)
	if rv.Kind() != reflect.Slice && rv.Kind() != reflect.Array {
		return nil
	}
	out := make([]any, rv.Len())
	for i := 0; i < rv.Len(); i++ {
		out[i] = rv.Index(i).Interface()
	}
	return out
}

func anyMap(v any) map[string]any {
	if m, ok := v.(map[string]any); ok {
		return m
	}
	if v == nil {
		return nil
	}
	rv := reflect.ValueOf(v)
	if rv.Kind() != reflect.Map || rv.Type().Key().Kind() != reflect.String {
		return nil
	}
	out := make(map[string]any, rv.Len())
	for _, key := range rv.MapKeys() {
		out[key.String()] = rv.MapIndex(key).Interface()
	}
	return out
}

func list(v any) []map[string]any {
	items := anySlice(v)
	out := make([]map[string]any, 0, len(items))
	for _, item := range items {
		if m := anyMap(item); m != nil {
			out = append(out, m)
		}
	}
	return out
}

func keyValues(v any) []KeyValue {
	m := anyMap(v)
	if m == nil {
		return nil
	}
	keys := make([]string, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	out := make([]KeyValue, 0, len(keys))
	for _, k := range keys {
		out = append(out, KeyValue{Key: k, Value: num(m[k])})
	}
	return out
}

func keyValueMap(items []KeyValue) map[string]any {
	out := make(map[string]any, len(items))
	for _, kv := range items {
		out[kv.Key] = kv.Value
	}
	return out
}
