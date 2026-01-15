<script setup lang="ts">
import { computed } from "vue"
import EditorForm from "@/components/editor/EditorForm.vue"
import TipButton from "@/components/editor/TipButton.vue"
import {useStore} from "@/app/store.ts";
import {getAttributeDescription, getAttributeName, getCategoryName} from "@/@types/models.ts";
import type {IEdition5Sheet} from "@/@types/gameline.ts";

type PointUsage = {
  point: number
  amount: number
}

const store = useStore()

function getPointsPool(): PointUsage[] {
  return [
    { point: 1, amount: 1 },
    { point: 2, amount: 4 },
    { point: 3, amount: 3 },
    { point: 4, amount: 1 },
  ]
}

function getUsedPoints(): PointUsage[] {
  const char = store.editingCharacter as any as IEdition5Sheet
  if (!char) return []
  const used: PointUsage[] = []

  const usage = (val: number) => {
    const idx = used.findIndex((p) => p.point === val)
    if (idx === -1) used.push({ point: val, amount: 1 })
    else used[idx]!.amount++
  }

  for (const cat of char.categories) {
    for (const attr of cat.attributes) {
      usage(attr.value)
    }
  }

  return used
}

function getSubtractedPool(): PointUsage[] {
  const pool = getPointsPool()
  const used = getUsedPoints()
  for (const p of used) {
    const pp = pool.find((x) => x.point === p.point)
    if (pp) pp.amount -= p.amount
  }
  return pool
}

function getAvailableAmount(val: number) {
  const pool = getSubtractedPool()
  const usage = pool.find((p) => p.point === val)
  return usage ? usage.amount : -1
}

function isPointAvailable(val: number) {
  return getAvailableAmount(val) > 0
}

const canGoNext = computed(() => {
  const pool = getSubtractedPool()
  return pool.every((p) => p.amount === 0)
})
</script>

<template>
  <EditorForm :can-go-next="canGoNext" next-step="editor-skills">
    <div
      v-if="store.editingCharacter"
      class="page"
    >
      <div class="wrap">
        <div class="form-group intro">
          <label class="required"><b>Gib folgendermaßen Punkte für deine Attribute aus:</b></label>
          <ul>
            <li>Nimm {{getAvailableAmount(4)}} Attribut auf 4</li>
            <li>Nimm {{getAvailableAmount(3)}} Attribut(e) auf 3</li>
            <li>Nimm {{getAvailableAmount(2)}} Attribut(e) auf 2</li>
            <li>Nimm {{getAvailableAmount(1)}} Attribut auf 1</li>
          </ul>
        </div>

        <div class="grid">
          <div class="card cat" v-for="cat in (store.editingCharacter as any as IEdition5Sheet).categories" :key="cat.name">
            <div class="cat-title">
              <b>{{ getCategoryName(cat.name) }}</b>
            </div>

            <div class="row" v-for="attr in cat.attributes" :key="attr.key">
              <small class="label">
                <TipButton :content="getAttributeDescription(attr.key)" />
                {{getAttributeName(attr.key)}}:
              </small>

              <select class="form-control control" v-model="attr.value">
                <option :value="0">0</option>
                <option
                  v-for="i in [1, 2, 3, 4]"
                  :key="i"
                  :value="i"
                  :disabled="!isPointAvailable(i)"
                >
                  {{ i }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  </EditorForm>
</template>

<style scoped lang="scss">
.page {
  width: 100%;
  height: 100%;
  padding: clamp(1rem, 4vw, 5rem);
  display: flex;
  justify-content: center;
  align-items: center;
}

.wrap {
  width: min(1100px, 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.intro {
  text-align: center;
  width: min(520px, 100%);
  ul {
    margin: 0.5rem 0 0;
    padding-left: 1.1rem;
    text-align: left;
    li {
      margin: 0;
    }
  }
}

.grid {
  width: 100%;
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.cat {
  margin: 0;
  padding: 1rem;
}

.cat-title {
  width: 100%;
  text-align: center;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 0.75rem;
}

.row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.35rem 0;
}

.label {
  flex: 1;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.control {
  width: 7rem;
  flex: 0 0 auto;
}

@media (max-width: 1050px) {
  .grid {
    grid-template-columns: 1fr;
  }
  .control {
    width: 6.5rem;
  }
}
</style>
