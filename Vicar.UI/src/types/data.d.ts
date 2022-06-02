export interface IEdition {
    languages: string[];
    books: { clans: number[]; id: number }[];
}

export interface IClan {
    id: number;
    name: string;
    slogan: string;
    symbol: string;
    disciplines: number[];
}

export interface IDiscipline {
    id: number;
    name: string;
    nicknames: string[];
    summary?: string;
    properties: IDisciplineProperties;
    levels: { [key: (1 | 2 | 3 | 4 | 5)]: IDisciplineAbility[] };
    note?: string;
}

export interface IDisciplineProperties {
    summary?: string;
    type: "Geistig" | "Körperlich" | "Magie";
    threat: string;
    resonance: string;
}

export interface IDisciplineAbility {
    id: number;
    name: string;
    combination?: string;
    requirement?: number;
    summary: string;
    costs: string;
    diceSupplies?: string;
    system: string;
    alternatives: string[];
    duration: string;
}

export interface IPredatorType {
    id: number;
    name: string;
    description: string;
    restriction?: IRestriction;
    actions: IPTAction[];
}

export interface IPTAction {
    description: string;
    type: PTActionType;
    restriction?: IRestriction;
    data: { [key: string]: any };
}

export enum PTActionType {
    AdditionalSpecialization = "additional_specialization",
    DisciplinePoint = "discipline_point",
    HumanityChange = "humanity_change",
}

export interface IRestriction {
    type: RestrictionType;
    data: any;
}

export enum RestrictionType {
    SpecificClans = "specific_clans", // data = [clanIds]
    ExcludeClans = "exclude_clans", // data = [clanIds]
    MinimumCharacterValue = "minimum_character_value", // data = {numeric value, key of value}
    BookActivated = "book_activated", // data = [bookIds] (orX)
    MaxGeneration = "max_generation", // data = numeric generation (must have this generation or less)
}

/**
 * The interface combining merits and backgrounds.
 */
export interface ITraitPack {
    id: number;
    name: string;
    description: string;
    isCombinable: boolean;
    restriction?: IRestriction;
    advantages: ITrait[];
    disadvantages: ITrait[];
}

export interface ITrait {
    id: number;
    level: 1 | 2 | 3 | 4 | 5;
    name: string;
    description: string;
    isRepeatable?: boolean;
    actions: ITraitAction[];
    restriction?: IRestriction;
}

export interface ITraitAction {
    description: string;
    type: TraitActionType;
    data: any;
}

export enum TraitActionType {
    CapSkill = "cap_skill",
}