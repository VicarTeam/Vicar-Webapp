<script setup lang="ts">
import { computed, ref } from "vue"
import EditorForm from "@/components/editor/EditorForm.vue"
import TipButton from "@/components/editor/TipButton.vue"
import XButton from "@/components/editor/XButton.vue"
import ChooseDisciplineAbilityModal from "@/components/editor/modals/ChooseDisciplineAbilityModal.vue"
import ChooseBloodRitualModal from "@/components/editor/modals/ChooseBloodRitualModal.vue"
import type { ICharacter, IDisciplineSelection, ILeveledDisciplineAbility } from "@/@types/models"
import type { IDiscipline } from "@/@types/data"
import {useStore} from "@/app/store.ts";

const store = useStore()

const chooseAbilityModal = ref<InstanceType<typeof ChooseDisciplineAbilityModal> | null>(null)
const chooseRitualModal = ref<InstanceType<typeof ChooseBloodRitualModal> | null>(null)

const disciplineFor2 = ref<IDiscipline | null>(null)
const disciplineFor1 = ref<IDiscipline | null>(null)
const characterCache = ref<ICharacter | null>(null)

function onBeforeNext(e: any) {
  const char = store.editingCharacter as ICharacter | undefined
  if (!char) return
  const selection = char.disciplines.find((d) => d.discipline.id === 3) as IDisciplineSelection | undefined
  if (selection && selection.currentLevel - 1 >= 1) {
    e.cancel = true
    chooseRitualModal.value?.showModal(e.next, selection, 1)
  }
}

function selectType() {
  const char = store.editingCharacter as ICharacter | undefined
  if (!char || !disciplineFor2.value || !disciplineFor1.value) return
  characterCache.value = JSON.parse(JSON.stringify(char))
  addDiscipline(disciplineFor2.value, 2)
  addDiscipline(disciplineFor1.value, 1)
}

function addDiscipline(discipline: IDiscipline, points: number) {
  const char = store.editingCharacter as ICharacter | undefined
  if (!char) return
  const existing = char.disciplines.find((d) => d.discipline.id === discipline.id)
  if (existing) existing.points += points
  else
    char.disciplines.push({
      discipline,
      points,
      currentLevel: 1,
      abilities: [],
    })
}

function addAbility(selection: IDisciplineSelection) {
  chooseAbilityModal.value?.showModal(selection, (ability: ILeveledDisciplineAbility) => {
    selection.abilities.push({ ...ability, usedLevel: selection.currentLevel })
    selection.currentLevel++
  })
}

function existsHigherAbility(selection: IDisciplineSelection, ability: ILeveledDisciplineAbility) {
  return !!selection.abilities.find((a) => a.usedLevel > ability.usedLevel)
}

function removeAbility(selection: IDisciplineSelection, ability: ILeveledDisciplineAbility, index: number) {
  if (existsHigherAbility(selection, ability)) return
  selection.abilities.splice(index, 1)
  selection.currentLevel--
}

function isDisciplineAvailable(disc: IDiscipline) {
  return disciplineFor1.value !== disc && disciplineFor2.value !== disc
}

function sortedAbilities(sel: IDisciplineSelection) {
  return [...sel.abilities].sort((a, b) => a.usedLevel - b.usedLevel)
}

const sortedDisciplines = computed(() => {
  const char = store.editingCharacter as ICharacter | undefined
  if (!char) return []
  return [...char.disciplines].sort((a, b) => b.points - a.points)
})

const canGoNext = computed(() => {
  const char = store.editingCharacter as ICharacter | undefined
  if (!char) return false
  return char.disciplines.every((d) => d.points === d.abilities.length)
})
</script>

