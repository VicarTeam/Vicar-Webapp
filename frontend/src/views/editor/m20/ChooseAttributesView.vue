<script setup lang="ts">
import { computed, ref } from "vue"
import EditorForm from "@/components/editor/EditorForm.vue"
import {getAttributeName, type IMageSheet} from "@/@types/m20"
import { mentalAttributes, physicalAttributes, socialAttributes, M20Attribute } from "@/@types/m20"
import { useStore } from "@/app/store"

enum AttributePriority {
  None = 0,
  Primary = 1,
  Secondary = 2,
  Tertiary = 3,
}

const priorities = [AttributePriority.Primary, AttributePriority.Secondary, AttributePriority.Tertiary]
const priorityMax: Record<number, number> = {
  [AttributePriority.None]: 0,
  [AttributePriority.Primary]: 7,
  [AttributePriority.Secondary]: 5,
  [AttributePriority.Tertiary]: 3,
}
const baseNumbers = [0, 1, 2, 3, 4]

const store = useStore()
const editingCharacter = computed(() => store.editingCharacter as IMageSheet | undefined)

const physicalPriority = ref<AttributePriority>(AttributePriority.None)
const socialPriority = ref<AttributePriority>(AttributePriority.None)
const mentalPriority = ref<AttributePriority>(AttributePriority.None)

function onBeforeNext() {
  const c = editingCharacter.value
  if (!c) return
  for (const attr of physicalAttributes) {
    c.attributes[attr]++
  }
}

const selectablePhysicalPriorities = computed(() => priorities.filter((p) => ![socialPriority.value, mentalPriority.value].includes(p)))
const selectableSocialPriorities = computed(() => priorities.filter((p) => ![physicalPriority.value, mentalPriority.value].includes(p)))
const selectableMentalPriorities = computed(() => priorities.filter((p) => ![physicalPriority.value, socialPriority.value].includes(p)))

function getAttrValue(attr: M20Attribute): number {
  return (editingCharacter.value?.attributes?.[attr] ?? 0) as number
}

function sumFor(attrs: readonly M20Attribute[], enabled: boolean): number {
  if (!enabled) return 0
  return attrs.reduce((acc, a) => acc + getAttrValue(a), 0)
}

function maxFor(priority: AttributePriority) {
  return priorityMax[priority] || 0
}

const usedPhysicalAmount = computed(() => sumFor(physicalAttributes, physicalPriority.value !== AttributePriority.None))
const usedSocialAmount = computed(() => sumFor(socialAttributes, socialPriority.value !== AttributePriority.None))
const usedMentalAmount = computed(() => sumFor(mentalAttributes, mentalPriority.value !== AttributePriority.None))

function isOptionDisabled(kind: "physical" | "social" | "mental", attr: M20Attribute, candidate: number): boolean {
  if (candidate === 0) return false
  const current = getAttrValue(attr)

  let used = 0
  let max = 0
  let locked = false

  if (kind === "physical") {
    used = usedPhysicalAmount.value
    max = maxFor(physicalPriority.value)
    locked = physicalPriority.value === AttributePriority.None
  } else if (kind === "social") {
    used = usedSocialAmount.value
    max = maxFor(socialPriority.value)
    locked = socialPriority.value === AttributePriority.None
  } else {
    used = usedMentalAmount.value
    max = maxFor(mentalPriority.value)
    locked = mentalPriority.value === AttributePriority.None
  }

  if (locked) return true
  if (candidate === current) return false

  const newTotal = used - current + candidate
  return newTotal > max
}

const physicalLocked = computed(() => physicalPriority.value === AttributePriority.None)
const socialLocked = computed(() => socialPriority.value === AttributePriority.None)
const mentalLocked = computed(() => mentalPriority.value === AttributePriority.None)

const canGoNext = computed(() => {
  if (
    physicalPriority.value !== AttributePriority.None &&
    socialPriority.value !== AttributePriority.None &&
    mentalPriority.value !== AttributePriority.None
  ) {
    const physicalOk = usedPhysicalAmount.value === maxFor(physicalPriority.value)
    const socialOk = usedSocialAmount.value === maxFor(socialPriority.value)
    const mentalOk = usedMentalAmount.value === maxFor(mentalPriority.value)
    return physicalOk && socialOk && mentalOk
  }
  return false
})
</script>

