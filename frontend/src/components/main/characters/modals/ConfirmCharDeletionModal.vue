<script setup lang="ts">
import { ref, computed } from "vue"
import Modal from "@/components/modal/Modal.vue"
import CharacterStorage from "@/libs/io/character-storage"
import type { ICharacter } from "@/@types/models"

const emit = defineEmits<{
  (e: "deleted"): void
}>()

const show = ref(false)
const char = ref<ICharacter | null>(null)

const text = computed(() => {
  if (!char.value) return ""
  return `Möchtest du wirklich ${char.value.name} löschen? Dieser Vorgang kann nicht rückgängig gemacht werden.`
})

const showModal = (c: ICharacter) => {
  char.value = c
  show.value = true
}

const deleteChar = async () => {
  if (!char.value) return
  await CharacterStorage.removeCharacter(char.value)
  show.value = false
  emit("deleted")
}

defineExpose({ showModal })
</script>

<template>
  <Modal :shown="show" @close="show = false">
    <div v-if="char" class="ccd-modal">
      <span class="ccd-modal__text">{{ text }}</span>
      <button class="btn btn-primary ccd-modal__cta" @click="deleteChar">
        Löschen
      </button>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.ccd-modal {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  text-align: center;
}

.ccd-modal__text {
  line-height: 1.5;
}

.ccd-modal__cta {
  width: 100%;
}
</style>
