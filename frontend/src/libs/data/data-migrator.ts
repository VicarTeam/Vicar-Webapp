import {GameLine, type IBaseSheet} from "@/@types/gameline.ts";
import {DataSync} from "@/libs/data/data-sync.ts";
import CharacterStorage from "@/libs/io/character-storage.ts";
import {V5DataMigrator} from "@/libs/data/migrators/v5.ts";

export class DataMigrator {

  public static needsMigration(char: IBaseSheet): boolean {
    if (!char.dataVersion) {
      return true;
    }
    if (!DataSync.dataVersion) {
      return false;
    }
    return DataSync.dataVersion !== char.dataVersion;
  }

  public static async migrate(char: IBaseSheet): Promise<void> {
    if (char.game === GameLine.Vampire || !char.game) {
      V5DataMigrator.migrate(char as any);
      char.dataVersion = DataSync.dataVersion!;
      await CharacterStorage.saveCharacter(char as any, false, true);
    }
  }
}