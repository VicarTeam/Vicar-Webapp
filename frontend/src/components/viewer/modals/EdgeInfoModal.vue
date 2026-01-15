<script setup lang="ts">
import { computed, ref } from "vue"
import Modal from "@/components/modal/Modal.vue"
import type { IH5Edge } from "@/@types/h5.ts"

const show = ref(false)
const edge = ref<IH5Edge | null>(null)
const expanded = ref<Record<number, boolean>>({})

function showModal(e: IH5Edge) {
  edge.value = e
  expanded.value = {}
  show.value = true
}

function togglePerk(id: number) {
  expanded.value = { ...expanded.value, [id]: !expanded.value[id] }
}

const areAllExpanded = computed(() => {
  if (!edge.value?.perks?.length) return false
  return edge.value.perks.every((p) => !!expanded.value[p.id])
})

function toggleAll() {
  if (!edge.value?.perks) return
  const target = !areAllExpanded.value
  const next: Record<number, boolean> = {}
  edge.value.perks.forEach((p) => (next[p.id] = target))
  expanded.value = next
}

defineExpose({ showModal })
</script>

<template>
  <Modal :shown="show" @close="show = false">
    <div v-if="edge" class="edge-info">
      <div class="header">
        <h5 class="m-0">
          {{ edge.name }}
          <span class="badge badge-primary ml-5">{{ edge.category }}</span>
        </h5>
        <button class="btn btn-sm" type="button" @click="toggleAll">
          {{ areAllExpanded ? "Alle einklappen" : "Alle ausklappen" }}
        </button>
      </div>

      <small v-if="edge.description"><i>{{ edge.description }}</i></small>
      <hr />

      <div class="edge-meta">
        <span v-if="edge.pool"><b>Würfelpool</b>: {{ edge.pool }}</span>
        <span><b>Regeln</b>: <span v-html="edge.system"></span></span>
      </div>

      <div class="mt-20">
        <b>Perks</b>

        <div v-if="edge.perks && edge.perks.length" class="mt-10">
          <div v-for="perk in edge.perks" :key="perk.id" class="card mb-10 perk-card">
            <div class="card-header perk-header" role="button" @click="togglePerk(perk.id)">
              <span>{{ perk.name }}</span>
              <span class="text-muted">{{ expanded[perk.id] ? "▾" : "▸" }}</span>
            </div>
            <div v-show="expanded[perk.id]" class="card-body p-15">
              <p class="m-0">{{ perk.description }}</p>
            </div>
          </div>
        </div>

        <div v-else class="text-muted mt-10">
          <small>Keine Perks verfügbar.</small>
        </div>
      </div>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.edge-info {
  width: 100%;
  max-height: min(70vh, 50rem);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.edge-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.perk-header {
  cursor: pointer;
  user-select: none;
}
</style>
