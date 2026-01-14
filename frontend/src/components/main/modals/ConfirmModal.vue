<script setup lang="ts">
import { ref } from "vue"
import Modal from "@/components/modal/Modal.vue"

const emit = defineEmits<{
  (e: "result", success: boolean): void
}>()

const visible = ref(false)
const text = ref("")
let cb: (success: boolean) => void = () => {}

function showConfirm(t: string, next: (success: boolean) => void) {
  text.value = t
  cb = next
  visible.value = true
}

function confirm() {
  cb(true)
  emit("result", true)
  visible.value = false
}

function cancel() {
  cb(false)
  emit("result", false)
  visible.value = false
}

defineExpose({ showConfirm })
</script>

<template>
  <Modal :shown="visible" @close="cancel()">
    <div class="confirm-modal">
      <p class="text">{{ text }}</p>
      <div class="actions">
        <button class="btn btn-primary" @click="confirm()">
          Bestätigen
        </button>
      </div>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.confirm-modal {
  width: min(20rem, calc(100vw - 2rem));
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}
.text {
  margin: 0;
  line-height: 1.45;
}
.actions {
  display: flex;
  justify-content: flex-end;
  .btn {
    min-height: 44px;
  }
}
</style>
