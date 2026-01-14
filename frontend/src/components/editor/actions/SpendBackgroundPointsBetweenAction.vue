<script setup lang="ts">
import { computed, ref } from "vue"
import DataManager from "@/libs/data/data-manager"
import SpendSelect from "@/components/editor/actions/SpendSelect.vue"
import type { ITraitPack } from "@/@types/data"
import type { ICharacter } from "@/@types/models"
import { usePTActionRegistration } from "@/components/editor/actions/PTActionBase"

type SpendSelectData = {
  background: ITraitPack
  val: number
}

const props = defineProps<{
  data: { points: number; choices: number[] }
}>()

const usages = ref<SpendSelectData[]>([])

function onPointsChanged(background: ITraitPack, val: number) {
  const idx = usages.value.findIndex((u) => u.background.id === background.id)
  if (idx === -1) {
    usages.value.push({ background, val })
  } else {
    usages.value[idx]!.val = val
  }
}

const usedPoints = computed(() => usages.value.map((u) => u.val).reduce((a, b) => a + b, 0))
const pool = computed(() => props.data.points - usedPoints.value)

const backgrounds = computed(() =>
  props.data.choices.map((id) => DataManager.getBackground(id)!).filter((b: any) => b !== null)
)

function applyOutput(char: ICharacter) {
  usages.value.forEach((u) => {
    if (u.val > 0) {
      const existing = (char.requiredPointSpreads as any).find(
        (s: any) => s.packId === u.background.id && s.type === "backgrounds" && !s.isFlaw
      )
      if (existing) {
        existing.points += u.val
      } else {
        ;(char.requiredPointSpreads as any).push({
          isFlaw: false,
          packId: u.background.id,
          type: "backgrounds",
          points: u.val,
        })
      }
    }
  })
}

function isReady() {
  return pool.value <= 0
}

usePTActionRegistration({ applyOutput, isReady })
defineExpose({ applyOutput, isReady })
</script>

<template>
  <div class="form-group mb-0">
    <label class="required">{{ `Verteile ${pool} Punkte` }}:</label>

    <div
      class="row"
      v-for="(background, i) in backgrounds"
      :key="background.id"
      :class="{ 'mt-10': i > 0 }"
    >
      <label class="name">{{ background.name }}: </label>
      <SpendSelect :max="data.points" :pool="pool" @change="(val) => onPointsChanged(background, val)" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.row {
  display: flex;
  gap: 1rem;
  align-items: center;
}
.name {
  width: 50%;
}
@media (max-width: 520px) {
  .row {
    flex-direction: column;
    align-items: stretch;
  }
  .name {
    width: 100%;
  }
}
</style>
