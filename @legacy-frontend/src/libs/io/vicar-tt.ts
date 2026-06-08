import {ICharacter} from "@/types/models";
import {VicarNet} from "@/libs/io/vicar-net";

export interface DiceRollMessage {
  vampire: {
    name: string;
    avatar: string;
  };
  roll: {
    title: string;
    normalDices: number;
    hungerDices: number;
    difficulty?: number;
  };
}

export class VicarTT {
  public static rollNamedDiceFor(char: ICharacter, title: string, normalDices: number, hungerDices: number, difficulty?: number) {
    if (!char.connectedFoundryId || char.connectedFoundryId.length === 0) {
      return;
    }

    VicarNet.postDiceRoll(char.connectedFoundryId, {
      vampire: {
        name: char.name,
        avatar: char.avatar
      },
      roll: {
        title: title,
        normalDices, hungerDices, difficulty
      }
    }).then().catch(reason => {
      console.error(reason);
    });
  }

  public static rollDiceFor(char: ICharacter, normalDices: number, hungerDices: number, difficulty?: number) {
    this.rollNamedDiceFor(char, "Custom Dice Roll", normalDices, hungerDices, difficulty)
  }
}