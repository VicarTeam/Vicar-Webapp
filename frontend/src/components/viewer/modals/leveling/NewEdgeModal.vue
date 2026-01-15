<script setup lang="ts">
import { computed, ref } from "vue"
import Modal from "@/components/modal/Modal.vue"
import TipButton from "@/components/editor/TipButton.vue"
import EdgeInfoModal from "@/components/viewer/modals/EdgeInfoModal.vue"
import CharacterStorage from "@/libs/io/character-storage"
import { LevelChangeType } from "@/@types/gameline"
import type { H5EdgeCategory, IH5Edge, IHunterSheet } from "@/@types/h5"
import { edges as allEdges } from "@/app/data/h5"
import { useStore } from "@/app/store"

const store = useStore()
const editingCharacter = computed(() => store.editingCharacter as IHunterSheet | undefined)

const show = ref(false)
const selectedEdgeId = ref<number | null>(null)
const onConfirm = ref<((edge: IH5Edge) => void) | null>(null)
const infoMessage = ref<string | null>(null)

const edgeInfoModal = ref<InstanceType<typeof EdgeInfoModal> | null>(null)

function showModal(cb: (edge: IH5Edge) => void) {
  onConfirm.value = cb
  selectedEdgeId.value = null
  infoMessage.value = null
  show.value = true
}

const availableEdges = computed<IH5Edge[]>(() => {
  const char = editingCharacter.value
  if (!char) return []
  const chosen = new Set((char.edges || []).map((e) => e.id))
  return allEdges.filter((e) => !chosen.has(e.id)).sort((a, b) => a.name.localeCompare(b.name))
})

const selectedEdge = computed<IH5Edge | null>(() => {
  if (selectedEdgeId.value == null) return null
  return allEdges.find((e) => e.id === selectedEdgeId.value) || null
})

const neededExp = computed(() => 7)

const canConfirm = computed(() => {
  const char = editingCharacter.value
  return !!selectedEdge.value && !!char && (char.exp ?? 0) >= neededExp.value
})

const categoryLabelMap: Record<any, string> = {
  Asset: "Vermögen",
  Aptitude: "Begabung",
  Endowment: "Weihe",
}

function categoryLabel(cat: H5EdgeCategory) {
  return categoryLabelMap[cat as any] || String(cat)
}

function showCurrentInfo() {
  if (selectedEdge.value) edgeInfoModal.value?.showModal(selectedEdge.value)
}

function confirm() {
  const char = editingCharacter.value
  if (!char || !selectedEdge.value || !canConfirm.value) {
    infoMessage.value = "Bitte ein Edge wählen und genügend EXP besitzen."
    return
  }

  CharacterStorage.trackLevelChange(char as any, LevelChangeType.Edge, neededExp.value, `${selectedEdge.value.name} hinzugefügt`)
  CharacterStorage.saveCharacter(char as any)

  onConfirm.value?.(selectedEdge.value)
  show.value = false
}

defineExpose({ showModal })
</script>

<template>
  <Modal :shown="show" @close="show = false">
    <div class="edge-modal">
      <b>Neues Edge wählen</b>
      <small class="text-muted">Kosten: <b>{{ neededExp }}</b> EXP</small>

      <div>
        <label class="form-label">
          Edge
          <TipButton v-if="selectedEdge" :override="true" @click="showCurrentInfo" />
        </label>

        <select v-model="selectedEdgeId" class="form-control">
          <option :value="null" disabled>– Bitte wählen –</option>
          <option v-for="e in availableEdges" :key="e.id" :value="e.id">
            {{ e.name }} ({{ categoryLabel(e.category) }})
          </option>
        </select>
      </div>

      <div class="summary">
        <span v-if="selectedEdge"><b>{{ selectedEdge.name }}</b></span>
        <span v-if="selectedEdge"> &nbsp;•&nbsp; </span>
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

      <EdgeInfoModal ref="edgeInfoModal" />
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.edge-modal {
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
