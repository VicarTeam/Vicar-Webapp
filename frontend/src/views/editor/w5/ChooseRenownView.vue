<script setup lang="ts">
import { computed, ref } from "vue"
import EditorForm from "@/components/editor/EditorForm.vue"
import TipButton from "@/components/editor/TipButton.vue"
import type { IWerewolfW5Sheet, W5RenownKey } from "@/@types/w5"
import { useStore } from "@/app/store"

const store = useStore()
const editingCharacter = computed(() => store.editingCharacter as IWerewolfW5Sheet | undefined)

const otherRenown = ref<W5RenownKey | "none">("none")

const RENOWN_NAME: Record<string, string> = {
  glory: "Ruhm",
  honor: "Ehre",
  wisdom: "Weisheit",
  none: "—",
}

function getRenownName(k: any) {
  return RENOWN_NAME[String(k)] ?? "—"
}

const availableRenownKeys = computed(() => {
  const char = editingCharacter.value
  if (!char?.tribe) return []
  const all = ["glory", "honor", "wisdom"]
  return all.filter(k => k !== String(char.tribe.renown))
})

function applyRenown() {
  const char = editingCharacter.value
  if (!char?.tribe) return
  if (otherRenown.value === "none") return

  for (const r of char.renown) {
    if (String(r.key) === String(char.tribe.renown)) r.value = 2
    else if (String(r.key) === String(otherRenown.value)) r.value = 1
    else r.value = 0
  }
}

const canGoNext = computed(() => otherRenown.value !== "none")
</script>

<template>
  <EditorForm :can-go-next="canGoNext" next-step="editor-traits" @before-next="applyRenown">
    <div v-if="editingCharacter" class="outer">
      <div class="form-group center">
        <label>
          Stammes-Ansehen:
          <b>{{ getRenownName(editingCharacter.tribe.renown) }}</b>
          (wird auf 2 gesetzt)
        </label>

        <label class="required">
          Zweites Ansehen wählen:
          <TipButton content="Du erhältst zusätzlich 1 Punkt in einem weiteren Ansehen." />
        </label>

        <select class="form-control select" v-model="otherRenown">
          <option value="none" disabled>Bitte wählen</option>
          <option v-for="r in availableRenownKeys" :key="r" :value="r">{{ getRenownName(r) }}</option>
        </select>
      </div>
    </div>
  </EditorForm>
</template>

<style scoped lang="scss">
.outer {
  width: 100%;
  height: 100%;
  padding: 5rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.center {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.select {
  width: 30rem;
}
</style>
