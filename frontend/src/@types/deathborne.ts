import {AvatarOrientation, GameLine, type IBaseSheet} from "@/@types/gameline";
import {Sex} from "@/@types/models";

export enum DbAttribute {
  Kraft = 'kraft',
  Geschick = 'geschick',
  Verstand = 'verstand',
  Gespuer = 'gespuer',
  Praesenz = 'praesenz',
  Raffinesse = 'raffinesse',
}

export enum DbSkill {
  Athletik = 'athletik',
  Kampf = 'kampf',
  Schiessen = 'schiessen',
  Heimlichkeit = 'heimlichkeit',
  Ueberleben = 'ueberleben',
  Ueberzeugen = 'ueberzeugen',
  Taeuschen = 'taeuschen',
  Menschenkenntnis = 'menschenkenntnis',
  Etikette = 'etikette',
  Strasse = 'strasse',
  Nachforschung = 'nachforschung',
  Bildung = 'bildung',
  Medizin = 'medizin',
  Okkultes = 'okkultes',
  Technik = 'technik',
}

export enum DbHumanTrait {
  Atem = 'atem',
  Waerme = 'waerme',
  Herzschlag = 'herzschlag',
  Essen = 'essen',
  Traeume = 'traeume',
  Mimik = 'mimik',
}

export enum DbCategory {
  Body = 'body',
  Mind = 'mind',
  Social = 'social',
}

export enum DbAnchorKind {
  Human = 'human',
  Night = 'night',
}

export enum DbAnchorState {
  Firm = 'firm',
  Shaken = 'shaken',
}

export enum DbFormKind {
  Established = 'established',
  Own = 'own',
}

export enum DbAnathemaSource {
  Base = 'base',
  Inherited = 'inherited',
  Personal = 'personal',
}

export enum DbDebtDirection {
  Owing = 'owing',
  Owed = 'owed',
}

export enum DbDamageKind {
  Wound = 'wound',
  Devastation = 'devastation',
}

export const dbAttributes: DbAttribute[] = [
  DbAttribute.Kraft,
  DbAttribute.Geschick,
  DbAttribute.Verstand,
  DbAttribute.Gespuer,
  DbAttribute.Praesenz,
  DbAttribute.Raffinesse,
];

export const dbSkills: DbSkill[] = [
  DbSkill.Athletik,
  DbSkill.Kampf,
  DbSkill.Schiessen,
  DbSkill.Heimlichkeit,
  DbSkill.Ueberleben,
  DbSkill.Ueberzeugen,
  DbSkill.Taeuschen,
  DbSkill.Menschenkenntnis,
  DbSkill.Etikette,
  DbSkill.Strasse,
  DbSkill.Nachforschung,
  DbSkill.Bildung,
  DbSkill.Medizin,
  DbSkill.Okkultes,
  DbSkill.Technik,
];

export const dbHumanTraits: DbHumanTrait[] = [
  DbHumanTrait.Atem,
  DbHumanTrait.Waerme,
  DbHumanTrait.Herzschlag,
  DbHumanTrait.Essen,
  DbHumanTrait.Traeume,
  DbHumanTrait.Mimik,
];

const ATTRIBUTE_CATEGORY: Record<DbAttribute, DbCategory> = {
  [DbAttribute.Kraft]: DbCategory.Body,
  [DbAttribute.Geschick]: DbCategory.Body,
  [DbAttribute.Verstand]: DbCategory.Mind,
  [DbAttribute.Gespuer]: DbCategory.Mind,
  [DbAttribute.Praesenz]: DbCategory.Social,
  [DbAttribute.Raffinesse]: DbCategory.Social,
};

