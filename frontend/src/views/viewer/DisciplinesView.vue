<script setup lang="ts">
import { computed, inject, ref } from "vue"
import { useStore } from "@/app/store"
import type { ICharacter, IDisciplineSelection, ILeveledDisciplineAbility } from "@/@types/models"
import TipButton from "@/components/editor/TipButton.vue"
import Dots from "@/components/progress/Dots.vue"
import DisciplineAbilityInfoModal from "@/components/viewer/modals/DisciplineAbilityInfoModal.vue"
import ChooseDisciplineAbilityModal from "@/components/editor/modals/ChooseDisciplineAbilityModal.vue"
import LevelButton from "@/components/viewer/LevelButton.vue"
import { levelResolver } from "@/libs/resolvers/level-resolver"
import DataManager from "@/libs/data/data-manager"
import CharacterStorage from "@/libs/io/character-storage"
import NewDisciplineModal from "@/components/viewer/modals/leveling/NewDisciplineModal.vue"
import ConfirmDeleteModal from "@/components/viewer/modals/ConfirmDeleteModal.vue"
import type { IDisciplineAbility } from "@/@types/data"
import { LightOfTheRenegade } from "@/app/data/v5"
import { LevelChangeType } from "@/@types/gameline"

const store = useStore()
const editingCharacter = computed(() => store.editingCharacter as ICharacter | undefined)
const isLevelMode = computed(() => store.isLevelMode as boolean)

const abilityInfoModal = ref<InstanceType<typeof DisciplineAbilityInfoModal> | null>(null)
const chooseAbilityModal = ref<InstanceType<typeof ChooseDisciplineAbilityModal> | null>(null)
const newDisciplineModal = ref<InstanceType<typeof NewDisciplineModal> | null>(null)
const confirmDeleteModal = ref<InstanceType<typeof ConfirmDeleteModal> | null>(null)

const setDicePool = inject("set-dice-pool") as
  | ((type: "attr" | "skill" | "disc", name: string, value: number, isHuman?: boolean) => void)
  | undefined

function deleteDisciplineAbility(selection: IDisciplineSelection, ability: IDisciplineAbility) {
  const c = editingCharacter.value
  if (!c) return

  confirmDeleteModal.value?.showModal(`${selection.discipline.name} ${selection.currentLevel - 1} - ${ability.name}`, () => {
    selection.abilities = selection.abilities.filter(a => a.id !== ability.id)
    selection.currentLevel--

    if (selection.abilities.length <= 0) {
      c.disciplines = c.disciplines.filter(d => d.discipline.id !== selection.discipline.id)
    }

    CharacterStorage.saveCharacter(c)
  })
}

function sortedDisciplineAbilities(abilities: ILeveledDisciplineAbility[]) {
  return abilities.sort((a, b) => a.level - b.level)
}

const sortedDisciplines = computed<IDisciplineSelection[]>(() => {
  const c = editingCharacter.value
  if (!c) return []
  return c.disciplines.sort((a, b) => b.currentLevel - a.currentLevel)
})

function getMaxDisciplineLevel(selection: IDisciplineSelection) {
  const c = editingCharacter.value
  if (!c) return 5
  if (c.allowLearningOfAllPowers) return Infinity
  return c.useAdavancedDisciplines ? 10 : 5
}

function getLevelCost(selection: IDisciplineSelection): number {
  const c = editingCharacter.value
  if (!c) return 0

  if (c.clan.id === 15) {
    return levelResolver.resolveCaitiffDiscipline(c, selection)
  }

  const resolver = DataManager.isClanDiscipline(c.clan, selection.discipline)
    ? levelResolver.resolveClanDiscipline
    : levelResolver.resolveOtherDiscipline

  return resolver(c, selection)
}

function levelDiscipline(selection: IDisciplineSelection) {
  const c = editingCharacter.value
  if (!c) return

  const costs = getLevelCost(selection)

  chooseAbilityModal.value?.showModal(
    selection,
    ability => {
      selection.abilities.push({ ...(ability as any), usedLevel: selection.currentLevel })
      selection.currentLevel++
      selection.abilities = sortedDisciplineAbilities(selection.abilities)

      CharacterStorage.trackLevelChange(c, LevelChangeType.Discipline, costs, `${ability.name} (${selection.discipline.name}) hinzugefügt`)
      c.disciplines = sortedDisciplines.value
      CharacterStorage.saveCharacter(c)
    },
    costs
  )
}

