<script setup lang="ts">
import { ref } from "vue"
import Modal from "@/components/modal/Modal.vue"
import type { ICharacter } from "@/@types/models"

const show = ref(false)
const char = ref<ICharacter | null>(null)
const receiverId = ref("")
let callback: ((id: string) => void) | null = null

function showModal(c: ICharacter, cb: (id: string) => void) {
  char.value = c
  receiverId.value = ""
  callback = cb
  show.value = true
}

function send() {
  if (!receiverId.value) return
  callback?.(receiverId.value)
  callback = null
  receiverId.value = ""
  char.value = null
  show.value = false
}

defineExpose({ showModal })
</script>

<template>
  <Modal v-if="char" :shown="show" @close="show = false; char = null">
    <div class="wrap">
      <span>{{ `Empfänger-ID für ${char.name} eingeben` }}</span>
      <input type="text" v-model="receiverId" class="form-control" style="width: 100%" />
      <div class="actions">
        <button class="btn btn-primary" :disabled="!receiverId" @click="send">Senden</button>
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
