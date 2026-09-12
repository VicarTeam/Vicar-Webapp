package postgres

import (
	"context"
	"encoding/json"
	"os"
	"reflect"
	"testing"
	"time"

	"github.com/VicarTeam/vicar-backend/internal/darkborne"
	"go.mongodb.org/mongo-driver/bson"
)

func testStore(t *testing.T) *Store {
	t.Helper()
	url := os.Getenv("DARKBORNE_TEST_DB")
	if url == "" {
		t.Skip("DARKBORNE_TEST_DB is not set")
	}
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	store, err := Connect(ctx, url)
	if err != nil {
		t.Fatalf("connect: %v", err)
	}
	t.Cleanup(func() { _ = store.Close(context.Background()) })
	return store
}

func sheetFixture() bson.M {
	return bson.M{
		"game":          "db",
		"name":          "Mara Vess",
		"sire":          "Halvard Sarr",
		"formerLife":    "Rechtsmedizinerin",
		"death":         "Autounfall",
		"startAge":      "established",
		"bloodAge":      62,
		"bloodStrength": 2,
		"glied":         9,
		"house":         "sarrath",
		"bloodline":     "sarrath",
		"sireArt":       "revelation",
		"affinityArt":   "revelation",
		"court":         "Free Court of Cologne",
		"courtRank":     2,
		"order":         "the_continuance",
		"cruor":         5,
		"hunger":        1,
		"wille":         3,
		"willePool":     2,
		"health":        7,
		"attributes":    bson.M{"kraft": 2, "geschick": 3, "verstand": 3, "gespuer": 4, "praesenz": 2, "raffinesse": 3},
		"skills":        bson.M{"nachforschung": 3, "okkultes": 2, "athletik": 1},
		"humanTraits":   bson.M{"atem": 3, "waerme": 3, "herzschlag": 3, "essen": 2, "traeume": 3, "mimik": 2},
		"specializations": []any{
			bson.M{"skill": "nachforschung", "name": "Spurensicherung"},
		},
		"arts": []any{
			bson.M{"key": "revelation", "depth": 2, "affinity": true},
			bson.M{"key": "veil", "depth": 1, "affinity": false},
		},
		"forms": []any{
			bson.M{"art": "revelation", "key": "der_zweite_blick", "name": "Der Zweite Blick", "level": 1, "kind": "established", "effect": "Erkennt einen Vesper.", "limits": "Nur ja oder nein."},
		},
		"anchors": []any{
			bson.M{"slot": 0, "kind": "human", "label": "Meine Schwester Ida", "state": "firm", "forced": false},
			bson.M{"slot": 1, "kind": "night", "label": "Mein Amt am Hof", "state": "shaken", "forced": false},
		},
		"anathema": []any{
			bson.M{"influence": "sunlight", "level": "extreme", "source": "inherited", "note": "sensorisch"},
		},
		"backgrounds": []any{
			bson.M{"key": "kontakte", "level": 2, "note": "Presse und Polizei"},
		},
		"debts": []any{
			bson.M{"direction": "owing", "size": "schuld", "party": "Regentin", "note": "Schweigen"},
		},
		"damage": []any{"wound", "", "devastation", "", "", "", ""},
		"levelHistory": []any{
			bson.M{"type": "db_art", "date": "2026-09-12", "text": "Offenbarung auf 2", "exp": bson.M{"used": 10, "before": 22, "after": 12}},
		},
	}
}

