import {MutationTree} from "vuex";
import {State} from "@/types/store";
import {ICharacter, ICharacterDirectory} from "@/types/models";

export const mutations: MutationTree<State> = {
    setEditingCharacter(state, char?: any) {
        state.editingCharacter = char;
    },
    setDirectoryForCharCreation(state, char?: ICharacterDirectory) {
        state.directoryForCharCreation = char;
    },
    setDraggingCharacter(state, char?: ICharacter) {
        state.draggingCharacter = char;
    },
    setLevelMode(state, mode: boolean) {
        state.isLevelMode = mode;
    }
};
