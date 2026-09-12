package darkborne

import (
	"io/fs"
	"strings"
	"testing"
)

func content(t *testing.T) *Content {
	t.Helper()
	c, err := Embedded()
	if err != nil {
		t.Fatalf("load embedded content: %v", err)
	}
	return c
}

func TestEmbeddedContentLoads(t *testing.T) {
	c := content(t)
	if c.Revision == "" {
		t.Fatal("revision is empty")
	}
	if len(c.Attributes) != 7 {
		t.Fatalf("want 7 attributes, got %d", len(c.Attributes))
	}
	if len(c.Skills) != 15 {
		t.Fatalf("want 15 skills, got %d", len(c.Skills))
	}
	if len(c.Arts) != 15 {
		t.Fatalf("want 15 arts, got %d", len(c.Arts))
	}
	if len(c.ArtPairs) != 7 {
		t.Fatalf("want 7 art pairs, got %d", len(c.ArtPairs))
	}
	if len(c.Houses) != 9 {
		t.Fatalf("want 9 houses, got %d", len(c.Houses))
	}
	if len(c.BloodStrength) != 10 {
		t.Fatalf("want 10 blood strength rows, got %d", len(c.BloodStrength))
	}
	if len(c.StartAges) != 3 {
		t.Fatalf("want 3 start ages, got %d", len(c.StartAges))
	}
	if len(c.HumanTraits) != 6 {
		t.Fatalf("want 6 human traits, got %d", len(c.HumanTraits))
	}
	if len(c.AnathemaLevels) != 5 {
		t.Fatalf("want 5 anathema levels, got %d", len(c.AnathemaLevels))
	}
	if len(c.Depths) != 5 {
		t.Fatalf("want 5 depths, got %d", len(c.Depths))
	}
	if len(c.Backgrounds) != 5 {
		t.Fatalf("want 5 backgrounds, got %d", len(c.Backgrounds))
	}
}

func TestArtsAreConsistent(t *testing.T) {
	c := content(t)
	keys := map[string]bool{}
	attributes := map[string]bool{}
	for _, a := range c.Attributes {
		attributes[a.Key] = true
	}
	primals := 0
	forms := 0

	for _, art := range c.Arts {
		if keys[art.Key] {
			t.Fatalf("duplicate art key %q", art.Key)
		}
		keys[art.Key] = true
		if art.Name == "" || art.Principle == "" || art.ShortName == "" {
			t.Fatalf("art %q is missing name, short name or principle", art.Key)
		}
		if len(art.Levels) != 5 {
			t.Fatalf("art %q has %d levels, want 5", art.Key, len(art.Levels))
		}
		for i, level := range art.Levels {
			if level.Depth != i+1 {
				t.Fatalf("art %q level %d has depth %d", art.Key, i, level.Depth)
			}
			if len(level.Examples) == 0 {
				t.Fatalf("art %q depth %d has no examples", art.Key, level.Depth)
			}
		}
		if len(art.Forms) == 0 {
			t.Fatalf("art %q has no established forms", art.Key)
		}
		for _, form := range art.Forms {
			forms++
			if form.Level < 1 || form.Level > 3 {
				t.Fatalf("form %q has level %d, established forms stop at 3", form.Key, form.Level)
			}
			if form.ArtKey != art.Key {
				t.Fatalf("form %q points at art %q instead of %q", form.Key, form.ArtKey, art.Key)
			}
			if form.Effect == "" {
				t.Fatalf("form %q has no effect", form.Key)
			}
		}
		if art.IsPrimal {
			primals++
			if art.CounterKey != "" {
				t.Fatalf("primal art %q must not have a counter art", art.Key)
			}
		}
		if len(art.TypicalAttributes) == 0 {
			t.Fatalf("art %q has no typical attributes", art.Key)
		}
		for _, attr := range art.TypicalAttributes {
			if !attributes[attr] {
				t.Fatalf("art %q references unknown attribute %q", art.Key, attr)
			}
		}
	}
	if primals != 1 {
		t.Fatalf("want exactly one primal art, got %d", primals)
	}
	if forms != 30 {
		t.Fatalf("want 30 established forms, got %d", forms)
	}

	for _, art := range c.Arts {
		if art.CounterKey == "" {
			continue
		}
		counter := c.Art(art.CounterKey)
		if counter == nil {
			t.Fatalf("art %q references unknown counter art %q", art.Key, art.CounterKey)
		}
		if counter.CounterKey != art.Key {
			t.Fatalf("counter art of %q is %q, but its counter is %q", art.Key, counter.Key, counter.CounterKey)
		}
	}

	for _, pair := range c.ArtPairs {
		if c.Art(pair.ArtA) == nil || c.Art(pair.ArtB) == nil {
			t.Fatalf("pair %q references unknown arts", pair.Key)
		}
		if len(pair.Effects) == 0 {
			t.Fatalf("pair %q has no dissonance effects", pair.Key)
		}
		heavy := 0
		for _, effect := range pair.Effects {
			switch effect.Severity {
			case "light":
			case "heavy":
				heavy++
			default:
				t.Fatalf("pair %q effect %q has severity %q", pair.Key, effect.Name, effect.Severity)
			}
		}
		if heavy == 0 {
			t.Fatalf("pair %q has no heavy dissonance effect", pair.Key)
		}
	}
}

