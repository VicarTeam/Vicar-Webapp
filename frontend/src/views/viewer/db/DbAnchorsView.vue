<script setup lang="ts">
import { computed, inject, onMounted, ref } from "vue"
import { useStore } from "@/app/store"
import Dots from "@/components/progress/Dots.vue"
import Squares from "@/components/progress/Squares.vue"
import Bullet from "@/components/Bullet.vue"
import IconButton from "@/components/IconButton.vue"
import LevelButton from "@/components/viewer/LevelButton.vue"
import TipButton from "@/components/editor/TipButton.vue"
import WrappedSpinner from "@/components/spinners/WrappedSpinner.vue"
import ConfirmDeleteModal from "@/components/viewer/modals/ConfirmDeleteModal.vue"
import CharacterStorage from "@/libs/io/character-storage"
import { DarkborneData } from "@/libs/data/darkborne-data"
import {
  DB_MAX_ANCHORS,
  DB_MAX_HUMAN_TRAIT,
  dbAnchorsOf,
  dbFirmAnchors,
  dbHumanTraitCap,
  dbIsAdrift,
  dbIsDehumanized,
  dbWillePoolMax,
} from "@/libs/data/darkborne-rules"
import {
  DbAnchorKind,
  DbAnchorState,
  type DbHumanTrait,
  dbHumanTraits,
  type IDbAnchor,
  type IDbSheet,
} from "@/@types/deathborne"

type DbRequestLevelFn = (type: string, subject?: unknown) => void

const store = useStore()
const sheet = computed(() => store.editingCharacter as unknown as IDbSheet | undefined)
const isLevelMode = computed(() => store.isLevelMode)

const requestLevel = inject("request-db-level") as DbRequestLevelFn | undefined

const confirmDeleteModal = ref<InstanceType<typeof ConfirmDeleteModal> | null>(null)

const ready = ref(DarkborneData.isLoaded)
const newAnchorLabel = ref("")
const newAnchorKind = ref<DbAnchorKind>(DbAnchorKind.Night)

onMounted(async () => {
  if (!DarkborneData.isLoaded) {
    await DarkborneData.load()
  }
  ready.value = true
})

function save() {
  const c = sheet.value
  if (!c) return
  CharacterStorage.saveCharacter(c as any)
}

const humanAnchors = computed(() => (sheet.value ? dbAnchorsOf(sheet.value, DbAnchorKind.Human) : []))
const nightAnchors = computed(() => (sheet.value ? dbAnchorsOf(sheet.value, DbAnchorKind.Night) : []))
const firmCount = computed(() => (sheet.value ? dbFirmAnchors(sheet.value).length : 0))
const freeSlots = computed(() => Math.max(0, DB_MAX_ANCHORS - (sheet.value?.anchors.length ?? 0)))
const dehumanized = computed(() => (sheet.value ? dbIsDehumanized(sheet.value) : false))
const adrift = computed(() => (sheet.value ? dbIsAdrift(sheet.value) : false))

function stateLabel(anchor: IDbAnchor): string {
  return anchor.state === DbAnchorState.Firm ? "fest" : "erschüttert"
}

function shake(anchor: IDbAnchor) {
  const c = sheet.value
  if (!c) return
  if (anchor.state === DbAnchorState.Firm) {
    anchor.state = DbAnchorState.Shaken
    save()
    return
  }
  confirmDeleteModal.value?.showModal(`den Anker "${anchor.label || "ohne Namen"}"`, () => {
    c.anchors = c.anchors.filter(a => a !== anchor)
    save()
  })
}

function makeFirm(anchor: IDbAnchor) {
  anchor.state = DbAnchorState.Firm
  save()
}

function letGo(anchor: IDbAnchor) {
  const c = sheet.value
  if (!c || anchor.forced || anchor.kind !== DbAnchorKind.Human) return
  confirmDeleteModal.value?.showModal(`den menschlichen Anker "${anchor.label || "ohne Namen"}"`, () => {
    anchor.kind = DbAnchorKind.Night
    anchor.label = ""
    anchor.state = DbAnchorState.Firm
    c.exp += 2
    save()
  })
}

function addAnchor() {
  const c = sheet.value
  if (!c || freeSlots.value === 0) return
  const label = newAnchorLabel.value.trim()
  if (!label) return
  const used = new Set(c.anchors.map(a => a.slot))
  let slot = 0
  while (used.has(slot) && slot < DB_MAX_ANCHORS) {
    slot++
  }
  c.anchors.push({
    slot,
    kind: newAnchorKind.value,
    label,
    state: DbAnchorState.Firm,
    forced: false,
  })
  newAnchorLabel.value = ""
  save()
}

