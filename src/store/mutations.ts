import {MutationTree} from "vuex";
import {State} from "@/types/store";
import {ICharacter, ICharacterDirectory} from "@/types/models";

export const mutations: MutationTree<State> = {
    setEditingCharacter(state, char?: ICharacter) {
        state.editingCharacter = char;
    },
    setDirectoryForCharCreation(state, char?: ICharacterDirectory) {
        state.directoryForCharCreation = char;
    },
    setDraggingCharacter(state, char?: ICharacter) {
        state.draggingCharacter = char;
    },
    addCharToEditorHistory(state, char: ICharacter) {
        state.editorCharHistory.push({...char});
    },
    clearCharHistory(state) {
        state.editorCharHistory = [];
    },
    setCharHistory(state, history: ICharacter[]) {
        state.editorCharHistory = history;
    },
    setLevelMode(state, mode: boolean) {
        state.isLevelMode = mode;
    }
};