const renegadeAbiities = computed<ILeveledDisciplineAbility[]>(() => {
  const abilities: ILeveledDisciplineAbility[] = []
  for (let i = 1; i <= 5; i++) {
    const ability = (LightOfTheRenegade as any).levels?.[i]?.[0]
    if (ability) abilities.push({ ...ability, usedLevel: i, level: i })
  }
  return abilities
})
</script>

<template>
  <div v-if="editingCharacter" class="disciplines-view">
    <div class="disciplines">
      <div v-if="editingCharacter.cainsMarkLevel! <= -5" class="discipline card">
        <div class="top">
          <div class="d-flex align-items-center" style="gap: 0.5rem; flex-grow: 1">
            <b @click="setDicePool?.('disc', LightOfTheRenegade.name, 5)">{{ LightOfTheRenegade.name }}</b>
            <TipButton :content="LightOfTheRenegade.summary" />
          </div>
          <Dots :amount="5" :max="5" :renegade="true" />
        </div>
        <div class="abilities">
          <div class="ability" v-for="a in renegadeAbiities" :key="a.id ?? a.name">
            <small class="name vicar-renegade-fg">{{ a.name }} - <i><b>Stufe</b>: {{ a.level }}</i></small>
            <TipButton class="tip" :override="true" @click="abilityInfoModal?.showModal(a, LightOfTheRenegade)" />
          </div>
        </div>
      </div>

      <div class="discipline card" v-for="d in editingCharacter.disciplines" :key="d.discipline.id" :id="`hldc-${d.discipline.id}`">
        <div class="top">
          <div class="d-flex align-items-center" style="gap: 0.5rem; flex-grow: 1">
            <LevelButton v-if="d.currentLevel - 1 < getMaxDisciplineLevel(d)" @click="levelDiscipline(d)" />
            <b @click="setDicePool?.('disc', d.discipline.name, Math.min(d.currentLevel - 1, 5))">{{ d.discipline.name }}</b>
            <TipButton :content="d.discipline.summary" />
          </div>
          <Dots :amount="Math.min(d.currentLevel - 1, 5)" :max="5" />
        </div>

        <div class="abilities">
          <div class="ability" v-for="a in d.abilities" :key="a.id">
            <i class="iconbtnprim fa-solid fa-xmark" v-if="editingCharacter.fullCustomization" @click="deleteDisciplineAbility(d, a)" />
            <small class="name">{{ a.name }} - <i><b>Stufe</b>: {{ a.level }}</i></small>
            <TipButton class="tip" :override="true" @click="abilityInfoModal?.showModal(a, d.discipline)" />
          </div>
        </div>
      </div>
    </div>

    <div class="card" v-if="isLevelMode">
      <button class="btn btn-primary" @click="newDisciplineModal?.showModal()">Neue Disziplin erlernen</button>
    </div>

    <DisciplineAbilityInfoModal ref="abilityInfoModal" />
    <ChooseDisciplineAbilityModal ref="chooseAbilityModal" />
    <NewDisciplineModal ref="newDisciplineModal" />
    <ConfirmDeleteModal ref="confirmDeleteModal" />
  </div>
</template>

<style scoped lang="scss">
.disciplines-view {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  .disciplines {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    flex-wrap: wrap;
    align-content: flex-start;
    padding-left: 2rem;
    padding-right: 2rem;

    .discipline {
      margin: auto;
      width: 30rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      .top {
        display: flex;
        align-items: center;
        width: 100%;
        border-bottom: 1px solid rgba(255, 255, 255, 0.3);
      }

      .abilities {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 0.3rem;

        .ability {
          display: flex;
          flex-direction: row;
          gap: 0.5rem;

          .name {
            flex-grow: 1;
          }

          .tip {
            flex-shrink: 0;
          }
        }
      }
    }
  }
}
</style>