func normalizeJSON(t *testing.T, v any) any {
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

func TestDarkborneContentIsSeeded(t *testing.T) {
	store := testStore(t)
	ctx := context.Background()

	embedded, err := darkborne.Embedded()
	if err != nil {
		t.Fatalf("embedded: %v", err)
	}
	revision, err := store.Darkborne().Revision(ctx)
	if err != nil {
		t.Fatalf("revision: %v", err)
	}
	if revision != embedded.Revision {
		t.Fatalf("revision %q does not match embedded %q", revision, embedded.Revision)
	}

	content, err := store.Darkborne().Content(ctx)
	if err != nil {
		t.Fatalf("content: %v", err)
	}
	if len(content.Arts) != len(embedded.Arts) {
		t.Fatalf("arts: got %d, want %d", len(content.Arts), len(embedded.Arts))
	}
	if len(content.Houses) != len(embedded.Houses) {
		t.Fatalf("houses: got %d, want %d", len(content.Houses), len(embedded.Houses))
	}
	if len(content.Lexicon) != len(embedded.Lexicon) {
		t.Fatalf("lexicon: got %d, want %d", len(content.Lexicon), len(embedded.Lexicon))
	}
	if !reflect.DeepEqual(normalizeJSON(t, embedded.Arts), normalizeJSON(t, content.Arts)) {
		t.Fatal("arts read back from postgres differ from the embedded content")
	}
	if !reflect.DeepEqual(normalizeJSON(t, embedded.Houses), normalizeJSON(t, content.Houses)) {
		t.Fatal("houses read back from postgres differ from the embedded content")
	}
	if !reflect.DeepEqual(normalizeJSON(t, embedded.BloodStrength), normalizeJSON(t, content.BloodStrength)) {
		t.Fatal("blood strength table read back from postgres differs")
	}
	if !reflect.DeepEqual(normalizeJSON(t, embedded.Firsts), normalizeJSON(t, content.Firsts)) {
		t.Fatal("the nine firsts read back from postgres differ")
	}
	if !reflect.DeepEqual(normalizeJSON(t, embedded.Covenant), normalizeJSON(t, content.Covenant)) {
		t.Fatal("the covenant read back from postgres differs")
	}
	if !reflect.DeepEqual(normalizeJSON(t, embedded.ArtBoundaries), normalizeJSON(t, content.ArtBoundaries)) {
		t.Fatal("the art boundaries read back from postgres differ")
	}
	if !reflect.DeepEqual(normalizeJSON(t, embedded.HouseRelations), normalizeJSON(t, content.HouseRelations)) {
		t.Fatal("the house relations read back from postgres differ")
	}
	if !reflect.DeepEqual(normalizeJSON(t, embedded.CourtTypes), normalizeJSON(t, content.CourtTypes)) {
		t.Fatal("the court types read back from postgres differ")
	}
	if !reflect.DeepEqual(normalizeJSON(t, embedded.CourtStructs), normalizeJSON(t, content.CourtStructs)) {
		t.Fatal("the court structures read back from postgres differ")
	}
	if !reflect.DeepEqual(normalizeJSON(t, embedded.Lexicon), normalizeJSON(t, content.Lexicon)) {
		t.Fatal("the lexicon read back from postgres differs")
	}
}

func TestDarkborneSeedIsIdempotent(t *testing.T) {
	store := testStore(t)
	ctx := context.Background()
	embedded, err := darkborne.Embedded()
	if err != nil {
		t.Fatalf("embedded: %v", err)
	}
	for i := 0; i < 3; i++ {
		if err := store.Darkborne().(*darkborneStore).Seed(ctx, embedded); err != nil {
			t.Fatalf("seed run %d: %v", i, err)
		}
	}
	var arts int
	if err := store.pool.QueryRow(ctx, `SELECT count(*) FROM dark_arts`).Scan(&arts); err != nil {
		t.Fatalf("count arts: %v", err)
	}
	if arts != len(embedded.Arts) {
		t.Fatalf("after reseeding there are %d arts, want %d", arts, len(embedded.Arts))
	}
}

func TestDeathborneSheetIsStoredRelationally(t *testing.T) {
	store := testStore(t)
	ctx := context.Background()
	data := sheetFixture()

	id, err := store.Characters().Create(ctx, "user-test", data)
	if err != nil {
		t.Fatalf("create: %v", err)
	}
	t.Cleanup(func() { _ = store.Characters().Delete(context.Background(), id) })

	var (
		bloodStrength int
		house         string
		sire          string
	)
	if err := store.pool.QueryRow(ctx, `SELECT blood_strength, house_key, sire FROM dark_characters WHERE character_id = $1`, id).
		Scan(&bloodStrength, &house, &sire); err != nil {
		t.Fatalf("read dark_characters: %v", err)
	}
	if bloodStrength != 2 || house != "sarrath" || sire != "Halvard Sarr" {
		t.Fatalf("unexpected core row: %d %q %q", bloodStrength, house, sire)
	}

	counts := map[string]int{
		"dark_character_attributes":    6,
		"dark_character_skills":        3,
		"dark_character_arts":          2,
		"dark_character_forms":         1,
		"dark_character_anchors":       2,
		"dark_character_human_traits":  6,
		"dark_character_anathema":      1,
		"dark_character_backgrounds":   1,
		"dark_character_debts":         1,
		"dark_character_damage":        2,
		"dark_character_level_history": 1,
	}
	for table, want := range counts {
		var got int
		if err := store.pool.QueryRow(ctx, "SELECT count(*) FROM "+table+" WHERE character_id = $1", id).Scan(&got); err != nil {
			t.Fatalf("count %s: %v", table, err)
		}
		if got != want {
			t.Fatalf("%s holds %d rows, want %d", table, got, want)
		}
	}

	loaded, err := store.Darkborne().LoadSheet(ctx, id)
	if err != nil {
		t.Fatalf("load sheet: %v", err)
	}
	expected := darkborne.SheetFromData(data).ToData()
	if !reflect.DeepEqual(normalizeJSON(t, expected), normalizeJSON(t, loaded)) {
		t.Fatalf("relational round trip changed the sheet\nwant: %v\ngot:  %v", normalizeJSON(t, expected), normalizeJSON(t, loaded))
	}
}

func TestDeathborneSheetUpdateReplacesRows(t *testing.T) {
	store := testStore(t)
	ctx := context.Background()
	data := sheetFixture()

	id, err := store.Characters().Create(ctx, "user-test", data)
	if err != nil {
		t.Fatalf("create: %v", err)
	}
	t.Cleanup(func() { _ = store.Characters().Delete(context.Background(), id) })

	data["arts"] = []any{bson.M{"key": "revelation", "depth": 3, "affinity": true}}
	data["hunger"] = 3
	data["damage"] = []any{"", "", "", "", "", "", ""}
	if err := store.Characters().ReplaceData(ctx, id, data); err != nil {
		t.Fatalf("replace: %v", err)
	}

	var (
		arts   int
		depth  int
		hunger int
		damage int
	)
	if err := store.pool.QueryRow(ctx, `SELECT count(*) FROM dark_character_arts WHERE character_id = $1`, id).Scan(&arts); err != nil {
		t.Fatalf("count arts: %v", err)
	}
	if err := store.pool.QueryRow(ctx, `SELECT depth FROM dark_character_arts WHERE character_id = $1 AND art_key = 'revelation'`, id).Scan(&depth); err != nil {
		t.Fatalf("read depth: %v", err)
	}
	if err := store.pool.QueryRow(ctx, `SELECT hunger FROM dark_characters WHERE character_id = $1`, id).Scan(&hunger); err != nil {
		t.Fatalf("read hunger: %v", err)
	}
	if err := store.pool.QueryRow(ctx, `SELECT count(*) FROM dark_character_damage WHERE character_id = $1`, id).Scan(&damage); err != nil {
		t.Fatalf("count damage: %v", err)
	}
	if arts != 1 || depth != 3 || hunger != 3 || damage != 0 {
		t.Fatalf("update left stale rows: arts=%d depth=%d hunger=%d damage=%d", arts, depth, hunger, damage)
	}
}

func TestDeleteCharacterCascadesToDarkborneTables(t *testing.T) {
	store := testStore(t)
	ctx := context.Background()

	id, err := store.Characters().Create(ctx, "user-test", sheetFixture())
	if err != nil {
		t.Fatalf("create: %v", err)
	}
	if err := store.Characters().Delete(ctx, id); err != nil {
		t.Fatalf("delete: %v", err)
	}
	for _, table := range []string{"dark_characters", "dark_character_attributes", "dark_character_arts"} {
		var count int
		if err := store.pool.QueryRow(ctx, "SELECT count(*) FROM "+table+" WHERE character_id = $1", id).Scan(&count); err != nil {
			t.Fatalf("count %s: %v", table, err)
		}
		if count != 0 {
			t.Fatalf("%s still holds %d rows after delete", table, count)
		}
	}
}

func TestNonDeathborneSheetStaysOutOfDarkborneTables(t *testing.T) {
	store := testStore(t)
	ctx := context.Background()

	id, err := store.Characters().Create(ctx, "user-test", bson.M{"game": "v5", "name": "Nicht Deathborne"})
	if err != nil {
		t.Fatalf("create: %v", err)
	}
	t.Cleanup(func() { _ = store.Characters().Delete(context.Background(), id) })

	var count int
	if err := store.pool.QueryRow(ctx, `SELECT count(*) FROM dark_characters WHERE character_id = $1`, id).Scan(&count); err != nil {
		t.Fatalf("count: %v", err)
	}
	if count != 0 {
		t.Fatal("a v5 sheet created rows in the darkborne tables")
	}
}

func TestDarkborneSeedIsSafeUnderConcurrency(t *testing.T) {
	store := testStore(t)
	ctx := context.Background()
	embedded, err := darkborne.Embedded()
	if err != nil {
		t.Fatalf("embedded: %v", err)
	}
	if _, err := store.pool.Exec(ctx, `DELETE FROM dark_content_meta WHERE key = $1`, darkborneRevisionKey); err != nil {
		t.Fatalf("reset revision: %v", err)
	}

	const workers = 4
	errs := make(chan error, workers)
	start := make(chan struct{})
	for i := 0; i < workers; i++ {
		go func() {
			<-start
			errs <- store.Darkborne().(*darkborneStore).Seed(ctx, embedded)
		}()
	}
	close(start)
	for i := 0; i < workers; i++ {
		if err := <-errs; err != nil {
			t.Fatalf("concurrent seed failed: %v", err)
		}
	}

	var arts, houses int
	if err := store.pool.QueryRow(ctx, `SELECT count(*) FROM dark_arts`).Scan(&arts); err != nil {
		t.Fatalf("count arts: %v", err)
	}
	if err := store.pool.QueryRow(ctx, `SELECT count(*) FROM dark_houses`).Scan(&houses); err != nil {
		t.Fatalf("count houses: %v", err)
	}
	if arts != len(embedded.Arts) || houses != len(embedded.Houses) {
		t.Fatalf("after concurrent seeding: %d arts and %d houses", arts, houses)
	}
	revision, err := store.Darkborne().Revision(ctx)
	if err != nil {
		t.Fatalf("revision: %v", err)
	}
	if revision != embedded.Revision {
		t.Fatalf("revision %q after concurrent seeding, want %q", revision, embedded.Revision)
	}
}

func TestCharacterSummaryCarriesDeathborneFields(t *testing.T) {
	store := testStore(t)
	ctx := context.Background()

	id, err := store.Characters().Create(ctx, "user-summary", sheetFixture())
	if err != nil {
		t.Fatalf("create: %v", err)
	}
	t.Cleanup(func() { _ = store.Characters().Delete(context.Background(), id) })

	summaries, err := store.Characters().OwnedSummaries(ctx, "user-summary")
	if err != nil {
		t.Fatalf("summaries: %v", err)
	}
	if len(summaries) != 1 {
		t.Fatalf("want 1 summary, got %d", len(summaries))
	}
	data := summaries[0].Data
	if data["bloodline"] != "sarrath" {
		t.Fatalf("summary carries bloodline %v", data["bloodline"])
	}
	if data["house"] != "sarrath" {
		t.Fatalf("summary carries house %v", data["house"])
	}
	if data["bloodStrength"] != int32(2) {
		t.Fatalf("summary carries blood strength %v (%T)", data["bloodStrength"], data["bloodStrength"])
	}
	if data["glied"] != int32(9) {
		t.Fatalf("summary carries glied %v (%T)", data["glied"], data["glied"])
	}
	if data["name"] != "Mara Vess" {
		t.Fatalf("summary lost the name: %v", data["name"])
	}
}

func TestCharacterSummaryStaysCleanForOtherGamelines(t *testing.T) {
	store := testStore(t)
	ctx := context.Background()

	id, err := store.Characters().Create(ctx, "user-v5-summary", bson.M{
		"game": "v5", "name": "Kein Vesper", "clan": bson.M{"name": "Brujah", "slogan": "Zeloten"},
	})
	if err != nil {
		t.Fatalf("create: %v", err)
	}
	t.Cleanup(func() { _ = store.Characters().Delete(context.Background(), id) })

	summaries, err := store.Characters().OwnedSummaries(ctx, "user-v5-summary")
	if err != nil {
		t.Fatalf("summaries: %v", err)
	}
	data := summaries[0].Data
	if _, ok := data["bloodline"]; ok {
		t.Fatal("a v5 summary must not carry darkborne fields")
	}
	if clan, ok := data["clan"].(bson.M); !ok || clan["name"] != "Brujah" {
		t.Fatalf("v5 summary lost its clan: %v", data["clan"])
	}
}
