<script setup lang="ts">
import { computed, ref } from "vue"
import TipButton from "@/components/editor/TipButton.vue"
import SkillInfoModal from "@/components/editor/modals/SkillInfoModal.vue"
import {getSkillName, type ICharacter, type SkillKeys} from "@/@types/models"
import { usePTActionRegistration } from "@/components/editor/actions/PTActionBase"

defineProps<{
  data: { choices: string[] }
  index?: number
}>()

const skillInfoModal = ref<InstanceType<typeof SkillInfoModal> | null>(null)

const selected = ref("")
const input = ref("")

function getSkillKey(choice: string): SkillKeys {
  return choice.split("=")[0] as SkillKeys
}

function needsInput() {
  return selected.value.split("=")[1]?.startsWith("$input")
}

function getPlaceholder(choice: string) {
  const right = choice.split("=")[1] ?? ""
  const parts = right.split(":")
  return parts[1] ? parts[1] : ""
}

function onSelectionChange() {
  input.value = ""
  if (!needsInput()) {
    input.value = (selected.value.split("=")[1] ?? "").toString()
  }
}

function applyOutput(char: ICharacter) {
  const key = getSkillKey(selected.value)
  for (let i = 0; i < char.categories.length; i++) {
    const category: any = (char.categories as any)[i]
    const skill = category.skills.find((s: any) => s.key === key)
    if (skill) {
      skill.specialization.push(input.value)
      break
    }
  }
}

function isReady() {
  return !!selected.value && (!needsInput() || input.value.trim().length > 0)
}

const selectedSkillKey = computed(() => (selected.value ? getSkillKey(selected.value) : null))

usePTActionRegistration({ applyOutput, isReady })
defineExpose({ applyOutput, isReady })
</script>

<template>
  <div class="form-group mb-0">
    <label class="required">Wähle eine Spezialisierung:</label>

    <div class="row">
      <select v-model="selected" class="form-control" @change="onSelectionChange" :data-agent="'select:pt-action:' + (index ?? 0)">
        <option v-for="(c, i) in data.choices" :key="i" :value="c">
          {{ getSkillName(getSkillKey(c)) }}
        </option>
      </select>

      <TipButton
        v-if="selectedSkillKey"
        :override="true"
        @click="skillInfoModal?.showModal(selectedSkillKey)"
      />
    </div>

    <input
      class="form-control mt-10"
      v-if="selected.trim().length > 0"
      v-model="input"
      :placeholder="getPlaceholder(selected)"
      :disabled="!needsInput()"
    />

    <SkillInfoModal ref="skillInfoModal" />
  </div>
</template>

<style scoped lang="scss">
.row {
  width: 100%;
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;
}
@media (max-width: 520px) {
  .row {
    flex-direction: row;
  }
  .row .form-control {
    flex: 1 1 auto;
    min-height: 44px;
  }
}
</style>
