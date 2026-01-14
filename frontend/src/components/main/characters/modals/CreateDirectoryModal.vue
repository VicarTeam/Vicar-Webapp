<script setup lang="ts">
import { ref } from "vue"
import Modal from "@/components/modal/Modal.vue"
import CharacterStorage from "@/libs/io/character-storage"

const emit = defineEmits<{
  (e: "created"): void
}>()

const show = ref(false)
const name = ref("")

const showModal = () => {
  name.value = ""
  show.value = true
}

const createDir = () => {
  const n = name.value.trim()
  if (!n) return
  CharacterStorage.addDirectory({ id: "", name: n, open: false })
  emit("created")
  show.value = false
}

defineExpose({ showModal })
</script>

<template>
  <Modal :shown="show" @close="show = false">
    <div class="cdm">
      <span class="cdm__label">Name des Ordners:</span>
      <input class="form-control" type="text" v-model="name" inputmode="text" autocomplete="off" />
      <button class="btn btn-primary cdm__cta" @click="createDir">Abschließen</button>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.cdm {
  width: min(26rem, 92vw);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: stretch;
}
.cdm__cta {
  width: 100%;
}
</style>
