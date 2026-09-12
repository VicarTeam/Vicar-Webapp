package darkborne

import "testing"

func TestBloodStrengthDerivedValues(t *testing.T) {
	c := content(t)
	cases := []struct {
		level, depth, reserve, upkeep int
	}{
		{1, 2, 6, 1},
		{2, 3, 7, 1},
		{3, 4, 8, 2},
		{5, 5, 10, 3},
	}
	for _, tc := range cases {
		if got := c.MaxDepthFor(tc.level); got != tc.depth {
			t.Fatalf("blood strength %d: max depth %d, want %d", tc.level, got, tc.depth)
		}
		if got := c.ReserveFor(tc.level); got != tc.reserve {
			t.Fatalf("blood strength %d: reserve %d, want %d", tc.level, got, tc.reserve)
		}
		if got := c.UpkeepFor(tc.level); got != tc.upkeep {
			t.Fatalf("blood strength %d: upkeep %d, want %d", tc.level, got, tc.upkeep)
		}
	}
	if c.MaxDepthFor(99) != 0 {
		t.Fatal("unknown blood strength must yield 0")
	}
	for _, row := range c.BloodStrength {
		if row.Level >= 6 && row.FreeIncreases != row.Level-5 {
			t.Fatalf("blood strength %d: free increases %d, want %d", row.Level, row.FreeIncreases, row.Level-5)
		}
	}
}

func TestTensionUsesLowerDepth(t *testing.T) {
	c := content(t)
	sheet := &Sheet{Arts: []CharacterArt{
		{Key: "flesh", Depth: 4},
		{Key: "spirit", Depth: 1},
		{Key: "veil", Depth: 3},
	}}
	tension := c.Tension(sheet)
	if got := tension["flesh_spirit"]; got != 1 {
		t.Fatalf("flesh 4 and spirit 1 give tension %d, want 1", got)
	}
	if _, ok := tension["veil_revelation"]; ok {
		t.Fatal("a single art of a pair must not create tension")
	}
}

func TestBloodDice(t *testing.T) {
	c := content(t)
	sheet := &Sheet{
		Hunger: 2,
		Arts: []CharacterArt{
			{Key: "flesh", Depth: 3},
			{Key: "spirit", Depth: 3},
			{Key: "blood", Depth: 5},
		},
	}
	if got := c.BloodDiceFor(sheet, "flesh", 2); got != 5 {
		t.Fatalf("hunger 2 plus tension 3 gives %d dice, want 5", got)
	}
	if got := c.BloodDiceFor(sheet, "veil", 2); got != 2 {
		t.Fatalf("art without tension gives %d dice, want 2", got)
	}
	if got := c.BloodDiceFor(sheet, "blood", 5); got != 5 {
		t.Fatalf("art of blood at level 5 gives %d dice, want 5", got)
	}
	if got := c.BloodDiceFor(sheet, "blood", 2); got != 2 {
		t.Fatalf("art of blood below level 3 gives %d dice, want 2", got)
	}
}

func TestAnathemaForMergesBaseAndBloodline(t *testing.T) {
	c := content(t)
	sheet := &Sheet{
		BloodlineKey: "kharven",
		Anathema: []CharacterAnathema{
			{InfluenceKey: "garlic", Level: "low", Source: "personal", Note: "seit dem Ritual"},
		},
	}
	entries := c.AnathemaFor(sheet)
	byKey := map[string]CharacterAnathema{}
	for _, entry := range entries {
		byKey[entry.InfluenceKey] = entry
	}
	if byKey["sunlight"].Level != "extreme" || byKey["sunlight"].Source != "inherited" {
		t.Fatalf("kharven sunlight should be inherited extreme, got %+v", byKey["sunlight"])
	}
	if byKey["fire"].Level != "strong" {
		t.Fatalf("fire should stay strong, got %+v", byKey["fire"])
	}
	if byKey["garlic"].Source != "personal" {
		t.Fatal("personal anathema missing")
	}
	if _, ok := byKey["salt"]; ok {
		t.Fatal("base profile must not add influences without a level")
	}
}

func TestShiftLevel(t *testing.T) {
	c := content(t)
	if got := c.ShiftLevel("strong", 1); got != "extreme" {
		t.Fatalf("strong shifted up is %q, want extreme", got)
	}
	if got := c.ShiftLevel("strong", -1); got != "moderate" {
		t.Fatalf("strong shifted down is %q, want moderate", got)
	}
	if got := c.ShiftLevel("extreme", 1); got != "extreme" {
		t.Fatalf("extreme cannot rise further, got %q", got)
	}
	if got := c.ShiftLevel("none", -1); got != "none" {
		t.Fatalf("none cannot fall further, got %q", got)
	}
}

func TestStartAgesMatchBloodStrengthTable(t *testing.T) {
	c := content(t)
	for _, age := range c.StartAges {
		if got := c.MaxDepthFor(age.BloodStrength); got != age.MaxDepth {
			t.Fatalf("start age %q: max depth %d, blood strength table says %d", age.Key, age.MaxDepth, got)
		}
		if age.HumanAnchors+age.NightAnchors != MaxAnchorSlots {
			t.Fatalf("start age %q has %d anchors, want %d", age.Key, age.HumanAnchors+age.NightAnchors, MaxAnchorSlots)
		}
		if age.LearnSteps < 1 {
			t.Fatalf("start age %q has no learn steps", age.Key)
		}
	}
}