<template>
  <EditorForm :can-go-next="canGoNext" next-step="editor-m20-abilities" @before-next="onBeforeNext">
    <div v-if="editingCharacter" class="attributes-view">
      <div class="card" style="width: 50rem">
        <small>Setze eine Attributenkategorie auf "primär" (7 Punkte), eine auf "sekundär" (5 Punkte) und eine auf "tertiär" (3 Punkte) und verteile die Punkte auf die Attribute.</small>
      </div>

      <div class="panels">
        <div class="card">
          <h6>Körperlich</h6>
          <select class="form-control" v-model="physicalPriority">
            <option :value="AttributePriority.None">Auswählen</option>
            <option v-for="p in selectablePhysicalPriorities" :key="p" :value="p">
              {{ p === AttributePriority.Primary ? "Primär" : (p === AttributePriority.Secondary ? "Sekundär" : "Tertiär") }}
            </option>
          </select>

          <div class="info">
            <span>{{ usedPhysicalAmount }} / {{ physicalPriority === AttributePriority.None ? 0 : (physicalPriority === AttributePriority.Primary ? 7 : (physicalPriority === AttributePriority.Secondary ? 5 : 3)) }}</span>
          </div>

          <div class="attribute-col">
            <div v-for="attr in physicalAttributes" :key="attr" class="attribute">
              <label>{{ getAttributeName(attr) }}:</label>
              <select class="form-control" v-model.number="editingCharacter.attributes[attr]" :disabled="physicalLocked">
                <option v-for="n in baseNumbers" :key="n" :value="n" :disabled="isOptionDisabled('physical', attr, n)">{{ n }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="card">
          <h6>Sozial</h6>
          <select class="form-control" v-model="socialPriority">
            <option :value="AttributePriority.None">Auswählen</option>
            <option v-for="p in selectableSocialPriorities" :key="p" :value="p">
              {{ p === AttributePriority.Primary ? "Primär" : (p === AttributePriority.Secondary ? "Sekundär" : "Tertiär") }}
            </option>
          </select>

          <div class="info">
            <span>{{ usedSocialAmount }} / {{ socialPriority === AttributePriority.None ? 0 : (socialPriority === AttributePriority.Primary ? 7 : (socialPriority === AttributePriority.Secondary ? 5 : 3)) }}</span>
          </div>

          <div class="attribute-col">
            <div v-for="attr in socialAttributes" :key="attr" class="attribute">
              <label>{{ getAttributeName(attr) }}:</label>
              <select class="form-control" v-model.number="editingCharacter.attributes[attr]" :disabled="socialLocked">
                <option v-for="n in baseNumbers" :key="n" :value="n" :disabled="isOptionDisabled('social', attr, n)">{{ n }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="card">
          <h6>Geistig</h6>
          <select class="form-control" v-model="mentalPriority">
            <option :value="AttributePriority.None">Auswählen</option>
            <option v-for="p in selectableMentalPriorities" :key="p" :value="p">
              {{ p === AttributePriority.Primary ? "Primär" : (p === AttributePriority.Secondary ? "Sekundär" : "Tertiär") }}
            </option>
          </select>

          <div class="info">
            <span>{{ usedMentalAmount }} / {{ mentalPriority === AttributePriority.None ? 0 : (mentalPriority === AttributePriority.Primary ? 7 : (mentalPriority === AttributePriority.Secondary ? 5 : 3)) }}</span>
          </div>

          <div class="attribute-col">
            <div v-for="attr in mentalAttributes" :key="attr" class="attribute">
              <label>{{ getAttributeName(attr) }}:</label>
              <select class="form-control" v-model.number="editingCharacter.attributes[attr]" :disabled="mentalLocked">
                <option v-for="n in baseNumbers" :key="n" :value="n" :disabled="isOptionDisabled('mental', attr, n)">{{ n }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  </EditorForm>
</template>

<style scoped lang="scss">
.attributes-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  .panels {
    display: flex;
    align-items: flex-start;
    gap: 2rem;
    flex-wrap: wrap;
  }

  .card {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 30rem;

    h6 {
      margin: 0 0 0.5rem;
      font-weight: bold;
      text-align: center;
    }

    .info {
      font-size: 0.85rem;
      text-align: right;
      opacity: 0.8;
    }

    .attribute-col {
      margin-top: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      .attribute {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.5rem;

        label {
          margin: 0;
        }

        select {
          width: 6rem;
        }
      }
    }
  }
}
</style>
