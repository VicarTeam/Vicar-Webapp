<script setup lang="ts">
import { computed, ref } from "vue"
import EditorForm from "@/components/editor/EditorForm.vue"
import {getAbilityName, type IMageSheet, M20Ability} from "@/@types/m20"
import { knowledgeAbilities, skillAbilities, talentAbilities, } from "@/@types/m20"
import { useStore } from "@/app/store"

enum AbilityPriority {
  None = 0,
  Primary = 1,
  Secondary = 2,
  Tertiary = 3,
}

const priorities = [AbilityPriority.Primary, AbilityPriority.Secondary, AbilityPriority.Tertiary]
const priorityMax: Record<number, number> = {
  [AbilityPriority.None]: 0,
  [AbilityPriority.Primary]: 13,
  [AbilityPriority.Secondary]: 9,
  [AbilityPriority.Tertiary]: 5,
}

const baseNumbers = [0, 1, 2, 3]

const store = useStore()
const editingCharacter = computed(() => store.editingCharacter as IMageSheet | undefined)

const talentsPriority = ref<AbilityPriority>(AbilityPriority.None)
const skillsPriority = ref<AbilityPriority>(AbilityPriority.None)
const knowledgesPriority = ref<AbilityPriority>(AbilityPriority.None)

const selectableTalentsPriorities = computed(() => priorities.filter((p) => ![skillsPriority.value, knowledgesPriority.value].includes(p)))
const selectableSkillsPriorities = computed(() => priorities.filter((p) => ![talentsPriority.value, knowledgesPriority.value].includes(p)))
const selectableKnowledgesPriorities = computed(() => priorities.filter((p) => ![talentsPriority.value, skillsPriority.value].includes(p)))

function ensureAbilities() {
  const c = editingCharacter.value
  if (!c) return
  if (!c.abilities) c.abilities = {} as any
}
ensureAbilities()

function getAbilityValue(ab: M20Ability): number {
  const c = editingCharacter.value
  return (c?.abilities?.[ab] ?? 0) as number
}

function setAbilityValue(ab: M20Ability, v: any) {
  const c = editingCharacter.value
  if (!c) return
  ensureAbilities()
  const safe = Math.max(0, Math.min(3, (parseInt(v, 10) | 0)))
  c.abilities[ab] = safe as any
}

function sumFor(list: readonly M20Ability[], enabled: boolean): number {
  if (!enabled) return 0
  return list.reduce((acc, ab) => acc + getAbilityValue(ab), 0)
}

function maxFor(p: AbilityPriority) {
  return priorityMax[p] || 0
}

const usedTalents = computed(() => sumFor(talentAbilities, talentsPriority.value !== AbilityPriority.None))
const usedSkills = computed(() => sumFor(skillAbilities, skillsPriority.value !== AbilityPriority.None))
const usedKnowledges = computed(() => sumFor(knowledgeAbilities, knowledgesPriority.value !== AbilityPriority.None))

function isOptionDisabled(kind: "talent" | "skill" | "knowledge", ab: M20Ability, candidate: number): boolean {
  if (candidate === 0) return false
  const current = getAbilityValue(ab)

  let used = 0,
    max = 0,
    locked = false

  if (kind === "talent") {
    used = usedTalents.value
    max = maxFor(talentsPriority.value)
    locked = talentsPriority.value === AbilityPriority.None
  } else if (kind === "skill") {
    used = usedSkills.value
    max = maxFor(skillsPriority.value)
    locked = skillsPriority.value === AbilityPriority.None
  } else {
    used = usedKnowledges.value
    max = maxFor(knowledgesPriority.value)
    locked = knowledgesPriority.value === AbilityPriority.None
  }

  if (locked) return true
  if (candidate > 3) return true
  if (candidate === current) return false

  const newTotal = used - current + candidate
  return newTotal > max
}

const talentsLocked = computed(() => talentsPriority.value === AbilityPriority.None)
const skillsLocked = computed(() => skillsPriority.value === AbilityPriority.None)
const knowledgesLocked = computed(() => knowledgesPriority.value === AbilityPriority.None)

const canGoNext = computed(() => {
  if (
    talentsPriority.value !== AbilityPriority.None &&
    skillsPriority.value !== AbilityPriority.None &&
    knowledgesPriority.value !== AbilityPriority.None
  ) {
    const okTal = usedTalents.value === maxFor(talentsPriority.value)
    const okSki = usedSkills.value === maxFor(skillsPriority.value)
    const okKno = usedKnowledges.value === maxFor(knowledgesPriority.value)
    return okTal && okSki && okKno
  }
  return false
})

function labelForPriority(p: AbilityPriority) {
  return p === AbilityPriority.Primary ? "Primär (13)" : p === AbilityPriority.Secondary ? "Sekundär (9)" : "Tertiär (5)"
}
</script>

