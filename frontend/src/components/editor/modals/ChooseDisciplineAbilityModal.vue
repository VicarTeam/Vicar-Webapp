<script setup lang="ts">
import { computed, ref, watch } from "vue"
import Modal from "@/components/modal/Modal.vue"
import DataManager from "@/libs/data/data-manager"
import { disciplineAbilityResolver } from "@/libs/resolvers/disciplineability-resolver"
import { useStore } from "@/app/store"
import type { ICharacter, IDisciplineSelection, ILeveledDisciplineAbility } from "@/@types/models"

export type ChooseAbilityCallback = (ability: ILeveledDisciplineAbility) => void

const store = useStore()
const editingCharacter = computed<ICharacter | undefined>(() => store.editingCharacter as any)

const costs = ref(-1)
const overrideCosts = ref(-1)

const shown = ref(false)
const ability = ref<ILeveledDisciplineAbility | null>(null)

const discipline = ref<IDisciplineSelection | null>(null)
const abilities = ref<ILeveledDisciplineAbility[]>([])
let callback: ChooseAbilityCallback | null = null

function showModal(disc: IDisciplineSelection, cb: ChooseAbilityCallback, c = -1) {
  ability.value = null
  costs.value = c
  discipline.value = disc
  abilities.value = DataManager.normalToLeveledAbilities(disc.discipline)
  callback = cb
  shown.value = true
}

function addCurrentAbility() {
  if (!canSelectAbility.value || !discipline.value || !ability.value || !callback) return
  callback(ability.value)
  shown.value = false
}

function isAbilitySelectable(a: ILeveledDisciplineAbility) {
  const char = editingCharacter.value
  const disc = discipline.value
  if (!char || !disc) return false
  return disciplineAbilityResolver.resolve(char, disc, a)
}

function getCombo(a: ILeveledDisciplineAbility) {
  if (!a.combination) return ""
  return (DataManager.getDiscipline(a.combination.id)?.name ?? "") + " " + a.combination.level
}

function getRequirement(a: ILeveledDisciplineAbility) {
  if (!a.requirement) return ""
  return abilities.value.find((x) => x.id === a.requirement)?.name ?? ""
}

function hasAbility(a: ILeveledDisciplineAbility) {
  return discipline.value?.abilities.find((x) => x.id === a.id) !== undefined
}

const availableAbilities = computed(() => {
  const disc = discipline.value
  if (!disc) return []
  return abilities.value.filter((a) => a.level <= disc.currentLevel && !hasAbility(a))
})

const canSelectAbility = computed(() => {
  const char = editingCharacter.value
  const disc = discipline.value
  const a = ability.value
  if (!char || !disc || !a) return false
  const pay = costs.value === -1 ? true : ((overrideCosts.value !== -1 ? overrideCosts.value : costs.value) <= char.exp)
  return disciplineAbilityResolver.resolve(char, disc, a) && pay
})

watch(
  () => ability.value,
  (a) => {
    const char = editingCharacter.value
    if (!a || !char) {
      overrideCosts.value = -1
      return
    }
    if (a.level > 5 && (char as any).cainsMarkLevel !== 5) {
      overrideCosts.value = a.level * 10
    } else {
      overrideCosts.value = -1
    }
  }
)

defineExpose({ showModal })
</script>

<template>
  <Modal :shown="shown" v-if="editingCharacter && discipline && callback" @close="shown = false">
    <div class="wrap">
      <p class="title">
        {{ `Kraft für ${discipline.discipline.name} ${discipline.currentLevel} auswählen` }}
      </p>

      <select class="form-control" v-model="ability">
        <option
          v-for="a in availableAbilities"
          :key="a.id"
          :class="{ 'not-selectable': !isAbilitySelectable(a) }"
          :value="a"
        >
          {{ a.name }} - Stufe: {{ a.level }}{{
            isAbilitySelectable(a) ? "" : " - Voraussetzungen nicht erfüllt"
          }}
        </option>
      </select>

      <div class="info" v-if="ability">
        <small><i>{{ ability.summary }}</i></small>
        <hr />
        <small v-if="ability.minBloodPotency"><b>Minimale Blutmacht</b>: {{ ability.minBloodPotency }}</small>
        <small v-if="ability.requirement"><b>Voraussetzung</b>: {{ getRequirement(ability) }}</small>
        <small v-if="ability.combination"><b>Kombination</b>: {{ getCombo(ability) }}</small>
        <hr v-if="ability.combination || ability.requirement" />
        <span><b>Kosten</b>: {{ ability.costs }}</span>
        <span v-if="ability.diceSupplies"><b>Würfelpool</b>: {{ ability.diceSupplies }}</span>
        <span><b>System</b>: <span v-html="ability.system" /></span>
        <small v-if="ability.alternatives && ability.alternatives.length > 0"><b>Alternativen</b>: {{ ability.alternatives.join(", ") }}</small>
        <span><b>Dauer</b>: {{ ability.duration }}</span>
      </div>

      <div class="footer">
        <span v-if="costs > 0" class="mb-10">{{ `Kosten: ${overrideCosts !== -1 ? overrideCosts : costs} EXP` }}</span>
        <button class="btn btn-primary" :disabled="!canSelectAbility" @click="addCurrentAbility">Auswählen</button>
      </div>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.wrap {
  width: min(50rem, calc(100vw - 2rem));
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.title {
  margin: 0;
  font-weight: 800;
  font-size: 1.6rem;
}
.info {
  max-height: min(50rem, 55vh);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  gap: 1rem;
}
.not-selectable {
  font-style: italic;
  color: rgba(255, 255, 255, 0.6) !important;
}
.footer {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  .btn {
    min-height: 44px;
    width: min(22rem, 100%);
  }
}
</style>
