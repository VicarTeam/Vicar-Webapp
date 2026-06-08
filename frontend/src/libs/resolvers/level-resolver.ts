import {AttributeKeys, type ICharacter, type IDisciplineSelection, LevelType, SkillKeys} from "@/@types/models";
import DataManager from "@/libs/data/data-manager";

type ResolverCallback = (char: ICharacter, data: any) => number;
const registeredResolvers: { [type: number]: ResolverCallback } = {};

class LevelResolver {

  constructor() {
    registeredResolvers[LevelType.Attribute] = this.resolveAttribute.bind(this);
    registeredResolvers[LevelType.Skill] = this.resolveSkill.bind(this);
    registeredResolvers[LevelType.NewSpecialization] = this.resolveSpecialization.bind(this);
    registeredResolvers[LevelType.Trait] = this.resolveTrait.bind(this);
    registeredResolvers[LevelType.ClanDiscipline] = this.resolveClanDiscipline.bind(this);
    registeredResolvers[LevelType.OtherDiscipline] = this.resolveOtherDiscipline.bind(this);
    registeredResolvers[LevelType.CaitiffDiscipline] = this.resolveCaitiffDiscipline.bind(this);
    registeredResolvers[LevelType.BloodPotency] = this.resolveBloodPotency.bind(this);
  }

  public isLevelingTypeAllowed(char: ICharacter, type: LevelType, data: any): boolean {
    if (registeredResolvers[type]) {
      return registeredResolvers[type](char, data) <= char.exp;
    }
    return false;
  }

  public resolveAttribute(char: ICharacter, attr: AttributeKeys): number {
    const newVal = DataManager.getAttributeValue(char, attr) + 1;
    return newVal * 5;
  }

  public resolveSkill(char: ICharacter, skill: SkillKeys): number {
    const newVal = DataManager.getSkillValue(char, skill) + 1;
    return newVal * 3;
  }

  public resolveSpecialization(): number {
    return 3;
  }

  public resolveTrait(): number {
    return 1;
  }

  public resolveClanDiscipline(char: ICharacter, disc: IDisciplineSelection): number {
    if (char.cainsMarkLevel === 5) {
      return disc.currentLevel * 3;
    }

    return disc.currentLevel * 5;
  }

  public resolveOtherDiscipline(char: ICharacter, disc: IDisciplineSelection): number {
    if (char.cainsMarkLevel === 5) {
      return disc.currentLevel * 3;
    }

    return disc.currentLevel * 7;
  }

  public resolveCaitiffDiscipline(char: ICharacter, disc: IDisciplineSelection): number {
    if (char.cainsMarkLevel === 5) {
      return disc.currentLevel * 3;
    }

    return disc.currentLevel * 6;
  }

  public resolveBloodPotency(char: ICharacter): number {
    return (char.bloodPotency + 1) * 10;
  }
}

export const levelResolver = new LevelResolver();
