import {IBook, IClan} from "@/types/models";
import {IDiscipline, IHomebrewClan, IHomebrewDiscipline} from "@/types/data";
import {Storage} from "@/libs/io/storage";

export const HomebrewIdOffset = 3021;

interface InstalledHomebrewContent {
  /**
   * here are disciplines stored, which weren't directly installed, but are required by an installed clan
   */
  cachedDisciplines: IHomebrewDiscipline[];
  clans: IHomebrewClan[];
  disciplines: IHomebrewDiscipline[];
  ownClans: IHomebrewClan[];
  ownDisciplines: IHomebrewDiscipline[];
}

const placeholderClan: IClan = {
  id: -1,
  name: "<placeholder>",
  curse: "",
  slogan: "",
  description: "",
  actions: [],
  disciplines: []
}

export class HomebrewManager {

  private static readonly books: {target: IBook, disciplines: IDiscipline[]}[] = [];
  private static _installedContent: InstalledHomebrewContent = {
    cachedDisciplines: [],
    clans: [],
    disciplines: [],
    ownClans: [],
    ownDisciplines: []
  };

  public static async initContent(predefinedDisciplines: IDiscipline[]): Promise<IBook> {
    const book: IBook = {
      id: HomebrewIdOffset,
      merits: [],
      backgrounds: [],
      clans: [placeholderClan],
      predatorTypes: []
    };

    this.books.push({target: book, disciplines: predefinedDisciplines});

    return book;
  }

  public static async loadInstalledContent() {
    const content = await Storage.readStorage("homebrew-content");
    if (content) {
      const parsedContent = JSON.parse(content) as InstalledHomebrewContent;
      this._installedContent = parsedContent;

      if (parsedContent.clans) {
        parsedContent.clans.forEach(clan => {
          this.addClan(clan);
        });
      }

      if (parsedContent.ownClans) {
        parsedContent.ownClans.forEach(clan => {
          this.addClan(clan);
        });
      }

      if (parsedContent.disciplines) {
        parsedContent.disciplines.forEach(discipline => {
          this.addDiscipline(discipline);
        });
      }

      if (parsedContent.ownDisciplines) {
        parsedContent.ownDisciplines.forEach(discipline => {
          this.addDiscipline(discipline);
        });
      }
    }
  }

  public static async installClan(clan: IHomebrewClan, neededHomebrewDisciplines: IHomebrewDiscipline[]) {
    for (const discipline of neededHomebrewDisciplines) {
      const index = this._installedContent.cachedDisciplines.findIndex(d => d.id === discipline.id);
      if (index >= 0) {
        this._installedContent.cachedDisciplines[index] = discipline;
      } else {
        this._installedContent.cachedDisciplines.push(discipline);
      }
    }

    this.addClan(clan);

    const index = this._installedContent.clans.findIndex(c => c.id === clan.id);
    if (index >= 0) {
      this._installedContent.clans[index] = clan;
    } else {
      this._installedContent.clans.push(clan);
    }

    await this.saveInstalledContent();
  }

  public static async installDiscipline(discipline: IHomebrewDiscipline) {
    this.addDiscipline(discipline);

    const index = this._installedContent.disciplines.findIndex(d => d.id === discipline.id);
    if (index >= 0) {
      this._installedContent.disciplines[index] = discipline;
    } else {
      this._installedContent.disciplines.push(discipline);
    }

    await this.saveInstalledContent();
  }

  public static async uninstallClan(clan: IHomebrewClan) {
    const index = this._installedContent.clans.indexOf(clan);
    if (index >= 0) {
      this._installedContent.clans.splice(index, 1);
    }

    await this.saveInstalledContent();
  }

  public static async uninstallDiscipline(discipline: IHomebrewDiscipline) {
    const index = this._installedContent.disciplines.indexOf(discipline);
    if (index >= 0) {
      this._installedContent.disciplines.splice(index, 1);
    }

    await this.saveInstalledContent();
  }

  public static async updateOwnClan(clan: IHomebrewClan) {
    const index = this._installedContent.ownClans.findIndex(c => c.id === clan.id);
    if (index >= 0) {
      this._installedContent.ownClans[index] = clan;
    } else {
      this._installedContent.ownClans.push(clan);
    }

    await this.saveInstalledContent();
  }

  public static async updateOwnDiscipline(discipline: IHomebrewDiscipline) {
    const index = this._installedContent.ownDisciplines.findIndex(d => d.id === discipline.id);
    if (index >= 0) {
      this._installedContent.ownDisciplines[index] = discipline;
    } else {
      this._installedContent.ownDisciplines.push(discipline);
    }

    await this.saveInstalledContent();
  }

  public static get installedContent() {
    return this._installedContent;
  }

  private static addClan(homebrewClan: IHomebrewClan) {
    for (const book of this.books) {
      const disciplins = homebrewClan.disciplines.map(discipline => this.findDiscipline(book.disciplines, discipline)).filter(discipline => !!discipline) as IDiscipline[];
      const clan: IClan = {
        id: homebrewClan.id + HomebrewIdOffset,
        name: homebrewClan.name,
        slogan: homebrewClan.slogan,
        description: homebrewClan.curse,
        curse: homebrewClan.curse,
        disciplines: disciplins,
        actions: [],
        symbol: homebrewClan.symbol
      };

      const index = book.target.clans.findIndex(c => c.id === clan.id);
      if (index >= 0) {
        book.target.clans[index] = clan;
      } else {
        book.target.clans.push(clan);
      }
    }
  }

  private static addDiscipline(discipline: IHomebrewDiscipline) {
    const index = placeholderClan.disciplines.findIndex(d => d.id === discipline.id + HomebrewIdOffset);
    if (index >= 0) {
      placeholderClan.disciplines[index] = {...discipline, id: discipline.id + HomebrewIdOffset};
    } else {
      placeholderClan.disciplines.push({...discipline, id: discipline.id + HomebrewIdOffset});
    }
  }

  private static findDiscipline(predefindDisciplines: IDiscipline[], id: number) {
    if (id < HomebrewIdOffset) {
      return predefindDisciplines.find(discipline => discipline.id === id);
    }

    return this.findHomebrewDiscipline(id);
  }

  private static findHomebrewDiscipline(id: number) {
    const realid = id >= HomebrewIdOffset ? id - HomebrewIdOffset : id;
    const d = this._installedContent.cachedDisciplines.find(discipline => discipline.id === realid)
      || this._installedContent.ownDisciplines.find(discipline => discipline.id === realid)
      || this._installedContent.disciplines.find(discipline => discipline.id === realid);
    if (d) {
      if (d.id < HomebrewIdOffset) {
        d.id += HomebrewIdOffset;
      }
    }

    return d;
  }

  private static async saveInstalledContent() {
    await Storage.writeStorage("homebrew-content", JSON.stringify(this._installedContent));
  }
}