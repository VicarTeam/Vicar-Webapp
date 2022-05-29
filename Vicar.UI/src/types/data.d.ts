export interface IEdition {
    key: string;
    name: string;
    languages: string[];
    books: {clans: number[]; key: string}[];
    i18n: {[langKey: string]: ({[key: string]: string})};
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
    levels: {[key: (1 | 2 | 3 | 4 | 5)]: IDisciplineAbility[] };
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