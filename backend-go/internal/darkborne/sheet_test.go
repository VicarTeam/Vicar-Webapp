package darkborne

import (
	"encoding/json"
	"reflect"
	"testing"
)

func fullSheetData() map[string]any {
	return map[string]any{
		"id":                "65f0aa11bb22cc33dd44ee55",
		"game":              "db",
		"name":              "Mara Vess",
		"avatar":            "",
		"avatarOrientation": "center",
		"sex":               "divers",
		"concept":           "Ermittlerin",
		"chronicle":         "Köln bei Nacht",
		"notes":             "",
		"exp":               12,
		"usedExp":           5,
		"inventory":         map[string]any{"carriedItems": []any{}, "ownedItems": []any{}, "cash": 0, "bank": 0},
		"sire":              "Halvard Sarr",
		"formerLife":        "Rechtsmedizinerin",
		"death":             "Autounfall",
		"startAge":          "established",
		"bloodAge":          62,
		"bloodStrength":     2,
		"glied":             9,
		"house":             "sarrath",
		"bloodline":         "sarrath",
		"sireArt":           "revelation",
		"affinityArt":       "revelation",
		"varyssAnathema":    "",
		"court":             "Free Court of Cologne",
		"courtRank":         2,
		"office":            "",
		"order":             "the_continuance",
		"cruor":             5,
		"hunger":            1,
		"wille":             3,
		"willePool":         2,
		"health":            7,
		"alienation":        false,
		"learnStepsUsed":    3,
		"attributes": map[string]any{
			"geschick": 3, "gespuer": 4, "kraft": 2,
			"praesenz": 2, "raffinesse": 3, "verstand": 3,
		},
		"skills": map[string]any{
			"athletik": 1, "nachforschung": 3, "okkultes": 2,
		},
		"humanTraits": map[string]any{
			"atem": 3, "essen": 2, "herzschlag": 3, "mimik": 2, "traeume": 3, "waerme": 3,
		},
		"specializations": []any{
			map[string]any{"skill": "nachforschung", "name": "Spurensicherung"},
		},
		"arts": []any{
			map[string]any{"key": "revelation", "depth": 2, "affinity": true},
			map[string]any{"key": "veil", "depth": 1, "affinity": false},
		},
		"forms": []any{
			map[string]any{
				"art": "revelation", "key": "der_zweite_blick", "name": "Der Zweite Blick",
				"level": 1, "kind": "established", "effect": "Erkennt einen Vesper.", "limits": "Nur ja oder nein.",
			},
		},
		"anchors": []any{
			map[string]any{"slot": 0, "kind": "human", "label": "Meine Schwester Ida", "state": "firm", "forced": false},
			map[string]any{"slot": 1, "kind": "night", "label": "Mein Amt als Keeper", "state": "shaken", "forced": false},
		},
		"anathema": []any{
			map[string]any{"influence": "sunlight", "level": "extreme", "source": "inherited", "note": "sensorisch"},
			map[string]any{"influence": "mirrors", "level": "strong", "source": "inherited", "note": ""},
		},
		"backgrounds": []any{
			map[string]any{"key": "kontakte", "level": 2, "note": "Presse und Polizei"},
		},
		"debts": []any{
			map[string]any{"direction": "owing", "size": "schuld", "party": "Regentin", "note": "Schweigen"},
		},
		"damage": []any{"wound", "", "devastation", "", "", "", ""},
		"levelHistory": []any{
			map[string]any{
				"type": "db_art", "date": "2026-09-12", "text": "Offenbarung auf 2",
				"exp": map[string]any{"used": 10, "before": 22, "after": 12},
			},
		},
	}
}

func normalize(t *testing.T, v any) any {
	t.Helper()
	raw, err := json.Marshal(v)
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}
	var out any
	if err := json.Unmarshal(raw, &out); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	return out
}

func TestSheetRoundTrip(t *testing.T) {
	in := fullSheetData()
	out := SheetFromData(in).ToData()
	if !reflect.DeepEqual(normalize(t, in), normalize(t, out)) {
		t.Fatalf("round trip changed the sheet\nin:  %v\nout: %v", normalize(t, in), normalize(t, out))
	}
}

