import {DamageType, ICategory, IInventory, IRequiredPointSpread, IUsingTraitPacks, Sex} from "@/types/models";
import {ISkillSpreadType} from "@/types/data";

export enum GameLine {
  Vampire = 'v5',
  Werewolf = 'w5',
  Mage = 'm20',
  Hunter = 'h5',
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