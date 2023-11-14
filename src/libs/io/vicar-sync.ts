import {Storage} from "@/libs/io/storage";
import {ICharacter} from "@/types/models";
import {VicarNet} from "@/libs/io/vicar-net";
import CharacterStorage from "@/libs/io/character-storage";
import EventBus from "@/libs/event-bus";

interface SyncMap {
  outs: {[key: string]: string};
  ins: {[key: string]: string};
}

export class VicarSync {

  private static readonly lastSyncedData: {[key: string]: string} = {};
  private static readonly syncIntervals: {[key: string]: number} = {};
  private static readonly syncInterval = 1000 * 5;
  private static readonly retrieveInterval = 1000 * 10;

  private static currentlyLevelingCharHash: string | undefined;
  private static lastLevelingCharHash: string | undefined;
  private static retrieveIntervalId: number | undefined;
  private static map: SyncMap = {
    outs: {},
    ins: {}
  };

  public static async initialize() {
    const storage = await Storage.readStorage("vicar-sync");
    if (storage) {
      this.map = JSON.parse(storage);

      if (Object.keys(this.map.ins).length > 0) {
        this.startRetrieveInterval();
      }
    }
  }

  public static isCharacterSyncedOut(char: ICharacter): boolean {
    return !!this.map.outs[char.id];
  }

  public static async enableCharacterOutSync(char: ICharacter): Promise<string | undefined> {
    if (this.map.outs[char.id]) {
      return;
    }

    const hash = this.computeCharSyncOutId(char);

    this.map.outs[char.id] = hash;
    await this.save();

    return hash;
  }

  public static async disableCharacterOutSync(char: ICharacter) {
    if (!this.map.outs[char.id]) {
      return;
    }

    delete this.map.outs[char.id];
    await this.save();
  }

  public static getCharacterSyncOutId(char: ICharacter): string {
    return this.map.outs[char.id] || "";
  }

  public static isCharacterSyncedIn(char: ICharacter): boolean {
    const roomId = this.findCharSyncOutHashByInCharacter(char);
    return !!roomId;
  }

  public static async unsyncCharacterIn(char: ICharacter) {
    const roomId = this.findCharSyncOutHashByInCharacter(char);
    if (!roomId) {
      return;
    }

    delete this.map.ins[roomId];
    await this.save();

    if (Object.keys(this.map.ins).length <= 0) {
      this.stopRetrieveInterval();
    }
  }

  public static async syncCharacterIn(char: ICharacter, roomId: string) {
    if (this.map.ins[roomId]) {
      return;
    }

    this.map.ins[roomId] = char.id;
    await this.save();

    if (Object.keys(this.map.ins).length > 0 && !this.retrieveIntervalId) {
      this.startRetrieveInterval();
    }
  }

  public static beginCharacterLevelSync(char: ICharacter) {
    if (!this.map.outs[char.id]) {
      return;
    }

    this.currentlyLevelingCharHash = this.getLevelData(char);
  }

  public static endCharacterLevelSync(char: ICharacter) {
    if (!this.currentlyLevelingCharHash) {
      return;
    }

    const levelData = this.getLevelData(char);
    if (this.currentlyLevelingCharHash === levelData) {
      this.currentlyLevelingCharHash = undefined;
      return;
    }

    if (this.lastLevelingCharHash === levelData) {
      return;
    }

    this.currentlyLevelingCharHash = undefined;
    this.lastLevelingCharHash = levelData;

    VicarNet.postCharLevelSync(this.map.outs[char.id], levelData).then().catch(e => console.error(e));
  }

  public static triggerCharacterSync(char: ICharacter) {
    if (!this.map.outs[char.id]) {
      return;
    }

    if (this.syncIntervals[char.id]) {
      clearTimeout(this.syncIntervals[char.id]);
    }

    this.syncIntervals[char.id] = setTimeout(() => {
      this.syncCharacter(char);
    }, this.syncInterval);
  }

  public static startRetrieveInterval() {
    this.stopRetrieveInterval();

    this.retrieveIntervalId = setInterval(async () => {
      await this.retrieveCharacters();
    }, this.retrieveInterval);
  }

