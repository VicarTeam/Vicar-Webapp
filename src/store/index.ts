import Vue from 'vue'
import Vuex from 'vuex'
import {State} from "@/types/store";
import {mutations} from "@/store/mutations";
import {actions} from "@/store/actions";
import VuexPersistence from 'vuex-persist';

Vue.use(Vuex)

const vuexLocal = new VuexPersistence<State>({
    storage: window.localStorage,
});

export const state: State = {
    editingCharacter: undefined,
    editorCharHistory: [],
    isLevelMode: false,
    directoryForCharCreation: undefined,
    draggingCharacter: undefined
}

const plugins = process.env.NODE_ENV === 'development' ? [vuexLocal.plugin] : [];

export default new Vuex.Store({
  state,
  mutations,
  actions,
  plugins
})
