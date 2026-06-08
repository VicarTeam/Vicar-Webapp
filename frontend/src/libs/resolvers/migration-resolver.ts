import {CurrentCharacterVersion, type ICharacter} from "@/@types/models";
import CharacterStorage from "@/libs/io/character-storage";
import DataManager from "@/libs/data/data-manager";

type ResolverCallback = (char: ICharacter) => void;
const registeredResolvers: { [version: number]: ResolverCallback } = {};

class MigrationResolver {

  constructor() {
    registeredResolvers[0] = this.migrateVersion0.bind(this);
    registeredResolvers[1] = this.migrateVersion0.bind(this);
  }

  public migrate(char: ICharacter) {
    const currentVersion = char["version"] || 0;
    for (let i = currentVersion; i < CurrentCharacterVersion; i++) {
      if (registeredResolvers[i]) {
        registeredResolvers[i]!(char);
      }
    }

    char.version = CurrentCharacterVersion;
    CharacterStorage.saveCharacter(char);
  }

  private migrateVersion0(char: ICharacter) {
    for (const selection of char.disciplines) {
      const discipline = DataManager.getDiscipline(selection.discipline.id);
      if (discipline) {
        selection.discipline = discipline;
      }
    }
  }
}

export const migrationResolver = new MigrationResolver();
