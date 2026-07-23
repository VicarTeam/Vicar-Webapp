<script setup lang="ts">
import { computed, ref } from "vue"
import EditorForm from "@/components/editor/EditorForm.vue"
import { getVdzAbilityName, type IVdzSheet, VdzAbility, vdzKnowledgeAbilities, vdzSkillAbilities, vdzTalentAbilities } from "@/@types/vdz"
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
// Bei der Erschaffung sind Fähigkeiten auf max. 3 Punkte begrenzt.
const baseNumbers = [0, 1, 2, 3]

const store = useStore()
const editingCharacter = computed(() => store.editingCharacter as IVdzSheet | undefined)

const talentPriority = ref<AbilityPriority>(AbilityPriority.None)
const skillPriority = ref<AbilityPriority>(AbilityPriority.None)
const knowledgePriority = ref<AbilityPriority>(AbilityPriority.None)

const selectableTalentPriorities = computed(() => priorities.filter((p) => ![skillPriority.value, knowledgePriority.value].includes(p)))
const selectableSkillPriorities = computed(() => priorities.filter((p) => ![talentPriority.value, knowledgePriority.value].includes(p)))
const selectableKnowledgePriorities = computed(() => priorities.filter((p) => ![talentPriority.value, skillPriority.value].includes(p)))

function getAbilityValue(ability: VdzAbility): number {
  return (editingCharacter.value?.abilities?.[ability] ?? 0) as number
}

function sumFor(abilities: readonly VdzAbility[], enabled: boolean): number {
  if (!enabled) return 0
  return abilities.reduce((acc, a) => acc + getAbilityValue(a), 0)
}

function maxFor(priority: AbilityPriority) {
  return priorityMax[priority] || 0
}

const usedTalentAmount = computed(() => sumFor(vdzTalentAbilities, talentPriority.value !== AbilityPriority.None))
const usedSkillAmount = computed(() => sumFor(vdzSkillAbilities, skillPriority.value !== AbilityPriority.None))
const usedKnowledgeAmount = computed(() => sumFor(vdzKnowledgeAbilities, knowledgePriority.value !== AbilityPriority.None))

function isOptionDisabled(kind: "talents" | "skills" | "knowledges", ability: VdzAbility, candidate: number): boolean {
  if (candidate === 0) return false
  const current = getAbilityValue(ability)

  let used = 0
  let max = 0
  let locked = false

  if (kind === "talents") {
    used = usedTalentAmount.value
    max = maxFor(talentPriority.value)
    locked = talentPriority.value === AbilityPriority.None
  } else if (kind === "skills") {
    used = usedSkillAmount.value
    max = maxFor(skillPriority.value)
    locked = skillPriority.value === AbilityPriority.None
  } else {
    used = usedKnowledgeAmount.value
    max = maxFor(knowledgePriority.value)
    locked = knowledgePriority.value === AbilityPriority.None
  }

  if (locked) return true
  if (candidate === current) return false

  const newTotal = used - current + candidate
  return newTotal > max
}

const talentsLocked = computed(() => talentPriority.value === AbilityPriority.None)
const skillsLocked = computed(() => skillPriority.value === AbilityPriority.None)
const knowledgesLocked = computed(() => knowledgePriority.value === AbilityPriority.None)

const canGoNext = computed(() => {
  if (
    talentPriority.value !== AbilityPriority.None &&
    skillPriority.value !== AbilityPriority.None &&
    knowledgePriority.value !== AbilityPriority.None
  ) {
    const talentsOk = usedTalentAmount.value === maxFor(talentPriority.value)
    const skillsOk = usedSkillAmount.value === maxFor(skillPriority.value)
    const knowledgesOk = usedKnowledgeAmount.value === maxFor(knowledgePriority.value)
    return talentsOk && skillsOk && knowledgesOk
  }
  return false
})

function priorityLabel(p: AbilityPriority): string {
  return p === AbilityPriority.Primary ? "Primär (13)" : p === AbilityPriority.Secondary ? "Sekundär (9)" : "Tertiär (5)"
}
</script>

<template>
  <EditorForm :can-go-next="canGoNext" next-step="editor-vdz-advantages">
    <div v-if="editingCharacter" class="abilities-view">
      <div class="card" style="width: 50rem">
        <small>Setze eine Fähigkeitenkategorie auf "primär" (13 Punkte), eine auf "sekundär" (9 Punkte) und eine auf "tertiär" (5 Punkte). Keine Fähigkeit darf bei der Erschaffung über 3 Punkte steigen.</small>
      </div>

      <div class="panels">
        <div class="card">
          <h6>Talente</h6>
          <select class="form-control" v-model="talentPriority">
            <option :value="AbilityPriority.None">Auswählen</option>
            <option v-for="p in selectableTalentPriorities" :key="p" :value="p">{{ priorityLabel(p) }}</option>
          </select>

          <div class="info">
            <span>{{ usedTalentAmount }} / {{ maxFor(talentPriority) }}</span>
          </div>

          <div class="ability-col">
            <div v-for="a in vdzTalentAbilities" :key="a" class="ability">
              <label>{{ getVdzAbilityName(a) }}:</label>
              <select class="form-control" v-model.number="editingCharacter.abilities[a]" :disabled="talentsLocked">
                <option v-for="n in baseNumbers" :key="n" :value="n" :disabled="isOptionDisabled('talents', a, n)">{{ n }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="card">
          <h6>Fertigkeiten</h6>
          <select class="form-control" v-model="skillPriority">
            <option :value="AbilityPriority.None">Auswählen</option>
            <option v-for="p in selectableSkillPriorities" :key="p" :value="p">{{ priorityLabel(p) }}</option>
          </select>

          <div class="info">
            <span>{{ usedSkillAmount }} / {{ maxFor(skillPriority) }}</span>
          </div>

          <div class="ability-col">
            <div v-for="a in vdzSkillAbilities" :key="a" class="ability">
              <label>{{ getVdzAbilityName(a) }}:</label>
              <select class="form-control" v-model.number="editingCharacter.abilities[a]" :disabled="skillsLocked">
                <option v-for="n in baseNumbers" :key="n" :value="n" :disabled="isOptionDisabled('skills', a, n)">{{ n }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="card">
          <h6>Kenntnisse</h6>
          <select class="form-control" v-model="knowledgePriority">
            <option :value="AbilityPriority.None">Auswählen</option>
            <option v-for="p in selectableKnowledgePriorities" :key="p" :value="p">{{ priorityLabel(p) }}</option>
          </select>

          <div class="info">
            <span>{{ usedKnowledgeAmount }} / {{ maxFor(knowledgePriority) }}</span>
          </div>

          <div class="ability-col">
            <div v-for="a in vdzKnowledgeAbilities" :key="a" class="ability">
              <label>{{ getVdzAbilityName(a) }}:</label>
              <select class="form-control" v-model.number="editingCharacter.abilities[a]" :disabled="knowledgesLocked">
                <option v-for="n in baseNumbers" :key="n" :value="n" :disabled="isOptionDisabled('knowledges', a, n)">{{ n }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  </EditorForm>
</template>

<style scoped lang="scss">
.abilities-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem;

  .panels {
    display: flex;
    align-items: flex-start;
    gap: 2rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .card {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 22rem;

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

      .ability {
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
}
</style>
