import * as data from "@/types/data";
import {fillDefaults, ICharacter, IClan, ILanguage} from "@/types/models";
import {i18n} from "@/libs/i18n";
import {DefaultTrait, IPredatorType, IRestrictionHolder, ITrait, ITraitPack} from "@/types/data";
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
                merit.advantages = merit.advantages.map(advantage => fillDefaults<ITrait>(advantage, DefaultTrait));
                merit.disadvantages = merit.disadvantages.map(disadvantage => fillDefaults<ITrait>(disadvantage, DefaultTrait));
                return merit;
            });

            const backgrounds: ITraitPack[] = (<data.ITraitPack[]>(await import(`@/assets/data/${langKey}/Backgrounds.json`)).default).map(merit => {
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

    public static filterRestrictions<T extends IRestrictionHolder>(char: ICharacter|undefined, input: T[]): T[] {
        if (!char) {
            return input;
        }
        return input.filter(value => !value.restriction || restrictionResolver.resolve(char, value.restriction));
    }
}
