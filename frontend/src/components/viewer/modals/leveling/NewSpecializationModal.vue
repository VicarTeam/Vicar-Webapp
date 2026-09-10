<script setup lang="ts">
import { computed, ref } from "vue"
import Modal from "@/components/modal/Modal.vue"
import { useStore } from "@/app/store"
import { levelResolver } from "@/libs/resolvers/level-resolver"
import CharacterStorage from "@/libs/io/character-storage"
import { LevelChangeType } from "@/@types/gameline"
import type { ICharacter, ISkillData } from "@/@types/models"

const store = useStore()
const editingCharacter = computed(() => store.editingCharacter as ICharacter | undefined)

const show = ref(false)
const specialization = ref("")
const data = ref<ISkillData | null>(null)

function showModal(d: ISkillData) {
  specialization.value = ""
  data.value = d
  show.value = true
}

const neededExp = computed(() => levelResolver.resolveSpecialization())

function level() {
  const char = editingCharacter.value
  const skill = data.value
  const spec = specialization.value.trim()

  if (!char || !skill) return
  if (char.exp < neededExp.value) return
  if (spec.length === 0) return
  if (skill.specialization.includes(spec)) return

  CharacterStorage.trackLevelChange(
    char,
    LevelChangeType.Specialization,
    neededExp.value,
    `${spec} (Skill: ${skill.key}) hinzugefügt`,
  )

  skill.specialization.push(spec)
  CharacterStorage.saveCharacter(char)
  show.value = false
}

defineExpose({ showModal })
</script>

<template>
  <Modal :shown="show" @close="show = false">
    <div v-if="data && editingCharacter" class="mini-modal">
      <b>Spezialisierung hinzufügen:</b>

      <div class="centerline">
        {{ `Kosten: ${neededExp} EXP` }}
      </div>

      <input type="text" class="form-control" v-model="specialization" data-agent="input:specialization" />

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