const humanTraits = computed(() => {
  const c = sheet.value
  if (!c || !ready.value) return []
  return dbHumanTraits.map(trait => {
    const value = c.humanTraits[trait] ?? 0
    const cap = dbHumanTraitCap(c, trait)
    return {
      key: trait,
      name: DarkborneData.humanTrait(trait)?.name ?? trait,
      description: DarkborneData.humanTrait(trait)?.description ?? "",
      value,
      cap,
      levelText: DarkborneData.humanTraitLevel(trait, value),
      overCap: value > cap,
    }
  })
})

function lowerTrait(trait: DbHumanTrait) {
  const c = sheet.value
  if (!c) return
  const value = c.humanTraits[trait] ?? 0
  if (value <= 0) return
  c.humanTraits[trait] = value - 1
  save()
}

const willePoolMax = computed(() => (sheet.value ? dbWillePoolMax(sheet.value) : 0))

function setWillePool(value: number) {
  const c = sheet.value
  if (!c) return
  const next = value === c.willePool ? value - 1 : value
  c.willePool = Math.min(willePoolMax.value, Math.max(0, next))
  save()
}

function changeWillePool(delta: number) {
  const c = sheet.value
  if (!c) return
  c.willePool = Math.min(willePoolMax.value, Math.max(0, c.willePool + delta))
  save()
}

function refillWille() {
  const c = sheet.value
  if (!c) return
  c.willePool = willePoolMax.value
  save()
}
</script>

