<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
import EditorForm from "@/components/editor/EditorForm.vue"
import TipButton from "@/components/editor/TipButton.vue"
import WrappedSpinner from "@/components/spinners/WrappedSpinner.vue"
import DbArtSymbol from "@/components/symbols/DbArtSymbol.vue"
import { DarkborneData, type IDarkArtForm } from "@/libs/data/darkborne-data"
import {
  DB_ESTABLISHED_FORM_MAX_LEVEL,
  dbArtDepth,
  dbFormDifficulty,
  dbFormSlots,
} from "@/libs/data/darkborne-rules"
import { DbFormKind, type IDbCharacterForm, type IDbSheet } from "@/@types/deathborne"
import { useStore } from "@/app/store"

const store = useStore()
const editingCharacter = computed(() => store.editingCharacter as unknown as IDbSheet | undefined)

const ready = ref(false)
const entries = ref<IDbCharacterForm[]>([])

const slots = computed(() => {
  const c = editingCharacter.value
  if (!c || !ready.value) return 0
  return dbFormSlots(c)
})

const ownedArts = computed(() => {
  const c = editingCharacter.value
  if (!c) return []
  return [...c.arts].sort((a, b) => b.depth - a.depth)
})

function emptyEntry(): IDbCharacterForm {
  return { art: "", key: "", name: "", level: 1, kind: DbFormKind.Established, effect: "", limits: "" }
}

function resizeEntries() {
  const list = [...entries.value]
  while (list.length < slots.value) {
    list.push(emptyEntry())
  }
  while (list.length > slots.value) {
    list.pop()
  }
  entries.value = list
}

onMounted(async () => {
  try {
    await DarkborneData.load()
  } finally {
    ready.value = DarkborneData.isLoaded
  }

  const c = editingCharacter.value
  if (c) {
    entries.value = c.forms
      .filter((form) => {
        const depth = dbArtDepth(c, form.art)
        return depth > 0 && form.level <= depth
      })
      .map((form) => ({ ...form }))
  }
  resizeEntries()

  const mandatory = entries.value[0]
  if (mandatory && mandatory.kind !== DbFormKind.Established) {
    entries.value.splice(0, 1, emptyEntry())
  }
})

watch(slots, () => resizeEntries())

function depthOf(artKey: string): number {
  const c = editingCharacter.value
  return c && artKey ? dbArtDepth(c, artKey) : 0
}

function slotLabel(index: number): string {
  return index === 0 ? "Pflichtlehre des Sires" : `Form ${index + 1}`
}

function isMandatorySlot(index: number): boolean {
  return index === 0
}

function establishedOptions(index: number): IDarkArtForm[] {
  const entry = entries.value[index]
  if (!entry || !entry.art) return []

  const maxLevel = Math.min(depthOf(entry.art), DB_ESTABLISHED_FORM_MAX_LEVEL)
  const usedKeys = entries.value
    .filter((other, otherIndex) => otherIndex !== index && other.kind === DbFormKind.Established)
    .map((other) => other.key)

  return DarkborneData.formsOf(entry.art, maxLevel).filter((form) => form.key === entry.key || !usedKeys.includes(form.key))
}

function ownLevels(index: number): number[] {
  const entry = entries.value[index]
  if (!entry || !entry.art) return []

  const levels: number[] = []
  for (let level = 1; level <= depthOf(entry.art); level++) {
    levels.push(level)
  }
  return levels
}

function levelTable(index: number): string {
  const entry = entries.value[index]
  if (!entry || !entry.art) return ""

  const art = DarkborneData.art(entry.art)
  if (!art) return ""

  return art.levels
    .filter((level) => level.depth <= depthOf(entry.art))
    .map((level) => `Stufe ${level.depth} (${DarkborneData.depthName(level.depth)}): ${level.examples.join(", ")}`)
    .join("\n\n")
}

function resetEntry(index: number) {
  const entry = entries.value[index]
  if (!entry) return

  entry.key = ""
  entry.name = ""
  entry.effect = ""
  entry.limits = ""
  entry.level = 1
}

function onEstablishedChange(index: number) {
  const entry = entries.value[index]
  if (!entry) return

  const form = DarkborneData.form(entry.key)
  if (!form) return

  entry.name = form.name
  entry.level = form.level
  entry.effect = form.effect
  entry.limits = form.limits
}

