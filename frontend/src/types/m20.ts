import {GameLine, IBaseSheet} from "@/types/gameline";
import {Sex} from "@/types/models";

export enum M20Sphere {
  None = 'none',
  Correspondence = 'correspondence',
  Entropy = 'entropy',
  Forces = 'forces',
  Life = 'life',
  Matter = 'matter',
  Mind = 'mind',
  Prime = 'prime',
  Spirit = 'spirit',
  Time = 'time',
}

export enum M20Essence {
  None = 'none',
  Dynamic = 'dynamic',
  Static = 'static',
  Primordial = 'primordial',
  Questing = 'questing',
}

export enum M20TraditionType {
  Tradition = 'tradition',
  Technocracy = 'technocracy',
  Disparate = 'disparate',
}

export enum M20AttributeCategory {
  Physical = 'physical',
  Social = 'social',
  Mental = 'mental',
}

export enum M20AbilityCategory {
  Talents = 'talents',
  Skills = 'skills',
  Knowledges = 'knowledges',
}

export enum M20Attribute {
  // Physical
  Strength = 'strength',
  Dexterity = 'dexterity',
  Stamina = 'stamina',
  // Social
  Charisma = 'charisma',
  Manipulation = 'manipulation',
  Appearance = 'appearance',
  // Mental
  Perception = 'perception',
  Intelligence = 'intelligence',
  Wits = 'wits',
}

export enum M20Ability {
  // Talents
  Alertness = 'alertness',
  Art = 'art',
  Athletics = 'athletics',
  Awareness = 'awareness',
  Brawl = 'brawl',
  Empathy = 'empathy',
  Expression = 'expression',
  Intimidation = 'intimidation',
  Leadership = 'leadership',
  Streetwise = 'streetwise',
  Subterfuge = 'subterfuge',
  // Skills
  Crafts = 'crafts',
  Drive = 'drive',
  Etiquette = 'etiquette',
  Firearms = 'firearms',
  MartialArts = 'martial_arts',
  Mediation = 'meditation',
  Melee = 'melee',
  Research = 'research',
  Stealth = 'stealth',
  Survival = 'survival',
  Technology = 'technology',
  // Knowledges
  Academics = 'academics',
  Computer = 'computer',
  Cosmology = 'cosmology',
  Enigmas = 'enigmas',
  Investigation = 'investigation',
  Law = 'law',
  Medicine = 'medicine',
  Occult = 'occult',
  Politics = 'politics',
  Science = 'science',
}

export interface IM20TraditionStereotypes {
  fellowTraditions: string;
  technocracy: string; // if the character is a technomancer, this is used for the normal traditions
  disparates: string; // if the character is a disparate, this is used for the normal traditions
}

export interface IM20Tradition {
  id: number; /** autoIncrement **/
  type: M20TraditionType; /** defaultToBefore **/
  name: string;
  description: string;
  organization: string;
  initiation: string;
  affinitySpheres: M20Sphere[];
  focus: string;
  stereotypes: IM20TraditionStereotypes;
}

export interface IM20Paradigm {
  // can be 0 for custom paradigms
  id: number; /** autoIncrement **/
  name: string;
  descrtiption: string;
}

export interface IM20Archetype {
  // can be 0 for custom archetypes
  id: number; /** autoIncrement **/
  name: string;
  description: string;
}

export interface IMageSheet extends IBaseSheet {
  freebiePoints: number;
  concept: string;
  paradigm: IM20Paradigm;
  tradition: IM20Tradition;
  nature: IM20Archetype;
  demeanor: IM20Archetype;
  essence: M20Essence;
  quintessence: number;
  paradox: number;
  spheres: {
    [M20Sphere.Correspondence]: number;
    [M20Sphere.Entropy]: number;
    [M20Sphere.Forces]: number;
    [M20Sphere.Life]: number;
    [M20Sphere.Matter]: number;
    [M20Sphere.Mind]: number;
    [M20Sphere.Prime]: number;
    [M20Sphere.Spirit]: number;
    [M20Sphere.Time]: number;
  };
  attributes: { [key in M20Attribute]: number };
  abilities: { [key in M20Ability]: number };
}

