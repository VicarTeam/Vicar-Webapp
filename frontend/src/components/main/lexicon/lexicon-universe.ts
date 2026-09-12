import { ref } from "vue"
import type { GameLine } from "@/@types/gameline"
import { Universe, getUniverse, universes } from "@/@types/universe"

const STORAGE_KEY = "lexicon__universe"

function readStored(): Universe | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }
    return universes.some((u) => u.id === raw) ? (raw as Universe) : null
  } catch {
    return null
  }
}

const stored = readStored()
let resolved = stored !== null

export const lexiconUniverse = ref<Universe>(stored ?? Universe.WorldOfDarkness)

export function ensureLexiconUniverse(gameline?: GameLine) {
  if (resolved) {
    return
  }
  lexiconUniverse.value = gameline ? getUniverse(gameline) : Universe.WorldOfDarkness
}

export function setLexiconUniverse(universe: Universe) {
  resolved = true
  lexiconUniverse.value = universe
  try {
    localStorage.setItem(STORAGE_KEY, universe)
  } catch {
    return
  }
}
