export interface IBook {
    id: number;
    clans: number[];
    merits: number[];
    backgrounds: number[];
}

export interface IEdition {
    languages: string[];
    books: IBook[];
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
    levels: { [key: number]: IDisciplineAbility[] };
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
    MinimumCharacterValue = "minimum_character_value", // data = {value: number, key: string}
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

export enum TraitSpecialRules {
    None = "none",
    Allies = "allies"
}

export interface ITrait {
    id: number;
    level: 1 | 2 | 3 | 4 | 5;
    name: string;
    description: string;
    isRepeatable: boolean;
    actions: ITraitAction[];
    restriction?: IRestriction;
    specialRules: TraitSpecialRules;
}

export const DefaultTrait: ITrait = {
    id: 0,
    level: 1,
    name: "",
    description: "",
    isRepeatable: false,
    actions: [],
    restriction: undefined,
    specialRules: TraitSpecialRules.None
};

export interface ITraitAction {
    description: string;
    type: TraitActionType;
    data: any;
}

export enum TraitActionType {
    CapSkill = "cap_skill",
}