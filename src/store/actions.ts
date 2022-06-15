import {ActionTree} from "vuex";
import {State} from "@/types/store";

export const actions: ActionTree<State, any> = {
    popEditorCharHistory: ({commit, state}) => {
        const editableArr = [...state.editorCharHistory];
        const popped = editableArr.pop();
        commit("setEditingCharacter", popped);
        commit("setCharHistory", editableArr);
        return popped;
    }
};