<template>
  <div v-if="sheet && ready" class="db-anchors-view">
    <div class="wrap">
      <div v-if="adrift" class="alert alert-danger banner">
        Treibend: Diese Figur hat keinen Anker mehr. In jeder Krise entscheidet die SL, was sie tut. Findet sie bis zum Ende des Kapitels keinen neuen Anker, wird sie zum NSC.
      </div>
      <div v-else-if="dehumanized" class="alert alert-warning banner">
        Entmenscht: Ohne menschlichen Anker lassen sich Folgen von Gier und Kontrollverlust nicht mehr abwenden. Als Mensch durchgehen klappt nur noch mit übernatürlicher Hilfe.
      </div>

      <div class="head">
        <b class="title">
          Anker
          <TipButton content="Jeder feste Anker gibt einmal pro Sitzung Halt und wendet damit eine passende Folge vollständig ab. Menschliche Anker wenden Hunger-Folgen ab, nächtliche Anker wenden Instabilität ab oder einen Zwang, ohne Wille zu zahlen." />
        </b>
        <small class="intro">
          {{ firmCount }} von {{ DB_MAX_ANCHORS }} Plätzen geben Halt.
          <Bullet />
          Freie Plätze: {{ freeSlots }}
        </small>
      </div>

      <div class="columns">
        <div class="card column">
          <b class="subtitle">Menschliche Anker</b>
          <small class="column-hint">Menschen, Orte, Gewohnheiten, Überzeugungen. Ein anwesender menschlicher Anker gibt +1 Würfel, um als Mensch durchzugehen.</small>

          <div v-if="humanAnchors.length === 0" class="empty"><small>Kein menschlicher Anker.</small></div>

          <div v-for="anchor in humanAnchors" :key="'h' + anchor.slot" class="anchor" :class="{ shaken: anchor.state === DbAnchorState.Shaken }">
            <div class="anchor-head">
              <input
                class="form-control"
                v-model="anchor.label"
                placeholder="Ein Name, ein Ort, ein Satz"
                :disabled="anchor.forced"
                :data-agent="'db:anchor:label:' + anchor.slot"
                @change="save"
              />
              <span class="badge">{{ stateLabel(anchor) }}</span>
              <span v-if="anchor.forced" class="badge forced">erzwungen</span>
            </div>

            <div class="anchor-actions">
              <button class="btn pill" :data-agent="'db:anchor:shake:' + anchor.slot" @click="shake(anchor)">
                {{ anchor.state === DbAnchorState.Firm ? "Erschüttern" : "Verlieren" }}
              </button>
              <button
                class="btn pill"
                :disabled="anchor.state === DbAnchorState.Firm"
                :data-agent="'db:anchor:firm:' + anchor.slot"
                @click="makeFirm(anchor)"
              >
                Festigen
              </button>
              <button
                class="btn pill"
                :disabled="anchor.forced"
                :data-agent="'db:anchor:letgo:' + anchor.slot"
                @click="letGo(anchor)"
              >
                Loslassen
              </button>
            </div>

            <small class="consequence">
              <template v-if="anchor.state === DbAnchorState.Firm">Erschüttern: gibt keinen Halt, bis er gefestigt wird.</template>
              <template v-else>Verlieren: der Platz wird frei, ein Menschenzug nach Wahl sinkt um 1.</template>
              <Bullet />
              Festigen: eine Szene, die Zeit, Aufsehen +1 oder eine unbequeme Wahrheit kostet.
              <Bullet />
              Loslassen: 2 XP, der Platz wird nächtlich, ein Menschenzug sinkt um 1.
            </small>
          </div>
        </div>

        <div class="card column">
          <b class="subtitle">Nächtliche Anker</b>
          <small class="column-hint">Mentoren, Nachkommen, Gemeinschaften, Ämter, Schwüre. Sie entstehen im Spiel fast von selbst.</small>

          <div v-if="nightAnchors.length === 0" class="empty"><small>Kein nächtlicher Anker.</small></div>

          <div v-for="anchor in nightAnchors" :key="'n' + anchor.slot" class="anchor" :class="{ shaken: anchor.state === DbAnchorState.Shaken }">
            <div class="anchor-head">
              <input
                class="form-control"
                v-model="anchor.label"
                placeholder="Ein Name, ein Amt, ein Schwur"
                :disabled="anchor.forced"
                :data-agent="'db:anchor:label:' + anchor.slot"
                @change="save"
              />
              <span class="badge">{{ stateLabel(anchor) }}</span>
              <span v-if="anchor.forced" class="badge forced">erzwungen</span>
            </div>

            <div class="anchor-actions">
              <button class="btn pill" :data-agent="'db:anchor:shake:' + anchor.slot" @click="shake(anchor)">
                {{ anchor.state === DbAnchorState.Firm ? "Erschüttern" : "Verlieren" }}
              </button>
              <button
                class="btn pill"
                :disabled="anchor.state === DbAnchorState.Firm"
                :data-agent="'db:anchor:firm:' + anchor.slot"
                @click="makeFirm(anchor)"
              >
                Festigen
              </button>
            </div>

            <small class="consequence">
              <template v-if="anchor.state === DbAnchorState.Firm">Erschüttern: gibt keinen Halt, bis er gefestigt wird.</template>
              <template v-else>Verlieren: der Platz wird frei, ein Menschenzug nach Wahl sinkt um 1.</template>
              <Bullet />
              Festigen: eine Szene, die Zeit, Aufsehen +1 oder eine unbequeme Wahrheit kostet.
              <template v-if="anchor.forced">
                <Bullet />
                Eine erzwungene Bindung kann nicht losgelassen werden.
              </template>
            </small>
          </div>
        </div>
      </div>

      <div v-if="freeSlots > 0" class="card new-anchor">
        <b class="subtitle">Anker eintragen</b>
        <small class="column-hint">Nächtliche Anker trägt der Spieler selbst ein. Menschliche Anker brauchen Szenen über mindestens ein Kapitel.</small>
        <div class="new-anchor-row">
          <input class="form-control" v-model="newAnchorLabel" placeholder="Konkret: mein Bruder Jonas" data-agent="db:anchor:new:label" />
          <select class="form-control kind-select" v-model="newAnchorKind" data-agent="db:anchor:new:kind">
            <option :value="DbAnchorKind.Human">menschlich</option>
            <option :value="DbAnchorKind.Night">nächtlich</option>
          </select>
          <button class="btn btn-primary" :disabled="!newAnchorLabel.trim()" data-agent="db:anchor:new:add" @click="addAnchor">
            Eintragen
          </button>
        </div>
      </div>

      <div class="card traits">
        <b class="title">
          Menschenzüge
          <TipButton content="Menschenzüge sind die Reste des menschlichen Körpers. Sie sind die Einbuße, wenn ein Anker verloren geht oder losgelassen wird. Sie kommen nie zurück und können nicht gekauft werden." />
        </b>
        <small class="intro">Als Mensch durchgehen ist meist Raffinesse + Täuschen. Jeder Zug auf 2 gibt Schwierigkeit +1, auf 1 gibt +2, auf 0 gibt +3.</small>

        <div class="trait-grid">
          <div v-for="trait in humanTraits" :key="trait.key" class="trait">
            <div class="trait-head">
              <small class="trait-name">
                <TipButton v-if="trait.description" :content="trait.description" />
                {{ trait.name }}
              </small>
              <Dots :amount="trait.value" :max="DB_MAX_HUMAN_TRAIT" />
              <IconButton
                icon="fa-minus"
                :disabled="trait.value <= 0"
                :data-agent="'db:trait:lower:' + trait.key"
                :data-agent-label="trait.name + ' senken'"
                @click="lowerTrait(trait.key)"
              />
            </div>
            <small class="trait-level">{{ trait.levelText }}</small>
            <small v-if="trait.cap < DB_MAX_HUMAN_TRAIT" class="trait-cap">Höchstens {{ trait.cap }} durch die Blutstärke.</small>
            <small v-if="trait.overCap" class="trait-warn">Der Wert liegt über der Obergrenze und muss gesenkt werden.</small>
          </div>
        </div>

        <small class="hint">Menschenzüge kommen nicht zurück. Ein Zug auf 0 ist für immer verloren.</small>
      </div>

      <div class="card wille">
        <b class="title">
          Wille
          <TipButton content="Der Wert ist Widerstand: Wille + Präsenz gegen Befehle und Zwang, Wille + Gespür gegen Illusionen, Wille + Verstand gegen Eingriffe in Gedanken. Der Vorrat gibt +2 Würfel auf einen angesagten Wurf, lehnt einen Zwang ab oder erlaubt eine letzte Handlung trotz Zusammenbruch." />
        </b>

        <div class="wille-row">
          <small class="wille-label">
            Wert
            <LevelButton v-if="isLevelMode && sheet.wille < 5" data-agent="db:wille:level" @click="requestLevel?.('wille')" />
          </small>
          <Dots :amount="sheet.wille" :max="5" />
          <b class="wille-value">{{ sheet.wille }}</b>
        </div>

        <div class="wille-row">
          <small class="wille-label">Vorrat</small>
          <Squares
            :max="willePoolMax"
            :amount="sheet.willePool"
            agent-id="db:wille:pool"
            agent-label="Wille-Vorrat auf"
            @click="setWillePool"
          />
          <b class="wille-value">{{ sheet.willePool }} / {{ willePoolMax }}</b>
        </div>

        <div class="wille-actions">
          <button class="btn pill" :disabled="sheet.willePool <= 0" data-agent="db:wille:spend" @click="changeWillePool(-1)">
            1 Wille ausgeben
          </button>
          <button class="btn pill" :disabled="sheet.willePool >= willePoolMax" data-agent="db:wille:gain" @click="changeWillePool(1)">
            Zwang angenommen, +1
          </button>
          <button class="btn pill" :disabled="sheet.willePool >= willePoolMax" data-agent="db:wille:refill" @click="refillWille">
            Vorrat füllen
          </button>
        </div>

        <small class="hint">
          Der Vorrat füllt sich: +1 bei einem angenommenen Zwang, +1 für eine Szene mit einem menschlichen Anker (einmal pro Sitzung), vollständig zu Beginn jedes Kapitels.
          <Bullet />
          Ist der Vorrat voll und ein Zwang wird angenommen, gibt es stattdessen 1 XP.
        </small>
      </div>
    </div>

    <ConfirmDeleteModal ref="confirmDeleteModal" />
  </div>

  <WrappedSpinner v-else>
    <small>Regelwerk wird geladen</small>
  </WrappedSpinner>
