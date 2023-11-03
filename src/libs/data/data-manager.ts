import * as data from "@/types/data";
import {
    AttributeKeys,
    fillDefaults,
    ICharacter,
    IClan,
    ILanguage,
    ILeveledDisciplineAbility, SkillKeys
} from "@/types/models";
import {i18n} from "@/libs/i18n";
import {
    DefaultTrait, IBloodPotencyData, IBloodRitual,
    IDiscipline, IDisciplineAbility,
    IFlawChoice,
    IPredatorType,
    IRestrictionHolder,
    ITrait,
    ITraitPack
} from "@/types/data";
import {restrictionResolver} from "@/libs/resolvers/restriction-resolver";
import {DataSync} from "@/libs/data/data-sync";
import {
    ICustomLexicon, ICustomLexiconTOC,
    ILexiconItem,
    ILexiconSection, ILexiconSubsection,
    ILexiconTextItem,
    ISectionatedCustomLexicon
} from "@/types/custom-lexicon";
//@ts-ignore
import {v4 as uuidv4} from 'uuid';

export default class DataManager {

    public static readonly languages: ILanguage[] = [];

    public static get selectedLanguage(): ILanguage {
        return this.languages.find(lang => lang.key === i18n.locale)
            || this.languages.find(lang => lang.key === i18n.fallbackLocale)!;
    }

    public static async load() {
        await DataSync.sync();

        const meta: data.IEdition = DataSync.loadFile("Meta.json");
        console.log(meta);

        for (const langKey of meta.languages) {
            const disciplines: data.IDiscipline[] = DataSync.loadFile(`${langKey}/Disciplines.json`);

            const clans: IClan[] = (<data.IClan[]>(DataSync.loadFile(`${langKey}/Clans.json`))).map(clan => {
                return {
                    id: clan.id,
                    name: clan.name,
                    slogan: clan.slogan,
                    description: clan.description,
                    curse: clan.curse,
                    actions: clan.actions || [],
                    disciplines: disciplines.filter(value => clan.disciplines.includes(value.id))
                };
            });

            const merits: ITraitPack[] = (<data.ITraitPack[]>(DataSync.loadFile(`${langKey}/Merits.json`))).map(merit => {
                merit.type = "merits";
                merit.advantages = merit.advantages.map(advantage => fillDefaults<ITrait>(advantage, DefaultTrait));
                merit.disadvantages = merit.disadvantages.map(disadvantage => fillDefaults<ITrait>(disadvantage, DefaultTrait));
                return merit;
            });

            const backgrounds: ITraitPack[] = (<data.ITraitPack[]>(DataSync.loadFile(`${langKey}/Backgrounds.json`))).map(merit => {
                merit.type = "backgrounds";
                merit.advantages = merit.advantages.map(advantage => fillDefaults<ITrait>(advantage, DefaultTrait));
                merit.disadvantages = merit.disadvantages.map(disadvantage => fillDefaults<ITrait>(disadvantage, DefaultTrait));
                return merit;
            });

            const predatorTypes: IPredatorType[] = (DataSync.loadFile(`${langKey}/PredatorTypes.json`));
            const bloodPotencyTable: IBloodPotencyData[] = (DataSync.loadFile(`${langKey}/BloodPotencyTable.json`));
            const bloodRituals: IBloodRitual[] = (DataSync.loadFile(`${langKey}/BloodRituals.json`));

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
                }),
                bloodPotencyTable, bloodRituals,
                customLexicon: this.getCustomLexicon(DataSync.loadFile(`${langKey}/CustomLexicon.json`))
            });
        }
    }

    public static normalBloodRitualsAsArray(): IBloodRitual[][] {
        const arr: IBloodRitual[][] = [];
        for (const ritual of DataManager.selectedLanguage.bloodRituals) {
            const lvl = ritual.level - 1;
            if (arr[lvl] === undefined) {
                arr[lvl] = [];
            }
            arr[lvl].push(ritual);
        }
        return arr;
    }

    public static normalDisciplineAbilitiesAsArray(discipline: IDiscipline): IDisciplineAbility[][] {
        const arr: IDisciplineAbility[][] = [];
        for (let [level, abilites] of Object.entries(discipline.levels)) {
            abilites.map(ability => {
                const lvl = parseInt(level) - 1;
                if (arr[lvl] === undefined) {
                    arr[lvl] = [];
                }
                arr[lvl].push(ability);
            });
        }
        return arr;
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

    public static isClanDiscipline(clan: IClan, disciple: IDiscipline): boolean {
        return clan.disciplines.find(d => d.id === disciple.id) !== undefined;
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

    public static getSkillValue(char: ICharacter, skill: SkillKeys): number {
        for (const cat of char.categories) {
            const a = cat.skills.find(a => a.key === skill);
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

    private static getCustomLexicon(rawLexicon: ICustomLexicon): ISectionatedCustomLexicon {
        const convertLexiconList = (items: ILexiconItem[]): {sections: ILexiconSection[], toc: ICustomLexiconTOC[]} => {
            const sections: ILexiconSection[] = [];
            const toc: ICustomLexiconTOC[] = [];
            let currentSection: ILexiconSection|null = null;
            let currentSubsection: ILexiconSubsection|null = null;
            let currentTocSection: ICustomLexiconTOC|null = null;

            for (const item of items) {
                if (item.type === "title") {
                    currentSubsection = null;
                    currentSection = {
                        title: (<ILexiconTextItem>item).text,
                        paragraph: "clpt-" + uuidv4(),
                        items: [],
                        sections: []
                    };
                    currentTocSection = {
                        title: {
                            paragraph: currentSection.paragraph,
                            text: currentSection.title
                        },
                        subtitles: []
                    };
                    sections.push(currentSection);
                    toc.push(currentTocSection);
                    continue;
                }

                if (!currentSection) {
                    continue;
                }

                if (item.type === "subtitle") {
                    currentSubsection = {
                        title: (<ILexiconTextItem>item).text,
                        paragraph: "clpst-" + uuidv4(),
                        items: []
                    };
                    currentTocSection!.subtitles.push({
                        paragraph: currentSubsection.paragraph,
                        text: currentSubsection.title
                    });
                    currentSection.sections.push(currentSubsection);
                    continue;
                }

                if (item.type === "paragraph" || item.type === "list") {
                    if (currentSubsection) {
                        currentSubsection.items.push(item);
                    } else {
                        currentSection.items.push(item);
                    }
                }
            }

            return {
                sections, toc
            };
        };

        return {
            prepend: convertLexiconList(rawLexicon.prepend),
            append: convertLexiconList(rawLexicon.append)
        };
    }
}
