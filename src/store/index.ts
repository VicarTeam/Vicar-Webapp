import Vue from 'vue'
import Vuex from 'vuex'
import {State} from "@/types/store";
import {mutations} from "@/store/mutations";
import {actions} from "@/store/actions";

Vue.use(Vuex)

export const state: State = {
    editingCharacter: undefined,
    editorCharHistory: []
}

export default new Vuex.Store({
  state,
  mutations,
  actions
})
