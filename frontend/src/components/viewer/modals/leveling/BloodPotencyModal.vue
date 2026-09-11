<script setup lang="ts">
import { computed, ref } from "vue"
import Modal from "@/components/modal/Modal.vue"
import Bullet from "@/components/Bullet.vue"
import { useStore } from "@/app/store"
import { levelResolver } from "@/libs/resolvers/level-resolver"
import CharacterStorage from "@/libs/io/character-storage"
import { LevelChangeType } from "@/@types/gameline"
import type { ICharacter } from "@/@types/models"

const store = useStore()

const MAX_LEVEL = 10

const show = ref(false)
const target = ref(0)
const editingCharacter = computed(() => store.editingCharacter as ICharacter | undefined)

function showModal() {
  target.value = (editingCharacter.value?.bloodPotency ?? 0) + 1
  show.value = true
}

/** Cumulative cost to raise blood potency from its current value up to `toLevel`. */
function cumulativeCost(toLevel: number): number {
  const current = editingCharacter.value?.bloodPotency ?? 0
  let cost = 0
  for (let v = current; v < toLevel; v++) {
    cost += (v + 1) * 10
  }
  return cost
}

const reachableLevels = computed(() => {
  const char = editingCharacter.value
  if (!char) return []
  const out: { level: number; cost: number; affordable: boolean }[] = []
  for (let lvl = char.bloodPotency + 1; lvl <= MAX_LEVEL; lvl++) {
    const cost = cumulativeCost(lvl)
    out.push({ level: lvl, cost, affordable: cost <= char.exp })
  }
  return out
})

const neededExp = computed(() => cumulativeCost(target.value))

function level() {
  const char = editingCharacter.value
  if (!char) return

  while (char.bloodPotency < target.value && char.bloodPotency < MAX_LEVEL) {
    const cost = levelResolver.resolveBloodPotency(char)
    if (char.exp < cost) break

    CharacterStorage.trackLevelChange(
      char,
      LevelChangeType.BloodPotency,
      cost,
      `${char.bloodPotency} → ${char.bloodPotency + 1}`,
    )

    char.bloodPotency++
  }

  CharacterStorage.saveCharacter(char)
  show.value = false
}

defineExpose({ showModal })
</script>

<template>
  <Modal :shown="show" @close="show = false">
    <div v-if="editingCharacter" class="mini-modal">
      <span data-agent-hint style="display: none">Blutmacht steigern: waehle die Zielstufe (select:level-target, Kosten sind kumulativ) und bestaetige mit level:confirm. Ein Sprung auf eine hoehere Stufe zahlt alle Zwischenstufen.</span>
      <b>Blutmacht steigern:</b>

      <div class="form-group centerline">
        <label>Zielstufe:</label>
        <select class="form-control" v-model.number="target" data-agent="select:level-target" data-agent-label="Zielstufe">
          <option v-for="r in reachableLevels" :key="r.level" :value="r.level" :disabled="!r.affordable">
            Stufe {{ r.level }} ({{ r.cost }} EXP)
          </option>
        </select>
      </div>

      <div class="centerline">
        {{ editingCharacter.bloodPotency }} &#8594; {{ target }}
        <bullet />
        {{ `Kosten: ${neededExp} EXP` }}
      </div>

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
