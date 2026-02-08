<script setup lang="ts">
import { ref } from "vue"
import Modal from "@/components/modal/Modal.vue"
import CharacterStorage from "@/libs/io/character-storage.ts"
import type { ICharacter } from "@/@types/models.ts"
import { useStore } from "@/app/store.ts"

const store = useStore()

const show = ref(false)
const exp = ref(0)

function showModal() {
  exp.value = 0
  show.value = true
}

function addExp() {
  const char = store.editingCharacter as ICharacter | undefined
  if (!char) return
  char.exp += parseInt(exp.value.toString())
  char.exp = Math.max(char.exp, 0)
  CharacterStorage.saveCharacter(char, false, true)
  show.value = false
}

defineExpose({ showModal })
</script>

<template>
  <Modal :shown="show" @close="show = false">
    <div class="form-group">
      <label class="required">Erfahrungspunkte ändern:</label>
      <input class="form-control" type="number" v-model.number="exp" />
    </div>
    <div class="actions">
      <button class="btn btn-primary" @click="addExp">Ändern</button>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.actions {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
