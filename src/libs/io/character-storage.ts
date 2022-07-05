import {ICharacter, ICharacterDirectory} from "@/types/models";
//@ts-ignore
import {v4 as uuidv4} from 'uuid';
import VicarPlayClient from "@/libs/vicarplay/vicar-play";
import { readTextFile, writeTextFile, removeFile, createDir } from "@tauri-apps/api/fs";
import { join, localDataDir } from "@tauri-apps/api/path";

export default class CharacterStorage {

    private static loadedCharacterIds: string[] = [];
    public static loadedCharacters: ICharacter[] = [];
    public static loadedDirectories: ICharacterDirectory[] = [];

    public static async initialize() {
        console.log("Is Tauri App: " + this.isTauriApp());

        const directories = await this.readStorage("character-directories");
        if (directories) {
            this.loadedDirectories = JSON.parse(directories);
            this.loadedDirectories.sort((a, b) => a.name.localeCompare(b.name));
        }

        const characterIds = await this.readStorage("character-ids");
        if (characterIds) {
            this.loadedCharacterIds = JSON.parse(characterIds);
        }

        for (const id of this.loadedCharacterIds) {
            const character = await this.readStorage("character-" + id);
            if (character) {
                this.loadedCharacters.push(JSON.parse(character));
            }
        }
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
                            this.removeStorage("character-" + id).catch(e => {
                                console.error(e);
                            });
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
        this.writeStorage("character-" + character.id, JSON.stringify(character)).catch(e => {
            console.error(e);
        });

        if (VicarPlayClient.isInSession() && VicarPlayClient.syncingChar) {
            if (character.id === VicarPlayClient.syncingChar.id) {
                VicarPlayClient.socket.emit("sync-char:update", character);
            }
        }
    }

    public static addCharacter(character: ICharacter): string {
        character.id = uuidv4();

        this.loadedCharacterIds.push(character.id);
        this.saveCharacterIds();

        this.loadedCharacters.push(character);
        this.writeStorage("character-" + character.id, JSON.stringify(character)).catch(e => {
            console.error(e);
        });

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

                this.removeStorage("character-" + character.id).catch(e => {
                    console.error(e);
                });
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
        this.writeStorage("character-ids", JSON.stringify(this.loadedCharacterIds)).catch(e => {
            console.error(e);
        });
    }

    public static saveCharacterDirectories() {
        this.writeStorage("character-directories", JSON.stringify(this.loadedDirectories)).catch(e => {
            console.error(e);
        });
    }

    public static async migrateCharacters() {
        const newDirectoryIds: {[old: string]: string} = {};

        const directories = localStorage.getItem("character-directories");
        if (directories) {
            const oldDirectories = JSON.parse(directories);
            oldDirectories.forEach((directory: ICharacterDirectory) => {
                if (this.loadedDirectories.find(d => d.id === directory.id)) {
                    newDirectoryIds[directory.id] = uuidv4();
                }
                directory.id = newDirectoryIds[directory.id] || directory.id;
                this.loadedDirectories.push(directory);
            });

            this.loadedDirectories.sort((a, b) => a.name.localeCompare(b.name));
            this.saveCharacterDirectories();
        }

        const characterIds = localStorage.getItem("character-ids");
        if (characterIds) {
            const oldCharacterIds = JSON.parse(characterIds);

            oldCharacterIds.forEach((id: string) => {
                const characterJson = localStorage.getItem("character-" + id);
                if (characterJson) {
                    const character = JSON.parse(characterJson);
                    if (character) {
                        this.addCharacter(character);
                    }
                }
            });
        }
    }

    private static async writeStorage(name: string, value: string) {
        try {
            if (!this.isTauriApp()) {
                localStorage.setItem(name, value);
            } else {
                const path = await this.getBaseStoragePath();
                const fileName = await join(path, name + ".json");
                await writeTextFile(fileName, value);
            }
        } catch (e) {
            console.error(e);
        }
    }

    private static async readStorage(name: string): Promise<string|null> {
        try {
            if (!this.isTauriApp()) {
                return localStorage.getItem(name);
            }

            const path = await this.getBaseStoragePath();
            const fileName = await join(path, name + ".json");
            return await readTextFile(fileName);
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    private static async removeStorage(name: string) {
        try {
            if (!this.isTauriApp()) {
                localStorage.removeItem(name);
            } else {
                const path = await this.getBaseStoragePath();
                const fileName = await join(path, name + ".json");
                await removeFile(fileName);
            }
        } catch (e) {
            console.error(e);
        }
    }

    private static async getBaseStoragePath(): Promise<string> {
        if (!this.isTauriApp()) {
            return "";
        } else {
            const path = await join(await localDataDir(), "Vicar");
            await createDir(path, {recursive: true});
            return path;
        }
    }

    private static isTauriApp() {
        // @ts-ignore
        return !!window.__TAURI__;
    }
}
