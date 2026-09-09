<script setup lang="ts">
import { computed, ref } from "vue"
import DataManager from "@/libs/data/data-manager"
import TipButton from "@/components/editor/TipButton.vue"
import type { IDiscipline, IRestriction } from "@/@types/data"
import type { ICharacter } from "@/@types/models"
import { usePTActionRegistration } from "@/components/editor/actions/PTActionBase"

type DisciplinePointActionData = {
  choices: { id: number; restriction?: IRestriction }[]
}

defineProps<{
  data: DisciplinePointActionData
  index?: number
}>()

const selected = ref<number>(-1)

function getDiscipline(id: number): IDiscipline | null {
  return DataManager.getDiscipline(id)
}

const selectedDiscipline = computed(() => getDiscipline(selected.value))

function applyOutput(char: ICharacter) {
  const discipline = selectedDiscipline.value
  if (!discipline) return

  const charDiscipline: any = (char.disciplines as any).find((d: any) => d.discipline.id === discipline.id)
  if (charDiscipline) {
    charDiscipline.points += 1
  } else {
    ;(char.disciplines as any).push({
      discipline,
      abilities: [],
      points: 1,
      currentLevel: 1,
    })
  }
}

function isReady() {
  return selected.value !== -1 && selectedDiscipline.value != null
}

usePTActionRegistration({ applyOutput, isReady })
defineExpose({ applyOutput, isReady })
</script>

<template>
  <div class="form-group mb-0">
    <label class="required">Wähle eine Disziplin:</label>

    <div class="row">
      <select v-model.number="selected" class="form-control" :data-agent="'select:pt-action:' + (index ?? 0)">
        <option v-for="(c, i) in data.choices" :key="i" :value="c.id">{{ getDiscipline(c.id)?.name }}</option>
      </select>

      <TipButton v-if="selectedDiscipline" :content="selectedDiscipline.summary" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.row {
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;
}
@media (max-width: 520px) {
  .row .form-control {
    flex: 1 1 auto;
    min-height: 44px;
  }
}
</style>
