<script setup lang="ts">
import { computed, ref } from "vue"
import Modal from "@/components/modal/Modal.vue"
import type { IOblivionCeremony } from "@/@types/data.ts"
import type { IDisciplineSelection, ILeveledDisciplineAbility } from "@/@types/models.ts"
import { useStore } from "@/app/store.ts"

const store = useStore()

const show = ref(false)
const ritual = ref<IOblivionCeremony | null>(null)
const discipline = ref<IDisciplineSelection | undefined>(undefined)

function showModal(r: IOblivionCeremony) {
  ritual.value = r
  const char: any = store.editingCharacter
  discipline.value = char?.disciplines?.find((x: any) => x.discipline.id === 11)
  show.value = true
}

const neededAbility = computed<ILeveledDisciplineAbility | undefined>(() => {
  if (!ritual.value?.requires) return undefined
  return discipline.value?.abilities?.find((x) => x.id === ritual.value!.id)
})

defineExpose({ showModal })
</script>

<template>
  <Modal :shown="show" @close="show = false">
    <div v-if="ritual && discipline" class="ability-info">
      <small><i>{{ (ritual as any).summary }}</i></small>
      <hr />
      <span v-if="neededAbility"><b>Benötigte Disziplinsfähigkeit</b>: {{ neededAbility.name }}</span>
      <span v-if="(ritual as any).cult"><b>Praktiziert von</b>: {{ (ritual as any).cult }}</span>
      <span><b>Kosten</b>: {{ (ritual as any).cost }}</span>
      <span><b>Zeremonienwurf</b>: {{ (ritual as any).roll }}</span>
      <span><b>Zutaten</b>: {{ (ritual as any).ingredients }}</span>
      <span><b>Ausführung</b>: {{ (ritual as any).execution }}</span>
      <span><b>System</b>: {{ (ritual as any).system }}</span>
      <span v-if="(ritual as any).duration"><b>Dauer</b>: {{ (ritual as any).duration }}</span>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.ability-info {
  width: 100%;
  max-height: min(60vh, 50rem);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  gap: 1rem;
}
</style>
