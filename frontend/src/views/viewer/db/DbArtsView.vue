<script setup lang="ts">
import { computed, inject, onMounted, ref } from "vue"
import { useStore } from "@/app/store"
import Dots from "@/components/progress/Dots.vue"
import Bullet from "@/components/Bullet.vue"
import LevelButton from "@/components/viewer/LevelButton.vue"
import TipButton from "@/components/editor/TipButton.vue"
import WrappedSpinner from "@/components/spinners/WrappedSpinner.vue"
import DbArtSymbol from "@/components/symbols/DbArtSymbol.vue"
import { DarkborneData } from "@/libs/data/darkborne-data"
import {
  DB_MAX_DEPTH,
  dbArtDepth,
  dbBloodDice,
  dbFormCost,
  dbFormDifficulty,
  dbImprovisationCost,
  dbImprovisationDifficulty,
  dbMaxDepth,
  dbTension,
} from "@/libs/data/darkborne-rules"
import { DbFormKind, type IDbSheet } from "@/@types/deathborne"

type DbRequestLevelFn = (type: string, subject?: unknown) => void

const store = useStore()
const sheet = computed(() => store.editingCharacter as unknown as IDbSheet | undefined)
const isLevelMode = computed(() => store.isLevelMode)

const requestLevel = inject("request-db-level") as DbRequestLevelFn | undefined

const ready = ref(DarkborneData.isLoaded)
const improvisationArt = ref("")
const improvisationLevel = ref(1)

onMounted(async () => {
  if (!DarkborneData.isLoaded) {
    await DarkborneData.load()
  }
  ready.value = true
})

const maxDepth = computed(() => (sheet.value ? dbMaxDepth(sheet.value.bloodStrength) : 0))

const ownedArts = computed(() => {
  const c = sheet.value
  if (!c || !ready.value) return []
  return c.arts
    .map(owned => {
      const art = DarkborneData.art(owned.key)
      const counter = DarkborneData.counterOf(owned.key)
      const established = c.forms.filter(f => f.art === owned.key && f.kind === DbFormKind.Established)
      const own = c.forms.filter(f => f.art === owned.key && f.kind === DbFormKind.Own)
      return {
        key: owned.key,
        depth: owned.depth,
        affinity: owned.affinity,
        name: art?.name ?? owned.key,
        shortName: art?.shortName ?? owned.key,
        principle: art?.principle ?? "",
        summary: art?.summary ?? "",
        isPrimal: art?.isPrimal === true,
        limits: art?.limits ?? [],
        levels: art?.levels ?? [],
        counterName: counter?.shortName ?? "",
        established,
        own,
      }
    })
    .sort((a, b) => b.depth - a.depth || a.name.localeCompare(b.name))
})

function depthName(depth: number): string {
  return ready.value ? DarkborneData.depthName(depth) : ""
}

function formDifficulty(key: string, kind: DbFormKind, level: number): number {
  if (kind === DbFormKind.Established && ready.value) {
    const known = DarkborneData.form(key)
    if (known) return known.difficulty
  }
  return dbFormDifficulty(kind, level)
}

function formCost(kind: DbFormKind, level: number): number {
  return dbFormCost(kind, level)
}

const tensions = computed(() => {
  const c = sheet.value
  if (!c || !ready.value) return []
  return dbTension(c).map(entry => {
    const pair = DarkborneData.content.artPairs.find(p => p.key === entry.key)
    return {
      key: entry.key,
      name: entry.name,
      tension: entry.tension,
      question: pair?.question ?? "",
      effects: pair?.effects ?? [],
    }
  })
})

const improvisationDepth = computed(() => {
  const c = sheet.value
  if (!c || !improvisationArt.value) return 0
  return dbArtDepth(c, improvisationArt.value)
})

const improvisationDice = computed(() => {
  const c = sheet.value
  if (!c) return 0
  return dbBloodDice(c, improvisationArt.value || undefined, improvisationLevel.value)
})

