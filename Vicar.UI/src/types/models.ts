import {IDiscipline, ITraitPack} from "@/types/data";

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
}

export interface IClan {
    readonly id: number;
    readonly name: string;
    readonly slogan: string;
    readonly symbol: string;
    readonly disciplines: IDiscipline[];
}

export interface ICharacter {
    books: number[];
    name: string;
    concept: string;
    //TODO jagdverhalten
    chronicle: string;
    ambition: string;
    clan: IClan;
    sire: string;
    desire: string;
    generation: number;
    health: number;
    willpower: number;
    hunger: number;
    humanity: number;
    resonance: string;
    attributes: {[key in AttributeKeys]: number};
    skills: {[key in SkillKeys]: ISkillData};
}

export interface ISkillData {
    value: number;
    specialization: string[];
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