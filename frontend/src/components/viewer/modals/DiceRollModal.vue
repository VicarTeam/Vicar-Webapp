<script setup lang="ts">
import { computed, ref } from "vue"
import Modal from "@/components/modal/Modal.vue"
import type { ICharacter } from "@/@types/models.ts"
import { VicarTT } from "@/libs/io/vicar-tt.ts"

const visible = ref(false)
const character = ref<ICharacter | null>(null)
const dices = ref(1)
const difficulty = ref("")

function showModal(char: ICharacter) {
  character.value = char
  dices.value = 1
  difficulty.value = ""
  visible.value = true
}

const canSend = computed(() => dices.value > 0)

function sendDiceRoll() {
  if (!canSend.value || !character.value) return

  let diff: number | undefined
  if (difficulty.value.trim().length > 0 && !isNaN(parseInt(difficulty.value))) {
    diff = parseInt(difficulty.value)
  }

  const hunger = Math.min((character.value as any).hunger, dices.value)
  const simple = dices.value - hunger

  VicarTT.rollDiceFor(character.value, simple, hunger, diff)
  visible.value = false
}

defineExpose({ showModal })
</script>

<template>
  <Modal :shown="visible" @close="visible = false">
    <div class="dice">
      <b class="title">Benutzerdefinierten Würfelpool würfel</b>

      <div class="form-group mb-0">
        <label>Anzahl der Würfel:</label>
        <input type="number" class="form-control" v-model.number="dices" />
      </div>

      <div class="form-group mb-0">
        <label>Schwierigkeit (optional):</label>
        <input type="text" class="form-control" v-model="difficulty" />
      </div>

      <div class="actions">
        <button class="btn btn-primary" :disabled="!canSend" @click="sendDiceRoll">
          In FoundryVTT würfeln
        </button>
      </div>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.dice {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-size: 1rem;
}

.title {
  text-align: center;
}

.actions {
  width: 100%;
  margin-top: 0.25rem;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
