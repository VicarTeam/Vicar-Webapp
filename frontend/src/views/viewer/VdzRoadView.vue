<script setup lang="ts">
import { computed, inject } from "vue"
import { useStore } from "@/app/store"
import Dots from "@/components/progress/Dots.vue"
import TipButton from "@/components/editor/TipButton.vue"
import LevelButton from "@/components/viewer/LevelButton.vue"
import { vdzBackgrounds } from "@/app/data/vdz"
import type { IVdzSheet, VdzRequestLevelFn } from "@/@types/vdz"

const store = useStore()
const editingCharacter = computed(() => store.editingCharacter as IVdzSheet | undefined)
const isLevelMode = computed(() => store.isLevelMode)

const requestLevel = inject("request-vdz-level") as VdzRequestLevelFn | undefined

const road = computed(() => editingCharacter.value?.road)

const currentSin = computed(() => {
  const c = editingCharacter.value
  const r = road.value
  if (!c || !r || r.hierarchyOfSins.length === 0) return null
  return r.hierarchyOfSins.find(s => s.rating === c.roadRating) ?? null
})

function backgroundDescription(name: string): string {
  return vdzBackgrounds.find(b => b.name === name)?.description ?? ""
}

function backgroundLevelText(name: string, level: number): string {
  const bg = vdzBackgrounds.find(b => b.name === name)
  return bg?.levels?.[String(level)] ?? ""
}

const missingBackgrounds = computed(() => {
  const c = editingCharacter.value
  if (!c) return []
  return vdzBackgrounds.filter(bg => !c.backgrounds.some(b => b.name === bg.name))
})

function addBackground(name: string) {
  requestLevel?.("background", name)
}
</script>

<template>
  <div v-if="editingCharacter && road" class="road-view">
    <div class="card road">
      <b class="title">{{ road.name }} <i class="latin">({{ road.latinName }})</i></b>
      <small v-if="road.followerName" class="meta">Anhänger: {{ road.followerName }}</small>

      <div class="desc">{{ road.description }}</div>

      <h6 class="sub">Aura: {{ road.aura.name }} <TipButton :content="road.aura.description" /></h6>

      <h6 class="sub">Moralvorstellungen:</h6>
      <ul class="ethics">
        <li v-for="(e, i) in road.ethics" :key="i">{{ e }}</li>
      </ul>

      <template v-if="road.hierarchyOfSins.length > 0">
        <h6 class="sub">Sündenhierarchie:</h6>
        <table class="table sins">
          <thead>
          <tr>
            <th>Wegwert</th>
            <th>Moralische Schwelle</th>
          </tr>
          </thead>
          <tbody>
          <tr
            v-for="s in road.hierarchyOfSins"
            :key="s.rating"
            :class="{ current: s.rating === editingCharacter.roadRating }"
          >
            <td>{{ s.rating }}</td>
            <td>{{ s.sin }}</td>
          </tr>
          </tbody>
        </table>
        <small v-if="currentSin" class="current-sin">
          Aktuelle Schwelle (Wegwert {{ editingCharacter.roadRating }}): <b>{{ currentSin.sin }}</b>
        </small>
      </template>

      <template v-if="road.paths.length > 0">
        <h6 class="sub">Pfade dieses Wegs:</h6>
        <ul class="paths">
          <li v-for="p in road.paths" :key="p.name">
            <b>{{ p.name }}</b> <TipButton :content="p.description" />
          </li>
        </ul>
      </template>
    </div>

    <div class="card backgrounds">
      <b class="title">Hintergründe</b>

      <div v-if="editingCharacter.backgrounds.length === 0" class="empty">
        <small>Keine Hintergründe.</small>
      </div>

      <div v-for="bg in editingCharacter.backgrounds" :key="bg.name" class="bg-row">
        <LevelButton v-if="bg.level < 5" @click="requestLevel?.('background', bg.name)" />
        <small class="name">
          <TipButton v-if="backgroundDescription(bg.name)" :content="backgroundDescription(bg.name)" />
          {{ bg.name }}
        </small>
        <Dots :amount="bg.level" :max="5" />
      </div>

      <div v-for="bg in editingCharacter.backgrounds" :key="bg.name + '-lvl'" class="bg-level-text">
        <small v-if="backgroundLevelText(bg.name, bg.level)">
          <b>{{ bg.name }} {{ bg.level }}:</b> {{ backgroundLevelText(bg.name, bg.level) }}
        </small>
      </div>

      <template v-if="missingBackgrounds.length > 0 && isLevelMode">
        <div class="divider"></div>
        <b class="subtitle">Neuen Hintergrund erwerben (Freie Punkte):</b>
        <div class="missing">
          <button v-for="bg in missingBackgrounds" :key="bg.id" class="btn pill" @click="addBackground(bg.name)">
            + {{ bg.name }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.road-view {
  width: 100%;
  min-height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 2rem;
  padding: 1.5rem;
  flex-wrap: wrap;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  width: min(38rem, 100%);
}

.title {
  font-size: 1.3rem;

  .latin {
    font-size: 1rem;
    font-weight: normal;
    color: #b2b2b2;
  }
}

.meta {
  color: #b2b2b2;
}

.desc {
  opacity: 0.95;
}

.sub {
  margin: 0.35rem 0 0;
  font-weight: bolder;
  font-family: Cinzel, serif;
  letter-spacing: 0.02em;
}

.ethics,
.paths {
  margin: 0;
  padding-left: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.sins tr.current td {
  color: var(--primary-color);
  font-weight: bold;
}

.current-sin {
  opacity: 0.9;
}

.bg-row {
  display: flex;
  align-items: center;
  gap: 1rem;

  .name {
    flex-grow: 1;
  }
}

.bg-level-text {
  opacity: 0.85;
}

.divider {
  width: 100%;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0.5rem 0;
}

.subtitle {
  font-size: 0.9rem;
}

.missing {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.pill {
  padding: 0.3rem 0.6rem;
  font-size: 0.85rem;
}
</style>
