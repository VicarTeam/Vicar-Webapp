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
  private static readonly syncInterval = 1000 * 30;
  private static map: SyncMap = {
    outs: {},
    ins: {}
  };

  public static async initialize() {
    const storage = await Storage.readStorage("vicar-sync");
    if (storage) {
      this.map = JSON.parse(storage);

      //TODO send all rooms to server
    }
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

  private static syncCharacter(char: ICharacter) {
    const roomId = this.map.outs[char.id];
    const data = this.getCharData(char);
    if (this.lastSyncedData[roomId] === data) {
      return;
    }

    this.lastSyncedData[roomId] = data;

    VicarNet.postCharSync(roomId, data).then().catch(e => console.error(e));
  }

  private static async resolveInCharacter(message: string) {
    const split = message.split("@");
    const roomId = split[0];
    const data = split[1];

    const charId = this.map.ins[roomId];
    if (!charId) {
      return;
    }

    const existing = CharacterStorage.loadedCharacters.find(c => c.id === charId);
    if (existing) {
      this.applyCharData(existing, data);

      CharacterStorage.saveCharacter(existing);

      EventBus.$emit("character-updated", existing.id);
    }
  }

  private static getCharData(char: ICharacter): string {
    return btoa(JSON.stringify({
      hunger: char.hunger,
      health: char.health,
      healthDamage: char.healthDamage,
      willpower: char.willpower,
      willpowerDamage: char.willpowerDamage,
      humanity: char.humanity,
      stains: char.stains,
      inventory: char.inventory,
    }));
  }

  private static applyCharData(char: ICharacter, base64: string) {
    const data = JSON.parse(atob(base64));
    char.hunger = data.hunger;
    char.health = data.health;
    char.healthDamage = data.healthDamage;
    char.willpower = data.willpower;
    char.willpowerDamage = data.willpowerDamage;
    char.humanity = data.humanity;
    char.stains = data.stains;
    char.inventory = data.inventory;
  }
}