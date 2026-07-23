<script setup lang="ts">
import { computed, inject, ref } from "vue"
import { useStore } from "@/app/store"
import Dots from "@/components/progress/Dots.vue"
import LevelButton from "@/components/viewer/LevelButton.vue"
import TipButton from "@/components/editor/TipButton.vue"
import { vdzDisciplines } from "@/app/data/vdz"
import { resolveVdzDiscipline, VDZ_HELP } from "@/libs/data/vdz-helpers"
import type { IVdzSheet, VdzRequestLevelFn } from "@/@types/vdz"

const store = useStore()
const editingCharacter = computed(() => store.editingCharacter as IVdzSheet | undefined)
const isLevelMode = computed(() => store.isLevelMode)

const requestLevel = inject("request-vdz-level") as VdzRequestLevelFn | undefined
const setDicePool = inject("set-dice-pool") as
  | ((type: "attr" | "skill" | "disc", name: string, value: number, isHuman?: boolean) => void)
  | undefined

const newDisciplineName = ref("")
const showPaths = ref<Record<string, boolean>>({})
const expandedPath = ref<Record<string, boolean>>({})

const clanName = computed(() => editingCharacter.value?.clan?.name)
const clanDisciplines = computed(() => editingCharacter.value?.clan?.disciplines ?? [])

function characterHasClanDiscipline(clanDiscName: string): boolean {
  const c = editingCharacter.value
  if (!c) return false
  return c.disciplines.some(
    x => x.name === clanDiscName || x.name.split(":")[0]!.trim() === clanDiscName || x.name.startsWith(clanDiscName),
  )
}

const missingClanDisciplines = computed(() => {
  const c = editingCharacter.value
  if (!c) return []
  return clanDisciplines.value.filter(d => !characterHasClanDiscipline(d))
})

const learnableCatalog = computed(() => {
  const c = editingCharacter.value
  if (!c) return []
  return vdzDisciplines.filter(d => !c.disciplines.some(x => x.name === d.name))
})

function isClanDiscipline(name: string): boolean {
  if (clanDisciplines.value.includes(name)) return true
  // Blutmagie-Hauptpfade (z.B. "Thaumaturgie: Potestas Vitae") gegen den
  // Oberbegriff der Clan-Disziplin ("Thaumaturgie") abgleichen.
  const base = name.split(":")[0]!.trim()
  return clanDisciplines.value.some(d => d === base || d.startsWith(base))
}

function resolved(name: string) {
  return resolveVdzDiscipline(name, clanName.value)
}

/** Alle Kräftestufen einer linearen Disziplin (beherrschte + noch verschlossene). */
function allLevels(name: string) {
  const res = resolved(name)
  const entry = res.entries[0]
  if (res.kind !== "linear" || !entry) return []
  return entry.levels
}

function pathShortName(fullName: string): string {
  const idx = fullName.indexOf(": ")
  return idx >= 0 ? fullName.slice(idx + 2) : fullName
}

function togglePaths(name: string) {
  showPaths.value = { ...showPaths.value, [name]: !showPaths.value[name] }
}

function togglePathDetail(name: string) {
  expandedPath.value = { ...expandedPath.value, [name]: !expandedPath.value[name] }
}

function learnDiscipline(name: string) {
  const n = name.trim()
  if (!n) return
  requestLevel?.("discipline", n)
  newDisciplineName.value = ""
}
</script>

