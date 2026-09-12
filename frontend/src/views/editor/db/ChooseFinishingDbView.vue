<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import EditorForm from "@/components/editor/EditorForm.vue"
import TipButton from "@/components/editor/TipButton.vue"
import WrappedSpinner from "@/components/spinners/WrappedSpinner.vue"
import IconButton from "@/components/IconButton.vue"
import { DarkborneData } from "@/libs/data/darkborne-data"
import {
  DB_MAX_ANCHORS,
  DB_MAX_HUMAN_TRAIT,
  dbAnathemaFor,
  dbCruorMax,
  dbHealth,
  dbMaxDepth,
  dbUpkeep,
} from "@/libs/data/darkborne-rules"
import {
  DbAnchorKind,
  DbAnchorState,
  DbDebtDirection,
  type IDbAnchor,
  type IDbDebt,
  type IDbSheet,
  dbHumanTraits,
} from "@/@types/deathborne"
import { useStore } from "@/app/store"

const BACKGROUND_POINTS = 3
const NO_BURDENS = "keine"

const store = useStore()
const editingCharacter = computed(() => store.editingCharacter as unknown as IDbSheet | undefined)

const ready = ref(false)
const backgroundLevels = ref<Record<string, number>>({})
const debts = ref<IDbDebt[]>([])

function buildAnchors(humanAnchors: number, total: number): IDbAnchor[] {
  const anchors: IDbAnchor[] = []
  for (let slot = 0; slot < total; slot++) {
    anchors.push({
      slot,
      kind: slot < humanAnchors ? DbAnchorKind.Human : DbAnchorKind.Night,
      label: "",
      state: DbAnchorState.Firm,
      forced: false,
    })
  }
  return anchors
}

onMounted(async () => {
  try {
    await DarkborneData.load()
  } finally {
    ready.value = DarkborneData.isLoaded
  }

  const c = editingCharacter.value
  if (!c || !ready.value) return

  const age = DarkborneData.startAge(c.startAge)
  if (c.anchors.length === 0 && age) {
    c.anchors = buildAnchors(age.humanAnchors, Math.min(DB_MAX_ANCHORS, age.humanAnchors + age.nightAnchors))
  }

  const levels: Record<string, number> = {}
  for (const background of DarkborneData.content.backgrounds) {
    levels[background.key] = c.backgrounds.find((b) => b.key === background.key)?.level ?? 0
  }
  backgroundLevels.value = levels
  debts.value = c.debts.map((debt) => ({ ...debt }))
})

const startAge = computed(() => {
  const c = editingCharacter.value
  if (!c || !ready.value) return undefined
  return DarkborneData.startAge(c.startAge)
})

const backgrounds = computed(() => (ready.value ? DarkborneData.content.backgrounds : []))
const courtRanks = computed(() => (ready.value ? DarkborneData.content.court.ranks : []))
const offices = computed(() => (ready.value ? DarkborneData.content.court.offices : []))
const debtSizes = computed(() => (ready.value ? DarkborneData.content.court.debts : []))
const orders = computed(() => (ready.value ? DarkborneData.content.orders : []))

function anchorTitle(anchor: IDbAnchor): string {
  return anchor.kind === DbAnchorKind.Human ? "Menschlicher Anker" : "Nächtlicher Anker"
}

function anchorHint(anchor: IDbAnchor): string {
  return anchor.kind === DbAnchorKind.Human
    ? "Menschen, Orte, Gewohnheiten, Überzeugungen"
    : "Sire, Scion, Court, Haus, Schwüre, Orders"
}

function anchorPlaceholder(anchor: IDbAnchor): string {
  return anchor.kind === DbAnchorKind.Human
    ? "Meine Tochter Mia. Die Wohnung in Ehrenfeld. Ich lüge nicht."
    : "Meine Lehrmeisterin. Mein Amt am Hof. Der Schwur vor dem Rat."
}

const filledAnchors = computed(() => editingCharacter.value?.anchors.filter((a) => a.label.trim().length > 0).length ?? 0)
const anchorCount = computed(() => editingCharacter.value?.anchors.length ?? 0)

function backgroundLevel(key: string): number {
  return backgroundLevels.value[key] ?? 0
}

function backgroundMax(key: string): number {
  return DarkborneData.background(key)?.levels.length ?? 3
}

function backgroundLevelText(key: string, level: number): string {
  return DarkborneData.background(key)?.levels.find((l) => l.level === level)?.description ?? ""
}