const SKILL_CATEGORY: Record<DbSkill, DbCategory> = {
  [DbSkill.Athletik]: DbCategory.Body,
  [DbSkill.Kampf]: DbCategory.Body,
  [DbSkill.Schiessen]: DbCategory.Body,
  [DbSkill.Heimlichkeit]: DbCategory.Body,
  [DbSkill.Ueberleben]: DbCategory.Body,
  [DbSkill.Ueberzeugen]: DbCategory.Social,
  [DbSkill.Taeuschen]: DbCategory.Social,
  [DbSkill.Menschenkenntnis]: DbCategory.Social,
  [DbSkill.Etikette]: DbCategory.Social,
  [DbSkill.Strasse]: DbCategory.Social,
  [DbSkill.Nachforschung]: DbCategory.Mind,
  [DbSkill.Bildung]: DbCategory.Mind,
  [DbSkill.Medizin]: DbCategory.Mind,
  [DbSkill.Okkultes]: DbCategory.Mind,
  [DbSkill.Technik]: DbCategory.Mind,
};

const CATEGORY_NAME: Record<DbCategory, string> = {
  [DbCategory.Body]: "Körper",
  [DbCategory.Mind]: "Geist",
  [DbCategory.Social]: "Sozial",
};

const ATTRIBUTE_NAME: Record<DbAttribute, string> = {
  [DbAttribute.Kraft]: "Kraft",
  [DbAttribute.Geschick]: "Geschick",
  [DbAttribute.Verstand]: "Verstand",
  [DbAttribute.Gespuer]: "Gespür",
  [DbAttribute.Praesenz]: "Präsenz",
  [DbAttribute.Raffinesse]: "Raffinesse",
};

const SKILL_NAME: Record<DbSkill, string> = {
  [DbSkill.Athletik]: "Athletik",
  [DbSkill.Kampf]: "Kampf",
  [DbSkill.Schiessen]: "Schießen",
  [DbSkill.Heimlichkeit]: "Heimlichkeit",
  [DbSkill.Ueberleben]: "Überleben",
  [DbSkill.Ueberzeugen]: "Überzeugen",
  [DbSkill.Taeuschen]: "Täuschen",
  [DbSkill.Menschenkenntnis]: "Menschenkenntnis",
  [DbSkill.Etikette]: "Etikette",
  [DbSkill.Strasse]: "Straße",
  [DbSkill.Nachforschung]: "Nachforschung",
  [DbSkill.Bildung]: "Bildung",
  [DbSkill.Medizin]: "Medizin",
  [DbSkill.Okkultes]: "Okkultes",
  [DbSkill.Technik]: "Technik",
};

const HUMAN_TRAIT_NAME: Record<DbHumanTrait, string> = {
  [DbHumanTrait.Atem]: "Atem",
  [DbHumanTrait.Waerme]: "Wärme",
  [DbHumanTrait.Herzschlag]: "Herzschlag",
  [DbHumanTrait.Essen]: "Essen",
  [DbHumanTrait.Traeume]: "Träume",
  [DbHumanTrait.Mimik]: "Mimik",
};

export function getDbAttributeName(attribute: DbAttribute | string): string {
  return ATTRIBUTE_NAME[attribute as DbAttribute] ?? attribute;
}

export function getDbSkillName(skill: DbSkill | string): string {
  return SKILL_NAME[skill as DbSkill] ?? skill;
}

export function getDbHumanTraitName(trait: DbHumanTrait | string): string {
  return HUMAN_TRAIT_NAME[trait as DbHumanTrait] ?? trait;
}

export function getDbAttributeCategory(attribute: DbAttribute): DbCategory {
  return ATTRIBUTE_CATEGORY[attribute];
}

export function getDbSkillCategory(skill: DbSkill): DbCategory {
  return SKILL_CATEGORY[skill];
}

export function getDbCategoryName(category: DbCategory): string {
  return CATEGORY_NAME[category];
}

export function getDbAttributesOf(category: DbCategory): DbAttribute[] {
  return dbAttributes.filter(a => ATTRIBUTE_CATEGORY[a] === category);
}

export function getDbSkillsOf(category: DbCategory): DbSkill[] {
  return dbSkills.filter(s => SKILL_CATEGORY[s] === category);
}

export const DB_ATTRIBUTE_SPREAD: number[] = [4, 3, 3, 2, 2, 1];

