import * as data from "@/@types/data";
import {
  AttributeKeys,
  fillDefaults,
  type ICharacter,
  type IClan, type IGroupItems, type IItem,
  type ILanguage,
  type ILeveledDisciplineAbility, SkillKeys
} from "@/@types/models";
import {
  DefaultTrait, type IBloodPotencyData, type IBloodRitual,
  type IDiscipline, type IDisciplineAbility,
  type IFlawChoice, type IOblivionCeremony,
  type IPredatorType,
  type IRestrictionHolder,
  type ITrait,
  type ITraitPack
} from "@/@types/data";
import {restrictionResolver} from "@/libs/resolvers/restriction-resolver";
import {DataSync} from "@/libs/data/data-sync";
import {
  type ICustomLexicon, type ICustomLexiconTOC,
  type ILexiconItem,
  type ILexiconSection, type ILexiconSubsection,
  type ILexiconTextItem,
  type ISectionatedCustomLexicon
} from "@/@types/custom-lexicon";
import {v4 as uuidv4} from 'uuid';
import {HomebrewManager} from "@/libs/data/homebrew-manager";
import {VicarSync} from "@/libs/io/vicar-sync";
import {get, patch} from "@/libs/io/rest";
import router from "@/app/router.ts";

export default class DataManager {

  public static loggedInAs: string | null = null;
  public static isAdmin = false;
  private static initialized = false;
  private static trackingDisabled?: boolean = undefined;

  private static loadedLanguageData: ILanguage | undefined = undefined;

  public static get isTrackingDisabled(): boolean {
    if (this.trackingDisabled === undefined) {
      const setting = localStorage.getItem("vicar_c::disableTracking");
      this.trackingDisabled = setting === "true";
    }
    return this.trackingDisabled;
  }

  public static get selectedLanguage(): ILanguage {
    return this.loadedLanguageData!;
  }

  public static async loadLogin(routing = true): Promise<boolean> {
    if (this.loggedInAs) {
      return true;
    }

    const [status, res] = await get<{ username: string; isAdmin?: boolean }>(`/users/@me`);
    if (status >= 400) {
      if (status === 401) {
        if (routing) {
          await router.push('/login');
        }
        return false;
      }
    }

    this.loggedInAs = res.username;
    this.isAdmin = !!res.isAdmin;
    return true;
  }