const improvisationTooDeep = computed(() => {
  if (!improvisationArt.value) return false
  return improvisationLevel.value > improvisationDepth.value
})

const learnableArts = computed(() => {
  const c = sheet.value
  if (!c || !ready.value) return []
  return DarkborneData.content.arts.filter(art => !c.arts.some(owned => owned.key === art.key))
})

function severityLabel(severity: string): string {
  return severity === "heavy" ? "schwer" : "leicht"
}
</script>

<template>
  <div v-if="sheet && ready" class="db-arts-view">
    <div class="wrap">
      <div class="head">
        <b class="title">
          Blutkünste
          <TipButton content="Pool bei Blutkünsten ist Attribut + Tiefe. Die Tiefe begrenzt die höchste Wirkungsstufe, die Blutstärke begrenzt die Tiefe." />
        </b>
        <small class="intro">Gefestigte Formen geben +2 Würfel, Eigene Formen sind billiger, Improvisation ist grenzenlos.</small>
      </div>

      <div v-if="ownedArts.length === 0" class="empty"><small>Keine Blutkunst gelernt.</small></div>

      <div class="art-grid">
        <div v-for="art in ownedArts" :key="art.key" class="card art-card">
          <div class="art-head">
            <DbArtSymbol :art="art.key" size="2.5rem" />
            <div class="art-title">
              <b>
                {{ art.shortName }}
                <span v-if="art.affinity" class="badge">Affinität</span>
                <span v-if="art.isPrimal" class="badge">Urkunst</span>
              </b>
              <small>{{ art.name }}</small>
            </div>
            <LevelButton
              v-if="art.depth < Math.min(maxDepth, DB_MAX_DEPTH)"
              :data-agent="'db:art:level:' + art.key"
              @click="requestLevel?.('art', art.key)"
            />
          </div>

          <small class="principle">{{ art.principle }}</small>

          <div class="depth-row">
            <small class="depth-label">Tiefe {{ art.depth }}</small>
            <Dots :amount="art.depth" :max="DB_MAX_DEPTH" />
            <small class="depth-name">{{ depthName(art.depth) }}</small>
          </div>

          <small v-if="art.counterName" class="counter">Gegenkunst: {{ art.counterName }}</small>
          <small v-else class="counter">Keine Gegenkunst. Jede Nutzung ab Wirkungsstufe 3 bringt Blutwürfel.</small>

          <h6 class="sub">Stufentabelle</h6>
          <div class="levels">
            <div
              v-for="level in art.levels"
              :key="level.depth"
              class="level"
              :class="{ locked: level.depth > art.depth }"
            >
              <b class="level-head">
                Stufe {{ level.depth }} {{ depthName(level.depth) }}
                <i v-if="level.depth > art.depth" class="fa-solid fa-lock" />
              </b>
              <small>{{ level.examples.join(", ") }}</small>
            </div>
          </div>

          <template v-if="art.limits.length > 0">
            <h6 class="sub">Grenzen der Kunst</h6>
            <ul class="list">
              <li v-for="(limit, index) in art.limits" :key="index">{{ limit }}</li>
            </ul>
          </template>

          <h6 class="sub">Gefestigte Formen</h6>
          <div v-if="art.established.length === 0" class="empty"><small>Keine gefestigte Form.</small></div>
          <div v-for="form in art.established" :key="form.key" class="form">
            <b class="form-head">
              {{ form.name }}
              <small class="form-meta">
                Stufe {{ form.level }}
                <Bullet />
                Schwierigkeit {{ formDifficulty(form.key, form.kind, form.level) }}
                <Bullet />
                {{ formCost(form.kind, form.level) }} Cruor
              </small>
            </b>
            <small class="form-effect">{{ form.effect }}</small>
            <small v-if="form.limits" class="form-limits">Grenzen: {{ form.limits }}</small>
          </div>

          <h6 class="sub">Eigene Formen</h6>
          <div v-if="art.own.length === 0" class="empty"><small>Keine eigene Form.</small></div>
          <div v-for="form in art.own" :key="form.key" class="form">
            <b class="form-head">
              {{ form.name }}
              <small class="form-meta">
                Stufe {{ form.level }}
                <Bullet />
                Schwierigkeit {{ formDifficulty(form.key, form.kind, form.level) }}
                <Bullet />
                {{ formCost(form.kind, form.level) }} Cruor
              </small>
            </b>
            <small class="form-effect">{{ form.effect }}</small>
            <small v-if="form.limits" class="form-limits">Grenzen: {{ form.limits }}</small>
          </div>
        </div>
      </div>

      <div v-if="tensions.length > 0" class="card tension">
        <b class="title">
          Spannung
          <TipButton content="Spannung ist die niedrigere Tiefe eines Kunstpaares. Bei jedem Einsatz einer der beiden Künste kommen so viele Blutwürfel in den Pool. Die dritte Dissonanz-Folge desselben Paares in einem Kapitel wird dauerhaft." />
        </b>

        <div v-for="entry in tensions" :key="entry.key" class="tension-entry">
          <div class="tension-head">
            <b>{{ entry.name }}</b>
            <span class="badge">Spannung {{ entry.tension }}</span>
          </div>
          <small v-if="entry.question" class="question">{{ entry.question }}</small>
          <div v-for="(effect, index) in entry.effects" :key="index" class="effect">
            <b>{{ effect.name }} <span class="badge">{{ severityLabel(effect.severity) }}</span></b>
            <small>{{ effect.effect }}</small>
          </div>
        </div>
      </div>

      <div class="card improvisation">
        <b class="title">
          Improvisation
          <TipButton content="Improvisation kostet Cruor in Höhe der Wirkungsstufe, die Schwierigkeit ist ebenfalls die Wirkungsstufe. Sie ist im Kampf langsam und verlangt immer einen Wurf, erlaubt aber Steigerungen." />
        </b>

        <div class="imp-controls">
          <select class="form-control" v-model="improvisationArt" data-agent="db:art:improvisation:art">
            <option value="" disabled>Kunst wählen</option>
            <option v-for="art in ownedArts" :key="art.key" :value="art.key">
              {{ art.shortName }} (Tiefe {{ art.depth }})
            </option>
          </select>
          <select class="form-control level-select" v-model.number="improvisationLevel" data-agent="db:art:improvisation:level">
            <option v-for="n in DB_MAX_DEPTH" :key="n" :value="n">Wirkungsstufe {{ n }}</option>
          </select>
        </div>

        <div class="stat-grid">
          <div class="stat">
            <small class="stat-label">Schwierigkeit</small>
            <b class="stat-value">{{ dbImprovisationDifficulty(improvisationLevel) }}</b>
          </div>
          <div class="stat">
            <small class="stat-label">Cruor</small>
            <b class="stat-value">{{ dbImprovisationCost(improvisationLevel) }}</b>
          </div>
          <div class="stat">
            <small class="stat-label">Blutwürfel</small>
            <b class="stat-value">{{ improvisationDice }}</b>
          </div>
          <div class="stat">
            <small class="stat-label">Umfang</small>
            <b class="stat-value">{{ depthName(improvisationLevel) }}</b>
          </div>
        </div>

        <div v-if="improvisationTooDeep" class="alert alert-warning">
          Wirkungsstufe {{ improvisationLevel }} liegt über der eigenen Tiefe {{ improvisationDepth }}. Diese Wirkung ist nicht möglich.
        </div>

        <small class="hint">
          Pool ist Attribut + Tiefe.
          <Bullet />
          Wirkungen ab Stufe 4 vor Zeugen erzeugen Aufsehen, sofern sie nicht unauffällig gemacht werden.
        </small>
      </div>

      <div v-if="isLevelMode" class="card learn">
        <b class="subtitle">
          Mit Erfahrung lernen
          <TipButton content="Tiefe steigern und Formen lernen kostet nur XP. Eine neue Kunst braucht zusätzlich eine Quelle im Spiel: Unterweisung, Blutlehre oder Durchbruch." />
        </b>

        <div class="learn-actions">
          <button
            class="btn btn-primary"
            :disabled="learnableArts.length === 0"
            data-agent="db:art:new"
            data-agent-label="Neue Kunst lernen"
            @click="requestLevel?.('new-art')"
          >
            Neue Kunst lernen
          </button>
          <button
            class="btn"
            :disabled="ownedArts.length === 0"
            data-agent="db:art:established-form"
            data-agent-label="Gefestigte Form lernen"
            @click="requestLevel?.('established-form')"
          >
            Gefestigte Form lernen
          </button>
          <button
            class="btn"
            :disabled="ownedArts.length === 0"
            data-agent="db:art:own-form"
            data-agent-label="Eigene Form entwickeln"
            @click="requestLevel?.('own-form')"
          >
            Eigene Form entwickeln
          </button>
        </div>

        <small class="hint">Höchste Tiefe durch Blutstärke {{ sheet.bloodStrength }}: {{ maxDepth }}</small>
      </div>
    </div>
  </div>

  <WrappedSpinner v-else>
    <small>Regelwerk wird geladen</small>
  </WrappedSpinner>
