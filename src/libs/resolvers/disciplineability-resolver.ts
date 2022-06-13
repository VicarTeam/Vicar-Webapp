import {IDisciplineAbility, IDisciplineCombo} from "@/types/data";
import {ICharacter} from "@/types/models";

type ResolverCallback = (char: ICharacter, data: any) => boolean;
const registeredResolvers: {[type: string]: ResolverCallback} = {};

const ResolveRestriction = (dataKey: keyof IDisciplineAbility) => {
    return (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
        if (descriptor.value) {
            registeredResolvers[dataKey] = (char, data) => descriptor.value.call(target, char, data);
        }
    };
}

class DisciplineAbilityResolver {

    public resolve(char: ICharacter, ability: IDisciplineAbility): boolean {
        for (let [key, value] of Object.entries(ability)) {
            if (registeredResolvers[key] && value) {
                if (!registeredResolvers[key](char, value)) {
                    return false;
                }
            }
        }
        return true;
    }

    @ResolveRestriction("requirement")
    private resolveRequirement(char: ICharacter, requirement: number): boolean {
        for (let discipline of char.disciplines) {
            if (discipline.abilities.find(ability => ability.id === requirement)) {
                return true;
            }
        }
        return false;
    }

    @ResolveRestriction("combination")
    private resolveCombination(char: ICharacter, combination: IDisciplineCombo): boolean {
        return !!char.disciplines.find(s => s.discipline.id === combination.id && s.points >= combination.level);
    }
}

export const disciplineAbilityResolver = new DisciplineAbilityResolver();
