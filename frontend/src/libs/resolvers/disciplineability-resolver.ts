import type {IDisciplineAbility, IDisciplineCombo} from "@/@types/data";
import type {ICharacter, IDisciplineSelection} from "@/@types/models";

type ResolverCallback = (char: ICharacter, data: any, dicipline: IDisciplineSelection) => boolean;
const registeredResolvers: { [type: string]: ResolverCallback } = {};

class DisciplineAbilityResolver {

  constructor() {
    registeredResolvers["minBloodPotency"] = this.resolveMinBloodPotency.bind(this);
    registeredResolvers["requirement"] = this.resolveRequirement.bind(this);
    registeredResolvers["combination"] = this.resolveCombination.bind(this);
  }

  public resolve(char: ICharacter, dicipline: IDisciplineSelection, ability: IDisciplineAbility): boolean {
    for (let [key, value] of Object.entries(ability)) {
      if (registeredResolvers[key] && value) {
        if (!registeredResolvers[key](char, value, dicipline)) {
          return false;
        }
      }
    }
    return true;
  }

  private resolveMinBloodPotency(char: ICharacter, data: number, dicipline: IDisciplineSelection): boolean {
    if (!dicipline) {
      return false;
    }
    return char.bloodPotency >= data;
  }

  private resolveRequirement(char: ICharacter, requirement: number, dicipline: IDisciplineSelection): boolean {
    if (!dicipline) {
      return false;
    }

    return !!dicipline.abilities.find(ability => ability.id === requirement);
  }

  private resolveCombination(char: ICharacter, combination: IDisciplineCombo): boolean {
    return !!char.disciplines.find(s => s.discipline.id === combination.id && s.currentLevel - 1 >= combination.level);
  }
}

export const disciplineAbilityResolver = new DisciplineAbilityResolver();
