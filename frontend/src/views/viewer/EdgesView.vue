<script setup lang="ts">
import { computed, ref } from "vue"
import { useStore } from "@/app/store"
import type { H5EdgeCategory, IH5Edge, IH5Perk, IH5SelectedPerk, IHunterSheet } from "@/@types/h5"
import { edges as allEdges } from "@/app/data/h5"
import EdgeInfoModal from "@/components/viewer/modals/EdgeInfoModal.vue"
import LevelButton from "@/components/viewer/LevelButton.vue"
import NewEdgeModal from "@/components/viewer/modals/leveling/NewEdgeModal.vue"
import ChooseEdgePerkModal from "@/components/viewer/modals/ChooseEdgePerkModal.vue"

const store = useStore()
const editingCharacter = computed(() => store.editingCharacter as IHunterSheet | undefined)
const isLevelMode = computed(() => store.isLevelMode as boolean)

const edgeInfoModal = ref<InstanceType<typeof EdgeInfoModal> | null>(null)
const newEdgeModal = ref<InstanceType<typeof NewEdgeModal> | null>(null)
const chooseEdgePerkModal = ref<InstanceType<typeof ChooseEdgePerkModal> | null>(null)

const categoryLabelMap: Record<H5EdgeCategory, string> = {
  Asset: "Vermögen",
  Aptitude: "Begabung",
  Endowment: "Weihe",
} as any

const perkIdToPerk = computed<Record<number, IH5Perk>>(() => {
  const map: Record<number, IH5Perk> = {}
  allEdges.forEach(e => e.perks.forEach(p => (map[p.id] = p as any)))
  return map
})

const perkIdToEdge = computed<Record<number, IH5Edge>>(() => {
  const map: Record<number, IH5Edge> = {}
  allEdges.forEach(e => e.perks.forEach(p => (map[p.id] = e as any)))
  return map
})

const currentEdges = computed<IH5Edge[]>(() => {
  const c = editingCharacter.value
  if (!c) return []
  return (c.edges || []).slice().sort((a, b) => a.name.localeCompare(b.name))
})

function perksForEdge(edge: IH5Edge): IH5SelectedPerk[] {
  const c = editingCharacter.value
  if (!c) return []
  const perks = c.perks || []
  return perks.filter(sp => perkIdToEdge.value[sp.perk]?.id === edge.id)
}

function categoryLabel(cat: H5EdgeCategory): string {
  return (categoryLabelMap as any)[cat] || String(cat)
}

function openEdgeInfo(edge: IH5Edge) {
  edgeInfoModal.value?.showModal(edge)
}

function levelEdge(edge: IH5Edge) {
  const c = editingCharacter.value
  if (!c) return
  chooseEdgePerkModal.value?.showModal(edge, (selected: IH5SelectedPerk) => {
    c.perks = [...(c.perks || []), selected]
  })
}

function addNewEdge() {
  const c = editingCharacter.value
  if (!c) return
  newEdgeModal.value?.showModal((edge: IH5Edge) => {
    const set = new Set((c.edges || []).map(e => e.id))
    if (!set.has(edge.id)) {
      c.edges = [...(c.edges || []), edge]
    }
  })
}
</script>

<template>
  <div v-if="editingCharacter" class="edges-view">
    <div class="edges">
      <div class="edge card" v-for="e in currentEdges" :key="e.id" :id="`edge-${e.id}`">
        <div class="top">
          <div class="d-flex align-items-center" style="gap: 0.5rem; flex-grow: 1">
            <LevelButton v-if="isLevelMode" @click="levelEdge(e)" />
            <b @click="openEdgeInfo(e)">{{ e.name }}</b>
            <span class="badge badge-primary ml-5">{{ categoryLabel(e.category) }}</span>
          </div>
          <button class="btn btn-sm" type="button" @click="openEdgeInfo(e)">Info</button>
        </div>

        <div class="perks">
          <div class="perks-title"><b>Perks</b></div>

          <div v-if="perksForEdge(e).length">
            <div v-for="(sp, idx) in perksForEdge(e)" :key="idx" class="perk-row">
              <div class="perk-name">
                {{ perkIdToPerk[sp.perk]?.name || ("#" + sp.perk) }}
                <small v-if="sp.specialization" class="text-muted">({{ sp.specialization }})</small>
              </div>
              <small class="perk-desc text-muted">
                {{ perkIdToPerk[sp.perk]?.description }}
              </small>
            </div>
          </div>

          <div v-else class="text-muted"><small>Keine Perks gewählt.</small></div>
        </div>
      </div>
    </div>

    <div class="card" v-if="isLevelMode">
      <div class="content d-flex justify-content-between align-items-center">
        <div>
          <b>Edges erweitern</b>
          <div class="text-muted small">Füge neue Edges hinzu oder wähle zusätzliche Perks.</div>
        </div>
        <button class="btn btn-primary" @click="addNewEdge">Neues Edge hinzufügen</button>
      </div>
    </div>

    <EdgeInfoModal ref="edgeInfoModal" />
    <ChooseEdgePerkModal ref="chooseEdgePerkModal" />
    <NewEdgeModal ref="newEdgeModal" />
  </div>
</template>

<style scoped lang="scss">
.edges-view {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 2rem;
  padding: 0 2rem;
}

.edges {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  align-content: flex-start;
  justify-content: center;
}

.edge {
  width: 30rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  .top {
    display: flex;
    align-items: center;
    width: 100%;
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    padding-bottom: 0.25rem;
  }

  .perks {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    .perks-title {
      margin-top: 0.5rem;
    }

    .perk-row {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      padding: 0.4rem 0.5rem;
      border-radius: 0.5rem;
      background: rgba(255, 255, 255, 0.04);
    }

    .perk-name {
      font-weight: 600;
    }

    .perk-desc {
      line-height: 1.2;
    }
  }
}
</style>