func TestSheetKeepsUnknownKeys(t *testing.T) {
	in := fullSheetData()
	in["skillTrees"] = []any{map[string]any{"id": "tree-1"}}
	in["customThing"] = "keep me"
	sheet := SheetFromData(in)
	if _, ok := sheet.Extra["customThing"]; !ok {
		t.Fatal("unknown key was dropped from extra")
	}
	if _, ok := sheet.Extra["attributes"]; ok {
		t.Fatal("modelled key leaked into extra")
	}
	out := sheet.ToData()
	if out["customThing"] != "keep me" {
		t.Fatalf("unknown key lost, got %v", out["customThing"])
	}
	if !reflect.DeepEqual(normalize(t, in), normalize(t, out)) {
		t.Fatal("round trip with unknown keys changed the sheet")
	}
}

func TestSheetFromDataSplitsDamageAndArts(t *testing.T) {
	sheet := SheetFromData(fullSheetData())
	if len(sheet.Damage) != 2 {
		t.Fatalf("want 2 damage boxes, got %d", len(sheet.Damage))
	}
	if sheet.Damage[0].Box != 0 || sheet.Damage[0].Kind != "wound" {
		t.Fatalf("unexpected first damage box: %+v", sheet.Damage[0])
	}
	if sheet.Damage[1].Box != 2 || sheet.Damage[1].Kind != "devastation" {
		t.Fatalf("unexpected second damage box: %+v", sheet.Damage[1])
	}
	if sheet.ArtDepth("revelation") != 2 {
		t.Fatalf("want depth 2 for revelation, got %d", sheet.ArtDepth("revelation"))
	}
	if sheet.ArtDepth("memory") != 0 {
		t.Fatal("unlearned art must have depth 0")
	}
	if len(sheet.Attributes) != 6 {
		t.Fatalf("want 6 attributes, got %d", len(sheet.Attributes))
	}
	if sheet.Attributes[0].Key != "geschick" {
		t.Fatalf("attributes must be sorted, got %q first", sheet.Attributes[0].Key)
	}
}

func TestSheetHandlesEmptyData(t *testing.T) {
	sheet := SheetFromData(map[string]any{"game": "db"})
	out := sheet.ToData()
	for _, key := range []string{"attributes", "skills", "arts", "forms", "anchors", "damage"} {
		if _, ok := out[key]; !ok {
			t.Fatalf("missing key %q in rebuilt sheet", key)
		}
	}
	if !IsDeathborne(out) {
		t.Fatal("game key lost")
	}
}

func TestIsDeathborne(t *testing.T) {
	if IsDeathborne(map[string]any{"game": "v5"}) {
		t.Fatal("v5 sheet detected as deathborne")
	}
	if IsDeathborne(map[string]any{}) {
		t.Fatal("sheet without game detected as deathborne")
	}
	if !IsDeathborne(map[string]any{"game": Gameline}) {
		t.Fatal("deathborne sheet not detected")
	}
}

type mongoLikeMap map[string]any

type mongoLikeSlice []any

func TestSheetFromDataAcceptsNamedMapAndSliceTypes(t *testing.T) {
	data := map[string]any{
		"game":        Gameline,
		"attributes":  mongoLikeMap{"kraft": int32(3), "geschick": int64(2)},
		"humanTraits": mongoLikeMap{"atem": 3.0},
		"arts":        mongoLikeSlice{mongoLikeMap{"key": "veil", "depth": 2, "affinity": true}},
		"damage":      mongoLikeSlice{"wound", ""},
		"levelHistory": mongoLikeSlice{
			mongoLikeMap{"type": "db_art", "exp": mongoLikeMap{"used": 5, "before": 10, "after": 5}},
		},
	}
	sheet := SheetFromData(data)
	if len(sheet.Attributes) != 2 {
		t.Fatalf("want 2 attributes from a named map type, got %d", len(sheet.Attributes))
	}
	if sheet.Attributes[1].Key != "kraft" || sheet.Attributes[1].Value != 3 {
		t.Fatalf("unexpected attribute mapping: %+v", sheet.Attributes)
	}
	if len(sheet.HumanTraits) != 1 || sheet.HumanTraits[0].Value != 3 {
		t.Fatalf("float values must map to ints: %+v", sheet.HumanTraits)
	}
	if len(sheet.Arts) != 1 || sheet.Arts[0].Key != "veil" || sheet.Arts[0].Depth != 2 || !sheet.Arts[0].Affinity {
		t.Fatalf("unexpected art mapping: %+v", sheet.Arts)
	}
	if len(sheet.Damage) != 1 || sheet.Damage[0].Kind != "wound" {
		t.Fatalf("unexpected damage mapping: %+v", sheet.Damage)
	}
	if len(sheet.LevelHistory) != 1 || sheet.LevelHistory[0].ExpUsed != 5 {
		t.Fatalf("unexpected level history mapping: %+v", sheet.LevelHistory)
	}
}
