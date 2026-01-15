<script setup lang="ts">
import { ref } from "vue"
import Modal from "@/components/modal/Modal.vue"
import type { IBloodRitual } from "@/@types/data.ts"

const show = ref(false)
const ritual = ref<IBloodRitual | null>(null)

function showModal(r: IBloodRitual) {
  ritual.value = r
  show.value = true
}

defineExpose({ showModal })
</script>

<template>
  <Modal :shown="show" @close="show = false">
    <div v-if="ritual" class="ability-info">
      <small><i>{{ ritual.description }}</i></small>
      <hr />
      <span><b>Zutaten</b>: {{ ritual.ingredients }}</span>
      <span><b>Ausführung</b>: {{ ritual.execution }}</span>
      <span><b>System</b>: {{ ritual.system }}</span>
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
