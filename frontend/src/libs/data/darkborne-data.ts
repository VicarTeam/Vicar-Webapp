import {ref} from "vue";
import {get} from "@/libs/io/rest";

export interface IDarkAttribute {
  key: string;
  name: string;
  category: string;
  kind: string;
  description: string;
}

export interface IDarkSkill {
  key: string;
  name: string;
  category: string;
  description: string;
}

export interface IDarkArtLevel {
  depth: number;
  examples: string[];
}

export interface IDarkArtForm {
  key: string;
  artKey: string;
  name: string;
  level: number;
  difficulty: number;
  cost: number;
  effect: string;
  limits: string;
}

export interface IDarkArt {
  key: string;
  name: string;
  shortName: string;
  principle: string;
  summary: string;
  isPrimal: boolean;
  counterKey: string;
  typicalAttributes: string[];
  limits: string[];
  levels: IDarkArtLevel[];
  forms: IDarkArtForm[];
}

export interface IDarkArtPairEffect {
  name: string;
  effect: string;
  severity: string;
}

export interface IDarkArtPair {
  key: string;
  artA: string;
  artB: string;
  question: string;
  effects: IDarkArtPairEffect[];
}

export interface IDarkHouseAnathema {
  influenceKey: string;
  level: string;
  note: string;
}

export interface IDarkBloodScar {
  key: string;
  name: string;
  summary: string;
  triggers: string[];
  permanentEffect: string;
  compulsions: string[];
}

export interface IDarkHouse {
  key: string;
  name: string;
  epithet: string;
  originName: string;
  originTitle: string;
  idea: string;
  reputation: string;
  description: string;
  scar: IDarkBloodScar;
  anathema: IDarkHouseAnathema[];
}

export interface IDarkInfluence {
  key: string;
  name: string;
  kind: string;
  baseLevel: string;
  note: string;
}

export interface IDarkAnathemaLevel {
  level: string;
  name: string;
  physical: string;
  symbolic: string;
  order: number;
}

export interface IDarkDepth {
  depth: number;
  name: string;
  meaning: string;
  target: string;
  scale: string;
}

export interface IDarkIncrease {
  key: string;
  name: string;
  mundane: string;
  supernatural: string;
}

export interface IDarkBloodStrength {
  level: number;
  maxDepth: number;
  reserve: number;
  upkeep: number;
  freeIncreases: number;
  notes: string[];
}

export interface IDarkStartAge {
  key: string;
  name: string;
  bloodAge: string;
  bloodStrength: number;
  maxDepth: number;
  learnSteps: number;
  bonusXp: number;
  humanAnchors: number;
  nightAnchors: number;
  humanTraitReduction: number;
  burdens: string;
  alienation: boolean;
  description: string;
}

export interface IDarkHumanTraitLevel {
  value: number;
  description: string;
}

export interface IDarkHumanTrait {
  key: string;
  name: string;
  description: string;
  levels: IDarkHumanTraitLevel[];
}

export interface IDarkEffect {
  key: string;
  kind: string;
  name: string;
  effect: string;
  severity: string;
}

export interface IDarkHuntMethod {
  key: string;
  name: string;
  attribute: string;
  skill: string;
  difficulty: number;
  note: string;
}

export interface IDarkBloodSource {
  key: string;
  name: string;
  cruor: number;
  note: string;
}

export interface IDarkBackgroundLevel {
  level: number;
  description: string;
}

export interface IDarkBackground {
  key: string;
  name: string;
  description: string;
  levels: IDarkBackgroundLevel[];
}

export interface IDarkCourtRank {
  level: number;
  name: string;
  rights: string;
  bonus: number;
}

export interface IDarkCourtOffice {
  key: string;
  name: string;
  task: string;
  rule: string;
}

export interface IDarkDebtSize {
  key: string;
  name: string;
  description: string;
}

export interface IDarkJudgement {
  key: string;
  name: string;
  effect: string;
}

