import {AvatarOrientation, GameLine, type IBaseSheet} from "@/@types/gameline";
import {DamageType, Sex} from "@/@types/models";

export type VdzRequestLevelFn = (type: 'attribute'|'ability'|'discipline'|'virtue'|'road'|'willpower'|'background', subject?: VdzAbility|VdzAttribute|string) => void;

export enum VdzAttributeCategory {
  Physical = 'physical',
  Social = 'social',
  Mental = 'mental',
}

export enum VdzAbilityCategory {
  Talents = 'talents',
  Skills = 'skills',
  Knowledges = 'knowledges',
}

export enum VdzAttribute {
  // Körperlich
  Strength = 'strength',
  Dexterity = 'dexterity',
  Stamina = 'stamina',
  // Gesellschaftlich
  Charisma = 'charisma',
  Manipulation = 'manipulation',
  Appearance = 'appearance',
  // Geistig
  Perception = 'perception',
  Intelligence = 'intelligence',
  Wits = 'wits',
}

export enum VdzAbility {
  // Talente
  Alertness = 'alertness',
  Expression = 'expression',
  Subterfuge = 'subterfuge',
  Intimidation = 'intimidation',
  Empathy = 'empathy',
  Leadership = 'leadership',
  Brawl = 'brawl',
  Awareness = 'awareness',
  Athletics = 'athletics',
  Legerdemain = 'legerdemain',
  // Fertigkeiten
  Performance = 'performance',
  Archery = 'archery',
  Etiquette = 'etiquette',
  Commerce = 'commerce',
  Crafts = 'crafts',
  Stealth = 'stealth',
  Melee = 'melee',
  Ride = 'ride',
  AnimalKen = 'animal_ken',
  Survival = 'survival',
  // Kenntnisse
  Academics = 'academics',
  Enigmas = 'enigmas',
  Law = 'law',
  Medicine = 'medicine',
  Investigation = 'investigation',
  Occult = 'occult',
  Politics = 'politics',
  Seneschal = 'seneschal',
  Theology = 'theology',
  HearthWisdom = 'hearth_wisdom',
}

export enum VdzVirtue {
  ConscienceOrConviction = 'conscience_or_conviction',
  SelfControlOrInstinct = 'self_control_or_instinct',
  Courage = 'courage',
}

const ATTRIBUTE_NAME: Record<VdzAttribute, string> = {
  [VdzAttribute.Strength]: "Körperkraft",
  [VdzAttribute.Dexterity]: "Geschicklichkeit",
  [VdzAttribute.Stamina]: "Widerstandsfähigkeit",
  [VdzAttribute.Charisma]: "Charisma",
  [VdzAttribute.Manipulation]: "Manipulation",
  [VdzAttribute.Appearance]: "Erscheinungsbild",
  [VdzAttribute.Perception]: "Wahrnehmung",
  [VdzAttribute.Intelligence]: "Intelligenz",
  [VdzAttribute.Wits]: "Geistesschärfe",
}

const ABILITY_NAME: Record<VdzAbility, string> = {
  [VdzAbility.Alertness]: "Aufmerksamkeit",
  [VdzAbility.Expression]: "Ausdruck",
  [VdzAbility.Subterfuge]: "Ausflüchte",
  [VdzAbility.Intimidation]: "Einschüchtern",
  [VdzAbility.Empathy]: "Empathie",
  [VdzAbility.Leadership]: "Führungsqualitäten",
  [VdzAbility.Brawl]: "Handgemenge",
  [VdzAbility.Awareness]: "Magiespür",
  [VdzAbility.Athletics]: "Sportlichkeit",
  [VdzAbility.Legerdemain]: "Taschenspielerei",
  [VdzAbility.Performance]: "Auftritt",
  [VdzAbility.Archery]: "Bogenschießen",
  [VdzAbility.Etiquette]: "Etikette",
  [VdzAbility.Commerce]: "Handel",
  [VdzAbility.Crafts]: "Handwerk",
  [VdzAbility.Stealth]: "Heimlichkeit",
  [VdzAbility.Melee]: "Nahkampf",
  [VdzAbility.Ride]: "Reiten",
  [VdzAbility.AnimalKen]: "Tierkunde",
  [VdzAbility.Survival]: "Überleben",
  [VdzAbility.Academics]: "Akademisches Wissen",
  [VdzAbility.Enigmas]: "Enigmas",
  [VdzAbility.Law]: "Gesetzeskenntnis",
  [VdzAbility.Medicine]: "Medizin",
  [VdzAbility.Investigation]: "Nachforschungen",
  [VdzAbility.Occult]: "Okkultismus",
  [VdzAbility.Politics]: "Politik",
  [VdzAbility.Seneschal]: "Seneschall",
  [VdzAbility.Theology]: "Theologie",
  [VdzAbility.HearthWisdom]: "Weisheit der Alten",
}

const ATTRIBUTE_CATEGORY_NAME: Record<VdzAttributeCategory, string> = {
  [VdzAttributeCategory.Physical]: "Körperlich",
  [VdzAttributeCategory.Social]: "Gesellschaftlich",
  [VdzAttributeCategory.Mental]: "Geistig",
}

