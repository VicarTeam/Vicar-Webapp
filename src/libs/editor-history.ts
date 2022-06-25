import {ICharacter} from "@/types/models";

export class EditorHistory {

    private static _history: ICharacter[] = [];

    public static push(character: ICharacter) {
        this._history.push(JSON.parse(JSON.stringify(character)));
    }

    public static pop(): ICharacter {
        return this._history.pop()!;
    }

    public static clear() {
        this._history = [];
    }
}