<template>
  <div v-if="editingCharacter" class="vdz-disciplines-view">
    <div class="wrap">
      <div class="head">
        <b class="title">
          Disziplinen
          <TipButton :content="VDZ_HELP.disciplinesGeneral" />
        </b>
        <small class="intro">Du beherrschst automatisch alle Kräfte bis zu deiner jeweiligen Disziplin-Stufe — du musst keine einzeln auswählen.</small>
      </div>

      <div v-if="editingCharacter.disciplines.length === 0" class="empty">
        <small>Keine Disziplinen gelernt.</small>
      </div>

      <div class="disc-grid">
        <div v-for="d in editingCharacter.disciplines" :key="d.name" class="disc-card">
          <div class="disc-row">
            <LevelButton v-if="d.level < 5" @click="requestLevel?.('discipline', d.name)" />
            <span class="name" @click="setDicePool?.('disc', d.name, d.level)">
              {{ d.name }}
              <span v-if="isClanDiscipline(d.name)" class="badge" title="Clan-Disziplin">Clan</span>
              <TipButton v-if="resolved(d.name).entries[0]?.summary" :content="resolved(d.name).entries[0]!.summary" />
            </span>
            <Dots :amount="d.level" :max="5" />
          </div>

          <!-- Lineare Disziplin: alle Kräfte sichtbar; beherrschte normal, höhere ausgegraut. -->
          <template v-if="resolved(d.name).kind === 'linear'">
            <div class="powers">
              <div
                v-for="lvl in allLevels(d.name)"
                :key="lvl.level"
                class="power-level"
                :class="{ locked: lvl.level > d.level }"
              >
                <b class="lvl">
                  Stufe {{ lvl.level }}
                  <span v-if="lvl.level <= d.level" class="known-tag">beherrscht</span>
                  <i v-else class="fa-solid fa-lock" title="Noch nicht gelernt" />
                </b>
                <div v-for="p in lvl.powers" :key="p.name" class="power">
                  <b>{{ p.name }}</b>
                  <small>{{ p.description }}</small>
                </div>
              </div>
            </div>
          </template>

          <!-- Blutmagie: Pfade & Rituale, jeder Eintrag einzeln aufklappbar. -->
          <template v-else-if="resolved(d.name).kind === 'pathbased'">
            <div class="powers">
              <small class="bloodmagic-note"><i class="fa-solid fa-circle-info" /> {{ VDZ_HELP.disciplineBloodMagic }}</small>

              <button class="btn link-btn" @click="togglePaths(d.name)">
                <i class="fas fa-chevron-down" :class="showPaths[d.name] ? 'fa-rotate-180' : ''" />
                {{ showPaths[d.name] ? "Pfade & Rituale verbergen" : "Pfade & Rituale anzeigen" }}
              </button>

              <div v-if="showPaths[d.name]" class="paths">
                <div v-for="entry in resolved(d.name).entries" :key="entry.name" class="path-entry">
                  <button class="path-head" @click="togglePathDetail(entry.name)">
                    <i class="fas fa-chevron-right" :class="expandedPath[entry.name] ? 'fa-rotate-90' : ''" />
                    <b>{{ pathShortName(entry.name) }}</b>
                  </button>

                  <div v-if="expandedPath[entry.name]" class="path-body">
                    <small v-if="entry.summary" class="path-summary">{{ entry.summary }}</small>
                    <div v-for="lvl in entry.levels" :key="lvl.level" class="power-level">
                      <b class="lvl">Stufe {{ lvl.level }}</b>
                      <div v-for="p in lvl.powers" :key="p.name" class="power">
                        <b>{{ p.name }}</b>
                        <small>{{ p.description }}</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>

      <div v-if="isLevelMode" class="learn card">
        <b class="subtitle">
          Neue Disziplin lernen
          <TipButton content="Clan-Disziplinen sind günstiger zu steigern (neuer Wert × 5 EP) als clanfremde (neuer Wert × 7 EP). Eine neue Disziplin kostet pauschal 10 EP bzw. 7 Freie Punkte. Clanfremde Disziplinen erfordern im Spiel einen Lehrmeister und dessen Vitæ — sprich das mit deiner Erzählerin ab." />
        </b>

        <div v-if="missingClanDisciplines.length > 0" class="missing">
          <button v-for="d in missingClanDisciplines" :key="d" class="btn pill" @click="learnDiscipline(d)">
            + {{ d }}
          </button>
        </div>

        <div class="new-disc">
          <select class="form-control" v-model="newDisciplineName">
            <option value="" disabled>Disziplin aus dem Regelwerk wählen …</option>
            <option v-for="d in learnableCatalog" :key="d.id" :value="d.name">{{ d.name }}</option>
          </select>
          <button class="btn btn-primary" :disabled="!newDisciplineName.trim()" @click="learnDiscipline(newDisciplineName)">
            Lernen
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.vdz-disciplines-view {
  width: 100%;
  min-height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 1.5rem;
}

.wrap {
  width: min(1100px, 100%);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.head {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.title {
  font-size: 1.3rem;
}

.intro {
  opacity: 0.8;
}

.disc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 25rem), 1fr));
  gap: 1rem;
  align-items: start;
}

.disc-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.85rem 1rem;
  border-radius: var(--radius-2, 10px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(180deg, var(--bg-3), var(--bg-2));
  box-shadow: var(--shadow-hairline);
}

.disc-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;

  .name {
    flex-grow: 1;
    cursor: pointer;
    user-select: none;
    font-weight: bold;
  }

  .badge {
    margin-left: 0.4rem;
    font-size: 0.65rem;
    padding: 0.1rem 0.4rem;
    border-radius: 0.5rem;
    background: var(--primary-color);
    color: var(--accent-contrast, #fff);
  }
}

.powers {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  padding-top: 0.5rem;
}

.power-level {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  &.locked {
    opacity: 0.5;
  }

  .lvl {
    font-size: 0.8rem;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    opacity: 0.9;
  }

  .known-tag {
    font-size: 0.6rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    padding: 0.05rem 0.35rem;
    border-radius: 0.4rem;
    background: color-mix(in srgb, var(--accent) 35%, transparent);
    color: var(--text-1);
    opacity: 0.85;
  }

  .power {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;

    small {
      opacity: 0.9;
    }
  }
}

.bloodmagic-note {
  opacity: 0.85;
  font-style: italic;

  i {
    margin-right: 0.35rem;
  }
}

.paths {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.path-entry {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 0.35rem;
}

.path-head {
  width: 100%;
  background: none;
  border: none;
  box-shadow: none;
  padding: 0.15rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  text-align: left;

  i {
    transition: transform var(--dur-2, 0.15s) var(--ease-2, ease);
    opacity: 0.7;
    font-size: 0.75rem;
  }

  b {
    color: color-mix(in srgb, var(--accent) 55%, var(--text-1));
  }
}

.path-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.3rem 0 0.4rem 1.1rem;

  .path-summary {
    opacity: 0.85;
  }
}

.link-btn {
  align-self: flex-start;
  padding: 0.2rem 0;
  background: none;
  border: none;
  box-shadow: none;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  opacity: 0.85;

  &:hover {
    opacity: 1;
  }
}

.learn {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 0.85rem 1rem;
  border-radius: var(--radius-2, 10px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(180deg, var(--bg-3), var(--bg-2));
}

.subtitle {
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.missing {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.pill {
  padding: 0.3rem 0.6rem;
  font-size: 0.85rem;
}

.new-disc {
  display: flex;
  gap: 0.5rem;

  select {
    flex-grow: 1;
  }
}
</style>
