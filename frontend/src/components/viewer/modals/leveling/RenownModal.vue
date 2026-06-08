<script setup lang="ts">
import { computed, ref } from "vue"
import Modal from "@/components/modal/Modal.vue"
import Bullet from "@/components/Bullet.vue"
import CharacterStorage from "@/libs/io/character-storage"
import { LevelChangeType } from "@/@types/gameline"
import {getRenownName, type IW5Renown, type IWerewolfW5Sheet, type W5RenownKey} from "@/@types/w5"

const show = ref(false)
const editingCharacter = ref<IWerewolfW5Sheet | null>(null)

const renown = ref<IW5Renown>({ key: "none" as any, value: 0 })

function showModal(char: IWerewolfW5Sheet, renownKey: W5RenownKey) {
  editingCharacter.value = char
  renown.value = char.renown.find((r) => r.key === renownKey) || { key: renownKey, value: 0 }
  show.value = true
}

const neededExp = computed(() => (renown.value.value + 1) * 5)

function level() {
  const char = editingCharacter.value
  if (!char) return
  if (char.exp < neededExp.value) return

  CharacterStorage.trackLevelChange(
    char as any,
    LevelChangeType.Renown,
    neededExp.value,
    `${renown.value.key}: ${renown.value.value} → ${renown.value.value + 1}`,
  )

  renown.value.value++

  const idx = char.renown.findIndex((r) => r.key === renown.value.key)
  if (idx === -1) char.renown.push({ ...renown.value })
  else char.renown[idx] = { ...renown.value }

  CharacterStorage.saveCharacter(char as any)
  show.value = false
}

defineExpose({ showModal })
</script>

<template>
  <Modal :shown="show" @close="show = false">
    <div v-if="editingCharacter" class="mini-modal">
      <b>Ansehen: {{ getRenownName(renown.key) }}:</b>

      <div class="centerline">
        {{ renown.value }} &#8594; {{ renown.value + 1 }}
        <bullet />
        {{ `Kosten: ${neededExp} EXP` }}
      </div>

      <div class="actions">
        <button class="btn btn-primary" :disabled="neededExp > editingCharacter.exp" @click="level">
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
