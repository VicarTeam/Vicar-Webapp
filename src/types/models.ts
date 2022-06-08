import {IDiscipline, IPredatorType, ITrait, ITraitPack} from "@/types/data";

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
    Ancillae = "ancillae"
}

const SortedSkillsAndAtribute = {
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
    readonly disciplines: IDiscipline[];
}

export interface IUsingTraitPacks {
    freePoints: number;
    packs: {
        pack: ITraitPack;
        usedPoints: number;
        bonusPoints: number;
        flawBonusPoints: number; //TODO these points must used: Force that!
        traits: ILockableTrait[];
    }[];
}

export interface ILockableTrait extends ITrait {
    isLocked: boolean;
    customLevel?: number;
    suffix?: string;
}

export interface ICharacter {
    books: number[];
    name: string;
    sex: Sex;
    concept: string;
    predatorType: IPredatorType;
    chronicle: string;
    ambition: string;
    clan: IClan;
    disciplines: {discipline: IDiscipline; points: number}[];
    sire: string;
    desire: string;
    generationEra: Generation;
    generation: number;
    health: number;
    willpower: number;
    hunger: number;
    humanity: number;
    resonance: string;
    bloodPotency: number;
    categories: ICategory[];
    merits: IUsingTraitPacks;
    backgrounds: IUsingTraitPacks;
    flaws: IUsingTraitPacks;
    exp: number;
}

export interface ICategory {
    readonly name: CategoryKeys;
    readonly attributes: {[key in AttributeKeys]: number};
    readonly skills: {[key in SkillKeys]: ISkillData};
}

export interface ISkillData {
    value: number;
    specialization: string[];
}

export const DefaultUsingTraitPacks: IUsingTraitPacks = {
    freePoints: 0,
    packs: []
};

export const DefaultCharacter: ICharacter = {
    ambition: "",
    bloodPotency: 0,
    books: [],
    categories: Object.values(CategoryKeys).map(key => {
        const category: ICategory = {
            name: key,
            // @ts-ignore
            attributes: {},
            // @ts-ignore
            skills: {}
        };

        SortedSkillsAndAtribute[key].attributes.forEach(attribute => {
            category.attributes[attribute] = 0;
        });

        SortedSkillsAndAtribute[key].skills.forEach(skill => {
            category.skills[skill] = {
                value: 0,
                specialization: []
            };
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
    humanity: 7,
    hunger: 0,
    name: "",
    predatorType: undefined!,
    resonance: "",
    sire: "",
    willpower: 0,
    sex: Sex.Divers,
    exp: 0,
    flaws: {...DefaultUsingTraitPacks},
    merits: {...DefaultUsingTraitPacks},
    backgrounds: {...DefaultUsingTraitPacks}
};
