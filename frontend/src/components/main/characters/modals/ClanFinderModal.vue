<script setup lang="ts">
import { computed, ref } from "vue"
import Modal from "@/components/modal/Modal.vue"
import ClanSymbol from "@/components/symbols/ClanSymbol.vue"
import { findClanMatches, getAllDisciplines } from "@/libs/data/clan-matchmaker"
import type { IDiscipline } from "@/@types/data"

const show = ref(false)
const selected = ref<Set<number>>(new Set())
const excludeCaitiff = ref(true)
const includePredators = ref(false)

const disciplines = ref<IDiscipline[]>([])

const showModal = () => {
  disciplines.value = getAllDisciplines()
  selected.value = new Set()
  excludeCaitiff.value = true
  includePredators.value = false
  show.value = true
}

function toggle(id: number) {
  const next = new Set(selected.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selected.value = next
}

const matches = computed(() => {
  if (selected.value.size === 0) return []
  return findClanMatches([...selected.value], {
    excludeCaitiff: excludeCaitiff.value,
    includePredators: includePredators.value,
  })
})

const desiredCount = computed(() => selected.value.size)

function difficultyLabel(difficulty?: number): string {
  switch (difficulty) {
    case 1:
      return "Leicht"
    case 2:
      return "Mittel"
    case 3:
      return "Schwer"
    default:
      return ""
  }
}

defineExpose({ showModal })
</script>

<template>
  <Modal :shown="show" with-close @close="show = false">
    <div class="cf">
      <div class="cf__head">
        <b><i class="fa-solid fa-wand-sparkles"></i> Klan-Finder</b>
        <div class="cf__sub">Wähle die Disziplinen, die du gerne spielen möchtest - das System sucht die passenden V5-Clans dazu.</div>
      </div>

      <div class="cf__chips">
        <button
          v-for="d in disciplines"
          :key="d.id"
          class="cf__chip"
          :class="{ active: selected.has(d.id) }"
          @click="toggle(d.id)"
        >
          {{ d.name }}
        </button>
      </div>

      <div class="cf__options">
        <label class="cf__check">
          <input type="checkbox" v-model="excludeCaitiff" />
          <span>Caitiff ausschließen <small class="muted">(hat immer alle Disziplinen)</small></span>
        </label>
        <label class="cf__check">
          <input type="checkbox" v-model="includePredators" />
          <span>Jagdverhalten einbeziehen <small class="muted">(schenken oft eine Disziplin)</small></span>
        </label>
      </div>

      <div class="cf__divider"></div>

      <div v-if="desiredCount === 0" class="cf__empty">
        Wähle oben mindestens eine Disziplin.
      </div>

      <div v-else class="cf__results">
        <div
          v-for="m in matches"
          :key="m.clan.id"
          class="cf__result"
          :class="{ perfect: m.isPerfect }"
        >
          <ClanSymbol class="cf__symbol" :clan="m.clan" />

          <div class="cf__result-body">
            <div class="cf__result-head">
              <span class="cf__clan-name">{{ m.clan.name }}</span>
              <span class="cf__coverage" :class="{ full: m.isPerfect }">
                {{ m.matched.length }}/{{ desiredCount }}
              </span>
              <span v-if="m.isPerfect" class="cf__perfect-badge">Perfekt</span>
              <span v-if="difficultyLabel(m.clan.difficulty)" class="cf__diff">
                {{ difficultyLabel(m.clan.difficulty) }}
              </span>
            </div>

            <div class="cf__disc-row">
              <span v-for="d in m.matched" :key="'m' + d.id" class="cf__disc matched">
                <i class="fa-solid fa-check"></i> {{ d.name }}
              </span>
              <span v-for="d in m.missing" :key="'x' + d.id" class="cf__disc missing">
                {{ d.name }}
              </span>
            </div>

            <div v-if="includePredators && m.suggestions.length > 0" class="cf__suggestions">
              <div class="cf__suggestions-title">Mit Jagdverhalten ergänzbar:</div>
              <div v-for="s in m.suggestions.slice(0, 3)" :key="s.predator.id" class="cf__suggestion">
                <b>{{ s.predator.name }}</b>
                <span class="muted"> → {{ s.adds.map(d => d.name).join(" / ") }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.cf {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: min(40rem, calc(100vw - 3rem));
}

.cf__head {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  b { font-size: 1.15rem; }
}
.cf__sub {
  opacity: 0.85;
}

.cf__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.cf__chip {
  cursor: pointer;
  user-select: none;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.04);
  color: #fff;
  border-radius: 999px;
  padding: 0.4rem 0.85rem;
  font-size: 0.95rem;
  transition: background-color 120ms ease, border-color 120ms ease;
  &:hover { border-color: var(--primary-color); }
  &.active {
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: var(--text-color-on-primary-color-bg, #fff);
  }
}

.cf__options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.cf__check {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  input { width: 1.1rem; height: 1.1rem; }
}

.cf__divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.12);
}

.cf__empty {
  opacity: 0.7;
  font-style: italic;
  padding: 0.5rem 0;
}

.cf__results {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 45vh;
  overflow-y: auto;
}

.cf__result {
  display: flex;
  gap: 0.85rem;
  align-items: flex-start;
  padding: 0.75rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);

  &.perfect {
    border-color: var(--primary-color);
    background: color-mix(in srgb, var(--primary-color) 12%, transparent);
  }
}

.cf__symbol {
  width: 3rem;
  min-width: 3rem;
  height: 3rem;
  filter: var(--image-to-primary-color-filter);
}

.cf__result-body {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.cf__result-head {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}
.cf__clan-name {
  font-weight: 800;
  text-transform: uppercase;
  color: #fff;
}
.cf__coverage {
  font-size: 0.85rem;
  color: #b9b9b9;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 999px;
  padding: 0.05rem 0.55rem;
  &.full {
    color: var(--text-color-on-primary-color-bg, #fff);
    background: var(--primary-color);
  }
}
.cf__perfect-badge {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--primary-color-light, #fff);
}
.cf__diff {
  margin-left: auto;
  font-size: 0.8rem;
  color: #9a9a9a;
}

.cf__disc-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}
.cf__disc {
  font-size: 0.85rem;
  border-radius: 6px;
  padding: 0.1rem 0.5rem;
  &.matched {
    color: #cdeccd;
    background: rgba(76, 175, 80, 0.18);
  }
  &.missing {
    color: #8a8a8a;
    background: rgba(255, 255, 255, 0.04);
    text-decoration: line-through;
  }
}

.cf__suggestions {
  margin-top: 0.15rem;
  font-size: 0.9rem;
}
.cf__suggestions-title {
  color: #9a9a9a;
  margin-bottom: 0.2rem;
}
.cf__suggestion {
  line-height: 1.5;
}

.muted { color: #9a9a9a; }
</style>