  public static stopRetrieveInterval() {
    if (this.retrieveIntervalId) {
      clearInterval(this.retrieveIntervalId);
    }
  }

  private static syncCharacter(char: ICharacter) {
    const roomId = this.map.outs[char.id];
    const data = this.getCharData(char);
    if (this.lastSyncedData[roomId] === data) {
      return;
    }

    this.lastSyncedData[roomId] = data;

    VicarNet.postCharSync(roomId, data).then().catch(e => console.error(e));
  }

  private static async retrieveCharacters() {
    const ids = Object.keys(this.map.ins);
    if (ids.length <= 0) {
      return;
    }

    const chars = await VicarNet.retrieveCharSyncs(ids);
    for (const [roomId, data] of Object.entries(chars)) {
      if (data.c) {
        await this.resolveInCharacter(roomId, data.c, false);
      }

      if (data.l) {
        await this.resolveInCharacter(roomId, data.l, true);
      }
    }
  }

  private static async resolveInCharacter(roomId: string, data: string, isLevel: boolean) {
    const charId = this.map.ins[roomId];
    if (!charId) {
      return;
    }

    const existing = CharacterStorage.loadedCharacters.find(c => c.id === charId);
    if (existing) {
      (isLevel ? this.applyLevelData : this.applyCharData)(existing, data);

      CharacterStorage.saveCharacter(existing);

      EventBus.$emit("character-updated", existing.id);
    }
  }

  private static getCharData(char: ICharacter): string {
    return btoa(encodeURIComponent(JSON.stringify({
      hunger: char.hunger,
      health: char.health,
      healthDamage: char.healthDamage,
      willpower: char.willpower,
      willpowerDamage: char.willpowerDamage,
      humanity: char.humanity,
      stains: char.stains,
      inventory: char.inventory,
    })));
  }

  private static applyCharData(char: ICharacter, base64: string) {
    const data = JSON.parse(decodeURIComponent(atob(base64)));
    char.hunger = data.hunger;
    char.health = data.health;
    char.healthDamage = data.healthDamage;
    char.willpower = data.willpower;
    char.willpowerDamage = data.willpowerDamage;
    char.humanity = data.humanity;
    char.stains = data.stains;
    char.inventory = data.inventory;
  }

  private static getLevelData(char: ICharacter): string {
    return btoa(encodeURIComponent(JSON.stringify({
      clan: char.clan,
      disciplines: char.disciplines,
      bloodPotency: char.bloodPotency,
      categories: char.categories,
      merits: char.merits,
      backgrounds: char.backgrounds,
      bloodRituals: char.bloodRituals,
      oblivionCeremonies: char.oblivionCeremonies,
      exp: char.exp,
      usedExp: char.usedExp
    })));
  }

  private static applyLevelData(char: ICharacter, base64: string) {
    const data = JSON.parse(decodeURIComponent(atob(base64)));
    char.clan = data.clan;
    char.disciplines = data.disciplines;
    char.bloodPotency = data.bloodPotency;
    char.categories = data.categories;
    char.merits = data.merits;
    char.backgrounds = data.backgrounds;
    char.bloodRituals = data.bloodRituals;
    char.oblivionCeremonies = data.oblivionCeremonies;
    char.exp = data.exp;
    char.usedExp = data.usedExp;
  }

  private static computeCharSyncOutId(char: ICharacter): string {
    const id1 = char.id;
    const id2 = Date.now().toString(36);
    const id3 = Math.floor(Math.random() * 1000).toString(36);
    const id = `${id1}${id2}${id3}`;
    const base64 = btoa(id);
    return base64.replace(/=/g, "");
  }

  private static findCharSyncOutHashByInCharacter(char: ICharacter): string|undefined {
    const pair = Object.entries(this.map.ins).find(([roomId, charId]) => charId === char.id);
    if (!pair) {
      return;
    }

    return pair[0];
  }

  private static async save() {
    await Storage.writeStorage("vicar-sync", JSON.stringify(this.map));
  }
}