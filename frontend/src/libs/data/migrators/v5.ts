import type {ICharacter, IClan} from "@/@types/models.ts";
import DataManager from "@/libs/data/data-manager.ts";
import type {IDiscipline, IDisciplineAbility} from "@/@types/data.ts";

export class V5DataMigrator {

  public static migrate(char: ICharacter) {
    const newClan = this.getClan(char);
    if (newClan) {
      char.clan = newClan;
    }

    const disciplines = this.getDisciplines();
    for (const ds of char.disciplines) {
      const newDiscipline = disciplines.get(ds.discipline.id);
      if (newDiscipline) {
        ds.discipline = newDiscipline;

        for (const ability of ds.abilities) {
          const newAbility = newDiscipline[ability.level]?.find((a) => a.id === ability.id) as IDisciplineAbility;
          if (newAbility) {
            ability.name = newAbility.name;
            ability.summary = newAbility.summary;
            ability.costs = newAbility.costs;
            ability.diceSupplies = newAbility.diceSupplies;
            ability.system = newAbility.system;
            ability.alternatives = newAbility.alternatives;
            ability.duration = newAbility.duration;
            ability.combination = newAbility.combination;
          }
        }
      }
    }
  }

  private static getDisciplines(): Map<number, IDiscipline> {
    const disciplines = new Map<number, IDiscipline>();
    for (const discipline of DataManager.normalDisciplinesAsArray()) {
      disciplines.set(discipline.id, discipline);
    }
    return disciplines;
  }

  private static getClan(char: ICharacter): IClan|undefined {
    let books: any[] = DataManager.selectedLanguage.books
    if (char) books = books.filter((b) => char.books.includes(b.id))
    return books
      .map((b) => b.clans)
      .flat()
      .find((b: any) => b.id >= 0 && b.id === char.clan.id);
  }
}