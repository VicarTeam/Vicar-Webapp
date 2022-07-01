import {ICharacter, ICharacterDirectory} from "@/types/models";
//@ts-ignore
import {v4 as uuidv4} from 'uuid';
import {vicarPlay} from "@/libs/vicarplay/vicar-play";

export default class CharacterStorage {

    private static loadedCharacterIds: string[] = [];
    public static loadedCharacters: ICharacter[] = [];
    public static loadedDirectories: ICharacterDirectory[] = [];

    public static initialize() {
        const directories = localStorage.getItem("character-directories");
        if (directories) {
            this.loadedDirectories = JSON.parse(directories);
            this.loadedDirectories.sort((a, b) => a.name.localeCompare(b.name));
        }

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

    public static addDirectory(directory: ICharacterDirectory) {
        directory.id = uuidv4();
        this.loadedDirectories.push(directory);
        this.loadedDirectories.sort((a, b) => a.name.localeCompare(b.name));

        this.saveCharacterDirectories();
    }

    public static removeDirectory(directory: ICharacterDirectory, deleteCharacters: boolean = false) {
        let index = this.loadedDirectories.indexOf(directory);
        if (index >= 0) {
            this.loadedDirectories.splice(index, 1);

            this.saveCharacterDirectories();

            if (deleteCharacters) {
                [...this.loadedCharacterIds].forEach(id => {
                    const character = localStorage.getItem("character-" + id);
                    if (character) {
                        const characterData = JSON.parse(character);
                        if (characterData.directory === directory.id) {
                            localStorage.removeItem("character-" + id);
                            this.loadedCharacters = this.loadedCharacters.filter(character => character.id !== id);
                            this.loadedCharacterIds.splice(this.loadedCharacterIds.indexOf(id), 1);
                        }
                    }
                });

                this.saveCharacterIds();
            }
        }
    }

    public static saveCharacter(character: ICharacter) {
        localStorage.setItem("character-" + character.id, JSON.stringify(character));

        if (vicarPlay.isRunning && vicarPlay.syncingChar) {
            if (character.id === vicarPlay.syncingChar.id) {
                vicarPlay.sendHost("send:sync-char", character);
            }
        }
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

    public static getSortedCharacters(): {directory: ICharacterDirectory|null, characters: ICharacter[]}[] {
        const directories: {directory: ICharacterDirectory|null, characters: ICharacter[]}[] = [];

        const characters = this.loadedCharacters.filter(character => !character.directory || !this.loadedDirectories.find(directory => directory.id === character.directory)).sort((a, b) => a.name.localeCompare(b.name));
        directories.push({characters, directory: null});

        this.loadedDirectories.forEach(directory => {
            const characters = this.loadedCharacters.filter(character => character.directory === directory.id).sort((a, b) => a.name.localeCompare(b.name));
            directories.push({directory, characters});
        });

        return directories;
    }

    private static saveCharacterIds() {
        localStorage.setItem("character-ids", JSON.stringify(this.loadedCharacterIds));
    }

    public static saveCharacterDirectories() {
        localStorage.setItem("character-directories", JSON.stringify(this.loadedDirectories));
    }
}
