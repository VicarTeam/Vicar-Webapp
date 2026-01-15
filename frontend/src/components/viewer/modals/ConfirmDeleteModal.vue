<script setup lang="ts">
import { ref } from "vue"
import Modal from "@/components/modal/Modal.vue"

const show = ref(false)
const element = ref<any>(null)
const confirm = ref<(() => void) | null>(null)

function showModal(el: any, fn: () => void) {
  element.value = el
  confirm.value = fn
  show.value = true
}

function confirmDelete() {
  if (!confirm.value) return
  confirm.value()
  element.value = null
  show.value = false
}

defineExpose({ showModal })
</script>

<template>
  <Modal :shown="show" @close="show = false">
    <div v-if="confirm && element" class="confirm">
      <span>{{ `Möchtest du ${element} wirklich löschen?` }}</span>
      <button class="btn btn-primary" @click="confirmDelete">
        Löschen
      </button>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.confirm {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  text-align: center;
}
</style>
