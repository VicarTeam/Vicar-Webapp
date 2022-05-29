import {Backend} from "@/libs/backend";
import * as yaml from "js-yaml";
import * as data from "@/types/data";
import {Book, Clan, Edition, Language} from "@/types/models";

export default class DataManager {
    
    public static readonly editions: Edition[] = [];
    
    public static async load() {
        const editionsPath = await Backend.joinPathAsync(Backend.dataPath, "Editions.yml");

        if (!await Backend.existsFileAsync(editionsPath)) {
            console.warn("Editions.yml not found!");
            return;
        }
        
        const editionKeys: string[] = <string[]>yaml.load(await Backend.readFileAsync(editionsPath));
        
        for (const editionKey of editionKeys) {
            const editionMetaFile = await Backend.joinPathAsync(Backend.dataPath, editionKey, "Meta.yml");
            if (!await Backend.existsFileAsync(editionMetaFile)) {
                console.warn(`Edition ${editionKey} has no Meta.yml!`);
                continue;
            }
            
            const editionMeta: data.IEdition = <data.IEdition>yaml.load(await Backend.readFileAsync(editionMetaFile));
            
            const edition = new Edition(editionMeta.key, editionMeta.name);
            this.editions.push(edition);
            
            for (const langKey of editionMeta.languages) {
                const disciplinesFile = await Backend.joinPathAsync(Backend.dataPath, editionKey, langKey, "Disciplines.yml");
                if (!await Backend.existsFileAsync(disciplinesFile)) {
                    console.warn(`No Disciplines.yml for Language ${langKey}!`);
                    continue;
                }
                
                const disciplines: data.IDiscipline[] = <data.IDiscipline[]>yaml.load(await Backend.readFileAsync(disciplinesFile));
                
                const clansFile = await Backend.joinPathAsync(Backend.dataPath, editionKey, langKey, "Clans.yml");
                if (!await Backend.existsFileAsync(clansFile)) {
                    console.warn(`No Clans.yml for Language ${langKey}!`);
                    continue;
                }
                
                const clans: Clan[] = (<data.IClan[]>yaml.load(await Backend.readFileAsync(clansFile))).map(clan => new Clan(clan.id, clan.name, clan.slogan, clan.symbol, disciplines.filter(value => clan.disciplines.includes(value.id))));
                
                const language = new Language(langKey);
                edition.languages.push(language);

                for (const book of editionMeta.books) {
                    const bookName = editionMeta.i18n[langKey] ? (editionMeta.i18n[langKey][book.key] || book.key) : book.key;
                    
                    language.books.push(new Book(bookName, clans.filter(clan => book.clans.includes(clan.id))));
                }
            }
        }
        
        console.log(this.editions);
    }
    
}