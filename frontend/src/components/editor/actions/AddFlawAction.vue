<script setup lang="ts">
import { computed, ref } from "vue"
import DataManager from "@/libs/data/data-manager"
import PTActionHandler from "@/libs/ptaction-handler"
import type { IFlawChoice, ITrait } from "@/@types/data"
import type { ICharacter } from "@/@types/models"
import { usePTActionRegistration } from "@/components/editor/actions/PTActionBase"

const props = defineProps<{
  data: { choices: IFlawChoice[] }
}>()

const selected = ref<IFlawChoice | null>(null)

function getFlaw(choice: IFlawChoice): ITrait | undefined {
  return DataManager.getFlawOwner(choice)?.disadvantages?.find((d: any) => d.id === choice.flawId)
}

function applyOutput(char: ICharacter) {
  if (selected.value) {
    PTActionHandler.addFlaw(char, selected.value)
  }
}

function isReady() {
  return !!selected.value
}

const selectValue = computed({
  get: () => selected.value?.id ?? null,
  set: (id: number | null) => {
    selected.value = id == null ? null : props.data.choices.find((c) => c.id === id) ?? null
  },
})

usePTActionRegistration({ applyOutput, isReady })
defineExpose({ applyOutput, isReady })
</script>

<template>
  <div class="form-group mb-0">
    <label class="required">Wähle eine Schwäche:</label>
    <select v-model="selectValue" class="form-control">
      <option v-for="(c, i) in data.choices" :key="i" :value="c.id">{{ getFlaw(c)?.name }}</option>
    </select>
  </div>
</template>

<style scoped lang="scss"></style>