export interface IDarkAwarenessStage {
  key: string;
  name: string;
  boxes: string;
  covenant: string;
  consequence: string;
}

export interface IDarkOrder {
  key: string;
  name: string;
  motto: string;
  description: string;
}

export interface IDarkXpCost {
  key: string;
  name: string;
  formula: string;
  scope: string;
}

export interface IDarkFirst {
  key: string;
  name: string;
  title: string;
  houseKey: string;
  role: string;
  motivation: string;
  ideal: string;
  description: string;
  afterAwakening: string;
  humans: string;
  scions: string;
  cruorTrait: string;
  urScar: string;
  fate: string;
  fateDetail: string;
  question: string;
}

export interface IDarkCovenantArticle {
  key: string;
  number: number;
  name: string;
  title: string;
  body: string;
}

export interface IDarkCovenant {
  title: string;
  subtitle: string;
  preamble: string;
  articles: IDarkCovenantArticle[];
  oath: string;
}

export interface IDarkNamedEntry {
  key: string;
  name: string;
  description: string;
}

export interface IDarkArtBoundary {
  pairKey: string;
  situation: string;
  artA: string;
  artB: string;
  textA: string;
  textB: string;
}

export interface IDarkHouseRelation {
  key: string;
  houseA: string;
  houseB: string;
  description: string;
}

export interface IDarkLexiconEntry {
  key: string;
  gameline: string;
  section: string;
  sectionPosition: number;
  parentKey: string;
  title: string;
  body: string;
  tags: string[];
  position: number;
}

export interface IDarkborneContent {
  revision: string;
  attributes: IDarkAttribute[];
  skills: IDarkSkill[];
  arts: IDarkArt[];
  artPairs: IDarkArtPair[];
  houses: IDarkHouse[];
  influences: IDarkInfluence[];
  anathemaLevels: IDarkAnathemaLevel[];
  depths: IDarkDepth[];
  increases: IDarkIncrease[];
  bloodStrength: IDarkBloodStrength[];
  startAges: IDarkStartAge[];
  humanTraits: IDarkHumanTrait[];
  effects: { hunger: IDarkEffect[], instability: IDarkEffect[] };
  hunt: { methods: IDarkHuntMethod[], sources: IDarkBloodSource[], increases: { key: string, effect: string }[] };
  backgrounds: IDarkBackground[];
  court: {
    ranks: IDarkCourtRank[],
    offices: IDarkCourtOffice[],
    debts: IDarkDebtSize[],
    judgements: IDarkJudgement[],
    awareness: IDarkAwarenessStage[],
  };
  orders: IDarkOrder[];
  xpCosts: IDarkXpCost[];
  firsts: IDarkFirst[];
  covenant: IDarkCovenant;
  courtTypes: IDarkNamedEntry[];
  courtMandates: IDarkNamedEntry[];
  courtStructures: IDarkNamedEntry[];
  artBoundaries: IDarkArtBoundary[];
  houseRelations: IDarkHouseRelation[];
  lexicon: IDarkLexiconEntry[];
}

export const darkborneRevision = ref("");

const CONTENT_KEY = "__darkborne__";
const REVISION_KEY = "darkborne__revision";

export class DarkborneData {

  private static loaded: IDarkborneContent | null = null;
  private static pending: Promise<IDarkborneContent> | null = null;

  private static artIndex: Map<string, IDarkArt> = new Map();
  private static formIndex: Map<string, IDarkArtForm> = new Map();
  private static houseIndex: Map<string, IDarkHouse> = new Map();
  private static influenceIndex: Map<string, IDarkInfluence> = new Map();
  private static levelIndex: Map<string, IDarkAnathemaLevel> = new Map();
  private static startAgeIndex: Map<string, IDarkStartAge> = new Map();
  private static backgroundIndex: Map<string, IDarkBackground> = new Map();
  private static humanTraitIndex: Map<string, IDarkHumanTrait> = new Map();
  private static bloodStrengthIndex: Map<number, IDarkBloodStrength> = new Map();
  private static pairByArt: Map<string, IDarkArtPair> = new Map();
  private static firstByHouse: Map<string, IDarkFirst> = new Map();

