import * as data from "@/types/data";
import {
    AttributeKeys,
    fillDefaults,
    ICharacter,
    IClan,
    ILanguage,
    ILeveledDisciplineAbility
} from "@/types/models";
import {i18n} from "@/libs/i18n";
import {
    DefaultTrait,
    IDiscipline,
    IFlawChoice,
    IPredatorType,
    IRestrictionHolder,
    ITrait,
    ITraitPack
} from "@/types/data";
import {restrictionResolver} from "@/libs/resolvers/restriction-resolver";

export default class DataManager {

    public static readonly languages: ILanguage[] = [];

    public static get selectedLanguage(): ILanguage {
        return this.languages.find(lang => lang.key === i18n.locale)
            || this.languages.find(lang => lang.key === i18n.fallbackLocale)!;
    }

    public static async load() {
        const meta: data.IEdition = (await import("@/assets/data/Meta.json")).default;

        for (const langKey of meta.languages) {
            const disciplines: data.IDiscipline[] = (await import(`@/assets/data/${langKey}/Disciplines.json`)).default;

            const clans: IClan[] = (<data.IClan[]>(await import(`@/assets/data/${langKey}/Clans.json`)).default).map(clan => {
                return {
                    id: clan.id,
                    name: clan.name,
                    slogan: clan.slogan,
                    description: clan.description,
                    disciplines: disciplines.filter(value => clan.disciplines.includes(value.id))
                };
            });

            const merits: ITraitPack[] = (<data.ITraitPack[]>(await import(`@/assets/data/${langKey}/Merits.json`)).default).map(merit => {
                merit.type = "merits";
                merit.advantages = merit.advantages.map(advantage => fillDefaults<ITrait>(advantage, DefaultTrait));
                merit.disadvantages = merit.disadvantages.map(disadvantage => fillDefaults<ITrait>(disadvantage, DefaultTrait));
                return merit;
            });

            const backgrounds: ITraitPack[] = (<data.ITraitPack[]>(await import(`@/assets/data/${langKey}/Backgrounds.json`)).default).map(merit => {
                merit.type = "backgrounds";
                merit.advantages = merit.advantages.map(advantage => fillDefaults<ITrait>(advantage, DefaultTrait));
                merit.disadvantages = merit.disadvantages.map(disadvantage => fillDefaults<ITrait>(disadvantage, DefaultTrait));
                return merit;
            });

            const predatorTypes: IPredatorType[] = (await import(`@/assets/data/${langKey}/PredatorTypes.json`)).default;

            this.languages.push({
                key: langKey,
                books: meta.books.map(book => {
                    return {
                        id: book.id,
                        clans: clans.filter(clan => book.clans.includes(clan.id)),
                        merits: merits.filter(merit => book.merits.includes(merit.id)),
                        backgrounds: backgrounds.filter(background => book.backgrounds.includes(background.id)),
                        predatorTypes: predatorTypes.filter(p => book.predatorTypes.includes(p.id))
                    };
                })
            });
        }
    }

    public static normalToLeveledAbilities(discipline: IDiscipline): ILeveledDisciplineAbility[] {
        const arr: ILeveledDisciplineAbility[] = [];
        for (let [level, abilites] of Object.entries(discipline.levels)) {
            abilites.map(ability => {
                arr.push({
                    level: parseInt(level),
                    usedLevel: 0,
                    ...ability
                });
            });
        }
        return arr;
    }

    public static getAttributeValue(char: ICharacter, attr: AttributeKeys): number {
        for (const cat of char.categories) {
            const a = cat.attributes.find(a => a.key === attr);
            if (a) {
                return a.value;
            }
        }
        return 0;
    }

    public static getFlawOwner(choice: IFlawChoice): ITraitPack|null {
        return (choice.type === "merit") ? this.getMerit(choice.id) : this.getBackground(choice.id);
    }

    public static getBackground(id: number): ITraitPack|null {
        for (const book of this.selectedLanguage.books) {
            for (const background of book.backgrounds) {
                if (background.id === id) {
                    return background;
                }
            }
        }
        return null;
    }

    public static getMerit(id: number): ITraitPack|null {
        for (const book of this.selectedLanguage.books) {
            for (const merit of book.merits) {
                if (merit.id === id) {
                    return merit;
                }
            }
        }
        return null;
    }

    public static getDiscipline(id: number): IDiscipline|null {
        for (const book of this.selectedLanguage.books) {
            for (const clan of book.clans) {
                for (const discipline of clan.disciplines) {
                    if (discipline.id === id) {
                        return discipline;
                    }
                }
            }
        }
        return null;
    }

    public static filterRestrictions<T extends IRestrictionHolder>(char: ICharacter|undefined, input: T[]): T[] {
        if (!char) {
            return input;
        }
        return input.filter(value => !value.restriction || restrictionResolver.resolve(char, value.restriction));
    }
}