const ABILITY_CATEGORY_NAME: Record<VdzAbilityCategory, string> = {
  [VdzAbilityCategory.Talents]: "Talente",
  [VdzAbilityCategory.Skills]: "Fertigkeiten",
  [VdzAbilityCategory.Knowledges]: "Kenntnisse",
}

export function getVdzAttributeName(attr: VdzAttribute): string {
  return ATTRIBUTE_NAME[attr];
}

export function getVdzAbilityName(ability: VdzAbility): string {
  return ABILITY_NAME[ability];
}

export function getVdzAttributeCategoryName(category: VdzAttributeCategory): string {
  return ATTRIBUTE_CATEGORY_NAME[category];
}

export function getVdzAbilityCategoryName(category: VdzAbilityCategory): string {
  return ABILITY_CATEGORY_NAME[category];
}

export const vdzPhysicalAttributes: VdzAttribute[] = [
  VdzAttribute.Strength,
  VdzAttribute.Dexterity,
  VdzAttribute.Stamina,
];

export const vdzSocialAttributes: VdzAttribute[] = [
  VdzAttribute.Charisma,
  VdzAttribute.Manipulation,
  VdzAttribute.Appearance,
];

export const vdzMentalAttributes: VdzAttribute[] = [
  VdzAttribute.Perception,
  VdzAttribute.Intelligence,
  VdzAttribute.Wits,
];

export function getVdzAttributeCategory(attr: VdzAttribute): VdzAttributeCategory {
  if (vdzPhysicalAttributes.includes(attr)) return VdzAttributeCategory.Physical;
  if (vdzSocialAttributes.includes(attr)) return VdzAttributeCategory.Social;
  return VdzAttributeCategory.Mental;
}

export const vdzTalentAbilities: VdzAbility[] = [
  VdzAbility.Alertness,
  VdzAbility.Expression,
  VdzAbility.Subterfuge,
  VdzAbility.Intimidation,
  VdzAbility.Empathy,
  VdzAbility.Leadership,
  VdzAbility.Brawl,
  VdzAbility.Awareness,
  VdzAbility.Athletics,
  VdzAbility.Legerdemain,
];

export const vdzSkillAbilities: VdzAbility[] = [
  VdzAbility.Performance,
  VdzAbility.Archery,
  VdzAbility.Etiquette,
  VdzAbility.Commerce,
  VdzAbility.Crafts,
  VdzAbility.Stealth,
  VdzAbility.Melee,
  VdzAbility.Ride,
  VdzAbility.AnimalKen,
  VdzAbility.Survival,
];

export const vdzKnowledgeAbilities: VdzAbility[] = [
  VdzAbility.Academics,
  VdzAbility.Enigmas,
  VdzAbility.Law,
  VdzAbility.Medicine,
  VdzAbility.Investigation,
  VdzAbility.Occult,
  VdzAbility.Politics,
  VdzAbility.Seneschal,
  VdzAbility.Theology,
  VdzAbility.HearthWisdom,
];

export function getVdzAbilityCategory(ability: VdzAbility): VdzAbilityCategory {
  if (vdzTalentAbilities.includes(ability)) return VdzAbilityCategory.Talents;
  if (vdzSkillAbilities.includes(ability)) return VdzAbilityCategory.Skills;
  return VdzAbilityCategory.Knowledges;
}

/**
 * Blutvorrat nach Generation (V20 Dark Ages): [max. Vorrat, max. Punkte pro Runde].
 */
export const VDZ_GENERATION_TABLE: Record<number, [number, number]> = {
  13: [10, 1],
  12: [11, 1],
  11: [12, 1],
  10: [13, 1],
  9: [14, 2],
  8: [15, 3],
  7: [20, 4],
  6: [30, 6],
  5: [40, 8],
  4: [50, 10],
}

export function getVdzBloodPool(generation: number): [number, number] {
  return VDZ_GENERATION_TABLE[generation] ?? [10, 1];
}

export interface IVdzClan {
  id: number;
  name: string;
  nickname: string;
  description: string;
  disciplines: string[];
  weakness: string;
  characterCreationHint?: string;
  /** ID des wiederverwendeten V5-Clan-Symbols in public/img/clans/<symbolId>.png. */
  symbolId?: number;
}

export interface IVdzRoadPath {
  name: string;
  description: string;
  virtues?: {
    conscienceOrConviction: "Gewissen" | "Überzeugung";
    selfControlOrInstinct: "Selbstbeherrschung" | "Instinkt";
  };
  hierarchyOfSins?: { rating: number; sin: string }[];
}

export interface IVdzRoad {
  id: number;
  name: string;
  latinName: string;
  followerName?: string;
  description: string;
  ethics: string[];
  virtues: {
    conscienceOrConviction: "Gewissen" | "Überzeugung";
    selfControlOrInstinct: "Selbstbeherrschung" | "Instinkt";
  };
  aura: {
    name: string;
    description: string;
  };
  hierarchyOfSins: { rating: number; sin: string }[];
  paths: IVdzRoadPath[];
}

