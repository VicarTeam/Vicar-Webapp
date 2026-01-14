<script setup lang="ts">
import { computed, ref } from "vue"
import Modal from "@/components/modal/Modal.vue"
import DataManager from "@/libs/data/data-manager"
import { useStore } from "@/app/store"
import type { ICharacter, IDisciplineSelection, ILeveledDisciplineAbility } from "@/@types/models"
import type { IOblivionCeremony } from "@/@types/data"

const store = useStore()
const editingCharacter = computed<ICharacter | undefined>(() => store.editingCharacter as any)

const maxLevel = ref<number>(0)

const shown = ref(false)
const ritual = ref<IOblivionCeremony | null>(null)

const discipline = ref<IDisciplineSelection | null>(null)
const rituals = ref<IOblivionCeremony[]>([])
let callback: (() => void) | null = null

function hasNeededAbility(ceremony: IOblivionCeremony) {
  if (!ceremony.requires) return true
  return !!discipline.value?.abilities?.find((x) => x.id === ceremony.requires)
}

function showModal(cb: () => void, disc: IDisciplineSelection, maxLvl = Infinity) {
  ritual.value = null
  callback = cb
  maxLevel.value = maxLvl
  discipline.value = disc

  const char = editingCharacter.value
  if (!char) return

    ;(char as any).oblivionCeremonies = (char as any).oblivionCeremonies || []

  rituals.value = DataManager.selectedLanguage.oblivionCeremonies
    .filter(
      (x) =>
        x.level <= disc.currentLevel - 1 &&
        x.level <= maxLvl &&
        !(char as any).oblivionCeremonies.find((y: any) => y.id === x.id) &&
        hasNeededAbility(x)
    )
    .sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level
      return a.name.localeCompare(b.name)
    })

  shown.value = true
}

function addCurrentAbility() {
  const char = editingCharacter.value
  if (!char || !canSelectAbility.value || !ritual.value || !callback) return
    ;(char as any).oblivionCeremonies.push({ ...ritual.value })
  callback()
  shown.value = false
}

const canSelectAbility = computed(() => {
  return !!ritual.value && ritual.value.level <= maxLevel.value && hasNeededAbility(ritual.value)
})

function getNeededAbility(ceremony: IOblivionCeremony): ILeveledDisciplineAbility | undefined {
  if (!ceremony.requires) return undefined
  return discipline.value?.abilities?.find((x) => x.id === ceremony.requires)
}

defineExpose({ showModal })
</script>

<template>
  <Modal :shown="shown" v-if="editingCharacter && discipline" @close="shown = false">
    <div class="wrap">
      <p class="title">Vergessenheitszeremonie auswählen</p>

      <select class="form-control" v-model="ritual">
        <option v-for="a in rituals" :key="a.id" :value="a">
          {{ a.name }} - Stufe: {{ a.level }}
        </option>
      </select>

      <div class="info" v-if="ritual">
        <small><i>{{ ritual.summary }}</i></small>
        <hr />
        <span v-if="getNeededAbility(ritual)"><b>Benötigte Disziplinsfähigkeit</b>: {{ getNeededAbility(ritual)!.name }}</span>
        <span v-if="ritual.cult"><b>Praktiziert vo</b>: {{ ritual.cult }}</span>
        <span><b>Kosten</b>: {{ ritual.cost }}</span>
        <span><b>Zeremonienwurf</b>: {{ ritual.roll }}</span>
        <span><b>Zutaten</b>: {{ ritual.ingredients }}</span>
        <span><b>Ausführung</b>: {{ ritual.execution }}</span>
        <span><b>System</b>: {{ ritual.system }}</span>
        <span v-if="ritual.duration"><b>Dauer</b>: {{ ritual.duration }}</span>
      </div>

      <div class="footer">
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
  .btn {
    min-height: 44px;
    width: min(22rem, 100%);
  }
}
</style>
