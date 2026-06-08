<script setup lang="ts">
import { ref } from "vue"
import Modal from "@/components/modal/Modal.vue"
import {getSkillDescription, getSkillSpecializations, type SkillKeys} from "@/@types/models"

const show = ref(false)
const skill = ref<SkillKeys | null>(null)

function showModal(s: SkillKeys) {
  skill.value = s
  show.value = true
}

defineExpose({ showModal })
</script>

<template>
  <Modal :shown="show" v-if="skill" @close="show = false">
    <div class="skill-info">
      <b>Beschreibung:</b>
      <span>{{ getSkillDescription(skill) }}</span>

      <b class="mt-10">Mögliche Spezialisierungen:</b>
      <span>{{ getSkillSpecializations(skill) }}</span>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.skill-info {
  display: flex;
  flex-direction: column;
  font-size: 1.25rem;
  gap: 0.5rem;
}
</style>
