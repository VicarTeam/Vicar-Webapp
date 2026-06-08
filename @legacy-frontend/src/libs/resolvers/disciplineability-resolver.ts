import {IDisciplineAbility, IDisciplineCombo} from "@/types/data";
import {ICharacter, IDisciplineSelection} from "@/types/models";

type ResolverCallback = (char: ICharacter, data: any, dicipline: IDisciplineSelection) => boolean;
const registeredResolvers: {[type: string]: ResolverCallback} = {};

const ResolveRestriction = (dataKey: keyof IDisciplineAbility) => {
    return (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
        if (descriptor.value) {
            registeredResolvers[dataKey] = (char, data, ability) => descriptor.value.call(target, char, data, ability);
        }
    };
}

class DisciplineAbilityResolver {

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

    @ResolveRestriction("minBloodPotency")
    private resolveMinBloodPotency(char: ICharacter, data: number, dicipline: IDisciplineSelection): boolean {
        if (!dicipline) {
            return false;
        }
        return char.bloodPotency >= data;
    }

    @ResolveRestriction("requirement")
    private resolveRequirement(char: ICharacter, requirement: number, dicipline: IDisciplineSelection): boolean {
        if (!dicipline) {
            return false;
        }

        return !!dicipline.abilities.find(ability => ability.id === requirement);
    }

    @ResolveRestriction("combination")
    private resolveCombination(char: ICharacter, combination: IDisciplineCombo): boolean {
        return !!char.disciplines.find(s => s.discipline.id === combination.id && s.currentLevel - 1 >= combination.level);
    }
}

export const disciplineAbilityResolver = new DisciplineAbilityResolver();