export const DB_SKILL_PACKAGES: { key: string, name: string, description: string, spread: number[] }[] = [
  {
    key: "specialist",
    name: "Spezialist",
    description: "Einmal 4, zweimal 3, dreimal 2, zweimal 1",
    spread: [4, 3, 3, 2, 2, 2, 1, 1],
  },
  {
    key: "generalist",
    name: "Generalist",
    description: "Einmal 3, fünfmal 2, fünfmal 1",
    spread: [3, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1],
  },
];

export interface IDbSpecialization {
  skill: string;
  name: string;
}

export interface IDbCharacterArt {
  key: string;
  depth: number;
  affinity: boolean;
}

export interface IDbCharacterForm {
  art: string;
  key: string;
  name: string;
  level: number;
  kind: DbFormKind;
  effect: string;
  limits: string;
}

export interface IDbAnchor {
  slot: number;
  kind: DbAnchorKind;
  label: string;
  state: DbAnchorState;
  forced: boolean;
}

export interface IDbAnathema {
  influence: string;
  level: string;
  source: DbAnathemaSource;
  note: string;
}

export interface IDbBackground {
  key: string;
  level: number;
  note: string;
}

export interface IDbDebt {
  direction: DbDebtDirection;
  size: string;
  party: string;
  note: string;
}

export interface IDbSheet extends IBaseSheet {
  game: GameLine.Deathborne;
  sire: string;
  formerLife: string;
  death: string;
  startAge: string;
  bloodAge: number;
  bloodStrength: number;
  glied: number;
  house: string;
  bloodline: string;
  sireArt: string;
  affinityArt: string;
  varyssAnathema: string;
  court: string;
  courtRank: number;
  office: string;
  order: string;
  cruor: number;
  hunger: number;
  wille: number;
  willePool: number;
  health: number;
  alienation: boolean;
  learnStepsUsed: number;
  attributes: Record<string, number>;
  skills: Record<string, number>;
  humanTraits: Record<string, number>;
  specializations: IDbSpecialization[];
  arts: IDbCharacterArt[];
  forms: IDbCharacterForm[];
  anchors: IDbAnchor[];
  anathema: IDbAnathema[];
  backgrounds: IDbBackground[];
  debts: IDbDebt[];
  damage: string[];
}

export function NewDbSheet(): IDbSheet {
  const attributes: Record<string, number> = {};
  for (const attribute of dbAttributes) {
    attributes[attribute] = 1;
  }
  const skills: Record<string, number> = {};
  for (const skill of dbSkills) {
    skills[skill] = 0;
  }
  const humanTraits: Record<string, number> = {};
  for (const trait of dbHumanTraits) {
    humanTraits[trait] = 3;
  }

  return {
    id: "",
    game: GameLine.Deathborne,
    directory: "",
    justViewing: false,
    avatar: "",
    avatarOrientation: AvatarOrientation.Center,
    name: "",
    notes: "",
    sex: Sex.Divers,
    concept: "",
    chronicle: "",
    exp: 0,
    usedExp: 0,
    inventory: {
      carriedItems: [],
      ownedItems: [],
      cash: 0,
      bank: 0,
    },
    sire: "",
    formerLife: "",
    death: "",
    startAge: "fresh",
    bloodAge: 0,
    bloodStrength: 1,
    glied: 9,
    house: "",
    bloodline: "",
    sireArt: "",
    affinityArt: "",
    varyssAnathema: "",
    court: "",
    courtRank: 2,
    office: "",
    order: "",
    cruor: 6,
    hunger: 0,
    wille: 2,
    willePool: 2,
    health: 6,
    alienation: false,
    learnStepsUsed: 0,
    attributes,
    skills,
    humanTraits,
    specializations: [],
    arts: [],
    forms: [],
    anchors: [],
    anathema: [],
    backgrounds: [],
    debts: [],
    damage: [],
  };
}

export function isDbSheet(sheet?: IBaseSheet): sheet is IDbSheet {
  return sheet?.game === GameLine.Deathborne;
}