function selectedForm(index: number): IDarkArtForm | undefined {
  const entry = entries.value[index]
  if (!entry || entry.kind !== DbFormKind.Established || !entry.key) return undefined
  return DarkborneData.form(entry.key)
}

function entryValid(index: number): boolean {
  const entry = entries.value[index]
  if (!entry || !entry.art) return false

  const depth = depthOf(entry.art)
  if (depth <= 0) return false

  if (entry.kind === DbFormKind.Established) {
    return !!entry.key && !!DarkborneData.form(entry.key)
  }
  if (entry.name.trim().length === 0) return false
  if (entry.level < 1 || entry.level > depth) return false
  return entry.effect.trim().length > 0 && entry.limits.trim().length > 0
}

const duplicateEstablished = computed(() => {
  const keys = entries.value.filter((e) => e.kind === DbFormKind.Established && e.key).map((e) => e.key)
  return new Set(keys).size !== keys.length
})

function slugify(index: number, name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
  return `own_${index + 1}_${slug || "form"}`
}

function onBeforeNext() {
  const c = editingCharacter.value
  if (!c) return

  c.forms = entries.value.map((entry, index) => {
    if (entry.kind === DbFormKind.Established) {
      return { ...entry }
    }
    return {
      art: entry.art,
      key: slugify(index, entry.name),
      name: entry.name.trim(),
      level: entry.level,
      kind: DbFormKind.Own,
      effect: entry.effect.trim(),
      limits: entry.limits.trim(),
    }
  })
}

const canGoNext = computed(() => {
  if (!ready.value || slots.value === 0) return false
  if (entries.value.length !== slots.value) return false
  if (duplicateEstablished.value) return false
  return entries.value.every((_, index) => entryValid(index))
})
</script>

