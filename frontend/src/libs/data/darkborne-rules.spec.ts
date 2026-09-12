import {readFileSync} from 'node:fs'
import {dirname, join} from 'node:path'
import {fileURLToPath} from 'node:url'
import {beforeAll, describe, expect, it} from 'vitest'
import {DarkborneData, type IDarkborneContent} from '@/libs/data/darkborne-data'
import {
  DB_MAX_HUNGER,
  DbCruorState,
  dbAnathemaFor,
  dbArtCost,
  dbArtDepth,
  dbAttributeCost,
  dbBloodDice,
  dbBloodStrengthCost,
  dbCanTakeRoutine,
  dbCruorMax,
  dbCruorState,
  dbCruorValue,
  dbFormCost,
  dbFormSlots,
  dbHasInheritance,
  dbHealth,
  dbHumanTraitCap,
  dbIsAdrift,
  dbIsDehumanized,
  dbLearnStepsLeft,
  dbMaxDepth,
  dbPassingDifficulty,
  dbShiftAnathemaLevel,
  dbSetCruorValue,
  dbSkillCost,
  dbTension,
  dbUpkeep,
} from '@/libs/data/darkborne-rules'
import {
  DbAnathemaSource,
  DbAnchorKind,
  DbAnchorState,
  DbAttribute,
  DbFormKind,
  DbHumanTrait,
  NewDbSheet,
  type IDbSheet,
} from '@/@types/deathborne'

const dataDir = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../../../backend-go/internal/darkborne/data',
)

function loadJson<T>(name: string): T {
  return JSON.parse(readFileSync(join(dataDir, name), 'utf8')) as T
}

function buildContent(): IDarkborneContent {
  const arts = loadJson<IDarkborneContent['arts']>('arts.json')
  for (const art of arts) {
    for (const form of art.forms) {
      form.artKey = art.key
    }
  }
  return {
    revision: 'test',
    attributes: loadJson('attributes.json'),
    skills: loadJson('skills.json'),
    arts,
    artPairs: loadJson('art-pairs.json'),
    houses: loadJson('houses.json'),
    influences: loadJson('influences.json'),
    anathemaLevels: loadJson('anathema-levels.json'),
    depths: loadJson('depths.json'),
    increases: loadJson('increases.json'),
    bloodStrength: loadJson('blood-strength.json'),
    startAges: loadJson('start-ages.json'),
    humanTraits: loadJson('human-traits.json'),
    effects: loadJson('effects.json'),
    hunt: loadJson('hunt.json'),
    backgrounds: loadJson('backgrounds.json'),
    court: loadJson('court.json'),
    orders: loadJson('orders.json'),
    xpCosts: loadJson('xp-costs.json'),
    firsts: loadJson('firsts.json'),
    covenant: loadJson('covenant.json'),
    courtTypes: loadJson('court-types.json'),
    courtMandates: loadJson('court-mandates.json'),
    courtStructures: loadJson('court-structures.json'),
    artBoundaries: loadJson('art-boundaries.json'),
    houseRelations: loadJson('house-relations.json'),
    lexicon: loadJson('lexicon.json'),
  }
}

function sheet(overrides: Partial<IDbSheet> = {}): IDbSheet {
  return {...NewDbSheet(), ...overrides}
}

