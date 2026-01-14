import {GameLine, type IEdition5Sheet} from "@/@types/gameline";
import {CategoryKeys, type ICategory, Sex, SortedSkillsAndAttribute} from "@/@types/models";

export interface IH5Creed {
  id: number;
  name: string;
  description: string;
  personality: string;
  tactics: string;
  dangers: string;
}

export interface IH5Drive {
  id: number;
  name: string;
  description: string;
  redemption: string;
}

export enum H5EdgeCategory {
  Asset = 'asset',
  Aptitude = 'aptitude',
  Endowment = 'endowment',
}

export interface IH5Edge {
  id: number;
  category: H5EdgeCategory;
  name: string;
  description: string;
  pool: string;
  system: string;
  perks: IH5Perk[];
}

export interface IH5Perk {
  id: number;
  name: string;
  description: string;
}

export interface IH5SelectedPerk {
  perk: number; // IH5Perk id in edge,
  specialization: string;
}

export interface IHunterSheet extends IEdition5Sheet {
  game: GameLine.Hunter;
  exp: number;
  usedExp: number;
  desire: string;
  ambition: string;
  backstory: string;
  notes: string;
  chroniclePrinciples: string;
  anchorsAndBeliefs: string;
  favorsAndBans: string;
  despair: number;
  creed: IH5Creed;
  drive: IH5Drive;
  edges: IH5Edge[];
  perks: IH5SelectedPerk[];
}

export function NewH5Sheet(): IHunterSheet {
  return {
    anchorsAndBeliefs: "",
    avatar: "",
    backgrounds: {
      packs: []
    },
    backstory: "",
    desire: "",
    perks: [],
    creed: undefined!,
    ambition: "",
    categories: Object.values(CategoryKeys).map(key => {
      const category: ICategory = {
        name: key,
        attributes: [],
        skills: []
      };

      SortedSkillsAndAttribute[key].attributes.forEach(attribute => {
        category.attributes.push({key: attribute, value: 0});
      });

      SortedSkillsAndAttribute[key].skills.forEach(skill => {
        category.skills.push({key: skill, value: 0, specialization: []});
      });

      return category;
    }),
    chronicle: "",
    chroniclePrinciples: "",
    concept: "",
    despair: 0,
    directory: "",
    drive: undefined!,
    edges: [],
    exp: 0,
    favorsAndBans: "",
    game: GameLine.Hunter,
    health: 0,
    healthDamage: [],
    id: "",
    inventory: {
      carriedItems: [],
      ownedItems: [],
      cash: 0,
      bank: 0
    },
    isElder: false,
    justViewing: false,
    merits: {
      packs: []
    },
    name: "",
    notes: "",
    requiredPointSpreads: [],
    sex: Sex.Divers,
    skillspread: undefined!,
    usedExp: 0,
    willpower: 0,
    willpowerDamage: []
  };
}