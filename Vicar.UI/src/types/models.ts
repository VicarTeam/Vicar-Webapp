import {IDiscipline} from "@/types/data";

export class Edition {
    
    public readonly languages: Language[] = [];
    
    public constructor(
        public readonly key: string, 
        public readonly name: string
    ){}
}

export class Language {

    public readonly books: Book[] = [];
    
    public constructor(
        public readonly key: string
    ){}
}

export class Book {

    public constructor(
        public readonly name: string,
        public readonly clans: Clan[]
    ){}
}

export class Clan {
    public constructor(
        public readonly id: number,
        public readonly name: string,
        public readonly slogan: string,
        public readonly symbol: string,
        public readonly disciplines: IDiscipline[]
    ){}
}