import type {ICharacter, ICharacterDirectory} from "@/@types/models";
import {v4 as uuidv4} from 'uuid';
import {del, get, patch, post, put} from "@/libs/io/rest";
import {useStore} from "@/app/store";
import router from "@/app/router.ts";
import {initRealtime, onCharacterUpdated} from "@/libs/io/realtime";
import {checkSession} from "@/libs/auth";
import {type IBaseSheet, LevelChangeType} from "@/@types/gameline";
import DataManager from "@/libs/data/data-manager";

let saveDebounce: number | null = null;

export default class CharacterStorage {

  public static loadedCharacters: ICharacter[] = [];
  public static loadedDirectories: ICharacterDirectory[] = [];
  private static initialized: boolean = false;
  /** IDs der Charaktere, deren vollständiger Blob (nicht nur das Listen-Summary) geladen ist. */
  private static fullyLoaded: Set<string> = new Set();

  public static async preloadCharacter(id: string): Promise<true | 'not_found' | 'not_authed'> {
    const result = await checkSession();
    if (result.status === 'not_found') {
      return 'not_authed';
    }

    if (!this.initialized) {
      await this.initialize();
    }

    // Die Liste enthält nur leichte Summaries -> hier den vollen Blob nachladen.
    const full = await this.loadFullCharacter(id);
    if (full === 'not_authed') {
      return 'not_authed';
    }
    if (!full) {
      return 'not_found';
    }

    const store = useStore();
    store.editingCharacter = full;
    return true;
  }

  /**
   * Lädt den vollständigen Charakter-Blob bei Bedarf vom Server und merged ihn in
   * den vorhandenen (Summary-)Listeneintrag, sodass bestehende Referenzen (Karte)
   * erhalten bleiben. Bereits voll geladene Charaktere werden direkt zurückgegeben.
   */
  private static async loadFullCharacter(id: string): Promise<ICharacter | undefined | 'not_authed'> {
    if (this.fullyLoaded.has(id)) {
      return this.loadedCharacters.find(character => character.id === id);
    }

    const [status, full] = await get<ICharacter>(`/characters/${id}`);
    if (status === 401) {
      return 'not_authed';
    }
    if (status >= 400) {
      return undefined;
    }

    let existing = this.loadedCharacters.find(character => character.id === id);
    if (existing) {
      Object.assign(existing, full);
    } else {
      existing = full;
      this.loadedCharacters.push(existing);
    }
    this.fullyLoaded.add(id);
    return existing;
  }

  /** Stellt sicher, dass der vollständige Blob geladen ist, und gibt ihn zurück (z. B. für Klonen/Export). */
  public static async getFullCharacter(id: string): Promise<ICharacter | undefined> {
    const full = await this.loadFullCharacter(id);
    return full === 'not_authed' ? undefined : full;
  }

  public static async initialize() {
    if (this.initialized) {
      return;
    }

    this.initialized = true;

    const [status, res] = await get<{
      characters: ICharacter[];
      sharedCharacters: ICharacter[];
    }>(`/characters`);

    if (status >= 400) {
      if (status === 401) {
        await router.push('/login');
      }
      return;
    }

    this.loadedCharacters.push(...res.characters);
    this.loadedCharacters.push(...res.sharedCharacters.map(character => ({...character, justViewing: true})));

    for (const character of this.loadedCharacters) {
      if (character.directory) {
        if (!this.loadedDirectories.find(directory => directory.id === character.directory)) {
          this.loadedDirectories.push({id: character.directory, name: character.directory, open: true});
        }
      }
    }

    this.initializeUpdatingSocket();
  }

  public static addDirectory(directory: ICharacterDirectory) {
    directory.id = directory.name;
    this.loadedDirectories.push(directory);
    this.loadedDirectories.sort((a, b) => a.name.localeCompare(b.name));
  }

  public static async saveCharacter(character: ICharacter, triggerSync: boolean = false, instant: boolean = false) {
    if (character.justViewing) {
      return;
    }

    // Schutz gegen Datenverlust: ein nur teilgeladenes Summary niemals als vollen
    // Blob zurückspeichern (würde u. a. das eingebettete Regelwerk in der DB
    // überschreiben). Voll geladen wird über den Viewer (preloadCharacter) oder
    // beim Neuanlegen/Import (addCharacter).
    if (!this.fullyLoaded.has(character.id)) {
      console.warn("saveCharacter abgebrochen: Charakter nicht vollständig geladen", character.id);
      return;
    }

    if (instant) {
      const [status, _] = await put(`/characters/${character.id}`, character);
      if (status >= 400) {
        console.error("Failed to save character");
      }
      return;
    }

    if (saveDebounce) {
      clearTimeout(saveDebounce);
    }

    saveDebounce = setTimeout(async () => {
      const [status, _] = await put(`/characters/${character.id}`, character);
      if (status >= 400) {
        console.error("Failed to save character");
      }
    }, 1000);
  }