  public static async load() {
    if (this.initialized) {
      return;
    }

    this.initialized = true;

    await DataSync.sync();

    const meta: data.IEdition = DataSync.loadFile("Meta.json");

    const disciplines: data.IDiscipline[] = DataSync.loadFile(`de-DE/Disciplines.json`);

    const clans: IClan[] = (<data.IClan[]>(DataSync.loadFile(`de-DE/Clans.json`))).map(clan => {
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

    const merits: ITraitPack[] = (<data.ITraitPack[]>(DataSync.loadFile(`de-DE/Merits.json`))).map(merit => {
      merit.type = "merits";
      merit.advantages = merit.advantages.map(advantage => fillDefaults<ITrait>(advantage, DefaultTrait));
      merit.disadvantages = merit.disadvantages.map(disadvantage => fillDefaults<ITrait>(disadvantage, DefaultTrait));
      return merit;
    });

    const backgrounds: ITraitPack[] = (<data.ITraitPack[]>(DataSync.loadFile(`de-DE/Backgrounds.json`))).map(merit => {
      merit.type = "backgrounds";
      merit.advantages = merit.advantages.map(advantage => fillDefaults<ITrait>(advantage, DefaultTrait));
      merit.disadvantages = merit.disadvantages.map(disadvantage => fillDefaults<ITrait>(disadvantage, DefaultTrait));
      return merit;
    });

    const predatorTypes: IPredatorType[] = (DataSync.loadFile(`de-DE/PredatorTypes.json`));
    const bloodPotencyTable: IBloodPotencyData[] = (DataSync.loadFile(`de-DE/BloodPotencyTable.json`));
    const bloodRituals: IBloodRitual[] = (DataSync.loadFile(`de-DE/BloodRituals.json`));
    const oblivionCeremonies: data.IOblivionCeremony[] = (DataSync.loadFile(`de-DE/OblivionCeremonies.json`));

    const items: IItem[] = (DataSync.loadFile<IItem[]>(`de-DE/Items.json`)).map(x => ({...x, isCustom: false}));
    const groupedItems: IGroupItems[] = [];
    const allItems: IItem[] = [];

    for (const item of items) {
      const group = groupedItems.find(g => g.category === item.category);
      if (group) {
        group.items.push(item);
      } else {
        groupedItems.push({
          category: item.category,
          items: [item]
        });
      }

      allItems.push(item);
    }

    groupedItems.forEach(x => {
      x.items.sort((a, b) => a.name.localeCompare(b.name));
    });

    groupedItems.sort((a, b) => a.category.localeCompare(b.category));
    allItems.sort((a, b) => a.name.localeCompare(b.name));
    groupedItems.unshift({
      category: "-- Alle Gegenstände --",
      items: allItems
    });

    const homebrewContent = await HomebrewManager.initContent(disciplines);

    this.loadedLanguageData = {
      key: "de-DE",
      books: [...meta.books.map(book => {
        return {
          id: book.id,
          clans: clans.filter(clan => book.clans.includes(clan.id)),
          merits: merits.filter(merit => book.merits.includes(merit.id)),
          backgrounds: backgrounds.filter(background => book.backgrounds.includes(background.id)),
          predatorTypes: predatorTypes.filter(p => book.predatorTypes.includes(p.id))
        };
      }), homebrewContent],
      bloodPotencyTable, bloodRituals, items: groupedItems, oblivionCeremonies,
      customLexicon: this.getCustomLexicon(DataSync.loadFile(`de-DE/CustomLexicon.json`))
    };

    await HomebrewManager.loadInstalledContent();
    await VicarSync.initialize();
  }

  public static async changeUserPassword(password: string, oldPassword: string): Promise<boolean> {
    try {
      const [status, _] = await patch(`/users/@me/password`, {password, oldPassword});
      return status === 204;
    } catch (e) {
      console.error("Failed to change password", e);
      return false;
    }
  }

  public static findAvailableClan(books: number[], clanId: number): IClan | undefined {
    for (const book of DataManager.selectedLanguage.books) {
      if (books.includes(book.id)) {
        const clan = book.clans.find(c => c.id === clanId);
        if (clan) {
          return clan;
        }
      }
    }
    return undefined;
  }

  public static normalDisciplinesAsArray(): IDiscipline[] {
    const arr: IDiscipline[] = [];
    for (const book of DataManager.selectedLanguage.books) {
      for (const clan of book.clans) {
        for (const discipline of clan.disciplines) {
          if (arr.find(d => d.id === discipline.id) === undefined) {
            arr.push(discipline);
          }
        }
      }
    }
    return arr.sort((a, b) => a.name.localeCompare(b.name));
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

  public static normalOblivionCeremoniesAsArray(): IOblivionCeremony[][] {
    const arr: IOblivionCeremony[][] = [];
    for (const ritual of DataManager.selectedLanguage.oblivionCeremonies) {
      const lvl = ritual.level - 1;
      if (arr[lvl] === undefined) {
        arr[lvl] = [];
      }
      arr[lvl].push(ritual);
    }
    return arr.map(x => x.sort((a, b) => a.name.localeCompare(b.name)));
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

  public static getFlawOwner(choice: IFlawChoice): ITraitPack | null {
    return (choice.type === "merit") ? this.getMerit(choice.id) : this.getBackground(choice.id);
  }

  public static getBackground(id: number): ITraitPack | null {
    for (const book of this.selectedLanguage.books) {
      for (const background of book.backgrounds) {
        if (background.id === id) {
          return background;
        }
      }
    }
    return null;
  }

  public static getMerit(id: number): ITraitPack | null {
    for (const book of this.selectedLanguage.books) {
      for (const merit of book.merits) {
        if (merit.id === id) {
          return merit;
        }
      }
    }
    return null;
  }

  public static getDiscipline(id: number): IDiscipline | null {
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

  public static filterRestrictions<T extends IRestrictionHolder>(char: ICharacter | undefined, input: T[]): T[] {
    if (!char) {
      return input;
    }
    return input.filter(value => !value.restriction || restrictionResolver.resolve(char, value.restriction));
  }

  private static getCustomLexicon(rawLexicon: ICustomLexicon): ISectionatedCustomLexicon {
    const convertLexiconList = (items: ILexiconItem[]): { sections: ILexiconSection[], toc: ICustomLexiconTOC[] } => {
      const sections: ILexiconSection[] = [];
      const toc: ICustomLexiconTOC[] = [];
      let currentSection: ILexiconSection | null = null;
      let currentSubsection: ILexiconSubsection | null = null;
      let currentTocSection: ICustomLexiconTOC | null = null;

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