func TestHousesAreConsistent(t *testing.T) {
	c := content(t)
	influences := map[string]bool{}
	for _, inf := range c.Influences {
		influences[inf.Key] = true
	}
	levels := map[string]bool{}
	for _, level := range c.AnathemaLevels {
		levels[level.Level] = true
	}

	for _, house := range c.Houses {
		if house.Name == "" || house.Epithet == "" || house.Description == "" {
			t.Fatalf("house %q is incomplete", house.Key)
		}
		if house.Scar.Key == "" || house.Scar.Name == "" || house.Scar.PermanentEffect == "" {
			t.Fatalf("house %q has an incomplete blood scar", house.Key)
		}
		if len(house.Scar.Compulsions) == 0 {
			t.Fatalf("house %q scar has no compulsions", house.Key)
		}
		sun := false
		for _, entry := range house.Anathema {
			if !influences[entry.InfluenceKey] {
				t.Fatalf("house %q references unknown influence %q", house.Key, entry.InfluenceKey)
			}
			if !levels[entry.Level] {
				t.Fatalf("house %q references unknown anathema level %q", house.Key, entry.Level)
			}
			if entry.InfluenceKey == "sunlight" {
				sun = true
			}
		}
		if !sun {
			t.Fatalf("house %q has no sunlight entry", house.Key)
		}
	}
}

func TestHuntAndBackgroundsReferenceKnownKeys(t *testing.T) {
	c := content(t)
	attributes := map[string]bool{}
	for _, a := range c.Attributes {
		attributes[a.Key] = true
	}
	skills := map[string]bool{}
	for _, s := range c.Skills {
		skills[s.Key] = true
	}
	for _, method := range c.Hunt.Methods {
		if method.Attribute != "" && !attributes[method.Attribute] {
			t.Fatalf("hunt method %q references unknown attribute %q", method.Key, method.Attribute)
		}
		if method.Skill != "" && !skills[method.Skill] {
			t.Fatalf("hunt method %q references unknown skill %q", method.Key, method.Skill)
		}
	}
	if len(c.Hunt.Sources) == 0 {
		t.Fatal("no blood sources")
	}
	for _, bg := range c.Backgrounds {
		if len(bg.Levels) == 0 {
			t.Fatalf("background %q has no levels", bg.Key)
		}
	}
	for _, trait := range c.HumanTraits {
		if len(trait.Levels) != 4 {
			t.Fatalf("human trait %q has %d levels, want 4", trait.Key, len(trait.Levels))
		}
		for i, level := range trait.Levels {
			if level.Value != 3-i {
				t.Fatalf("human trait %q level %d has value %d", trait.Key, i, level.Value)
			}
			if level.Description == "" {
				t.Fatalf("human trait %q level %d has no description", trait.Key, level.Value)
			}
		}
	}
}

func TestContentUsesNoLongDashes(t *testing.T) {
	entries, err := fs.ReadDir(contentFS, "data")
	if err != nil {
		t.Fatalf("read data dir: %v", err)
	}
	for _, entry := range entries {
		raw, err := fs.ReadFile(contentFS, "data/"+entry.Name())
		if err != nil {
			t.Fatalf("read %s: %v", entry.Name(), err)
		}
		for _, dash := range []rune{0x2014, 0x2013, 0x2012, 0x2015, 0x2212} {
			if strings.ContainsRune(string(raw), dash) {
				t.Fatalf("%s contains the long dash %U", entry.Name(), dash)
			}
		}
	}
}

func TestLexiconIsConsistent(t *testing.T) {
	c := content(t)
	if len(c.Lexicon) < 40 {
		t.Fatalf("want at least 40 lexicon entries, got %d", len(c.Lexicon))
	}
	keys := map[string]LexiconEntry{}
	for _, entry := range c.Lexicon {
		if _, exists := keys[entry.Key]; exists {
			t.Fatalf("duplicate lexicon key %q", entry.Key)
		}
		if entry.Title == "" || entry.Body == "" || entry.Section == "" {
			t.Fatalf("lexicon entry %q is incomplete", entry.Key)
		}
		if len(entry.Tags) == 0 {
			t.Fatalf("lexicon entry %q has no tags", entry.Key)
		}
		keys[entry.Key] = entry
	}
	for _, entry := range c.Lexicon {
		if entry.ParentKey == "" {
			continue
		}
		parent, ok := keys[entry.ParentKey]
		if !ok {
			t.Fatalf("lexicon entry %q references unknown parent %q", entry.Key, entry.ParentKey)
		}
		if parent.Section != entry.Section {
			t.Fatalf("lexicon entry %q sits in a different section than its parent", entry.Key)
		}
		if parent.ParentKey != "" {
			t.Fatalf("lexicon entry %q nests below a child entry", entry.Key)
		}
	}
}