describe('Darkborne-Inhalte', () => {
  beforeAll(() => {
    DarkborneData.hydrate(buildContent())
  })

  it('stellt alle Künste, Häuser und Tabellen bereit', () => {
    expect(DarkborneData.content.arts).toHaveLength(15)
    expect(DarkborneData.content.houses).toHaveLength(9)
    expect(DarkborneData.content.bloodStrength).toHaveLength(10)
    expect(DarkborneData.content.startAges).toHaveLength(3)
    expect(DarkborneData.content.humanTraits).toHaveLength(6)
  })

  it('findet Künste, Formen und Gegenkünste', () => {
    expect(DarkborneData.art('veil')?.shortName).toBe('Schleier')
    expect(DarkborneData.counterOf('veil')?.key).toBe('revelation')
    expect(DarkborneData.counterOf('blood')).toBeUndefined()
    expect(DarkborneData.formsOf('veil')).toHaveLength(2)
    expect(DarkborneData.formsOf('veil', 1)).toHaveLength(1)
    expect(DarkborneData.pairOf('spirit')?.key).toBe('flesh_spirit')
  })

  it('liefert Menschenzug-Beschreibungen pro Stufe', () => {
    expect(DarkborneData.humanTraitLevel(DbHumanTrait.Atem, 3)).toContain('unbewusst')
    expect(DarkborneData.humanTraitLevel(DbHumanTrait.Atem, 0)).not.toBe('')
  })

  it('verknüpft die Neun Ersten mit ihren Häusern', () => {
    const content = DarkborneData.content
    expect(content.firsts).toHaveLength(9)
    for (const house of content.houses) {
      const first = DarkborneData.firstOfHouse(house.key)
      expect(first, `kein Erster für ${house.key}`).toBeDefined()
      expect(house.originName).toContain(first!.name.split(' ')[0]!)
    }
  })

  it('liefert den Bund mit allen Artikeln', () => {
    const covenant = DarkborneData.content.covenant
    expect(covenant.articles).toHaveLength(15)
    expect(covenant.preamble.length).toBeGreaterThan(100)
    expect(covenant.oath.length).toBeGreaterThan(100)
    expect(covenant.articles.map(a => a.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])
  })

  it('kennt die Grenze zwischen Fleisch und Bewegung', () => {
    const rows = DarkborneData.boundariesOf('flesh_motion')
    expect(rows.length).toBeGreaterThan(5)
    for (const row of rows) {
      expect(DarkborneData.art(row.artA)).toBeDefined()
      expect(DarkborneData.art(row.artB)).toBeDefined()
      expect(row.situation.length).toBeGreaterThan(0)
    }
  })

  it('findet die politischen Spannungen eines Hauses', () => {
    const relations = DarkborneData.relationsOfHouse('kaelor')
    expect(relations.length).toBeGreaterThan(1)
    for (const relation of relations) {
      expect(relation.description.length).toBeGreaterThan(10)
    }
  })

  it('sortiert die Lexikon-Abschnitte in Lesereihenfolge', () => {
    const sections = DarkborneData.lexiconSections()
    expect(sections[0]!.section).toBe('Grundregeln')
    const positions = sections.map(s => s.entries[0]!.sectionPosition)
    expect([...positions].sort((a, b) => a - b)).toEqual(positions)
    expect(sections.map(s => s.section)).toContain('Welt')
  })

  it('gruppiert das Lexikon in Abschnitte', () => {
    const sections = DarkborneData.lexiconSections()
    expect(sections.length).toBeGreaterThan(4)
    for (const section of sections) {
      const positions = section.entries.map(e => e.position)
      expect([...positions].sort((a, b) => a - b)).toEqual(positions)
    }
  })
})

