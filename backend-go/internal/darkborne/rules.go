package darkborne

const (
	MaxHunger      = 5
	MaxAnchorSlots = 5
	MaxDepth       = 5
)

func (c *Content) bloodStrength(level int) *BloodStrengthLevel {
	for i := range c.BloodStrength {
		if c.BloodStrength[i].Level == level {
			return &c.BloodStrength[i]
		}
	}
	return nil
}

func (c *Content) MaxDepthFor(bloodStrength int) int {
	if row := c.bloodStrength(bloodStrength); row != nil {
		return row.MaxDepth
	}
	return 0
}

func (c *Content) ReserveFor(bloodStrength int) int {
	if row := c.bloodStrength(bloodStrength); row != nil {
		return row.Reserve
	}
	return 0
}

func (c *Content) UpkeepFor(bloodStrength int) int {
	if row := c.bloodStrength(bloodStrength); row != nil {
		return row.Upkeep
	}
	return 0
}

func (c *Content) FreeIncreasesFor(bloodStrength int) int {
	if row := c.bloodStrength(bloodStrength); row != nil {
		return row.FreeIncreases
	}
	return 0
}

func (c *Content) Art(key string) *Art {
	for i := range c.Arts {
		if c.Arts[i].Key == key {
			return &c.Arts[i]
		}
	}
	return nil
}

func (c *Content) House(key string) *House {
	for i := range c.Houses {
		if c.Houses[i].Key == key {
			return &c.Houses[i]
		}
	}
	return nil
}

func (c *Content) FirstOfHouse(houseKey string) *First {
	for i := range c.Firsts {
		if c.Firsts[i].HouseKey == houseKey {
			return &c.Firsts[i]
		}
	}
	return nil
}

func (c *Content) StartAge(key string) *StartAge {
	for i := range c.StartAges {
		if c.StartAges[i].Key == key {
			return &c.StartAges[i]
		}
	}
	return nil
}

func (s *Sheet) ArtDepth(key string) int {
	for _, a := range s.Arts {
		if a.Key == key {
			return a.Depth
		}
	}
	return 0
}

func (c *Content) Tension(s *Sheet) map[string]int {
	out := map[string]int{}
	for _, pair := range c.ArtPairs {
		a := s.ArtDepth(pair.ArtA)
		b := s.ArtDepth(pair.ArtB)
		if a == 0 || b == 0 {
			continue
		}
		if a < b {
			out[pair.Key] = a
		} else {
			out[pair.Key] = b
		}
	}
	return out
}

func (c *Content) BloodDiceFor(s *Sheet, artKey string, effectLevel int) int {
	dice := s.Hunger
	if dice > MaxHunger {
		dice = MaxHunger
	}
	for _, pair := range c.ArtPairs {
		if pair.ArtA != artKey && pair.ArtB != artKey {
			continue
		}
		a := s.ArtDepth(pair.ArtA)
		b := s.ArtDepth(pair.ArtB)
		if a == 0 || b == 0 {
			continue
		}
		if a < b {
			dice += a
		} else {
			dice += b
		}
	}
	if art := c.Art(artKey); art != nil && art.IsPrimal && effectLevel > 2 {
		dice += effectLevel - 2
	}
	return dice
}

func (c *Content) AnathemaFor(s *Sheet) []CharacterAnathema {
	byKey := map[string]CharacterAnathema{}
	order := []string{}
	add := func(entry CharacterAnathema) {
		if _, ok := byKey[entry.InfluenceKey]; !ok {
			order = append(order, entry.InfluenceKey)
		}
		byKey[entry.InfluenceKey] = entry
	}
	for _, inf := range c.Influences {
		if inf.BaseLevel == "" || inf.BaseLevel == "none" {
			continue
		}
		add(CharacterAnathema{InfluenceKey: inf.Key, Level: inf.BaseLevel, Source: "base", Note: inf.Note})
	}
	if house := c.House(s.BloodlineKey); house != nil {
		for _, entry := range house.Anathema {
			add(CharacterAnathema{
				InfluenceKey: entry.InfluenceKey, Level: entry.Level,
				Source: "inherited", Note: entry.Note,
			})
		}
	}
	for _, entry := range s.Anathema {
		if entry.Source == "personal" {
			add(entry)
		}
	}
	out := make([]CharacterAnathema, 0, len(order))
	for _, key := range order {
		out = append(out, byKey[key])
	}
	return out
}

func (c *Content) ShiftLevel(level string, steps int) string {
	idx := -1
	for i, l := range c.AnathemaLevels {
		if l.Level == level {
			idx = i
			break
		}
	}
	if idx < 0 {
		return level
	}
	target := c.AnathemaLevels[idx].Order + steps
	best := c.AnathemaLevels[idx]
	for _, l := range c.AnathemaLevels {
		if l.Order == target {
			return l.Level
		}
		if target > best.Order && l.Order > best.Order {
			best = l
		}
		if target < 0 && l.Order == 0 {
			best = l
		}
	}
	return best.Level
}
