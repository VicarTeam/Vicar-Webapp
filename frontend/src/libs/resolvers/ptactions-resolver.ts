import {IFlawChoice, IPTAction, PTActionType} from "@/types/data";
import {ICharacter} from "@/types/models";
import {DisciplinePointActionData} from "@/components/editor/actions/DisciplinePointAction.vue";
import {restrictionResolver} from "@/libs/resolvers/restriction-resolver";

type ResolverCallback = (char: ICharacter, data: any) => boolean;
const registeredResolvers: {[type: string]: ResolverCallback} = {};

const ResolveType = (type: PTActionType) => {
    return (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
        if (descriptor.value) {
            registeredResolvers[type] = (char, data) => descriptor.value.call(target, char, data);
        }
    };
}

const AvailableActions: PTActionType[] = [
    PTActionType.AdditionalSpecialization, PTActionType.DisciplinePoint, PTActionType.AddFlaw,
    PTActionType.SpendBackgroundPointsBetween, PTActionType.SpendFlawPointsBetween
];

class PTActionsResolver {

    public resolve(actions: IPTAction[], char: ICharacter): IPTAction[] {
        return actions.filter(action => {
            if (!AvailableActions.includes(action.type)) {
                return false;
            }

            if (registeredResolvers[action.type]) {
                return registeredResolvers[action.type](char, action.data);
            }

            return true;
        });
    }

    @ResolveType(PTActionType.AddFlaw)
    private resolveAddFlaw(char: ICharacter, data: {choices: IFlawChoice[]}): boolean {
        return data.choices.length > 1;
    }

    @ResolveType(PTActionType.DisciplinePoint)
    private resolveDisciplinePoint(char: ICharacter, data: DisciplinePointActionData): boolean {
        const choices = data.choices.filter(choice => {
            if (choice.restriction) {
                if (!restrictionResolver.resolve(char, choice.restriction)) {
                    return false;
                }
            }
            return true;
        });
        return choices.length > 1;
    }
}

export const ptActionResolver = new PTActionsResolver();