<template>
  <EditorForm :can-go-next="canGoNext" :is-finish="true" @before-next="onBeforeNext">
    <div v-if="store.editingCharacter" class="page">
      <div class="wrap">
        <div class="form-group spread">
          <label class="required"><b>Wähle zwei deiner Clansdisziplinen. Setze zwei Punkte in die eine und einen Punkt in die andere:</b></label>

          <div class="spread-grid">
            <div class="col">
              <label>2 Punkten für...</label>
              <select class="form-control" :disabled="!!characterCache" v-model="disciplineFor2" data-agent="select:disc-2">
                <option :value="null">nicht ausgewählt</option>
                <option
                  v-for="d in (store.editingCharacter as ICharacter).clan.disciplines"
                  :key="d.id"
                  :value="d"
                  :disabled="!isDisciplineAvailable(d)"
                >
                  {{ d.name }}
                </option>
              </select>
            </div>

            <div class="col">
              <label>1 Punkt für...</label>
              <select class="form-control" :disabled="!!characterCache" v-model="disciplineFor1" data-agent="select:disc-1">
                <option :value="null">nicht ausgewählt</option>
                <option
                  v-for="d in (store.editingCharacter as ICharacter).clan.disciplines"
                  :key="d.id"
                  :value="d"
                  :disabled="!isDisciplineAvailable(d)"
                >
                  {{ d.name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <button
          v-if="(store.editingCharacter as ICharacter).skillspread && !characterCache"
          class="btn btn-primary"
          :disabled="!disciplineFor2 || !disciplineFor1"
          @click="selectType"
          data-agent="disc:confirm"
        >
          Auswählen
        </button>

        <div class="cards" v-if="characterCache">
          <div class="card discipline" v-for="d in sortedDisciplines" :key="d.discipline.id">
            <div class="head">
              <span>{{ d.discipline.name }}</span>
              <span><b>{{ d.points }}</b></span>
              <small>verwendet <b>{{ d.abilities.length }}</b></small>
            </div>

            <div class="ability" v-for="(a, i) in sortedAbilities(d)" :key="a.id + ':' + i">
              <div class="meta">{{ a.level }} - {{ a.name }}</div>
              <div class="actions">
                <TipButton :content="a.summary" />
                <XButton v-if="!existsHigherAbility(d, a)" class="ml-5" @click="removeAbility(d, a, i)" />
              </div>
            </div>

            <button class="add" type="button" v-if="d.points > d.abilities.length" @click="addAbility(d)" :data-agent="'disc:add:' + d.discipline.id" :data-agent-label="d.discipline.name">
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>
        </div>
      </div>

      <ChooseDisciplineAbilityModal ref="chooseAbilityModal" />
      <ChooseBloodRitualModal ref="chooseRitualModal" />
    </div>
  </EditorForm>
</template>

<style scoped lang="scss">
.page {
  width: 100%;
  height: 100%;
  padding: clamp(1rem, 4vw, 5rem);
  display: flex;
  justify-content: center;
}

.wrap {
  width: min(1200px, 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.spread {
  width: min(700px, 100%);
  text-align: center;
}

.spread-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 0.75rem;
}

.col {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.divider {
  width: min(760px, 100%);
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
}

.cards {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1.25rem;
}

.discipline {
  margin: 0;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.head {
  display: flex;
  gap: 0.6rem;
  align-items: baseline;
  justify-content: space-between;
  padding-bottom: 0.65rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.10);
  small {
    color: rgba(255, 255, 255, 0.65);
  }
}

.ability {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.meta {
  flex: 1;
}

.actions {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
}

.add {
  width: 100%;
  margin-top: 0.25rem;
  padding: 0.6rem 0.75rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.10);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), transparent 55%),
    linear-gradient(180deg, var(--bg-3), var(--bg-2));
  box-shadow: var(--shadow-hairline);
  cursor: pointer;
  transition: transform var(--dur-2) var(--ease-2), filter var(--dur-2) var(--ease-2), border-color var(--dur-2) var(--ease-2);
  &:hover {
    transform: translateY(-1px);
    filter: brightness(1.03);
    border-color: rgba(255, 255, 255, 0.16);
  }
  &:active {
    transform: translateY(0);
    filter: brightness(0.99);
  }
}

@media (max-width: 1050px) {
  .cards {
    grid-template-columns: 1fr;
  }
  .spread-grid {
    grid-template-columns: 1fr;
  }
}
</style>