function backgroundLevelTable(key: string): string {
  const background = DarkborneData.background(key)
  if (!background) return ""
  return `${background.description}\n\n${background.levels.map((l) => `Stufe ${l.level}: ${l.description}`).join("\n")}`
}

const usedBackgroundPoints = computed(() => Object.values(backgroundLevels.value).reduce((sum, value) => sum + value, 0))

function changeBackground(key: string, delta: number) {
  const current = backgroundLevel(key)
  const next = current + delta
  if (next < 0 || next > backgroundMax(key)) return
  if (delta > 0 && usedBackgroundPoints.value + delta > BACKGROUND_POINTS) return
  backgroundLevels.value = { ...backgroundLevels.value, [key]: next }
}

const burdensRequired = computed(() => {
  const burdens = startAge.value?.burdens?.trim() ?? ""
  return burdens.length > 0 && burdens.toLowerCase() !== NO_BURDENS
})

function addDebt() {
  debts.value.push({
    direction: DbDebtDirection.Owing,
    size: debtSizes.value[0]?.key ?? "",
    party: "",
    note: "",
  })
}

function removeDebt(index: number) {
  debts.value.splice(index, 1)
}

function directionLabel(direction: string): string {
  return direction === DbDebtDirection.Owing ? "Ich schulde" : "Mir wird geschuldet"
}

const validDebts = computed(() => debts.value.filter((debt) => debt.party.trim().length > 0 && debt.size.length > 0))

const traitValues = ref<Record<string, number>>(
  Object.fromEntries(dbHumanTraits.map((trait) => [trait, DB_MAX_HUMAN_TRAIT])),
)

const traitReduction = computed(() => startAge.value?.humanTraitReduction ?? 0)

const traitStepsSpent = computed(() =>
  dbHumanTraits.reduce((sum, trait) => sum + (DB_MAX_HUMAN_TRAIT - (traitValues.value[trait] ?? DB_MAX_HUMAN_TRAIT)), 0),
)

const traitStepsLeft = computed(() => Math.max(0, traitReduction.value - traitStepsSpent.value))

const reducedTraits = computed<Record<string, number>>(() => traitValues.value)

function canLowerTrait(trait: string): boolean {
  return traitStepsLeft.value > 0 && (traitValues.value[trait] ?? DB_MAX_HUMAN_TRAIT) > 1
}

function lowerTrait(trait: string) {
  if (!canLowerTrait(trait)) return
  traitValues.value[trait] = (traitValues.value[trait] ?? DB_MAX_HUMAN_TRAIT) - 1
}

function raiseTrait(trait: string) {
  const current = traitValues.value[trait] ?? DB_MAX_HUMAN_TRAIT
  if (current >= DB_MAX_HUMAN_TRAIT) return
  traitValues.value[trait] = current + 1
}

const derived = computed(() => {
  const c = editingCharacter.value
  if (!c || !ready.value) {
    return { cruor: 0, upkeep: 0, health: 0, wille: 0, maxDepth: 0 }
  }
  return {
    cruor: dbCruorMax(c),
    upkeep: dbUpkeep(c),
    health: dbHealth(c),
    wille: c.wille,
    maxDepth: dbMaxDepth(c.bloodStrength),
  }
})

const anathema = computed(() => {
  const c = editingCharacter.value
  if (!c || !ready.value) return []
  return dbAnathemaFor(c)
})

function traitName(trait: string): string {
  return DarkborneData.humanTrait(trait)?.name ?? trait
}

function traitDescription(trait: string, value: number): string {
  return DarkborneData.humanTraitLevel(trait, value)
}

function onBeforeNext() {
  const c = editingCharacter.value
  if (!c) return

  c.backgrounds = backgrounds.value
    .filter((background) => backgroundLevel(background.key) > 0)
    .map((background) => ({ key: background.key, level: backgroundLevel(background.key), note: "" }))

  c.debts = validDebts.value.map((debt) => ({ ...debt, party: debt.party.trim(), note: debt.note.trim() }))
  c.court = c.court.trim()

  const traits: Record<string, number> = {}
  for (const trait of dbHumanTraits) {
    traits[trait] = reducedTraits.value[trait] ?? DB_MAX_HUMAN_TRAIT
  }
  c.humanTraits = traits

  c.health = dbHealth(c)
  c.cruor = dbCruorMax(c)
  c.willePool = c.wille
  c.hunger = 0
}

