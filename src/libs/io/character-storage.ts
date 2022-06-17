import {ICharacter} from "@/types/models";
//@ts-ignore
import { v4 as uuidv4 } from 'uuid';

export default class CharacterStorage {

    private static loadedCharacterIds: string[] = [];
    public static loadedCharacters: ICharacter[] = [];

    public static initialize() {
        const characterIds = localStorage.getItem("character-ids");
        if (characterIds) {
            this.loadedCharacterIds = JSON.parse(characterIds);
        }

        this.loadedCharacterIds.forEach(id => {
            const character = localStorage.getItem("character-" + id);
            if (character) {
                this.loadedCharacters.push(JSON.parse(character));
            }
        });
    }

    public static addCharacter(character: ICharacter): string {
        character.id = uuidv4();

        this.loadedCharacterIds.push(character.id);
        this.saveCharacterIds();

        this.loadedCharacters.push(character);
        localStorage.setItem("character-" + character.id, JSON.stringify(character));

        return character.id;
    }

    public static removeCharacter(character: ICharacter) {
        let index = this.loadedCharacterIds.indexOf(character.id);
        if (index >= 0) {
            this.loadedCharacterIds.splice(index, 1);
            this.saveCharacterIds();

            index = this.loadedCharacters.indexOf(character);
            if (index >= 0) {
                this.loadedCharacters.splice(index, 1);

                localStorage.removeItem("character-" + character.id);
            }
        }
    }

    private static saveCharacterIds() {
        localStorage.setItem("character-ids", JSON.stringify(this.loadedCharacterIds));
    }
}
