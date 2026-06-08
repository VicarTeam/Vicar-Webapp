import { defineStore } from 'pinia'
import type {State} from "@/@types/store.ts";
import {GameLine} from "@/@types/gameline.ts";

export const useStore = defineStore('vicar-main', {
  state: (): State => ({
    editingCharacter: undefined,
    draggingCharacter: undefined,
    directoryForCharCreation: undefined,
    isLevelMode: false,
    lexiconOpen: false,
    overrideGameLine: undefined,
  }),
  actions: {
    resetTheme() {
      const html = document.documentElement;
      html.classList.remove("theme--v5", "theme--w5", "theme--m20", "theme--h5");
      html.classList.add(`theme--v5`);
    },
    openLexicon() {
      this.lexiconOpen = true
    },
    closeLexicon() {
      this.lexiconOpen = false
    },
    toggleLexicon() {
      this.lexiconOpen = !this.lexiconOpen
    },
  },
  getters: {
    isVampire(state): boolean {
      return state.editingCharacter?.game === GameLine.Vampire || !state.editingCharacter?.game;
    },
    isWerewolf(state): boolean {
      return state.editingCharacter?.game === GameLine.Werewolf;
    },
    isMage(state): boolean {
      return state.editingCharacter?.game === GameLine.Mage;
    },
    isHunter(state): boolean {
      return state.editingCharacter?.game === GameLine.Hunter;
    },
    currentGameLine(state): GameLine {
      if (state.overrideGameLine) {
        return state.overrideGameLine;
      }
      return state.editingCharacter?.game ?? GameLine.Vampire;
    }
  }
})