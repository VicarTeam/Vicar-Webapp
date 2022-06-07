import {MutationTree} from "vuex";
import {State} from "@/types/store";
import {ICharacter} from "@/types/models";

export const mutations: MutationTree<State> = {
    setEditingCharacter(state, char?: ICharacter) {
        state.editingCharacter = char;
    },
    addCharToEditorHistory(state, char: ICharacter) {
        state.editorCharHistory.push({...char});
    },
    clearCharHistory(state) {
        state.editorCharHistory = [];
    }
};