describe('Abgeleitete Werte', () => {
  beforeAll(() => {
    DarkborneData.hydrate(buildContent())
  })

  it('leitet Vorrat, Unterhalt und höchste Tiefe aus der Blutstärke ab', () => {
    expect(dbCruorMax(sheet({bloodStrength: 1}))).toBe(6)
    expect(dbCruorMax(sheet({bloodStrength: 5}))).toBe(10)
    expect(dbUpkeep(sheet({bloodStrength: 1}))).toBe(1)
    expect(dbUpkeep(sheet({bloodStrength: 3}))).toBe(2)
    expect(dbMaxDepth(1)).toBe(2)
    expect(dbMaxDepth(5)).toBe(5)
    expect(dbMaxDepth(99)).toBe(0)
  })

  it('bestimmt den Füllstand', () => {
    expect(dbCruorState(sheet({bloodStrength: 2, cruor: 7}))).toBe(DbCruorState.Sated)
    expect(dbCruorState(sheet({bloodStrength: 2, cruor: 2}))).toBe(DbCruorState.Cool)
    expect(dbCruorState(sheet({bloodStrength: 2, cruor: 0}))).toBe(DbCruorState.Empty)
    expect(dbCruorState(sheet({bloodStrength: 2, cruor: 0, hunger: 2}))).toBe(DbCruorState.Hungry)
  })

  it('führt Cruor und Hunger als einen Zähler', () => {
    const s = sheet({bloodStrength: 2, cruor: 7, hunger: 0})
    expect(dbCruorValue(s)).toBe(7)

    dbSetCruorValue(s, 0)
    expect(s.cruor).toBe(0)
    expect(s.hunger).toBe(0)
    expect(dbCruorValue(s)).toBe(0)

    dbSetCruorValue(s, -3)
    expect(s.cruor).toBe(0)
    expect(s.hunger).toBe(3)
    expect(dbCruorValue(s)).toBe(-3)
    expect(dbCruorState(s)).toBe(DbCruorState.Hungry)

    dbSetCruorValue(s, 2)
    expect(s.hunger).toBe(0)
    expect(s.cruor).toBe(2)

    dbSetCruorValue(s, 99)
    expect(s.cruor).toBe(dbCruorMax(s))

    dbSetCruorValue(s, -99)
    expect(s.hunger).toBe(DB_MAX_HUNGER)
    expect(dbCruorValue(s)).toBe(-DB_MAX_HUNGER)
  })

  it('verbietet Routine bei Hunger', () => {
    expect(dbCanTakeRoutine(sheet())).toBe(true)
    expect(dbCanTakeRoutine(sheet({hunger: 1}))).toBe(false)
  })

  it('berechnet die Gesundheit aus Kraft', () => {
    const s = sheet()
    s.attributes[DbAttribute.Kraft] = 3
    expect(dbHealth(s)).toBe(8)
  })

  it('nimmt die niedrigere Tiefe als Spannung', () => {
    const s = sheet({
      arts: [
        {key: 'flesh', depth: 4, affinity: false},
        {key: 'spirit', depth: 1, affinity: false},
        {key: 'veil', depth: 3, affinity: false},
      ],
    })
    const tension = dbTension(s)
    expect(tension).toHaveLength(1)
    expect(tension[0]!.key).toBe('flesh_spirit')
    expect(tension[0]!.tension).toBe(1)
    expect(dbArtDepth(s, 'veil')).toBe(3)
    expect(dbArtDepth(s, 'memory')).toBe(0)
  })

  it('zählt Blutwürfel aus Hunger, Spannung und der Kunst des Blutes', () => {
    const s = sheet({
      hunger: 2,
      arts: [
        {key: 'flesh', depth: 3, affinity: false},
        {key: 'spirit', depth: 3, affinity: false},
        {key: 'blood', depth: 5, affinity: false},
      ],
    })
    expect(dbBloodDice(s)).toBe(2)
    expect(dbBloodDice(s, 'flesh', 2)).toBe(5)
    expect(dbBloodDice(s, 'veil', 2)).toBe(2)
    expect(dbBloodDice(s, 'blood', 5)).toBe(5)
    expect(dbBloodDice(s, 'blood', 2)).toBe(2)
    expect(dbBloodDice(sheet({hunger: 9}))).toBe(DB_MAX_HUNGER)
  })

  it('kostet Formen nach Art und Stufe', () => {
    expect(dbFormCost(DbFormKind.Established, 3)).toBe(1)
    expect(dbFormCost(DbFormKind.Own, 1)).toBe(1)
    expect(dbFormCost(DbFormKind.Own, 3)).toBe(2)
  })

  it('mischt Grundprofil, Blutlinie und persönliche Anathema', () => {
    const s = sheet({
      bloodline: 'kharven',
      bloodStrength: 1,
      anathema: [{influence: 'garlic', level: 'low', source: DbAnathemaSource.Personal, note: ''}],
    })
    const merged = dbAnathemaFor(s)
    const byKey = new Map(merged.map(entry => [entry.influence, entry]))
    expect(byKey.get('sunlight')?.level).toBe('extreme')
    expect(byKey.get('sunlight')?.source).toBe(DbAnathemaSource.Inherited)
    expect(byKey.get('fire')?.level).toBe('strong')
    expect(byKey.get('garlic')?.source).toBe(DbAnathemaSource.Personal)
    expect(byKey.has('salt')).toBe(false)
  })

  it('verschärft Anathema mit wachsender Blutstärke', () => {
    const low = dbAnathemaFor(sheet({bloodline: 'imreth', bloodStrength: 1}))
    const high = dbAnathemaFor(sheet({bloodline: 'imreth', bloodStrength: 5}))
    expect(low.find(e => e.influence === 'salt')?.level).toBe('moderate')
    expect(high.find(e => e.influence === 'salt')?.level).toBe('strong')
    expect(low.find(e => e.influence === 'sunlight')?.level).toBe('strong')
    expect(high.find(e => e.influence === 'sunlight')?.level).toBe('extreme')
  })

  it('verschiebt Anathema-Stufen in beide Richtungen und stoppt an den Rändern', () => {
    expect(dbShiftAnathemaLevel('strong', 1)).toBe('extreme')
    expect(dbShiftAnathemaLevel('strong', -1)).toBe('moderate')
    expect(dbShiftAnathemaLevel('extreme', 1)).toBe('extreme')
    expect(dbShiftAnathemaLevel('none', -1)).toBe('none')
  })

  it('begrenzt Menschenzüge über die Blutstärke', () => {
    expect(dbHumanTraitCap(sheet({bloodStrength: 2}), DbHumanTrait.Essen)).toBe(3)
    expect(dbHumanTraitCap(sheet({bloodStrength: 4}), DbHumanTrait.Essen)).toBe(1)
    expect(dbHumanTraitCap(sheet({bloodStrength: 4}), DbHumanTrait.Atem)).toBe(3)
    expect(dbHumanTraitCap(sheet({bloodStrength: 9}), DbHumanTrait.Atem)).toBe(1)
  })

  it('erhöht die Schwierigkeit beim Durchgehen als Mensch', () => {
    const s = sheet()
    s.humanTraits[DbHumanTrait.Waerme] = 2
    s.humanTraits[DbHumanTrait.Herzschlag] = 0
    expect(dbPassingDifficulty(s, [DbHumanTrait.Atem])).toBe(2)
    expect(dbPassingDifficulty(s, [DbHumanTrait.Waerme])).toBe(3)
    expect(dbPassingDifficulty(s, [DbHumanTrait.Waerme, DbHumanTrait.Herzschlag])).toBe(6)
  })

  it('erkennt Entmenschung und Treiben', () => {
    const anchored = sheet({
      anchors: [
        {slot: 0, kind: DbAnchorKind.Human, label: 'Meine Schwester', state: DbAnchorState.Firm, forced: false},
        {slot: 1, kind: DbAnchorKind.Night, label: 'Mein Amt', state: DbAnchorState.Firm, forced: false},
      ],
    })
    expect(dbIsDehumanized(anchored)).toBe(false)
    expect(dbIsAdrift(anchored)).toBe(false)

    const nightOnly = sheet({
      anchors: [{slot: 0, kind: DbAnchorKind.Night, label: 'Mein Court', state: DbAnchorState.Firm, forced: false}],
    })
    expect(dbIsDehumanized(nightOnly)).toBe(true)
    expect(dbIsAdrift(nightOnly)).toBe(false)

    const empty = sheet({
      anchors: [{slot: 0, kind: DbAnchorKind.Human, label: '  ', state: DbAnchorState.Firm, forced: false}],
    })
    expect(dbIsAdrift(empty)).toBe(true)
  })
})

