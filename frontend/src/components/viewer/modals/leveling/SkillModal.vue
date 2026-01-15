<script setup lang="ts">
import { computed, ref } from "vue"
import Modal from "@/components/modal/Modal.vue"
import Bullet from "@/components/Bullet.vue"
import { useStore } from "@/app/store"
import { levelResolver } from "@/libs/resolvers/level-resolver"
import CharacterStorage from "@/libs/io/character-storage"
import { LevelChangeType } from "@/@types/gameline"
import {getSkillName, type ICharacter, type ISkillData} from "@/@types/models"

const store = useStore()
const editingCharacter = computed(() => store.editingCharacter as ICharacter | undefined)

const show = ref(false)
const data = ref<ISkillData | null>(null)

function showModal(d: ISkillData) {
  data.value = d
  show.value = true
}

const neededExp = computed(() => {
  if (!editingCharacter.value || !data.value) return Infinity
  return levelResolver.resolveSkill(editingCharacter.value, data.value.key)
})

function level() {
  const char = editingCharacter.value
  const skill = data.value
  if (!char || !skill) return
  if (char.exp < neededExp.value) return

  CharacterStorage.trackLevelChange(
    char,
    LevelChangeType.Skill,
    neededExp.value,
    `${getSkillName(skill.key)}: ${skill.value} → ${skill.value + 1}`,
  )

  skill.value++
  CharacterStorage.saveCharacter(char)
  show.value = false
}

defineExpose({ showModal })
</script>

<template>
  <Modal :shown="show" @close="show = false">
    <div v-if="data && editingCharacter" class="mini-modal">
      <b>Fähigkeit steigern:</b>

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
