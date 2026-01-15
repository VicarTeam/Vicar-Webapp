<script setup lang="ts">
import { computed, ref } from "vue"
import Modal from "@/components/modal/Modal.vue"
import CharacterStorage from "@/libs/io/character-storage.ts"
import type { IH5Edge, IH5Perk, IH5SelectedPerk, IHunterSheet } from "@/@types/h5.ts"
import { LevelChangeType } from "@/@types/gameline.ts"
import { useStore } from "@/app/store.ts"

const store = useStore()

const show = ref(false)
const edge = ref<IH5Edge | null>(null)
const selectedPerkId = ref<number | null>(null)
const specialization = ref("")
const onConfirm = ref<((sp: IH5SelectedPerk) => void) | null>(null)
const infoMessage = ref<string | null>(null)

function showModal(e: IH5Edge, cb: (sp: IH5SelectedPerk) => void) {
  edge.value = e
  onConfirm.value = cb
  selectedPerkId.value = null
  specialization.value = ""
  infoMessage.value = null
  show.value = true
}

const editingCharacter = computed(() => store.editingCharacter as IHunterSheet | undefined)

const selectedPerk = computed<IH5Perk | null>(() => {
  if (!edge.value || selectedPerkId.value == null) return null
  return edge.value.perks.find((p) => p.id === selectedPerkId.value) || null
})

const neededExp = computed(() => 3)

const canConfirm = computed(() => {
  return !!selectedPerk.value && !!editingCharacter.value && (editingCharacter.value.exp ?? 0) >= neededExp.value
})

function confirm() {
  if (!canConfirm.value || !selectedPerk.value || !editingCharacter.value) {
    infoMessage.value = "Bitte einen Perk wählen und genügend EXP besitzen."
    return
  }

  const spec = (specialization.value || "").trim()
  CharacterStorage.trackLevelChange(
    editingCharacter.value as any,
    LevelChangeType.EdgePerk,
    neededExp.value,
    selectedPerk.value.name + (spec.length <= 0 ? "" : ` (${spec})`) + " hinzugefügt",
  )
  CharacterStorage.saveCharacter(editingCharacter.value as any)

  onConfirm.value?.({
    perk: selectedPerk.value.id,
    specialization: spec,
  })

  show.value = false
}

defineExpose({ showModal })
</script>

<template>
  <Modal :shown="show" @close="show = false">
    <div class="perk-modal">
      <b>Perk wählen</b>
      <small class="text-muted">
        Edge: <b>{{ edge?.name || "—" }}</b> • Kosten: <b>{{ neededExp }}</b> EXP
      </small>

      <div>
        <label class="form-label">Perk</label>
        <select v-model="selectedPerkId" class="form-control">
          <option :value="null" disabled>– Bitte wählen –</option>
          <option v-for="p in edge?.perks || []" :key="p.id" :value="p.id">
            {{ p.name }}
          </option>
        </select>
        <small v-if="selectedPerk" class="text-muted d-block mt-5">{{ selectedPerk.description }}</small>
      </div>

      <div>
        <label class="form-label">Spezialisierung (optional)</label>
        <input
          type="text"
          class="form-control"
          v-model="specialization"
          placeholder="z. B. Kreaturentyp / Detail"
        />
      </div>

      <div class="summary">
        <span v-if="selectedPerk"><b>{{ selectedPerk.name }}</b></span>
        <span v-if="selectedPerk"> &nbsp;•&nbsp; </span>
        <span v-if="editingCharacter">
          Benötigte EXP: <b>{{ neededExp }}</b> &nbsp;|&nbsp; Verfügbar: <b>{{ editingCharacter.exp }}</b>
        </span>
      </div>

      <div class="actions">
        <button class="btn btn-primary" :disabled="!canConfirm" @click="confirm">
          Bestätigen (−{{ neededExp }} EXP)
        </button>
      </div>

      <div v-if="infoMessage" class="alert alert-secondary mt-10">{{ infoMessage }}</div>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.perk-modal {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.summary {
  width: 100%;
  text-align: center;
}

.actions {
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