<template>
  <EditorForm :can-go-next="canGoNext" next-step="editor-db-finishing" @before-next="onBeforeNext">
    <WrappedSpinner v-if="!ready">Darkborne-Daten werden geladen</WrappedSpinner>

    <div v-else-if="editingCharacter" class="forms-view">
      <div class="card intro">
        <small>
          Wähle deine Formen: eine pro Tiefenpunkt, dazu eine Gefestigte Form aus der Pflichtlehre deines Sires. Das
          sind zusammen <b>{{ slots }}</b> Formen.
        </small>
        <small class="hint">
          Eine Gefestigte Form gelingt leichter, ist dafür starr und für jeden Vesper erkennbar. Eine Eigene Form ist
          dein persönliches Rezept und wird von der Spielleitung gegen die Stufentabelle geprüft.
        </small>
        <small v-if="slots === 0" class="warn">Verteile zuerst deine Lernschritte auf Blutkünste.</small>
      </div>

      <div class="slots">
        <div v-for="(entry, index) in entries" :key="index" class="card slot" :class="{ complete: entryValid(index) }">
          <div class="head">
            <DbArtSymbol v-if="entry.art" :art="entry.art" class="symbol" />
            <h6>
              {{ slotLabel(index) }}
              <TipButton
                v-if="isMandatorySlot(index)"
                title="Pflichtlehre des Sires"
                content="Artikel 6 des Bundes verlangt, dass jeder Sire seinen Scion lehrt, was er geworden ist. Diese zusätzliche Form ist immer eine Gefestigte Form."
              />
            </h6>
          </div>

          <div class="field">
            <label class="required">Blutkunst</label>
            <select class="form-control" v-model="entry.art" :data-agent="'db:form:' + index + ':art'" @change="resetEntry(index)">
              <option value="" disabled>Kunst wählen</option>
              <option v-for="art in ownedArts" :key="art.key" :value="art.key">
                {{ DarkborneData.artName(art.key) }} (Tiefe {{ art.depth }})
              </option>
            </select>
          </div>

          <div class="field" v-if="entry.art && !isMandatorySlot(index)">
            <label class="required">Art der Form</label>
            <select class="form-control" v-model="entry.kind" :data-agent="'db:form:' + index + ':kind'" @change="resetEntry(index)">
              <option :value="DbFormKind.Established">Gefestigte Form</option>
              <option :value="DbFormKind.Own">Eigene Form</option>
            </select>
          </div>

          <template v-if="entry.art && entry.kind === DbFormKind.Established">
            <div class="field">
              <label class="required">Gefestigte Form</label>
              <select
                class="form-control"
                v-model="entry.key"
                :data-agent="'db:form:' + index + ':established'"
                @change="onEstablishedChange(index)"
              >
                <option value="" disabled>Form wählen</option>
                <option v-for="form in establishedOptions(index)" :key="form.key" :value="form.key">
                  {{ form.name }} (Stufe {{ form.level }})
                </option>
              </select>
            </div>

            <div v-if="selectedForm(index)" class="block">
              <div class="line"><span>Wirkungsstufe</span><b>{{ selectedForm(index)?.level }}</b></div>
              <div class="line"><span>Schwierigkeit</span><b>{{ selectedForm(index)?.difficulty }}</b></div>
              <small><b>Wirkung:</b> {{ selectedForm(index)?.effect }}</small>
              <small><b>Grenzen:</b> {{ selectedForm(index)?.limits }}</small>
              <small class="good">Vorteil: +2 Würfel, außerhalb von Konflikten ohne Wurf, solange du nicht hungrig bist.</small>
              <small class="warn">
                Preis: feste Wirkung, feste Grenzen, keine Steigerungen. Jeder Vesper erkennt die Form, Gegenwehr +1
                beim NSC und +2 Würfel für andere Vesperi, um ihr zu widerstehen.
              </small>
            </div>
          </template>

          <template v-if="entry.art && entry.kind === DbFormKind.Own">
            <div class="field">
              <label class="required">Name der Form</label>
              <input
                class="form-control"
                type="text"
                placeholder="Name deiner Form"
                v-model="entry.name"
                :data-agent="'db:form:' + index + ':name'"
              />
            </div>

            <div class="field">
              <label class="required">
                Wirkungsstufe
                <TipButton v-if="levelTable(index)" :title="DarkborneData.artName(entry.art)" :content="levelTable(index)" />
              </label>
              <select class="form-control" v-model.number="entry.level" :data-agent="'db:form:' + index + ':level'">
                <option v-for="level in ownLevels(index)" :key="level" :value="level">
                  {{ level }} - {{ DarkborneData.depthName(level) }}
                </option>
              </select>
              <small class="hint">Schwierigkeit dieser Form: {{ dbFormDifficulty(DbFormKind.Own, entry.level) }}</small>
            </div>

            <div class="field">
              <label class="required">Wirkung</label>
              <textarea
                class="form-control"
                rows="3"
                placeholder="Was genau geschieht?"
                v-model="entry.effect"
                :data-agent="'db:form:' + index + ':effect'"
              ></textarea>
            </div>

            <div class="field">
              <label class="required">Grenzen</label>
              <textarea
                class="form-control"
                rows="2"
                placeholder="Was kann die Form nicht?"
                v-model="entry.limits"
                :data-agent="'db:form:' + index + ':limits'"
              ></textarea>
            </div>

            <div v-if="levelTable(index)" class="block">
              <small class="block-title">Stufentabelle deiner Kunst</small>
              <small class="table-text">{{ levelTable(index) }}</small>
              <small class="hint">Die Spielleitung gleicht deine Wirkungsstufe mit dieser Tabelle ab.</small>
            </div>
          </template>
        </div>
      </div>

      <div v-if="duplicateEstablished" class="card warn-card">
        <small class="warn">Jede Gefestigte Form kann nur einmal gewählt werden.</small>
      </div>
    </div>
  </EditorForm>
</template>

<style scoped lang="scss">
.forms-view {
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
  }

  .intro,
  .warn-card {
    width: min(60rem, 100%);
  }

  .slots {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .slot {
    width: 24rem;
    border: 1px solid rgba(255, 255, 255, 0.08);

    &.complete {
      border-color: var(--primary-color);
    }

    .head {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .symbol {
      width: 2.25rem;
      flex-shrink: 0;
      filter: var(--image-to-primary-color-filter);
    }

    h6 {
      margin: 0;
      font-weight: bold;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;

    label {
      margin: 0;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.9rem;
    }
  }

  .block {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.5rem 0.6rem;
    border-radius: 0.6rem;
    border: 1px solid rgba(255, 255, 255, 0.08);

    .block-title {
      font-weight: bold;
    }

    .table-text {
      white-space: pre-line;
      max-height: 10rem;
      overflow: auto;
      -webkit-overflow-scrolling: touch;
    }
  }

  .line {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.6rem;
    font-size: 0.9rem;

    span {
      opacity: 0.8;
    }
  }

  .hint {
    opacity: 0.8;
  }

  .good {
    color: var(--accent);
  }

  .warn {
    color: var(--primary-color);
  }
}
</style>