<template>
  <EditorForm :can-go-next="canGoNext" next-step="editor-traits">
    <div v-if="editingCharacter" class="abilities-view">
      <div class="card header">
        <small>Step Three: Select Abilities — Priorisiere 13 / 9 / 5. Kein Wert über 3.</small>
      </div>

      <div class="panels">
        <div class="card">
          <h6>Talents</h6>
          <select class="form-control" v-model="talentsPriority">
            <option :value="AbilityPriority.None">Auswählen</option>
            <option v-for="p in selectableTalentsPriorities" :key="p" :value="p">
              {{ labelForPriority(p) }}
            </option>
          </select>
          <div class="info"><span>{{ usedTalents }} / {{ talentsPriority === AbilityPriority.None ? 0 : (talentsPriority === AbilityPriority.Primary ? 13 : (talentsPriority === AbilityPriority.Secondary ? 9 : 5)) }}</span></div>

          <div class="ability-col">
            <div v-for="ab in talentAbilities" :key="ab" class="ability-row">
              <label>{{ getAbilityName(ab) }}</label>
              <select
                class="form-control"
                :disabled="talentsLocked"
                :value="editingCharacter.abilities[ab]"
                @change="setAbilityValue(ab, ($event.target as HTMLSelectElement).value)"
              >
                <option v-for="n in baseNumbers" :key="n" :value="n" :disabled="isOptionDisabled('talent', ab, n)">
                  {{ n }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div class="card">
          <h6>Skills</h6>
          <select class="form-control" v-model="skillsPriority">
            <option :value="AbilityPriority.None">Auswählen</option>
            <option v-for="p in selectableSkillsPriorities" :key="p" :value="p">
              {{ labelForPriority(p) }}
            </option>
          </select>
          <div class="info"><span>{{ usedSkills }} / {{ skillsPriority === AbilityPriority.None ? 0 : (skillsPriority === AbilityPriority.Primary ? 13 : (skillsPriority === AbilityPriority.Secondary ? 9 : 5)) }}</span></div>

          <div class="ability-col">
            <div v-for="ab in skillAbilities" :key="ab" class="ability-row">
              <label>{{ getAbilityName(ab) }}</label>
              <select
                class="form-control"
                :disabled="skillsLocked"
                :value="editingCharacter.abilities[ab]"
                @change="setAbilityValue(ab, ($event.target as HTMLSelectElement).value)"
              >
                <option v-for="n in baseNumbers" :key="n" :value="n" :disabled="isOptionDisabled('skill', ab, n)">
                  {{ n }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div class="card">
          <h6>Knowledges</h6>
          <select class="form-control" v-model="knowledgesPriority">
            <option :value="AbilityPriority.None">Auswählen</option>
            <option v-for="p in selectableKnowledgesPriorities" :key="p" :value="p">
              {{ labelForPriority(p) }}
            </option>
          </select>
          <div class="info"><span>{{ usedKnowledges }} / {{ knowledgesPriority === AbilityPriority.None ? 0 : (knowledgesPriority === AbilityPriority.Primary ? 13 : (knowledgesPriority === AbilityPriority.Secondary ? 9 : 5)) }}</span></div>

          <div class="ability-col">
            <div v-for="ab in knowledgeAbilities" :key="ab" class="ability-row">
              <label>{{ getAbilityName(ab) }}</label>
              <select
                class="form-control"
                :disabled="knowledgesLocked"
                :value="editingCharacter.abilities[ab]"
                @change="setAbilityValue(ab, ($event.target as HTMLSelectElement).value)"
              >
                <option v-for="n in baseNumbers" :key="n" :value="n" :disabled="isOptionDisabled('knowledge', ab, n)">
                  {{ n }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <small class="hint">
        Tip: „0“ ist immer verfügbar, um Punkte freizugeben. Du kannst innerhalb des Budgets beliebig umschichten.
      </small>
    </div>
  </EditorForm>
</template>

<style scoped lang="scss">
.abilities-view {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;

  .header {
    width: 50rem;
  }

  .panels {
    display: flex;
    align-items: flex-start;
    gap: 2rem;
    flex-wrap: wrap;
  }

  .card {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 30rem;

    h6 {
      margin: 0 0 0.5rem;
      font-weight: bold;
      text-align: center;
    }

    .info {
      font-size: 0.85rem;
      text-align: right;
      opacity: 0.8;
    }

    .ability-col {
      margin-top: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      .ability-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.5rem;

        label {
          margin: 0;
        }
        select {
          width: 6rem;
        }
      }
    }
  }

  .hint {
    opacity: 0.8;
  }
}
</style>
