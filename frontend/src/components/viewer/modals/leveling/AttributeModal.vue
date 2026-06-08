<script setup lang="ts">
import { computed, ref } from "vue"
import Modal from "@/components/modal/Modal.vue"
import Bullet from "@/components/Bullet.vue"
import CharacterStorage from "@/libs/io/character-storage"
import DataManager from "@/libs/data/data-manager"
import { levelResolver } from "@/libs/resolvers/level-resolver"
import { LevelChangeType } from "@/@types/gameline"
import {AttributeKeys, getAttributeName, type IAttributeData, type ICharacter} from "@/@types/models"
import { useStore } from "@/app/store"

const store = useStore()

const show = ref(false)
const data = ref<IAttributeData | null>(null)

const editingCharacter = computed(() => store.editingCharacter as ICharacter | undefined)

function showModal(d: IAttributeData) {
  data.value = d
  show.value = true
}

const neededExp = computed(() => {
  if (!editingCharacter.value || !data.value) return Infinity
  return levelResolver.resolveAttribute(editingCharacter.value, data.value.key)
})

function level() {
  const char = editingCharacter.value
  const d = data.value
  if (!char || !d) return
  if (char.exp < neededExp.value) return

  const translatedAttr = getAttributeName(d.key);

  CharacterStorage.trackLevelChange(
    char,
    LevelChangeType.Attribute,
    neededExp.value,
    `${translatedAttr}: ${d.value} → ${d.value + 1}`,
  )

  d.value++

  if (d.key === AttributeKeys.Stamina) {
    char.health = d.value + 3
  }

  if (d.key === AttributeKeys.Composure) {
    char.willpower = d.value + DataManager.getAttributeValue(char, AttributeKeys.Resolve)
  } else if (d.key === AttributeKeys.Resolve) {
    char.willpower = d.value + DataManager.getAttributeValue(char, AttributeKeys.Composure)
  }

  CharacterStorage.saveCharacter(char)
  show.value = false
}

defineExpose({ showModal })
</script>

<template>
  <Modal :shown="show" @close="show = false">
    <div v-if="data && editingCharacter" class="mini-modal">
      <b>Attribut steigern:</b>

      <div class="centerline">
        {{ data.value }} &#8594; {{ data.value + 1 }}
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
