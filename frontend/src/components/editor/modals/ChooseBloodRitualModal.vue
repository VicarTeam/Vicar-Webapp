<script setup lang="ts">
import { computed, ref } from "vue"
import Modal from "@/components/modal/Modal.vue"
import DataManager from "@/libs/data/data-manager"
import CharacterStorage from "@/libs/io/character-storage"
import { LevelChangeType } from "@/@types/gameline"
import { useStore } from "@/app/store"
import type { ICharacter, IDisciplineSelection } from "@/@types/models"
import type { IBloodRitual } from "@/@types/data"

const store = useStore()
const editingCharacter = computed<ICharacter | undefined>(() => store.editingCharacter as any)

const withCosts = ref(false)
const maxLevel = ref<number>(0)

const shown = ref(false)
const ritual = ref<IBloodRitual | null>(null)

const discipline = ref<IDisciplineSelection | null>(null)
const rituals = ref<IBloodRitual[]>([])
let callback: (() => void) | null = null

function showModal(cb: () => void, disc: IDisciplineSelection, maxLvl = Infinity, costs = false) {
  ritual.value = null
  callback = cb
  withCosts.value = costs
  maxLevel.value = maxLvl
  discipline.value = disc

  const char = editingCharacter.value
  rituals.value = DataManager.selectedLanguage.bloodRituals.filter(
    (x) =>
      x.level <= disc.currentLevel - 1 &&
      x.level <= maxLvl &&
      (char?.bloodRituals.find((y) => y.id === x.id) === undefined)
  )

  shown.value = true
}

function addCurrentAbility() {
  const char = editingCharacter.value
  if (!char || !canSelectAbility.value || !discipline.value || !ritual.value || !callback) return

  char.bloodRituals.push({ ...ritual.value })

  if (withCosts.value) {
    CharacterStorage.trackLevelChange(char, LevelChangeType.BloodRitual, costs.value, ritual.value.name + " erlernt")
  }

  callback()
  shown.value = false
}

const costs = computed(() => {
  if (!withCosts.value || !ritual.value) return -1
  return ritual.value.level * 3
})

const canSelectAbility = computed(() => {
  const char = editingCharacter.value
  return !!ritual.value && (!!char && (costs.value === -1 || costs.value <= char.exp)) && ritual.value.level <= maxLevel.value
})

defineExpose({ showModal })
</script>

<template>
  <Modal :shown="shown" v-if="editingCharacter && discipline" @close="shown = false">
    <div class="wrap">
      <p class="title">Blutritual auswählen</p>

      <select class="form-control" v-model="ritual">
        <option v-for="a in rituals" :key="a.id" :value="a">
          {{ a.name }} - Stufe: {{ a.level }}
        </option>
      </select>

      <div class="info" v-if="ritual">
        <small><i>{{ ritual.description }}</i></small>
        <hr />
        <span><b>Zutaten</b>: {{ ritual.ingredients }}</span>
        <span><b>Ausführung</b>: {{ ritual.execution }}</span>
        <span><b>System</b>: {{ ritual.system }}</span>
      </div>

      <div class="footer">
        <span v-if="costs > 0" class="mb-10">{{ `Kosten: ${costs} EXP` }}</span>
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