export function NewMageSheet(): IMageSheet {
  return {
    freebiePoints: 15,
    avatar: "",
    chronicle: "",
    concept: "",
    directory: "",
    exp: 0,
    game: GameLine.Mage,
    id: "",
    inventory: {
      carriedItems: [],
      ownedItems: [],
      cash: 0,
      bank: 0
    },
    justViewing: false,
    name: "",
    sex: Sex.Divers,
    spheres: {
      [M20Sphere.Correspondence]: 0,
      [M20Sphere.Entropy]: 0,
      [M20Sphere.Forces]: 0,
      [M20Sphere.Life]: 0,
      [M20Sphere.Matter]: 0,
      [M20Sphere.Mind]: 0,
      [M20Sphere.Prime]: 0,
      [M20Sphere.Spirit]: 0,
      [M20Sphere.Time]: 0,
    },
    tradition: undefined!,
    demeanor: undefined!,
    nature: undefined!,
    paradigm: undefined!,
    essence: M20Essence.None,
    paradox: 0,
    quintessence: 0,
    attributes: {
      // Physical
      [M20Attribute.Strength]: 0,
      [M20Attribute.Dexterity]: 0,
      [M20Attribute.Stamina]: 0,
      // Social
      [M20Attribute.Charisma]: 0,
      [M20Attribute.Manipulation]: 0,
      [M20Attribute.Appearance]: 0,
      // Mental
      [M20Attribute.Perception]: 0,
      [M20Attribute.Intelligence]: 0,
      [M20Attribute.Wits]: 0,
    },
    abilities: {
      // Talents
      [M20Ability.Alertness]: 0,
      [M20Ability.Art]: 0,
      [M20Ability.Athletics]: 0,
      [M20Ability.Awareness]: 0,
      [M20Ability.Brawl]: 0,
      [M20Ability.Empathy]: 0,
      [M20Ability.Expression]: 0,
      [M20Ability.Intimidation]: 0,
      [M20Ability.Leadership]: 0,
      [M20Ability.Streetwise]: 0,
      [M20Ability.Subterfuge]: 0,
      // Skills
      [M20Ability.Crafts]: 0,
      [M20Ability.Drive]: 0,
      [M20Ability.Etiquette]: 0,
      [M20Ability.Firearms]: 0,
      [M20Ability.MartialArts]: 0,
      [M20Ability.Mediation]: 0,
      [M20Ability.Melee]: 0,
      [M20Ability.Research]: 0,
      [M20Ability.Stealth]: 0,
      [M20Ability.Survival]: 0,
      [M20Ability.Technology]: 0,
      // Knowledges
      [M20Ability.Academics]: 0,
      [M20Ability.Computer]: 0,
      [M20Ability.Cosmology]: 0,
      [M20Ability.Enigmas]: 0,
      [M20Ability.Investigation]: 0,
      [M20Ability.Law]: 0,
      [M20Ability.Medicine]: 0,
      [M20Ability.Occult]: 0,
      [M20Ability.Politics]: 0,
      [M20Ability.Science]: 0,
    },
    notes: "",
  };
}

export const physicalAttributes: M20Attribute[] = [
  M20Attribute.Strength,
  M20Attribute.Dexterity,
  M20Attribute.Stamina,
];

export const socialAttributes: M20Attribute[] = [
  M20Attribute.Charisma,
  M20Attribute.Manipulation,
  M20Attribute.Appearance,
];

export const mentalAttributes: M20Attribute[] = [
  M20Attribute.Perception,
  M20Attribute.Intelligence,
  M20Attribute.Wits,
];

export function getAttributeCategory(attr: M20Attribute): M20AttributeCategory {
  if (physicalAttributes.includes(attr)) return M20AttributeCategory.Physical;
  if (socialAttributes.includes(attr)) return M20AttributeCategory.Social;
  return M20AttributeCategory.Mental;
}

export const talentAbilities: M20Ability[] = [
  M20Ability.Alertness,
  M20Ability.Art,
  M20Ability.Athletics,
  M20Ability.Awareness,
  M20Ability.Brawl,
  M20Ability.Empathy,
  M20Ability.Expression,
  M20Ability.Intimidation,
  M20Ability.Leadership,
  M20Ability.Streetwise,
  M20Ability.Subterfuge,
];

export const skillAbilities: M20Ability[] = [
  M20Ability.Crafts,
  M20Ability.Drive,
  M20Ability.Etiquette,
  M20Ability.Firearms,
  M20Ability.MartialArts,
  M20Ability.Mediation,
  M20Ability.Melee,
  M20Ability.Research,
  M20Ability.Stealth,
  M20Ability.Survival,
  M20Ability.Technology,
];

export const knowledgeAbilities: M20Ability[] = [
  M20Ability.Academics,
  M20Ability.Computer,
  M20Ability.Cosmology,
  M20Ability.Enigmas,
  M20Ability.Investigation,
  M20Ability.Law,
  M20Ability.Medicine,
  M20Ability.Occult,
  M20Ability.Politics,
  M20Ability.Science,
];

export function getAbilityCategory(ability: M20Ability): M20AbilityCategory {
  if (talentAbilities.includes(ability)) return M20AbilityCategory.Talents;
  if (skillAbilities.includes(ability)) return M20AbilityCategory.Skills;
  return M20AbilityCategory.Knowledges;
}