const canGoNext = computed(() => {
  const c = editingCharacter.value
  if (!c || !ready.value) return false
  if (anchorCount.value === 0 || filledAnchors.value !== anchorCount.value) return false
  if (usedBackgroundPoints.value !== BACKGROUND_POINTS) return false
  if (c.court.trim().length === 0) return false
  if (traitStepsLeft.value > 0) return false
  return !burdensRequired.value || validDebts.value.length > 0
})
</script>

<template>
  <EditorForm :can-go-next="canGoNext" :is-finish="true" @before-next="onBeforeNext">
    <WrappedSpinner v-if="!ready">Darkborne-Daten werden geladen</WrappedSpinner>

    <div v-else-if="editingCharacter" class="finishing-view">
      <div class="card intro">
        <small>
          Die letzten Handgriffe: Setze deine Anker, verteile deine Hintergründe, ordne dich politisch ein und trage
          die Altlasten deines Startalters ein.
        </small>
      </div>

      <div class="card block">
        <h6>
          Anker
          <TipButton
            title="Anker"
            content="Jede Figur hat fünf Ankerplätze. Menschliche Anker binden dich an die Welt der Lebenden, nächtliche an die verborgene Welt. Jeder Anker kann einmal pro Sitzung Halt geben und eine passende Folge vollständig abwenden. Ein Anker muss konkret sein: nicht Familie, sondern mein Bruder Jonas."
          />
        </h6>
        <small class="hint">
          Deine Verteilung kommt aus dem Startalter: {{ startAge?.humanAnchors ?? 0 }} menschlich,
          {{ startAge?.nightAnchors ?? 0 }} nächtlich. Alle {{ anchorCount }} Plätze müssen konkret gefüllt sein
          ({{ filledAnchors }} / {{ anchorCount }}).
        </small>

        <div class="anchors">
          <div
            v-for="anchor in editingCharacter.anchors"
            :key="anchor.slot"
            class="anchor"
            :class="{ night: anchor.kind === DbAnchorKind.Night }"
          >
            <div class="anchor-head">
              <b>{{ anchorTitle(anchor) }}</b>
              <small class="badge-state">fest</small>
            </div>
            <small class="hint">{{ anchorHint(anchor) }}</small>
            <input
              class="form-control"
              type="text"
              :placeholder="anchorPlaceholder(anchor)"
              v-model="anchor.label"
              :data-agent="'db:anchor:' + anchor.slot"
            />
          </div>
        </div>
      </div>

      <div class="card block">
        <h6>
          Hintergründe
          <TipButton
            title="Hintergründe"
            content="Hintergründe beschreiben, was dir in der Nacht zur Verfügung steht: Zuflucht, Ressourcen, Kontakte, Verbündete und Stammspender. Du verteilst 3 Punkte."
          />
        </h6>
        <div class="info"><span>{{ usedBackgroundPoints }} / {{ BACKGROUND_POINTS }} Punkte</span></div>

        <div class="rows">
          <div v-for="background in backgrounds" :key="background.key" class="bg-row">
            <div class="bg-label">
              <label>
                {{ background.name }}
                <TipButton :title="background.name" :content="backgroundLevelTable(background.key)" />
              </label>
              <small class="hint">
                {{ backgroundLevel(background.key) > 0 ? backgroundLevelText(background.key, backgroundLevel(background.key)) : background.description }}
              </small>
            </div>
            <div class="stepper">
              <button
                class="btn incdec"
                :disabled="backgroundLevel(background.key) <= 0"
                :data-agent="'db:background:' + background.key + ':down'"
                @click="changeBackground(background.key, -1)"
              >
                -
              </button>
              <div class="value">{{ backgroundLevel(background.key) }}</div>
              <button
                class="btn incdec"
                :disabled="usedBackgroundPoints >= BACKGROUND_POINTS || backgroundLevel(background.key) >= backgroundMax(background.key)"
                :data-agent="'db:background:' + background.key + ':up'"
                @click="changeBackground(background.key, 1)"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="card block">
        <h6>
          Politik
          <TipButton
            title="Court und Stand"
            content="Der Court ist die politische Ordnung deiner Stadt. Der Stand beginnt bei 2 (Bewohner), sofern die Geschichte nichts anderes verlangt. Ein Amt und eine Order sind optional."
          />
        </h6>

        <div class="grid">
          <div class="field">
            <label class="required">Court</label>
            <input
              class="form-control"
              type="text"
              placeholder="Name des Courts oder der Stadt"
              v-model="editingCharacter.court"
              data-agent="db:input:court"
            />
          </div>

          <div class="field">
            <label class="required">Stand</label>
            <select class="form-control" v-model.number="editingCharacter.courtRank" data-agent="db:select:court-rank">
              <option v-for="rank in courtRanks" :key="rank.level" :value="rank.level">
                {{ rank.level }} - {{ rank.name }}
              </option>
            </select>
            <small class="hint">
              {{ DarkborneData.courtRank(editingCharacter.courtRank)?.rights }}
              <template v-if="(DarkborneData.courtRank(editingCharacter.courtRank)?.bonus ?? 0) > 0">
                (+{{ DarkborneData.courtRank(editingCharacter.courtRank)?.bonus }} Würfel im Umgang mit dem Court)
              </template>
            </small>
          </div>

          <div class="field">
            <label>Amt (optional)</label>
            <select class="form-control" v-model="editingCharacter.office" data-agent="db:select:office">
              <option value="">kein Amt</option>
              <option v-for="office in offices" :key="office.key" :value="office.key">{{ office.name }}</option>
            </select>
            <small v-if="editingCharacter.office" class="hint">
              {{ DarkborneData.office(editingCharacter.office)?.task }}
            </small>
          </div>

          <div class="field">
            <label>Order (optional)</label>
            <select class="form-control" v-model="editingCharacter.order" data-agent="db:select:order">
              <option value="">keine Order</option>
              <option v-for="order in orders" :key="order.key" :value="order.key">{{ order.name }}</option>
            </select>
            <small v-if="editingCharacter.order" class="hint">
              {{ DarkborneData.order(editingCharacter.order)?.motto }}
            </small>
          </div>
        </div>
      </div>

      <div class="card block">
        <h6>
          Altlasten
          <TipButton
            title="Schulden"
            content="Schulden laufen in beide Richtungen. Ein Gefallen kostet eine Tür, eine Information oder ein Schweigen. Eine Schuld verlangt ein echtes Risiko. Eine Blutschuld verlangt ein Leben, eine Existenz oder ein gedecktes Verbrechen. Feinde und Schwüre trägst du hier ebenfalls ein und beschreibst sie in der Notiz."
          />
        </h6>
        <small class="hint">
          Dein Startalter verlangt: <b>{{ startAge?.burdens ?? NO_BURDENS }}</b>
        </small>
        <small v-if="burdensRequired" class="hint">
          Trage jede Altlast als Eintrag ein. Feinde und Schwüre notierst du ebenfalls hier, mit einem Wort in der Notiz.
        </small>

        <div class="debts">
          <div v-for="(debt, index) in debts" :key="index" class="debt-row">
            <select class="form-control" v-model="debt.direction" :data-agent="'db:debt:' + index + ':direction'">
              <option v-for="direction in [DbDebtDirection.Owing, DbDebtDirection.Owed]" :key="direction" :value="direction">
                {{ directionLabel(direction) }}
              </option>
            </select>
            <select class="form-control" v-model="debt.size" :data-agent="'db:debt:' + index + ':size'">
              <option value="" disabled>Größe</option>
              <option v-for="size in debtSizes" :key="size.key" :value="size.key">{{ size.name }}</option>
            </select>
            <input
              class="form-control"
              type="text"
              placeholder="Gegenüber wem?"
              v-model="debt.party"
              :data-agent="'db:debt:' + index + ':party'"
            />
            <input
              class="form-control"
              type="text"
              placeholder="Notiz, etwa Feind oder Schwur"
              v-model="debt.note"
              :data-agent="'db:debt:' + index + ':note'"
            />
            <button class="btn remove" :data-agent="'db:debt:' + index + ':remove'" @click="removeDebt(index)">
              <i class="fa-solid fa-xmark" />
            </button>
          </div>
        </div>

        <button class="btn add" data-agent="db:debt:add" @click="addDebt">Altlast hinzufügen</button>

        <small v-if="burdensRequired && validDebts.length === 0" class="warn">
          Dein Startalter verlangt mindestens eine Altlast mit Größe und Gegenüber.
        </small>
      </div>

      <div class="card block summary">
        <h6>Dein fertiger Charakter</h6>

        <div class="grid">
          <div class="line"><span>Cruor-Vorrat</span><b>{{ derived.cruor }}</b></div>
          <div class="line"><span>Unterhalt</span><b>{{ derived.upkeep }} pro Nacht</b></div>
          <div class="line"><span>Gesundheit</span><b>{{ derived.health }}</b></div>
          <div class="line"><span>Wille</span><b>{{ derived.wille }} (Vorrat {{ derived.wille }})</b></div>
          <div class="line"><span>Hunger</span><b>0</b></div>
          <div class="line"><span>Höchste Tiefe</span><b>{{ derived.maxDepth }}</b></div>
          <div class="line"><span>Blutstärke</span><b>{{ editingCharacter.bloodStrength }}</b></div>
          <div class="line"><span>Bonus-XP</span><b>{{ editingCharacter.exp }}</b></div>
        </div>

        <div class="sub">
          <small class="block-title">Anathema</small>
          <div class="line" v-for="entry in anathema" :key="entry.influence">
            <span>{{ DarkborneData.influenceName(entry.influence) }}</span>
            <b>{{ DarkborneData.anathemaLevelName(entry.level) }}</b>
          </div>
        </div>

        <div class="sub">
          <small class="block-title">Menschenzüge</small>
          <div class="line" v-for="trait in dbHumanTraits" :key="trait">
            <span>
              {{ traitName(trait) }}
              <TipButton :title="traitName(trait)" :content="traitDescription(trait, reducedTraits[trait] ?? DB_MAX_HUMAN_TRAIT)" />
            </span>
            <span class="trait-steps">
              <IconButton
                icon="fa-minus"
                :disabled="!canLowerTrait(trait)"
                :data-agent="`db:trait:lower:${trait}`"
                @click="lowerTrait(trait)"
              />
              <b>{{ reducedTraits[trait] }}</b>
              <IconButton
                icon="fa-plus"
                :disabled="(reducedTraits[trait] ?? DB_MAX_HUMAN_TRAIT) >= DB_MAX_HUMAN_TRAIT"
                :data-agent="`db:trait:raise:${trait}`"
                @click="raiseTrait(trait)"
              />
            </span>
          </div>
          <small class="hint">
            Dein Startalter zieht {{ traitReduction }} Stufen ab, du verteilst sie selbst. Offen: {{ traitStepsLeft }}.
            Keiner fällt unter 1, und Menschenzüge kommen nie zurück.
          </small>
        </div>
      </div>
    </div>
  </EditorForm>