</template>

<style scoped lang="scss">
.db-anchors-view {
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

.banner {
  margin: 0;
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
  gap: 0.5rem;
}

.columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 24rem), 1fr));
  gap: 1rem;
  align-items: start;
}

.subtitle {
  font-size: 1rem;
  font-family: var(--font-display);
}

.column-hint {
  color: var(--text-3);
}

.anchor {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.07);

  &.shaken .badge {
    background: transparent;
    border: 1px solid var(--accent-border);
    color: var(--text-2);
  }

  .anchor-head {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;

    input {
      flex-grow: 1;
      min-width: 10rem;
    }
  }

  .anchor-actions {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
  }

  .consequence {
    color: var(--text-3);
  }
}

.badge {
  font-size: 0.65rem;
  padding: 0.1rem 0.4rem;
  border-radius: 0.5rem;
  background: var(--primary-color);
  color: var(--accent-contrast);

  &.forced {
    background: transparent;
    border: 1px solid var(--accent-border);
    color: var(--text-2);
  }
}

.pill {
  padding: 0.3rem 0.6rem;
  font-size: 0.85rem;
}

.new-anchor-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;

  input {
    flex-grow: 1;
    min-width: 12rem;
  }

  .kind-select {
    max-width: 10rem;
  }
}

.trait-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 20rem), 1fr));
  gap: 0.75rem;
}

.trait {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;

  .trait-head {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .trait-name {
    flex-grow: 1;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }

  .trait-level {
    color: var(--text-2);
  }

  .trait-cap {
    color: var(--text-3);
  }

  .trait-warn {
    color: var(--accent-soft);
  }
}

.wille-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;

  .wille-label {
    width: 4.5rem;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    color: var(--text-3);
  }

  .wille-value {
    color: var(--text-2);
  }
}

.wille-actions {
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