  public static get isLoaded(): boolean {
    return darkborneRevision.value !== "" && this.loaded !== null;
  }

  public static get content(): IDarkborneContent {
    if (!this.loaded) {
      throw new Error("Darkborne-Daten sind noch nicht geladen");
    }
    return this.loaded;
  }

  public static hydrate(content: IDarkborneContent): IDarkborneContent {
    return this.apply(content);
  }

  public static async load(force: boolean = false): Promise<IDarkborneContent> {
    if (this.loaded && !force) {
      return this.loaded;
    }
    if (this.pending && !force) {
      return this.pending;
    }
    this.pending = this.resolve(force).finally(() => {
      this.pending = null;
    });
    return this.pending;
  }

  private static async resolve(force: boolean): Promise<IDarkborneContent> {
    const cached = this.readCache();
    if (!force && cached) {
      const revision = await this.fetchRevision();
      if (revision === null || revision === cached.revision) {
        return this.apply(cached);
      }
    }

    const fetched = await this.fetchContent();
    if (fetched) {
      this.writeCache(fetched);
      return this.apply(fetched);
    }
    if (cached) {
      return this.apply(cached);
    }
    throw new Error("Darkborne-Daten konnten nicht geladen werden");
  }

  private static async fetchRevision(): Promise<string | null> {
    try {
      const [status, body] = await get<{ revision: string }>("/darkborne/revision");
      return status === 200 ? body.revision : null;
    } catch {
      return null;
    }
  }

  private static async fetchContent(): Promise<IDarkborneContent | null> {
    try {
      const [status, body] = await get<IDarkborneContent>("/darkborne/content");
      return status === 200 ? body : null;
    } catch {
      return null;
    }
  }

