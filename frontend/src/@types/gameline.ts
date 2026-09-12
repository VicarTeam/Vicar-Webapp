import {DamageType, type ICategory, type IInventory, type IRequiredPointSpread, type IUsingTraitPacks, Sex} from "@/@types/models";
import {type ISkillSpreadType} from "@/@types/data";

export enum GameLine {
  Vampire = 'v5',
  Werewolf = 'w5',
  Mage = 'm20',
  Hunter = 'h5',
  DarkAges = 'vdz',
  Deathborne = 'db',
}

export interface IBaseSheet {
  id: string;
  game?: GameLine; // if not provided, defaults to V5
  directory?: string;
  justViewing?: boolean;
  avatar: string;
  name: string;
  notes: string;
  sex: Sex;
  concept: string;
  inventory: IInventory;
  chronicle: string;
  exp: number;
  usedExp: number;
  levelHistory?: ILevelChange[];
  avatarOrientation: AvatarOrientation;
  dataVersion?: string;
}

export enum AvatarOrientation {
  Center = 'center',
  Top = 'top',
  Bottom = 'bottom',
}

export interface IEdition5Sheet extends IBaseSheet {
  requiredPointSpreads: IRequiredPointSpread[];
  skillspread: ISkillSpreadType;
  categories: ICategory[];
  merits: IUsingTraitPacks;
  backgrounds: IUsingTraitPacks;
  isElder?: boolean;
  health: number;
  healthDamage?: DamageType[];
  willpower: number;
  willpowerDamage?: DamageType[];
}

export enum LevelChangeType {
  Attribute = 'attribute',
  Skill = 'skill',
  Discipline = 'discipline',
  Trait = 'trait',
  Flaw = 'flaw',
  BloodPotency = 'blood_potency',
  BloodRitual = 'blood_ritual',
  Gift = 'gift',
  Edge = 'edge',
  EdgePerk = 'edge_perk',
  Renown = 'renown',
  Specialization = 'specialization',
  M20_Ability = 'm20_ability',
  M20_Attribute = 'm20_attribute',
  M20_Sphere = 'm20_sphere',
  M20_Arete = 'm20_arete',
  M20_Willpower = 'm20_willpower',
  VDZ_Attribute = 'vdz_attribute',
  VDZ_Ability = 'vdz_ability',
  VDZ_Discipline = 'vdz_discipline',
  VDZ_Virtue = 'vdz_virtue',
  VDZ_Road = 'vdz_road',
  VDZ_Willpower = 'vdz_willpower',
  VDZ_Background = 'vdz_background',
  DB_Attribute = 'db_attribute',
  DB_Skill = 'db_skill',
  DB_Specialization = 'db_specialization',
  DB_Art = 'db_art',
  DB_Form = 'db_form',
  DB_BloodStrength = 'db_blood_strength',
  DB_Wille = 'db_wille',
  DB_Background = 'db_background',
  DB_Alienation = 'db_alienation',
  Unknown = 'unknown',
}

export interface ILevelChange {
  type: LevelChangeType;
  date: string; // ISO date string
  text: string;
  exp: {
    used: number;
    before: number;
    after: number;
  };
}

export function levelChangeTypeLabel(type: LevelChangeType): string {
  switch (type) {
    case LevelChangeType.Attribute:
      return "Attribut";
    case LevelChangeType.Skill:
      return "Fähigkeit";
    case LevelChangeType.Discipline:
      return "Disziplin";
    case LevelChangeType.Trait:
      return "Vorteil";
    case LevelChangeType.Flaw:
      return "Schwäche";
    case LevelChangeType.BloodPotency:
      return "Blutmacht";
    case LevelChangeType.BloodRitual:
      return "Blutritual";
    case LevelChangeType.Gift:
      return "Gabe/Ritus";
    case LevelChangeType.Edge:
      return "Edge";
    case LevelChangeType.EdgePerk:
      return "Edge-Perk";
    case LevelChangeType.Renown:
      return "Ruhm";
    case LevelChangeType.Specialization:
      return "Spezialisierung";
    case LevelChangeType.M20_Ability:
      return "Fähigkeit";
    case LevelChangeType.M20_Attribute:
      return "Attribut";
    case LevelChangeType.M20_Sphere:
      return "Sphäre";
    case LevelChangeType.M20_Willpower:
      return "Willenskraft";
    case LevelChangeType.M20_Arete:
      return "Arete";
    case LevelChangeType.VDZ_Attribute:
      return "Attribut";
    case LevelChangeType.VDZ_Ability:
      return "Fähigkeit";
    case LevelChangeType.VDZ_Discipline:
      return "Disziplin";
    case LevelChangeType.VDZ_Virtue:
      return "Tugend";
    case LevelChangeType.VDZ_Road:
      return "Weg";
    case LevelChangeType.VDZ_Willpower:
      return "Willenskraft";
    case LevelChangeType.VDZ_Background:
      return "Hintergrund";
    case LevelChangeType.DB_Attribute:
      return "Attribut";
    case LevelChangeType.DB_Skill:
      return "Fertigkeit";
    case LevelChangeType.DB_Specialization:
      return "Spezialisierung";
    case LevelChangeType.DB_Art:
      return "Blutkunst";
    case LevelChangeType.DB_Form:
      return "Form";
    case LevelChangeType.DB_BloodStrength:
      return "Blutstärke";
    case LevelChangeType.DB_Wille:
      return "Wille";
    case LevelChangeType.DB_Background:
      return "Hintergrund";
    case LevelChangeType.DB_Alienation:
      return "Entfremdung";
    default:
      return "Unbekannt";
  }
}