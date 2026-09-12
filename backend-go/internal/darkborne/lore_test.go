package darkborne

import (
	"strings"
	"testing"
)

func TestFirstsCoverEveryHouse(t *testing.T) {
	c := content(t)
	if len(c.Firsts) != 9 {
		t.Fatalf("want 9 firsts, got %d", len(c.Firsts))
	}
	houses := map[string]bool{}
	for _, house := range c.Houses {
		houses[house.Key] = true
	}
	seen := map[string]bool{}
	keys := map[string]bool{}
	for _, first := range c.Firsts {
		if keys[first.Key] {
			t.Fatalf("duplicate first %q", first.Key)
		}
		keys[first.Key] = true
		if first.Name == "" || first.Title == "" || first.Description == "" {
			t.Fatalf("first %q is incomplete", first.Key)
		}
		if first.Role == "" || first.Motivation == "" || first.Ideal == "" {
			t.Fatalf("first %q is missing role, motivation or ideal", first.Key)
		}
		if first.UrScar == "" || first.CruorTrait == "" {
			t.Fatalf("first %q is missing its cruor trait or ur scar", first.Key)
		}
		if first.Fate == "" {
			t.Fatalf("first %q has no fate", first.Key)
		}
		if !houses[first.HouseKey] {
			t.Fatalf("first %q references unknown house %q", first.Key, first.HouseKey)
		}
		if seen[first.HouseKey] {
			t.Fatalf("house %q is claimed by two firsts", first.HouseKey)
		}
		seen[first.HouseKey] = true
	}
	if len(seen) != len(c.Houses) {
		t.Fatalf("firsts cover %d of %d houses", len(seen), len(c.Houses))
	}
	for _, house := range c.Houses {
		first := c.FirstOfHouse(house.Key)
		if first == nil {
			t.Fatalf("no first for house %q", house.Key)
		}
		if !strings.Contains(house.OriginName, strings.Split(first.Name, " ")[0]) {
			t.Fatalf("house %q names origin %q but its first is %q", house.Key, house.OriginName, first.Name)
		}
	}
}

func TestCovenantIsComplete(t *testing.T) {
	c := content(t)
	if c.Covenant.Title == "" || c.Covenant.Preamble == "" || c.Covenant.Oath == "" {
		t.Fatal("covenant is missing title, preamble or oath")
	}
	if len(c.Covenant.Articles) != 15 {
		t.Fatalf("want 15 covenant articles, got %d", len(c.Covenant.Articles))
	}
	keys := map[string]bool{}
	for i, article := range c.Covenant.Articles {
		if article.Number != i+1 {
			t.Fatalf("article %d carries number %d", i+1, article.Number)
		}
		if keys[article.Key] {
			t.Fatalf("duplicate article key %q", article.Key)
		}
		keys[article.Key] = true
		if article.Title == "" || article.Body == "" {
			t.Fatalf("article %d is incomplete", article.Number)
		}
		if len(article.Body) < 80 {
			t.Fatalf("article %d looks truncated: %q", article.Number, article.Body)
		}
	}
}

func TestCourtLoreIsPresent(t *testing.T) {
	c := content(t)
	if len(c.CourtTypes) != 5 {
		t.Fatalf("want 5 court types, got %d", len(c.CourtTypes))
	}
	if len(c.CourtMandates) != 5 {
		t.Fatalf("want 5 mandates, got %d", len(c.CourtMandates))
	}
	if len(c.CourtStructs) < 8 {
		t.Fatalf("want at least 8 court structures, got %d", len(c.CourtStructs))
	}
	for _, entry := range c.CourtTypes {
		if entry.Name == "" || entry.Description == "" {
			t.Fatalf("court type %q is incomplete", entry.Key)
		}
	}
	for _, entry := range c.CourtMandates {
		if entry.Name == "" || entry.Description == "" {
			t.Fatalf("mandate %q is incomplete", entry.Key)
		}
	}
	for _, entry := range c.CourtStructs {
		if entry.Name == "" || entry.Description == "" {
			t.Fatalf("court structure %q is incomplete", entry.Key)
		}
	}
}

func TestArtBoundariesReferenceKnownArts(t *testing.T) {
	c := content(t)
	if len(c.ArtBoundaries) < 8 {
		t.Fatalf("want at least 8 boundary rows, got %d", len(c.ArtBoundaries))
	}
	pairs := map[string]bool{}
	for _, pair := range c.ArtPairs {
		pairs[pair.Key] = true
	}
	for _, row := range c.ArtBoundaries {
		if c.Art(row.ArtA) == nil || c.Art(row.ArtB) == nil {
			t.Fatalf("boundary %q references unknown arts %q and %q", row.Situation, row.ArtA, row.ArtB)
		}
		if row.Situation == "" || row.TextA == "" || row.TextB == "" {
			t.Fatalf("boundary %q is incomplete", row.Situation)
		}
		if row.PairKey == "" {
			t.Fatalf("boundary %q has no pair key", row.Situation)
		}
	}
}

func TestHouseRelationsReferenceKnownHouses(t *testing.T) {
	c := content(t)
	if len(c.HouseRelations) < 5 {
		t.Fatalf("want at least 5 house relations, got %d", len(c.HouseRelations))
	}
	for _, relation := range c.HouseRelations {
		if c.House(relation.HouseA) == nil {
			t.Fatalf("relation %q references unknown house %q", relation.Key, relation.HouseA)
		}
		if relation.HouseB != "" && c.House(relation.HouseB) == nil {
			t.Fatalf("relation %q references unknown house %q", relation.Key, relation.HouseB)
		}
		if relation.Description == "" {
			t.Fatalf("relation %q has no description", relation.Key)
		}
	}
}

func TestLexiconSectionsKeepAuthoringOrder(t *testing.T) {
	c := content(t)
	order := map[string]int{}
	sequence := []string{}
	for _, entry := range c.Lexicon {
		if _, ok := order[entry.Section]; !ok {
			order[entry.Section] = entry.SectionPosition
			sequence = append(sequence, entry.Section)
		}
		if order[entry.Section] != entry.SectionPosition {
			t.Fatalf("entry %q carries section position %d, expected %d", entry.Key, entry.SectionPosition, order[entry.Section])
		}
	}
	last := -1
	for _, section := range sequence {
		if order[section] <= last {
			t.Fatalf("section %q breaks the ascending section order", section)
		}
		last = order[section]
	}
	if _, ok := order["Welt"]; !ok {
		t.Fatal("the lexicon has no Welt section")
	}
}