</template>

<style scoped lang="scss">
.finishing-view {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem;

  .card {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: min(60rem, 100%);
  }

  h6 {
    margin: 0;
    font-weight: bold;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
  }

  .info {
    font-size: 0.85rem;
    opacity: 0.8;
    text-align: right;
  }

  .anchors {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .anchor {
    flex: 1 1 17rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.6rem 0.7rem;
    border-radius: 0.6rem;
    border: 1px solid rgba(255, 255, 255, 0.08);

    &.night {
      border-color: rgba(255, 255, 255, 0.18);
    }

    .anchor-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .badge-state {
      opacity: 0.7;
    }
  }

  .rows {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .bg-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;

    .bg-label {
      display: flex;
      flex-direction: column;

      label {
        margin: 0;
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
      }
    }
  }

  .stepper {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex-shrink: 0;

    .btn.incdec {
      min-width: 2rem;
      height: 2rem;
      font-size: 1.2rem;
      font-weight: bold;
      padding: 0;
      line-height: 1;
    }

    .value {
      min-width: 1.75rem;
      text-align: center;
      font-weight: 600;
    }
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
    gap: 0.75rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;

    label {
      margin: 0;
      font-size: 0.9rem;
    }
  }

  .debts {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .debt-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;

    select {
      width: 12rem;
    }

    input {
      flex: 1 1 12rem;
    }

    .btn.remove {
      min-width: 2rem;
      height: 2rem;
      padding: 0;
      line-height: 1;
    }
  }

  .btn.add {
    align-self: flex-start;
  }

  .summary {
    .sub {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      padding: 0.5rem 0.6rem;
      border-radius: 0.6rem;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .block-title {
      font-weight: bold;
    }
  }

  .line {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.6rem;
    font-size: 0.9rem;

    span {
      opacity: 0.85;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }

    b {
      text-align: right;
    }
  }

  .hint {
    opacity: 0.8;
  }

  .warn {
    color: var(--primary-color);
  }
}
</style>
