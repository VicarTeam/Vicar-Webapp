﻿import {
    IBloodPotencyData, IBloodRitual,
    IDiscipline,
    IDisciplineAbility, IOblivionCeremony,
    IPredatorType, IPTAction,
    ISkillSpreadType,
    ITrait,
    ITraitPack
} from "@/types/data";
import {ISectionatedCustomLexicon} from "@/types/custom-lexicon";

export enum LevelType {
    Attribute,
    Skill,
    NewSpecialization,
    ClanDiscipline,
    OtherDiscipline,
    Trait,
    BloodPotency,
    CaitiffDiscipline
}

export enum CategoryKeys {
    Physical = "physical",
    Social = "social",
    Mental = "mental"
}

export enum AttributeKeys {
    Strength = "str",
    Dexterity = "dex",
    Stamina = "sta",
    Charisma = "cha",
    Manipulation = "man",
    Composure = "com",
    Intelligence = "int",
    Wits = "wit",
    Resolve = "res"
}

export enum SkillKeys {
    Athletics= "ath",
    Brawl = "bra",
    Craft = "cra",
    Drive = "dri",
    Firearms = "fir",
    Melee = "mel",
    Larceny = "lar",
    Stealth = "ste",
    Survival = "sur",
    AnimalKen = "ken",
    Etiquette = "eti",
    Insight = "ins",
    Intimidation = "int",
    Leadership = "lea",
    Performance = "per",
    Persuasion = "pes",
    Streetwise = "stw",
    Subterfuge = "sub",
    Academics = "aca",
    Awareness = "awa",
    Finance = "fin",
    Investigation = "inv",
    Medicine = "med",
    Occult = "occ",
    Politics = "pol",
    Science = "sci",
    Technology = "tec"
}

export enum Sex {
    Male = 'm',
    Female = 'f',
    Divers = 'd'
}

export enum Generation {
    Children = "children",
    Newborn = "newborn",
    Ancillae = "ancillae",
    Older = "older",
    Elder = "elder",
}

export enum DamageType {
    None = "none",
    Superficial = "superficial",
    Heavy = "heavy",
    Full = "full"
}

export const SortedSkillsAndAttribute = {
    [CategoryKeys.Physical]: {
        attributes: [AttributeKeys.Strength, AttributeKeys.Dexterity, AttributeKeys.Stamina],
        skills: [
            SkillKeys.Athletics,
            SkillKeys.Brawl,
            SkillKeys.Craft,
            SkillKeys.Drive,
            SkillKeys.Firearms,
            SkillKeys.Melee,
            SkillKeys.Larceny,
            SkillKeys.Stealth,
            SkillKeys.Survival
        ]
    },
    [CategoryKeys.Social]: {
        attributes: [AttributeKeys.Charisma, AttributeKeys.Manipulation, AttributeKeys.Composure],
        skills: [
            SkillKeys.AnimalKen,
            SkillKeys.Etiquette,
            SkillKeys.Insight,
            SkillKeys.Intimidation,
            SkillKeys.Leadership,
            SkillKeys.Performance,
            SkillKeys.Persuasion,
            SkillKeys.Streetwise,
            SkillKeys.Subterfuge
        ]
    },
    [CategoryKeys.Mental]: {
        attributes: [AttributeKeys.Intelligence, AttributeKeys.Wits, AttributeKeys.Resolve],
        skills: [
            SkillKeys.Academics,
            SkillKeys.Awareness,
            SkillKeys.Finance,
            SkillKeys.Investigation,
            SkillKeys.Medicine,
            SkillKeys.Occult,
            SkillKeys.Politics,
            SkillKeys.Science,
            SkillKeys.Technology
        ]
    }
};

export function fillDefaults<T extends object>(given: T, defaults: T): T {
    for (let key in given) {
        given[key] = given[key] || defaults[key];
    }
    return given;
}

export interface ILanguage {
    readonly key: string;
    readonly books: IBook[];
    readonly bloodPotencyTable: IBloodPotencyData[];
    readonly bloodRituals: IBloodRitual[];
    readonly oblivionCeremonies: IOblivionCeremony[];
    readonly customLexicon: ISectionatedCustomLexicon;
    readonly items: IGroupItems[];
}

export interface IBook {
    readonly id: number;
    readonly clans: IClan[];
    readonly merits: ITraitPack[];
    readonly backgrounds: ITraitPack[];
    readonly predatorTypes: IPredatorType[];
}

export interface IClan {
    readonly id: number;
    readonly name: string;
    readonly slogan: string;
    readonly description: string;
    readonly curse: string;
    readonly disciplines: IDiscipline[];
    readonly actions: IPTAction[];
    symbol?: string;
}

