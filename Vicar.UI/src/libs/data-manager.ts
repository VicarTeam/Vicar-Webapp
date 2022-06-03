import * as data from "@/types/data";
import {fillDefaults, IClan, ILanguage} from "@/types/models";
import {i18n} from "@/libs/i18n";
import {DefaultTrait, ITrait, ITraitPack} from "@/types/data";

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
                    symbol: clan.symbol,
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

            this.languages.push({
                key: langKey,
                books: meta.books.map(book => {
                    return {
                        id: book.id,
                        clans: clans.filter(clan => book.clans.includes(clan.id)),
                        merits,
                        backgrounds
                    };
                })
            });
        }
        
        console.log(this.selectedLanguage);
    }

}