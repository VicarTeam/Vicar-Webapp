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

const MAX_LEVEL = 5

const show = ref(false)
const data = ref<ISkillData | null>(null)
const target = ref(0)

function showModal(d: ISkillData) {
  data.value = d
  target.value = d.value + 1
  show.value = true
}

/** Cumulative cost to raise the skill from its current value up to `toLevel`. */
function cumulativeCost(toLevel: number): number {
  const d = data.value
  if (!d) return Infinity
  let cost = 0
  for (let v = d.value; v < toLevel; v++) {
    cost += (v + 1) * 3
  }
  return cost
}

const reachableLevels = computed(() => {
  const d = data.value
  const exp = editingCharacter.value?.exp ?? 0
  if (!d) return []
  const out: { level: number; cost: number; affordable: boolean }[] = []
  for (let lvl = d.value + 1; lvl <= MAX_LEVEL; lvl++) {
    const cost = cumulativeCost(lvl)
    out.push({ level: lvl, cost, affordable: cost <= exp })
  }
  return out
})

const neededExp = computed(() => cumulativeCost(target.value))

function level() {
  const char = editingCharacter.value
  const skill = data.value
  if (!char || !skill) return

  while (skill.value < target.value && skill.value < MAX_LEVEL) {
    const cost = levelResolver.resolveSkill(char, skill.key)
    if (char.exp < cost) break

    CharacterStorage.trackLevelChange(
      char,
      LevelChangeType.Skill,
      cost,
      `${getSkillName(skill.key)}: ${skill.value} → ${skill.value + 1}`,
    )

    skill.value++
  }

  CharacterStorage.saveCharacter(char)
  show.value = false
}

defineExpose({ showModal })
</script>

<template>
  <Modal :shown="show" @close="show = false">
    <div v-if="data && editingCharacter" class="mini-modal">
      <span data-agent-hint style="display: none">Faehigkeit steigern: waehle die Zielstufe (select:level-target, Kosten sind kumulativ) und bestaetige mit level:confirm. Ein Sprung auf eine hoehere Stufe zahlt alle Zwischenstufen.</span>
      <b>Fähigkeit steigern:</b>

      <div class="form-group centerline">
        <label>Zielstufe:</label>
        <select class="form-control" v-model.number="target" data-agent="select:level-target" data-agent-label="Zielstufe">
          <option v-for="r in reachableLevels" :key="r.level" :value="r.level" :disabled="!r.affordable">
            Stufe {{ r.level }} ({{ r.cost }} EXP)
          </option>
        </select>
      </div>

      <div class="centerline">
        {{ data.value }} &#8594; {{ target }}
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
