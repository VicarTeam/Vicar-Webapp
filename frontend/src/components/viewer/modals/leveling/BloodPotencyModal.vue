<script setup lang="ts">
import { computed, ref } from "vue"
import Modal from "@/components/modal/Modal.vue"
import Bullet from "@/components/Bullet.vue"
import { useStore } from "@/app/store"
import { levelResolver } from "@/libs/resolvers/level-resolver"
import CharacterStorage from "@/libs/io/character-storage"
import { LevelChangeType } from "@/@types/gameline"
import type { ICharacter } from "@/@types/models"

const store = useStore()

const show = ref(false)
const editingCharacter = computed(() => store.editingCharacter as ICharacter | undefined)

function showModal() {
  show.value = true
}

const neededExp = computed(() => {
  if (!editingCharacter.value) return Infinity
  return levelResolver.resolveBloodPotency(editingCharacter.value)
})

function level() {
  const char = editingCharacter.value
  if (!char) return
  if (char.exp < neededExp.value) return

  CharacterStorage.trackLevelChange(
    char,
    LevelChangeType.BloodPotency,
    neededExp.value,
    `${char.bloodPotency} → ${char.bloodPotency + 1}`,
  )

  char.bloodPotency++
  CharacterStorage.saveCharacter(char)
  show.value = false
}

defineExpose({ showModal })
</script>

<template>
  <Modal :shown="show" @close="show = false">
    <div v-if="editingCharacter" class="mini-modal">
      <b>Blutmacht steigern:</b>

      <div class="centerline">
        {{ editingCharacter.bloodPotency }} &#8594; {{ editingCharacter.bloodPotency + 1 }}
        <bullet />
        {{ `Kosten: ${neededExp} EXP` }}
      </div>

      <div class="actions">
        <button class="btn btn-primary" :disabled="neededExp > editingCharacter.exp" @click="level" data-agent="level:confirm">
          Abschließen
        </button>
      </div>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.mini-modal {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.centerline {
  width: 100%;
  text-align: center;
}
.actions {
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
