import {ICharacter, ICharacterDirectory} from "@/types/models";
//@ts-ignore
import {v4 as uuidv4} from 'uuid';
import {del, get, post, put} from "@/libs/io/rest";
import store from "@/store";
import router from "@/router";
import {io} from "socket.io-client";

let saveDebounce: number|null = null;

export default class CharacterStorage {

    public static loadedCharacters: ICharacter[] = [];
    public static loadedDirectories: ICharacterDirectory[] = [];
    private static initialized: boolean = false;

    public static async preloadCharacter(id: string): Promise<true|'not_found'|'not_authed'> {
        if (!localStorage.getItem('vicar:session')) {
            return 'not_authed';
        }

        if (!this.initialized) {
            await this.initialize();
        }

        const existing = this.loadedCharacters.find(character => character.id === id);
        if (!existing) {
            return 'not_found';
        }

        store.commit("setEditingCharacter", existing);
        return true;
    }

    public static async initialize() {
        if (this.initialized) {
            return;
        }

        this.initialized = true;

        const [status, res] = await get<{
            characters: ICharacter[];
            sharedCharacters: ICharacter[];
        }>(`/characters`);

        if (status >= 400) {
            if (status === 401) {
                await router.push('/login');
            }
            return;
        }

        this.loadedCharacters.push(...res.characters);
        this.loadedCharacters.push(...res.sharedCharacters.map(character => ({...character, justViewing: true})));

        for (const character of this.loadedCharacters) {
            if (character.directory) {
                if (!this.loadedDirectories.find(directory => directory.id === character.directory)) {
                    this.loadedDirectories.push({id: character.directory, name: character.directory, open: true});
                }
            }
        }

        this.initializeUpdatingSocket();
    }

    public static addDirectory(directory: ICharacterDirectory) {
        directory.id = directory.name;
        this.loadedDirectories.push(directory);
        this.loadedDirectories.sort((a, b) => a.name.localeCompare(b.name));
    }

    public static async saveCharacter(character: ICharacter, triggerSync: boolean = false) {
        if (character.justViewing) {
            return;
        }

        if (saveDebounce) {
            clearTimeout(saveDebounce);
        }

        saveDebounce = setTimeout(async () => {
            const [status, _] = await put(`/characters/${character.id}`, character);
            if (status >= 400) {
                console.error("Failed to save character");
            }
        }, 1000);
    }

    public static async addCharacter(character: ICharacter): Promise<string|undefined> {
        const [status, res] = await post<{id: string}>(`/characters`, character);
        if (status >= 400) {
            return;
        }

        character.id = res.id;
        this.loadedCharacters.push(character);

        if (character.directory && !this.loadedDirectories.find(directory => directory.id === character.directory)) {
            this.loadedDirectories.push({id: character.directory, name: character.directory, open: true});
        }

        return character.id;
    }

    public static async removeCharacter(character: ICharacter) {
        const [status, _] = await del(`/characters/${character.id}`);
        if (status >= 400) {
            return;
        }

        let index = this.loadedCharacters.indexOf(character);
        if (index >= 0) {
            this.loadedCharacters.splice(index, 1);
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

    private static initializeUpdatingSocket() {
        if (!localStorage.getItem('vicar:session')) {
            return;
        }

        const socket = io(process.env.VUE_APP_API_URL as string);
        socket.on('character_updated', (character: ICharacter) => {
            this.updateCharacter(character);
        });
        socket.emit('authenticate', localStorage.getItem('vicar:session'));
    }

    private static updateCharacter(char: ICharacter) {
        const existing = this.loadedCharacters.find(character => character.id === char.id);
        if (existing) {
            Object.assign(existing, char);

            if (store.state.editingCharacter) {
                if (store.state.editingCharacter.id === char.id) {
                    store.commit("setEditingCharacter", existing);
                }
            }
        }
    }
}
