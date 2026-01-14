import {GameLine, type IEdition5Sheet} from "@/@types/gameline";
import {CategoryKeys, DefaultDamageArray, type ICategory, Sex, SortedSkillsAndAttribute} from "@/@types/models";
import type {ITrait} from "@/@types/data";

export enum W5Form {
  Homid = "homid",
  Glabro = "glabro",
  Crinos = "crinos",
  Hispo = "hispo",
  Lupus = "lupus",
}

export enum W5RenownKey {
  none = "none",
  Glory = "glory",
  Honor = "honor",
  Wisdom = "wisdom",
}

export enum W5GiftCategory {
  Tribal = "tribal",
  Auspice = "auspice",
  Native = "native",
  Rite = "rite",
}

export interface IW5Gift {
  id: number; /** autoIncrement **/
  category: W5GiftCategory; /** defaultToBefore **/
  totalRenown: number; /** defaultToBefore **/
  onlyFor?: number|null; /** defaultToBefore **/
  name: string;
  description: string;
  renown: W5RenownKey; // the renown associated to this gift (possibly enhances the gift if the renown is high enough)
  cost: string;
  action: string;
  pool: string;
  system: string;
  duration: string;
}

export interface IW5Rite {
  id: number; /** autoIncrement **/
  name: string;
  description: string;
  pool?: string|null;
  system?: string|null;
}

export interface IW5Talisman {
  id: number; /** autoIncrement **/
  name: string;
  description: string;
  system: string;
  talenCost: number; // if both talen and normal cost are 0, it cannot be taken, if either is 0, it is not in that type available
  cost: number; // if non talen
}

export function convertTalismansIntoTraits(talismans: IW5Talisman[]): ITrait[] {
  const traits: ITrait[] = [];
  let currentId = 1000; // Starting ID for talismans to avoid conflicts
  talismans.forEach(talisman => {
    const get = (asTalen: boolean): ITrait => ({
      id: currentId++,
      name: talisman.name + (asTalen ? " (Talen)" : ""),
      description: talisman.description,
      level: (asTalen ? talisman.talenCost : talisman.cost) as any,
      actions: [],
      isRepeatable: true
    });
    if (talisman.talenCost > 0) {
      traits.push(get(true));
    }
    if (talisman.cost > 0) {
      traits.push(get(false));
    }
  });
  return traits;
}

export interface IW5Auspice {
  id: number;
  key: "ragabash" | "theurge" | "philodox" | "galliard" | "ahroun";
  name: string;
  description: string;
}

export interface IW5Tribe {
  id: number;
  name: string;
  description: string;
  patron: {
    name: string;
    description: string;
  };
  ban: string;
  favor: string;
  status: "nation" | "wayward";
  availableGifts: (number|[number, number])[]; // if array, the first is the ID of gift, the second the total renown override
  renown: W5RenownKey;
}

export interface IW5Renown {
  key: W5RenownKey;
  value: number;
}

export interface IWerewolfW5Sheet extends IEdition5Sheet {
  game: GameLine.Werewolf;
  tribe: IW5Tribe;
  auspice: IW5Auspice;
  forms?: W5Form[];
  rage: number;
  renown: IW5Renown[];
  selectedGifts: IW5Gift[];
  selectedRites: IW5Rite[];
  crinos: number;
  harano: number;
  hauglosk: number;
  exp: number;
  usedExp: number;
  backstory: string;
  notes: string;
  chroniclePrinciples: string;
  anchorsAndBeliefs: string;
  favorsAndBans: string;
}

export function NewW5Sheet(): IWerewolfW5Sheet {
  return {
    anchorsAndBeliefs: "",
    auspice: undefined!,
    backstory: "",
    chroniclePrinciples: "",
    concept: "",
    crinos: 0,
    directory: "",
    favorsAndBans: "",
    forms: [],
    selectedRites: [],
    game: GameLine.Werewolf,
    harano: 0,
    hauglosk: 0,
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
    backgrounds: {
      packs: []
    },
    name: "",
    notes: "",
    rage: 0,
    renown: [
      {key: W5RenownKey.Glory, value: 0},
      {key: W5RenownKey.Honor, value: 0},
      {key: W5RenownKey.Wisdom, value: 0}
    ],
    selectedGifts: [],
    skillspread: undefined!,
    tribe: undefined!,
    usedExp: 0,
    id: "",
    requiredPointSpreads: [],
    avatar: "",
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
    health: 0,
    healthDamage: DefaultDamageArray(),
    willpower: 0,
    willpowerDamage: DefaultDamageArray(),
    sex: Sex.Divers,
    exp: 0
  };
}