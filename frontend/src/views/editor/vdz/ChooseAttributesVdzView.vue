<script setup lang="ts">
import { computed, ref } from "vue"
import EditorForm from "@/components/editor/EditorForm.vue"
import { getVdzAttributeName, type IVdzSheet, VdzAttribute, vdzMentalAttributes, vdzPhysicalAttributes, vdzSocialAttributes } from "@/@types/vdz"
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
// Jedes Attribut startet bei 1; verteilt werden die Punkte obendrauf (max. 5).
const baseNumbers = [1, 2, 3, 4, 5]

const store = useStore()
const editingCharacter = computed(() => store.editingCharacter as IVdzSheet | undefined)

const physicalPriority = ref<AttributePriority>(AttributePriority.None)
const socialPriority = ref<AttributePriority>(AttributePriority.None)
const mentalPriority = ref<AttributePriority>(AttributePriority.None)

const selectablePhysicalPriorities = computed(() => priorities.filter((p) => ![socialPriority.value, mentalPriority.value].includes(p)))
const selectableSocialPriorities = computed(() => priorities.filter((p) => ![physicalPriority.value, mentalPriority.value].includes(p)))
const selectableMentalPriorities = computed(() => priorities.filter((p) => ![physicalPriority.value, socialPriority.value].includes(p)))

function getAttrValue(attr: VdzAttribute): number {
  return (editingCharacter.value?.attributes?.[attr] ?? 1) as number
}

// Basiswert 1 pro Attribut zählt nicht als verteilter Punkt
function sumFor(attrs: readonly VdzAttribute[], enabled: boolean): number {
  if (!enabled) return 0
  return attrs.reduce((acc, a) => acc + getAttrValue(a) - 1, 0)
}

function maxFor(priority: AttributePriority) {
  return priorityMax[priority] || 0
}

const usedPhysicalAmount = computed(() => sumFor(vdzPhysicalAttributes, physicalPriority.value !== AttributePriority.None))
const usedSocialAmount = computed(() => sumFor(vdzSocialAttributes, socialPriority.value !== AttributePriority.None))
const usedMentalAmount = computed(() => sumFor(vdzMentalAttributes, mentalPriority.value !== AttributePriority.None))

function isOptionDisabled(kind: "physical" | "social" | "mental", attr: VdzAttribute, candidate: number): boolean {
  if (candidate === 1) return false
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

  const newTotal = used - (current - 1) + (candidate - 1)
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

function priorityLabel(p: AttributePriority): string {
  return p === AttributePriority.Primary ? "Primär (7)" : p === AttributePriority.Secondary ? "Sekundär (5)" : "Tertiär (3)"
}
</script>

<template>
  <EditorForm :can-go-next="canGoNext" next-step="editor-vdz-abilities">
    <div v-if="editingCharacter" class="attributes-view">
      <div class="card" style="width: 50rem">
        <small>Setze eine Attributskategorie auf "primär" (7 Punkte), eine auf "sekundär" (5 Punkte) und eine auf "tertiär" (3 Punkte) und verteile die Punkte. Jedes Attribut startet bereits mit 1 Punkt.</small>
      </div>

      <div class="panels">
        <div class="card">
          <h6>Körperlich</h6>
          <select class="form-control" v-model="physicalPriority">
            <option :value="AttributePriority.None">Auswählen</option>
            <option v-for="p in selectablePhysicalPriorities" :key="p" :value="p">{{ priorityLabel(p) }}</option>
          </select>

          <div class="info">
            <span>{{ usedPhysicalAmount }} / {{ maxFor(physicalPriority) }}</span>
          </div>

          <div class="attribute-col">
            <div v-for="attr in vdzPhysicalAttributes" :key="attr" class="attribute">
              <label>{{ getVdzAttributeName(attr) }}:</label>
              <select class="form-control" v-model.number="editingCharacter.attributes[attr]" :disabled="physicalLocked">
                <option v-for="n in baseNumbers" :key="n" :value="n" :disabled="isOptionDisabled('physical', attr, n)">{{ n }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="card">
          <h6>Gesellschaftlich</h6>
          <select class="form-control" v-model="socialPriority">
            <option :value="AttributePriority.None">Auswählen</option>
            <option v-for="p in selectableSocialPriorities" :key="p" :value="p">{{ priorityLabel(p) }}</option>
          </select>

          <div class="info">
            <span>{{ usedSocialAmount }} / {{ maxFor(socialPriority) }}</span>
          </div>

          <div class="attribute-col">
            <div v-for="attr in vdzSocialAttributes" :key="attr" class="attribute">
              <label>{{ getVdzAttributeName(attr) }}:</label>
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
            <option v-for="p in selectableMentalPriorities" :key="p" :value="p">{{ priorityLabel(p) }}</option>
          </select>

          <div class="info">
            <span>{{ usedMentalAmount }} / {{ maxFor(mentalPriority) }}</span>
          </div>

          <div class="attribute-col">
            <div v-for="attr in vdzMentalAttributes" :key="attr" class="attribute">
              <label>{{ getVdzAttributeName(attr) }}:</label>
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
  padding: 1rem;

  .panels {
    display: flex;
    align-items: flex-start;
    gap: 2rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .card {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 22rem;

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
