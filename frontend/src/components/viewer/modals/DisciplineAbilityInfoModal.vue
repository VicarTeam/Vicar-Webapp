<script setup lang="ts">
import { ref } from "vue"
import Modal from "@/components/modal/Modal.vue"
import DataManager from "@/libs/data/data-manager.ts"
import type { IDiscipline, IDisciplineAbility } from "@/@types/data.ts"
import type { ILeveledDisciplineAbility } from "@/@types/models.ts"

const show = ref(false)
const ability = ref<IDisciplineAbility | null>(null)
const abilities = ref<ILeveledDisciplineAbility[]>([])

function showModal(a: IDisciplineAbility, discipline: IDiscipline) {
  ability.value = a
  abilities.value = DataManager.normalToLeveledAbilities(discipline)
  show.value = true
}

function getCombo(): string {
  if (!ability.value?.combination) return ""
  return (DataManager.getDiscipline(ability.value.combination.id)?.name ?? "") + " " + ability.value.combination.level
}

function getRequirement(): string {
  if (!ability.value?.requirement) return ""
  return abilities.value.find((a) => a.id === ability.value!.requirement)?.name ?? ""
}

defineExpose({ showModal })
</script>

<template>
  <Modal :shown="show" @close="show = false">
    <div v-if="ability" class="ability-info">
      <small><i>{{ (ability as any).summary }}</i></small>
      <hr />
      <small v-if="(ability as any).requirement"><b>Voraussetzung</b>: {{ getRequirement() }}</small>
      <small v-if="(ability as any).combination"><b>Kombination</b>: {{ getCombo() }}</small>
      <hr v-if="(ability as any).combination || (ability as any).requirement" />
      <span><b>Kosten</b>: {{ (ability as any).costs }}</span>
      <span v-if="(ability as any).diceSupplies"><b>Würfelpool</b>: {{ (ability as any).diceSupplies }}</span>
      <span><b>System</b>: <span v-html="(ability as any).system" /></span>
      <small v-if="(ability as any).alternatives && (ability as any).alternatives.length > 0"><b>Alternativen</b>: {{ (ability as any).alternatives.join(", ") }}</small>
      <span><b>Dauer</b>: {{ (ability as any).duration }}</span>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.ability-info {
  width: 100%;
  max-height: min(60vh, 50rem);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  gap: 1rem;
}
</style>