  /**
   * Persistiert nur die Ordner-Zuordnung (Drag-&-Drop in der Liste). Nutzt einen
   * gezielten PATCH statt eines vollen PUT, da in der Liste evtl. nur ein Summary
   * geladen ist und ein volles PUT den Blob überschreiben würde.
   */
  public static async saveDirectory(character: ICharacter, directory: string | undefined) {
    if (character.justViewing) {
      return;
    }
    const [status] = await patch(`/characters/${character.id}/directory`, {directory: directory ?? null});
    if (status >= 400) {
      console.error("Failed to update character directory");
    }
  }

  public static async addCharacter(character: ICharacter): Promise<string | undefined> {
    const [status, res] = await post<{ id: string }>(`/characters`, character);
    if (status >= 400) {
      return;
    }

    character.id = res.id;
    // Neu angelegte/importierte Charaktere liegen lokal vollständig vor.
    this.fullyLoaded.add(character.id);
    this.loadedCharacters.push(character);

    if (character.directory && !this.loadedDirectories.find(directory => directory.id === character.directory)) {
      this.loadedDirectories.push({id: character.directory, name: character.directory, open: true});
    }

    return character.id;
  }

  public static async removeCharacter(character: ICharacter) {
    const [status, _] = await del(`/characters/${character.id}`);
    if (status >= 400) {
      return;
    }

    let index = this.loadedCharacters.indexOf(character);
    if (index >= 0) {
      this.loadedCharacters.splice(index, 1);
    }
  }

  public static getSortedCharacters(): { directory: ICharacterDirectory | null, characters: ICharacter[] }[] {
    const directories: { directory: ICharacterDirectory | null, characters: ICharacter[] }[] = [];

    const characters = this.loadedCharacters.filter(character => !character.directory || !this.loadedDirectories.find(directory => directory.id === character.directory)).sort((a, b) => a.name.localeCompare(b.name));
    const sharedChars = characters.filter(c => c.justViewing);
    const ownChars = characters.filter(c => !c.justViewing);
    sharedChars.sort((a, b) => a.name.localeCompare(b.name));
    ownChars.sort((a, b) => a.name.localeCompare(b.name));

    if (ownChars.length > 0) {
      directories.push({characters: ownChars, directory: null});
    }

    if (sharedChars.length > 0) {
      directories.push({characters: sharedChars,
        directory: {
          id: '@shared-chars',
          name: 'Geteilte Charaktere',
          open: localStorage.getItem('vicar::shared-chars-open') === "1"
        }
      });
    }

    this.loadedDirectories.forEach(directory => {
      const characters = this.loadedCharacters.filter(character => character.directory === directory.id).sort((a, b) => a.name.localeCompare(b.name));
      directories.push({directory, characters});
    });

    return directories;
  }

  public static async migrateCharacters() {
    const newDirectoryIds: { [old: string]: string } = {};

    const directories = localStorage.getItem("character-directories");
    if (directories) {
      const oldDirectories = JSON.parse(directories);
      oldDirectories.forEach((directory: ICharacterDirectory) => {
        if (this.loadedDirectories.find(d => d.id === directory.id)) {
          newDirectoryIds[directory.id] = uuidv4();
        }
        directory.id = newDirectoryIds[directory.id] || directory.id;
        this.loadedDirectories.push(directory);
      });

      this.loadedDirectories.sort((a, b) => a.name.localeCompare(b.name));
    }

    const characterIds = localStorage.getItem("character-ids");
    if (characterIds) {
      const oldCharacterIds = JSON.parse(characterIds);

      oldCharacterIds.forEach((id: string) => {
        const characterJson = localStorage.getItem("character-" + id);
        if (characterJson) {
          const character = JSON.parse(characterJson);
          if (character) {
            this.addCharacter(character);
          }
        }
      });
    }
  }

  public static trackLevelChange(char: IBaseSheet, type: LevelChangeType, costs: number, changeText: string) {
    if (!DataManager.isTrackingDisabled) {
      const beforeExp = char.exp;
      const afterExp = char.exp - costs;

      char.levelHistory = char.levelHistory || [];
      char.levelHistory.push({
        type,
        date: new Date().toISOString(),
        text: changeText,
        exp: {
          before: beforeExp,
          after: afterExp,
          used: costs
        }
      });

      char.usedExp = char.usedExp || 0;
      char.usedExp += costs;
    }

    char.exp -= costs;
  }

  private static initializeUpdatingSocket() {
    initRealtime();
    onCharacterUpdated((character: ICharacter) => this.updateCharacter(character));
  }

  private static updateCharacter(char: ICharacter) {
    const existing = this.loadedCharacters.find(character => character.id === char.id);
    if (existing) {
      Object.assign(existing, char);


      const store = useStore();

      if (store.editingCharacter) {
        if (store.editingCharacter.id === char.id) {
          store.editingCharacter = existing;
        }
      }
    }
  }
}
