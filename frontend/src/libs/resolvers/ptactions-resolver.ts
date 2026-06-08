import {type IFlawChoice, type IPTAction, type IRestriction, PTActionType} from "@/@types/data";
import type {ICharacter} from "@/@types/models";
import {restrictionResolver} from "@/libs/resolvers/restriction-resolver";

export type DisciplinePointActionData = {
  choices: { id: number; restriction?: IRestriction }[]
}

type ResolverCallback = (char: ICharacter, data: any) => boolean;
const registeredResolvers: { [type: string]: ResolverCallback } = {};

const AvailableActions: PTActionType[] = [
  PTActionType.AdditionalSpecialization, PTActionType.DisciplinePoint, PTActionType.AddFlaw,
  PTActionType.SpendBackgroundPointsBetween, PTActionType.SpendFlawPointsBetween
];

class PTActionsResolver {

  constructor() {
    registeredResolvers[PTActionType.AddFlaw] = this.resolveAddFlaw.bind(this);
    registeredResolvers[PTActionType.DisciplinePoint] = this.resolveDisciplinePoint.bind(this);
  }

  public resolve(actions: IPTAction[], char: ICharacter): IPTAction[] {
    return actions.filter(action => {
      if (!AvailableActions.includes(action.type)) {
        return false;
      }

      if (registeredResolvers[action.type]) {
        return registeredResolvers[action.type]!(char, action.data);
      }

      return true;
    });
  }

  private resolveAddFlaw(char: ICharacter, data: { choices: IFlawChoice[] }): boolean {
    return data.choices.length > 1;
  }

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