</template>

<style scoped lang="scss">
.db-arts-view {
  width: 100%;
  min-height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 1.5rem;
}

.wrap {
  width: min(1100px, 100%);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.head {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.title {
  font-size: 1.25rem;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.intro {
  color: var(--text-2);
}

.card {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.art-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 26rem), 1fr));
  gap: 1rem;
  align-items: start;
}

.art-head {
  display: flex;
  align-items: center;
  gap: 0.6rem;

  .art-title {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 0.1rem;

    small {
      color: var(--text-3);
    }
  }
}

.badge {
  margin-left: 0.35rem;
  font-size: 0.65rem;
  padding: 0.1rem 0.4rem;
  border-radius: 0.5rem;
  background: var(--primary-color);
  color: var(--accent-contrast);
}

.principle {
  color: var(--text-2);
  font-style: italic;
}

.depth-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;

  .depth-label {
    min-width: 4.5rem;
  }

  .depth-name {
    color: var(--text-3);
  }
}

.counter {
  color: var(--text-3);
}

.sub {
  margin: 0.4rem 0 0;
  font-family: var(--font-display);
  letter-spacing: 0.02em;
}

.levels {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.level {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;

  &.locked {
    opacity: 0.45;
  }

  .level-head {
    font-size: 0.8rem;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }

  small {
    color: var(--text-2);
  }
}

.list {
  margin: 0;
  padding-left: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  color: var(--text-2);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  padding-top: 0.35rem;
  border-top: 1px solid rgba(255, 255, 255, 0.07);

  .form-head {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }

  .form-meta {
    font-weight: normal;
    color: var(--text-3);
  }

  .form-effect {
    color: var(--text-2);
  }

  .form-limits {
    color: var(--text-3);
    font-style: italic;
  }
}

.tension-entry {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding-top: 0.4rem;
  border-top: 1px solid rgba(255, 255, 255, 0.07);

  .tension-head {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .question {
    color: var(--text-3);
    font-style: italic;
  }
}

.effect {
  display: flex;
  flex-direction: column;
  gap: 0.05rem;

  small {
    color: var(--text-2);
  }
}

.imp-controls {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;

  select {
    flex-grow: 1;
    min-width: 12rem;
  }

  .level-select {
    max-width: 14rem;
  }
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
  gap: 0.75rem;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;

  .stat-label {
    color: var(--text-3);
  }

  .stat-value {
    font-size: 1.1rem;
  }
}

.subtitle {
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.learn-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.hint {
  color: var(--text-3);
}

.empty {
  color: var(--text-3);
}
</style>
