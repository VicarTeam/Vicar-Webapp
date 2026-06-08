<script setup lang="ts">
import Modal from "@/components/modal/Modal.vue"

const show = defineModel<boolean>("show", { default: false })
const title = defineModel<any>("title", { default: null })
const content = defineModel<any>("content", { default: "" })

function showModal(t: any, c: any) {
  title.value = t
  content.value = c
  show.value = true
}

defineExpose({ showModal })
</script>

<template>
  <Modal :shown="show" @close="show = false">
    <div class="tip-modal">
      <p v-if="title" class="tip-title">{{ title }}</p>
      <small class="tip-content">{{ content }}</small>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.tip-modal {
  max-width: min(40rem, calc(100vw - 2rem));
  padding: 0.25rem 0.25rem 0.5rem;
  display: grid;
  gap: 0.6rem;
}
.tip-title {
  margin: 0;
  font-weight: 800;
  letter-spacing: 0.02em;
  font-size: 1.35rem;
  font-family: Cinzel, serif;
}
.tip-content {
  font-size: 1rem;
  line-height: 1.45;
  opacity: 0.92;
}
</style>
