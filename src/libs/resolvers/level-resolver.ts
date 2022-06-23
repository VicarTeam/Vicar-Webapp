import {AttributeKeys, ICharacter, IDisciplineSelection, LevelType, SkillKeys} from "@/types/models";
import DataManager from "@/libs/data-manager";

type ResolverCallback = (char: ICharacter, data: any) => number;
const registeredResolvers: {[type: number]: ResolverCallback} = {};

const ResolveType = (type: LevelType) => {
    return (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
        if (descriptor.value) {
            registeredResolvers[type] = (char, data) => descriptor.value.call(target, char, data);
        }
    };
}

class LevelResolver {

    public isLevelingTypeAllowed(char: ICharacter, type: LevelType, data: any): boolean {
        if (registeredResolvers[type]) {
            return registeredResolvers[type](char, data) <= char.exp;
        }
        return false;
    }

    @ResolveType(LevelType.Attribute)
    public resolveAttribute(char: ICharacter, attr: AttributeKeys): number {
        const newVal = DataManager.getAttributeValue(char, attr) + 1;
        return newVal * 5;
    }

    @ResolveType(LevelType.Skill)
    public resolveSkill(char: ICharacter, skill: SkillKeys): number {
        const newVal = DataManager.getSkillValue(char, skill) + 1;
        return newVal * 3;
    }

    @ResolveType(LevelType.NewSpecialization)
    public resolveSpecialization(): number {
        return 3;
    }

    @ResolveType(LevelType.Trait)
    public resolveTrait(): number {
        return 1;
    }

    @ResolveType(LevelType.ClanDiscipline)
    public resolveClanDiscipline(char: ICharacter, disc: IDisciplineSelection): number {
        return disc.currentLevel * 5;
    }

    @ResolveType(LevelType.OtherDiscipline)
    public resolveOtherDiscipline(char: ICharacter, disc: IDisciplineSelection): number {
        return disc.currentLevel * 7;
    }

    @ResolveType(LevelType.CaitiffDiscipline)
    public resolveCaitiffDiscipline(char: ICharacter, disc: IDisciplineSelection): number {
        return disc.currentLevel * 6;
    }

    @ResolveType(LevelType.BloodPotency)
    public resolveBloodPotency(char: ICharacter): number {
        return (char.bloodPotency + 1) * 10;
    }
}

export const levelResolver = new LevelResolver();
