<script setup lang="ts">
import { computed, ref } from "vue"
import DataManager from "@/libs/data/data-manager"
import SpendSelect from "@/components/editor/actions/SpendSelect.vue"
import type { ITraitPack } from "@/@types/data"
import type { ICharacter } from "@/@types/models"
import { usePTActionRegistration } from "@/components/editor/actions/PTActionBase"

type SpendSelectData = {
  type: "backgrounds" | "merits"
  pack: ITraitPack
  val: number
}

type ITypedTraitPack = ITraitPack & { type: "backgrounds" | "merits" }

const props = defineProps<{
  data: { points: number; choices: { type: "backgrounds" | "merits"; id: number }[] }
}>()

const usages = ref<SpendSelectData[]>([])

function onPointsChanged(type: "backgrounds" | "merits", pack: ITraitPack, val: number) {
  const idx = usages.value.findIndex((u) => u.pack.id === pack.id && u.type === type)
  if (idx === -1) {
    usages.value.push({ type, pack, val })
  } else {
    usages.value[idx]!.val = val
  }
}

const usedPoints = computed(() => usages.value.map((u) => u.val).reduce((a, b) => a + b, 0))
const pool = computed(() => props.data.points - usedPoints.value)

const packs = computed<ITypedTraitPack[]>(() =>
  props.data.choices
    .map((c) => {
      const owner = DataManager.getFlawOwner({
        type: c.type === "backgrounds" ? "background" : "merit",
        id: c.id,
        flawId: -1,
      } as any)
      if (!owner) return null
      return { ...(owner as any), type: c.type } as ITypedTraitPack
    })
    .filter((x): x is ITypedTraitPack => !!x)
)

function applyOutput(char: ICharacter) {
  usages.value.forEach((u) => {
    if (u.val > 0) {
      const existing = (char.requiredPointSpreads as any).find(
        (s: any) => s.packId === u.pack.id && s.type === u.type && s.isFlaw
      )
      if (existing) {
        existing.points += u.val
      } else {
        ;(char.requiredPointSpreads as any).push({
          isFlaw: true,
          packId: u.pack.id,
          type: u.type,
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

    <div class="row" v-for="(pack, i) in packs" :key="pack.id" :class="{ 'mt-10': i > 0 }">
      <label class="name">{{ pack.name }}: </label>
      <SpendSelect :max="data.points" :pool="pool" @change="(val) => onPointsChanged(pack.type, pack, val)" />
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