  private static readCache(): IDarkborneContent | null {
    try {
      const raw = localStorage.getItem(CONTENT_KEY);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw) as IDarkborneContent;
      return parsed?.arts?.length ? parsed : null;
    } catch {
      return null;
    }
  }

  private static writeCache(content: IDarkborneContent) {
    try {
      localStorage.setItem(CONTENT_KEY, JSON.stringify(content));
      localStorage.setItem(REVISION_KEY, content.revision);
    } catch {
      localStorage.removeItem(CONTENT_KEY);
    }
  }

  private static apply(content: IDarkborneContent): IDarkborneContent {
    this.loaded = content;
    this.artIndex = new Map(content.arts.map(a => [a.key, a]));
    this.formIndex = new Map(content.arts.flatMap(a => a.forms.map(f => [f.key, {...f, artKey: f.artKey || a.key}] as [string, IDarkArtForm])));
    this.houseIndex = new Map(content.houses.map(h => [h.key, h]));
    this.influenceIndex = new Map(content.influences.map(i => [i.key, i]));
    this.levelIndex = new Map(content.anathemaLevels.map(l => [l.level, l]));
    this.startAgeIndex = new Map(content.startAges.map(a => [a.key, a]));
    this.backgroundIndex = new Map(content.backgrounds.map(b => [b.key, b]));
    this.humanTraitIndex = new Map(content.humanTraits.map(t => [t.key, t]));
    this.bloodStrengthIndex = new Map(content.bloodStrength.map(b => [b.level, b]));
    this.pairByArt = new Map();
    for (const pair of content.artPairs) {
      this.pairByArt.set(pair.artA, pair);
      this.pairByArt.set(pair.artB, pair);
    }
    this.firstByHouse = new Map((content.firsts ?? []).map(f => [f.houseKey, f]));
    darkborneRevision.value = content.revision || "geladen";
    return content;
  }

  public static art(key: string): IDarkArt | undefined {
    return this.artIndex.get(key);
  }

  public static artName(key: string): string {
    return this.artIndex.get(key)?.shortName ?? key;
  }

  public static form(key: string): IDarkArtForm | undefined {
    return this.formIndex.get(key);
  }

  public static formsOf(artKey: string, maxLevel: number = 3): IDarkArtForm[] {
    return this.artIndex.get(artKey)?.forms.filter(f => f.level <= maxLevel) ?? [];
  }

  public static house(key: string): IDarkHouse | undefined {
    return this.houseIndex.get(key);
  }

  public static influence(key: string): IDarkInfluence | undefined {
    return this.influenceIndex.get(key);
  }

  public static influenceName(key: string): string {
    return this.influenceIndex.get(key)?.name ?? key;
  }

  public static anathemaLevel(level: string): IDarkAnathemaLevel | undefined {
    return this.levelIndex.get(level);
  }

  public static anathemaLevelName(level: string): string {
    return this.levelIndex.get(level)?.name ?? level;
  }

  public static startAge(key: string): IDarkStartAge | undefined {
    return this.startAgeIndex.get(key);
  }

  public static background(key: string): IDarkBackground | undefined {
    return this.backgroundIndex.get(key);
  }

  public static humanTrait(key: string): IDarkHumanTrait | undefined {
    return this.humanTraitIndex.get(key);
  }

  public static humanTraitLevel(key: string, value: number): string {
    return this.humanTraitIndex.get(key)?.levels.find(l => l.value === value)?.description ?? "";
  }

  public static bloodStrength(level: number): IDarkBloodStrength | undefined {
    return this.bloodStrengthIndex.get(level);
  }

  public static pairOf(artKey: string): IDarkArtPair | undefined {
    return this.pairByArt.get(artKey);
  }

  public static counterOf(artKey: string): IDarkArt | undefined {
    const counter = this.artIndex.get(artKey)?.counterKey;
    return counter ? this.artIndex.get(counter) : undefined;
  }

  public static depth(depth: number): IDarkDepth | undefined {
    return this.loaded?.depths.find(d => d.depth === depth);
  }

  public static depthName(depth: number): string {
    return this.depth(depth)?.name ?? "";
  }

  public static courtRank(level: number): IDarkCourtRank | undefined {
    return this.loaded?.court.ranks.find(r => r.level === level);
  }

  public static office(key: string): IDarkCourtOffice | undefined {
    return this.loaded?.court.offices.find(o => o.key === key);
  }

  public static debtSize(key: string): IDarkDebtSize | undefined {
    return this.loaded?.court.debts.find(d => d.key === key);
  }

  public static order(key: string): IDarkOrder | undefined {
    return this.loaded?.orders.find(o => o.key === key);
  }

  public static first(key: string): IDarkFirst | undefined {
    return this.loaded?.firsts.find(f => f.key === key);
  }

  public static firstOfHouse(houseKey: string): IDarkFirst | undefined {
    return this.firstByHouse.get(houseKey);
  }

  public static boundariesOf(pairKey: string): IDarkArtBoundary[] {
    return (this.loaded?.artBoundaries ?? []).filter(b => b.pairKey === pairKey);
  }

  public static relationsOfHouse(houseKey: string): IDarkHouseRelation[] {
    return (this.loaded?.houseRelations ?? []).filter(r => r.houseA === houseKey || r.houseB === houseKey);
  }

  public static lexiconSections(): { section: string, entries: IDarkLexiconEntry[] }[] {
    const sections: { section: string, entries: IDarkLexiconEntry[] }[] = [];
    for (const entry of this.loaded?.lexicon ?? []) {
      let bucket = sections.find(s => s.section === entry.section);
      if (!bucket) {
        bucket = {section: entry.section, entries: []};
        sections.push(bucket);
      }
      bucket.entries.push(entry);
    }
    for (const bucket of sections) {
      bucket.entries.sort((a, b) => a.position - b.position);
    }
    sections.sort((a, b) => {
      const left = a.entries[0]?.sectionPosition ?? 0;
      const right = b.entries[0]?.sectionPosition ?? 0;
      return left - right;
    });
    return sections;
  }
}