describe('Erschaffung und Erfahrung', () => {
  beforeAll(() => {
    DarkborneData.hydrate(buildContent())
  })

  it('zählt die Lernschritte des Startalters', () => {
    const s = sheet({startAge: 'fresh'})
    expect(dbLearnStepsLeft(s)).toBe(3)
    s.arts = [{key: 'veil', depth: 2, affinity: false}]
    expect(dbLearnStepsLeft(s)).toBe(1)
    expect(dbFormSlots(s)).toBe(3)
  })

  it('prüft das Erbe des Sires', () => {
    const s = sheet({
      sireArt: 'revelation',
      arts: [
        {key: 'revelation', depth: 2, affinity: true},
        {key: 'veil', depth: 1, affinity: false},
      ],
    })
    expect(dbHasInheritance(s)).toBe(true)

    s.arts = [
      {key: 'revelation', depth: 1, affinity: true},
      {key: 'veil', depth: 2, affinity: false},
    ]
    expect(dbHasInheritance(s)).toBe(false)

    expect(dbHasInheritance(sheet())).toBe(false)
  })

  it('verweigert das Erbe bei Gleichstand an der Spitze', () => {
    const tied = sheet({
      sireArt: 'revelation',
      arts: [
        {key: 'revelation', depth: 1, affinity: false},
        {key: 'veil', depth: 1, affinity: false},
        {key: 'motion', depth: 1, affinity: false},
      ],
    })
    expect(dbHasInheritance(tied)).toBe(false)

    const alone = sheet({
      sireArt: 'revelation',
      arts: [
        {key: 'revelation', depth: 2, affinity: false},
        {key: 'veil', depth: 1, affinity: false},
        {key: 'motion', depth: 1, affinity: false},
      ],
    })
    expect(dbHasInheritance(alone)).toBe(true)

    const notLearned = sheet({
      sireArt: 'memory',
      arts: [
        {key: 'memory', depth: 0, affinity: false},
        {key: 'veil', depth: 1, affinity: false},
      ],
    })
    expect(dbHasInheritance(notLearned)).toBe(false)
  })

  it('rechnet XP-Kosten nach den Tabellen', () => {
    expect(dbAttributeCost(3)).toBe(15)
    expect(dbSkillCost(4)).toBe(12)
    expect(dbArtCost(3, true)).toBe(15)
    expect(dbArtCost(3, false)).toBe(21)
    expect(dbBloodStrengthCost(3, 9)).toBe(39)
  })
})