export interface IUsingTraitPack {
    pack: ITraitPack;
    traits: ILockableTrait[];
    flawTraits: ILockableTrait[];
}

export interface IUsingTraitPacks {
    packs: IUsingTraitPack[];
}

export interface ILockableTrait extends ITrait {
    isLocked: boolean;
    isManual: boolean;
    customLevel?: number;
    suffix?: string;
}

export interface ILeveledDisciplineAbility extends IDisciplineAbility {
    level: number;
    usedLevel: number;
}

export interface IDisciplineSelection {
    discipline: IDiscipline;
    points: number;
    currentLevel: number;
    abilities: ILeveledDisciplineAbility[];
}

export interface IRequiredPointSpread {
    type: "backgrounds"|"merits";
    isFlaw: boolean;
    points: number;
    packId: number;
}

export interface ICharacterDirectory {
    id: string;
    name: string;
    open: boolean;
}

export const CurrentCharacterVersion = 2;

export interface ICharacter {
    directory?: string;
    id: string;
    avatar: string;
    requiredPointSpreads: IRequiredPointSpread[];
    books: number[];
    name: string;
    sex: Sex;
    concept: string;
    predatorType: IPredatorType;
    chronicle: string;
    ambition: string;
    clan: IClan;
    disciplines: IDisciplineSelection[];
    sire: string;
    desire: string;
    generationEra: Generation;
    generation: number;
    health: number;
    healthDamage?: DamageType[];
    willpower: number;
    willpowerDamage?: DamageType[];
    hunger: number;
    humanity: number;
    stains?: number;
    resonance: string;
    bloodPotency: number;
    skillspread: ISkillSpreadType;
    categories: ICategory[];
    merits: IUsingTraitPacks;
    backgrounds: IUsingTraitPacks;
    exp: number;
    chroniclePrinciples: string;
    anchorsAndBeliefs: string;
    backstory: string;
    notes: string;
    bloodRituals: IBloodRitual[];
    oblivionCeremonies: IOblivionCeremony[];
    useAdavancedDisciplines: boolean;
    allowLearningOfAllPowers: boolean;
    fullCustomization: boolean;
    version: number;
    inventory: IInventory;
    usedExp: number;
    connectedFoundryId?: string;
    isElder?: boolean;
}

export interface ICategory {
    readonly name: CategoryKeys;
    readonly attributes: IAttributeData[];
    readonly skills: ISkillData[];
}

export interface IAttributeData {
    key: AttributeKeys;
    value: number;
}

export interface ISkillData {
    key: SkillKeys;
    value: number;
    specialization: string[];
}

export interface IInventory {
    carriedItems: IItemStack[];
    ownedItems: IItemStack[];
    bank: number;
    cash: number;
}

export interface IItemStack {
    item: IItem;
    amount: number;
}

export interface IItem {
    isCustom: boolean;
    name: string;
    description: string;
    category: string;
}

export interface IGroupItems {
    category: string;
    items: IItem[];
}

export const DefaultDamageArray: () => DamageType[] = () => {
    const arr: DamageType[] = [];
    for (let i = 0; i < 10; i++) {
        arr.push(DamageType.None);
    }
    return arr;
};

export const DefaultCharacter: () => ICharacter = () => ({
    id: "",
    requiredPointSpreads: [],
    bloodRituals: [],
    ambition: "",
    avatar: "",
    bloodPotency: 0,
    books: [],
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
    disciplines: [],
    chronicle: "",
    clan: undefined!,
    concept: "",
    desire: "",
    generationEra: Generation.Children,
    generation: 0,
    health: 0,
    healthDamage: DefaultDamageArray(),
    humanity: 7,
    hunger: 0,
    name: "",
    stains: 0,
    predatorType: undefined!,
    skillspread: undefined!,
    resonance: "",
    sire: "",
    willpower: 0,
    willpowerDamage: DefaultDamageArray(),
    sex: Sex.Divers,
    exp: 0,
    merits: {
        packs: []
    },
    backgrounds: {
        packs: []
    },
    oblivionCeremonies: [],
    chroniclePrinciples: "",
    anchorsAndBeliefs: "",
    backstory: "",
    notes: "",
    useAdavancedDisciplines: false,
    allowLearningOfAllPowers: false,
    fullCustomization: false,
    version: CurrentCharacterVersion,
    usedExp: 0,
    inventory: {
        carriedItems: [],
        ownedItems: [],
        cash: 0,
        bank: 0
    }
});
