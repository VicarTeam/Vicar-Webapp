import type {ICharacter, ICharacterDirectory, IFolder} from "@/@types/models";
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
  /** Echte, verschachtelbare Ordner (neues System). */
  public static loadedFolders: IFolder[] = [];
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

    await this.loadFolders();

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

    await this.removeCharacterFromFolders(character.id);
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

  private static folderOpenStorageKey = "vicar::folders-open";

  private static readFolderOpenState(): Record<string, boolean> {
    try {
      const raw = localStorage.getItem(this.folderOpenStorageKey);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // ignore
    }
    return {};
  }

  private static persistFolderOpenState() {
    const map: Record<string, boolean> = {};
    for (const folder of this.loadedFolders) {
      map[folder.id] = folder.open !== false;
    }
    try {
      localStorage.setItem(this.folderOpenStorageKey, JSON.stringify(map));
    } catch {
      // ignore
    }
  }

  /**
   * Laedt die Ordner des Nutzers. Fehlt der Endpunkt (aeltere Backends), bleibt
   * die Liste leer und nur das alte, abgeleitete Ordnersystem greift.
   */
  private static async loadFolders() {
    const [status, res] = await get<IFolder[]>(`/folders`);
    if (status >= 400 || !Array.isArray(res)) {
      return;
    }
    const openState = this.readFolderOpenState();
    this.loadedFolders = res.map(folder => ({
      ...folder,
      characters: Array.isArray(folder.characters) ? folder.characters : [],
      open: openState[folder.id] !== false,
    }));
  }

  private static folderedCharacterIds(): Set<string> {
    const ids = new Set<string>();
    for (const folder of this.loadedFolders) {
      for (const id of folder.characters) {
        ids.add(id);
      }
    }
    return ids;
  }

  public static folderOfCharacter(characterId: string): IFolder | undefined {
    return this.loadedFolders.find(folder => folder.characters.includes(characterId));
  }

  public static rootFolders(): IFolder[] {
    return this.loadedFolders.filter(folder => !folder.parentId).sort((a, b) => a.position - b.position);
  }

  public static subFolders(parentId: string): IFolder[] {
    return this.loadedFolders.filter(folder => folder.parentId === parentId).sort((a, b) => a.position - b.position);
  }

  public static charactersInFolder(folder: IFolder): ICharacter[] {
    const byId = new Map(this.loadedCharacters.map(character => [character.id, character]));
    const out: ICharacter[] = [];
    for (const id of folder.characters) {
      const character = byId.get(id);
      // Auch geteilte (nur ansehbare) Charaktere duerfen in Ordnern liegen - die
      // Zuordnung lebt im Ordner, der Charakter selbst wird nie veraendert.
      if (character) {
        out.push(character);
      }
    }
    return out;
  }

  /**
   * Gruppen fuer die Wurzel-Ebene, die NICHT im neuen Ordnersystem liegen:
   * lose eigene Charaktere, die alten (flachen) directory-Ordner und die
   * geteilten Charaktere. Charaktere in einem neuen Ordner erscheinen hier nicht.
   */
  public static getUnfolderedGroups(): { directory: ICharacterDirectory | null, characters: ICharacter[] }[] {
    const foldered = this.folderedCharacterIds();
    const groups: { directory: ICharacterDirectory | null, characters: ICharacter[] }[] = [];

    const candidates = this.loadedCharacters.filter(character => !foldered.has(character.id));
    const byName = (a: ICharacter, b: ICharacter) => a.name.localeCompare(b.name);

    const looseOwn = candidates.filter(character => !character.justViewing && !character.directory).sort(byName);
    if (looseOwn.length > 0) {
      groups.push({directory: null, characters: looseOwn});
    }

    const legacyDirectories = new Map<string, ICharacter[]>();
    for (const character of candidates) {
      if (character.justViewing || !character.directory) {
        continue;
      }
      const list = legacyDirectories.get(character.directory) ?? [];
      list.push(character);
      legacyDirectories.set(character.directory, list);
    }
    [...legacyDirectories.keys()].sort((a, b) => a.localeCompare(b)).forEach(key => {
      const existing = this.loadedDirectories.find(directory => directory.id === key);
      groups.push({
        directory: {id: key, name: key, open: existing ? existing.open : true},
        characters: legacyDirectories.get(key)!.sort(byName),
      });
    });

    const shared = candidates.filter(character => character.justViewing).sort(byName);
    if (shared.length > 0) {
      groups.push({
        characters: shared,
        directory: {
          id: '@shared-chars',
          name: 'Geteilte Charaktere',
          open: localStorage.getItem('vicar::shared-chars-open') === "1",
        },
      });
    }

    return groups;
  }

  public static async createFolder(name: string, parentId: string = ""): Promise<IFolder | undefined> {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    const siblings = this.loadedFolders.filter(folder => folder.parentId === parentId);
    const position = siblings.reduce((max, folder) => Math.max(max, folder.position), 0) + 1;

    const [status, res] = await post<IFolder>(`/folders`, {name: trimmed, parentId, position, characters: []});
    if (status >= 400 || !res) {
      return;
    }
    const folder: IFolder = {...res, characters: res.characters ?? [], open: true};
    this.loadedFolders.push(folder);
    this.persistFolderOpenState();
    return folder;
  }

  public static async saveFolder(folder: IFolder): Promise<void> {
    const [status] = await put(`/folders/${folder.id}`, {
      name: folder.name,
      parentId: folder.parentId,
      position: folder.position,
      characters: folder.characters,
    });
    if (status >= 400) {
      console.error("Failed to save folder");
    }
  }

  public static async renameFolder(folder: IFolder, name: string): Promise<void> {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    folder.name = trimmed;
    await this.saveFolder(folder);
  }

  public static async deleteFolder(folder: IFolder): Promise<void> {
    const [status] = await del(`/folders/${folder.id}`);
    if (status >= 400) {
      console.error("Failed to delete folder");
      return;
    }
    this.loadedFolders = this.loadedFolders.filter(entry => entry.id !== folder.id);
    this.persistFolderOpenState();
  }

  public static toggleFolderOpen(folder: IFolder) {
    const isOpen = folder.open !== false;
    folder.open = !isOpen;
    this.persistFolderOpenState();
  }

  /** Ist `folderId` gleich `ancestorId` oder ein Nachfahre davon? (Zyklus-Schutz.) */
  public static isFolderDescendant(folderId: string, ancestorId: string): boolean {
    let current: IFolder | undefined = this.loadedFolders.find(folder => folder.id === folderId);
    const guard = new Set<string>();
    while (current) {
      if (current.id === ancestorId) {
        return true;
      }
      if (!current.parentId || guard.has(current.id)) {
        return false;
      }
      guard.add(current.id);
      current = this.loadedFolders.find(folder => folder.id === current!.parentId);
    }
    return false;
  }

  private static positionForIndex(siblings: IFolder[], index: number): number {
    const before = index > 0 ? siblings[index - 1]?.position ?? null : null;
    const after = index < siblings.length ? siblings[index]?.position ?? null : null;
    if (before === null && after === null) {
      return 0;
    }
    if (before === null) {
      return (after as number) - 1;
    }
    if (after === null) {
      return before + 1;
    }
    return (before + after) / 2;
  }

  public static async moveFolder(folder: IFolder, newParentId: string, index: number): Promise<void> {
    if (this.isFolderDescendant(newParentId, folder.id)) {
      return;
    }
    const siblings = this.loadedFolders
      .filter(entry => entry.parentId === newParentId && entry.id !== folder.id)
      .sort((a, b) => a.position - b.position);
    const clamped = Math.max(0, Math.min(index, siblings.length));
    folder.parentId = newParentId;
    folder.position = this.positionForIndex(siblings, clamped);
    await this.saveFolder(folder);
  }

  public static async addCharacterToFolder(folderId: string, characterId: string, index?: number): Promise<void> {
    const target = this.loadedFolders.find(folder => folder.id === folderId);
    if (!target) {
      return;
    }
    const source = this.loadedFolders.find(folder => folder.id !== folderId && folder.characters.includes(characterId));
    if (source) {
      source.characters = source.characters.filter(id => id !== characterId);
      await this.saveFolder(source);
    }
    target.characters = target.characters.filter(id => id !== characterId);
    const at = index === undefined || index < 0 || index > target.characters.length ? target.characters.length : index;
    target.characters.splice(at, 0, characterId);
    await this.saveFolder(target);
  }

  public static async removeCharacterFromFolders(characterId: string): Promise<void> {
    const source = this.folderOfCharacter(characterId);
    if (!source) {
      return;
    }
    source.characters = source.characters.filter(id => id !== characterId);
    await this.saveFolder(source);
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