export interface IVdzArchetype {
  id: number;
  name: string;
  description: string;
}

export interface IVdzBackground {
  id: number;
  name: string;
  description: string;
  levels?: { [key: string]: string };
}

export interface IVdzDisciplinePower {
  name: string;
  description: string;
}

export interface IVdzDisciplineLevel {
  level: number;
  powers: IVdzDisciplinePower[];
}

export interface IVdzDiscipline {
  id: number;
  name: string;
  summary: string;
  levels: IVdzDisciplineLevel[];
}

export interface IVdzTraitDef {
  id: number;
  name: string;
  category: "koerperlich" | "geistig" | "gesellschaftlich" | "uebernatuerlich";
  type: "merit" | "flaw";
  minLevel: number;
  maxLevel: number;
  description: string;
}

export function getVdzTraitCategoryName(category: IVdzTraitDef["category"]): string {
  switch (category) {
    case "koerperlich":
      return "Körperlich";
    case "geistig":
      return "Geistig";
    case "gesellschaftlich":
      return "Gesellschaftlich";
    case "uebernatuerlich":
      return "Übernatürlich";
    default:
      return "";
  }
}

export interface IVdzSheetTrait {
  name: string;
  level: number;
  isFlaw: boolean;
}

export interface IVdzSheetDiscipline {
  name: string;
  level: number;
}

export interface IVdzSheetBackground {
  name: string;
  level: number;
}

export interface IVdzSheet extends IBaseSheet {
  freebiePoints: number;
  backstory: string;
  sire: string;
  clan: IVdzClan;
  road: IVdzRoad;
  roadRating: number;
  nature: IVdzArchetype;
  demeanor: IVdzArchetype;
  generation: number;
  virtues: { [key in VdzVirtue]: number };
  willpower: number;
  willpowerDamage?: DamageType[];
  bloodPool: number;
  health: number;
  healthDamage?: DamageType[];
  attributes: { [key in VdzAttribute]: number };
  abilities: { [key in VdzAbility]: number };
  disciplines: IVdzSheetDiscipline[];
  traits: IVdzSheetTrait[];
  backgrounds: IVdzSheetBackground[];
}

export function NewVdzSheet(): IVdzSheet {
  return {
    id: "",
    game: GameLine.DarkAges,
    directory: "",
    justViewing: false,
    avatar: "",
    avatarOrientation: AvatarOrientation.Center,
    name: "",
    notes: "",
    sex: Sex.Divers,
    concept: "",
    chronicle: "",
    backstory: "",
    sire: "",
    exp: 0,
    usedExp: 0,
    freebiePoints: 15,
    clan: undefined!,
    road: undefined!,
    roadRating: 0,
    nature: undefined!,
    demeanor: undefined!,
    generation: 13,
    virtues: {
      [VdzVirtue.ConscienceOrConviction]: 1,
      [VdzVirtue.SelfControlOrInstinct]: 1,
      [VdzVirtue.Courage]: 1,
    },
    willpower: 1,
    bloodPool: 10,
    health: 7,
    attributes: {
      [VdzAttribute.Strength]: 1,
      [VdzAttribute.Dexterity]: 1,
      [VdzAttribute.Stamina]: 1,
      [VdzAttribute.Charisma]: 1,
      [VdzAttribute.Manipulation]: 1,
      [VdzAttribute.Appearance]: 1,
      [VdzAttribute.Perception]: 1,
      [VdzAttribute.Intelligence]: 1,
      [VdzAttribute.Wits]: 1,
    },
    abilities: {
      [VdzAbility.Alertness]: 0,
      [VdzAbility.Expression]: 0,
      [VdzAbility.Subterfuge]: 0,
      [VdzAbility.Intimidation]: 0,
      [VdzAbility.Empathy]: 0,
      [VdzAbility.Leadership]: 0,
      [VdzAbility.Brawl]: 0,
      [VdzAbility.Awareness]: 0,
      [VdzAbility.Athletics]: 0,
      [VdzAbility.Legerdemain]: 0,
      [VdzAbility.Performance]: 0,
      [VdzAbility.Archery]: 0,
      [VdzAbility.Etiquette]: 0,
      [VdzAbility.Commerce]: 0,
      [VdzAbility.Crafts]: 0,
      [VdzAbility.Stealth]: 0,
      [VdzAbility.Melee]: 0,
      [VdzAbility.Ride]: 0,
      [VdzAbility.AnimalKen]: 0,
      [VdzAbility.Survival]: 0,
      [VdzAbility.Academics]: 0,
      [VdzAbility.Enigmas]: 0,
      [VdzAbility.Law]: 0,
      [VdzAbility.Medicine]: 0,
      [VdzAbility.Investigation]: 0,
      [VdzAbility.Occult]: 0,
      [VdzAbility.Politics]: 0,
      [VdzAbility.Seneschal]: 0,
      [VdzAbility.Theology]: 0,
      [VdzAbility.HearthWisdom]: 0,
    },
    disciplines: [],
    inventory: {
      carriedItems: [],
      ownedItems: [],
      cash: 0,
      bank: 0
    },
    traits: [],
    backgrounds: [],
  };
}
