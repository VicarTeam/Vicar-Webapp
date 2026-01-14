<script setup lang="ts">
import { ref } from "vue"
import Modal from "@/components/modal/Modal.vue"
import type { ICharacter } from "@/@types/models"

const show = ref(false)
const char = ref<ICharacter | null>(null)
let callback: (() => void) | null = null

function showModal(c: ICharacter, cb: () => void) {
  char.value = c
  callback = cb
  show.value = true
}

function confirm() {
  callback?.()
  callback = null
  char.value = null
  show.value = false
}

defineExpose({ showModal })
</script>

<template>
  <Modal v-if="char" :shown="show" @close="show = false; char = null">
    <div class="wrap">
      <span>{{ `Du hast den Charakter ${char.name} erhalten, willst du ihn abspeichern?` }}</span>
      <div class="actions">
        <button class="btn btn-primary" @click="confirm">Ja</button>
      </div>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.wrap {
  display: flex;
  flex-direction: column;
  width: min(40rem, calc(100vw - 2rem));
  gap: 1rem;
}
.actions {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  .btn {
    min-height: 44px;
    width: min(18rem, 100%);
  }
}
</style>
