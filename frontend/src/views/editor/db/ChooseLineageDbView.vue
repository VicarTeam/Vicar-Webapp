<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import EditorForm from "@/components/editor/EditorForm.vue"
import TipButton from "@/components/editor/TipButton.vue"
import WrappedSpinner from "@/components/spinners/WrappedSpinner.vue"
import DbHouseSymbol from "@/components/symbols/DbHouseSymbol.vue"
import { DarkborneData, type IDarkHouse } from "@/libs/data/darkborne-data"
import { dbAnathemaFor } from "@/libs/data/darkborne-rules"
import { DbAnathemaSource, type IDbAnathema, type IDbSheet } from "@/@types/deathborne"
import { useStore } from "@/app/store"

const VARYSS_KEY = "varyss"
const PERSONAL_LEVEL = "moderate"

const varyssOptions: { key: string, extra?: string }[] = [
  { key: "silver" },
  { key: "salt" },
  { key: "garlic", extra: "hawthorn" },
  { key: "cold_iron" },
  { key: "bell_chime" },
  { key: "mirrors" },
  { key: "running_water" },
  { key: "threshold" },
  { key: "lived_faith" },
  { key: "ash_circles" },
]

const store = useStore()

function firstOf(houseKey: string) {
  return DarkborneData.firstOfHouse(houseKey)
}
const editingCharacter = computed(() => store.editingCharacter as unknown as IDbSheet | undefined)

const ready = ref(false)

onMounted(async () => {
  try {
    await DarkborneData.load()
  } finally {
    ready.value = DarkborneData.isLoaded
  }
})

const houses = computed<IDarkHouse[]>(() => (ready.value ? DarkborneData.content.houses : []))
const isVaryss = computed(() => editingCharacter.value?.bloodline === VARYSS_KEY)

function influenceLabel(option: { key: string, extra?: string }): string {
  const main = DarkborneData.influenceName(option.key)
  return option.extra ? `${main} und ${DarkborneData.influenceName(option.extra)}` : main
}

const selectedVaryssNote = computed(() => {
  const key = editingCharacter.value?.varyssAnathema
  return key ? DarkborneData.influence(key)?.note ?? "" : ""
})

function selectBloodline(house: IDarkHouse) {
  const c = editingCharacter.value
  if (!c) return

  const followedPolitics = !c.house || c.house === c.bloodline
  c.bloodline = house.key
  if (followedPolitics) {
    c.house = house.key
  }
  if (house.key !== VARYSS_KEY) {
    c.varyssAnathema = ""
  }
}

function personalAnathema(): IDbAnathema[] {
  const c = editingCharacter.value
  if (!c || c.bloodline !== VARYSS_KEY) return []

  const option = varyssOptions.find((o) => o.key === c.varyssAnathema)
  if (!option) return []

  const keys = option.extra ? [option.key, option.extra] : [option.key]
  return keys.map((key) => ({
    influence: key,
    level: PERSONAL_LEVEL,
    source: DbAnathemaSource.Personal,
    note: DarkborneData.influence(key)?.note ?? "",
  }))
}

const anathemaPreview = computed<IDbAnathema[]>(() => {
  const c = editingCharacter.value
  if (!c || !ready.value || !c.bloodline) return []
  return dbAnathemaFor({ ...c, anathema: personalAnathema() })
})

function sourceLabel(source: string): string {
  if (source === DbAnathemaSource.Inherited) return "vererbt"
  if (source === DbAnathemaSource.Personal) return "persönlich"
  return "Grundprofil"
}

function onBeforeNext() {
  const c = editingCharacter.value
  if (!c) return

  c.anathema = personalAnathema()
  c.anathema = dbAnathemaFor(c)
}

const canGoNext = computed(() => {
  const c = editingCharacter.value
  if (!c || !ready.value) return false
  if (!c.bloodline || !c.house) return false
  if (!Number.isFinite(c.glied) || c.glied < 1) return false
  return c.bloodline !== VARYSS_KEY || c.varyssAnathema.length > 0
})
</script>

<template>
  <EditorForm :can-go-next="canGoNext" next-step="editor-db-attributes" @before-next="onBeforeNext">
    <WrappedSpinner v-if="!ready">Darkborne-Daten werden geladen</WrappedSpinner>

    <div v-else-if="editingCharacter" class="lineage-view">
      <div class="card intro">
        <small>
          Wähle deine Blutlinie. Sie bestimmt deinen Blood Scar und deine vererbten Anathema und ist unveränderlich.
          Danach legst du fest, welchem Haus du politisch folgst und in welchem Glied du stehst.
        </small>
      </div>

      <div class="houses">
        <div
          v-for="house in houses"
          :key="house.key"
          class="card house"
          :class="{ selected: editingCharacter.bloodline === house.key }"
          :data-agent="'db:house:' + house.key"
          :data-agent-label="house.name"
          @click="selectBloodline(house)"
        >
          <div class="head">
            <DbHouseSymbol :house="house" class="symbol" />
            <div class="titles">
              <b>{{ house.name }}</b>
              <small><i>{{ house.epithet }}</i></small>
            </div>
          </div>

          <div class="line"><span>Leitidee</span><b>{{ house.idea }}</b></div>
          <div class="line"><span>Reputation</span><b>{{ house.reputation }}</b></div>
          <div class="line" v-if="firstOf(house.key)">
            <span>Ursprung</span>
            <b>{{ firstOf(house.key)!.name }}, {{ firstOf(house.key)!.title }}</b>
          </div>

          <small class="desc">{{ house.description }}</small>

          <div class="block">
            <small class="block-title">Blood Scar: {{ house.scar.name }}</small>
            <small>{{ house.scar.summary }}</small>
            <small><b>Auslöser:</b> {{ house.scar.triggers.join(", ") }}</small>
            <small><b>Dauerwirkung:</b> {{ house.scar.permanentEffect }}</small>
            <small><b>Zwänge:</b> {{ house.scar.compulsions.join(", ") }}</small>
          </div>

          <div class="block">
            <small class="block-title">Abweichende Anathema</small>
            <small v-if="house.anathema.length === 0">keine eigenen Abweichungen</small>
            <small v-for="entry in house.anathema" :key="house.key + entry.influenceKey">
              {{ DarkborneData.influenceName(entry.influenceKey) }}:
              <b>{{ DarkborneData.anathemaLevelName(entry.level) }}</b>
              <template v-if="entry.note"> - {{ entry.note }}</template>
            </small>
          </div>
        </div>
      </div>

      <div v-if="editingCharacter.bloodline" class="card politics">
        <div class="form-group" v-if="isVaryss">
          <label class="required">
            Persönliches Anathema (Haus Varyss)
            <TipButton
              title="Varyss und das persönliche Anathema"
              content="Varyss besitzt keinen gemeinsamen Satz zusätzlicher Anathema. Jeder Varyss wählt ein persönliches Anathema auf Stufe Mäßig. Knoblauch und Weißdorn gelten dabei als eine Wahl und wirken zusammen."
            />
          </label>
          <select class="form-control" v-model="editingCharacter.varyssAnathema" data-agent="db:select:varyss-anathema">
            <option value="" disabled>Anathema wählen</option>
            <option v-for="option in varyssOptions" :key="option.key" :value="option.key">{{ influenceLabel(option) }}</option>
          </select>
          <small class="hint">Stufe: Mäßig. Das gewählte Anathema gilt dauerhaft und zusätzlich zum Grundprofil.</small>
          <small class="hint" v-if="selectedVaryssNote">{{ selectedVaryssNote }}</small>
        </div>

        <div class="form-group">
          <label>
            Politisches Haus
            <TipButton
              title="Haus und Blutlinie"
              content="Das Haus ist deine politische Zugehörigkeit. Ein Vesper kann sich einem anderen Haus anschließen, als seine Blutlinie vorgibt: aus Zweckmäßigkeit, Verbannung oder Überzeugung. Am Blut ändert das nichts."
            />
          </label>
          <select class="form-control" v-model="editingCharacter.house" data-agent="db:select:political-house">
            <option v-for="house in houses" :key="'p' + house.key" :value="house.key">{{ house.name }}</option>
          </select>
          <small class="hint">Politik ändert niemals das Blut: Blood Scar und vererbte Anathema bleiben die deiner Blutlinie.</small>
        </div>

        <div class="form-group">
          <label class="required">
            Glied
            <TipButton
              title="Glied"
              content="Das Glied gibt an, wie viele Rote Übergänge zwischen dir und den Neun liegen. Ein Scion steht immer ein Glied tiefer als sein Sire. 1 bis 3 sind Legenden, 4 bis 6 Älteste und Häupter, 7 bis 12 die meisten Vesperi der Gegenwart, 13 und mehr ferne Linien. Kennst du das Glied deines Sires nicht, bleibt es bei 9."
            />
          </label>
          <input
            class="form-control glied"
            type="number"
            min="1"
            max="20"
            v-model.number="editingCharacter.glied"
            data-agent="db:input:glied"
          />
          <small class="hint">
            Ein niedrigeres Glied bedeutet Prestige und günstigere Verdichtung: Das Glied wird zu den XP-Kosten jeder
            Verdichtung addiert. Ab Glied 6 und näher gibt es zusätzlich +1 Würfel auf Etikette bei den Alten Häusern.
          </small>
        </div>
      </div>

      <div v-if="anathemaPreview.length > 0" class="card summary">
        <h6>Dein Anathema-Profil</h6>
        <div class="line" v-for="entry in anathemaPreview" :key="entry.influence">
          <span>{{ DarkborneData.influenceName(entry.influence) }}</span>
          <b>{{ DarkborneData.anathemaLevelName(entry.level) }} ({{ sourceLabel(entry.source) }})</b>
        </div>
      </div>
    </div>
  </EditorForm>
</template>

<style scoped lang="scss">
.lineage-view {
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

  .intro {
    width: min(60rem, 100%);
  }

  .houses {
    display: flex;
    align-items: stretch;
    justify-content: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .house {
    width: 22rem;
    cursor: pointer;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: border-color 160ms ease, transform 160ms ease;

    &:hover {
      transform: translateY(-2px);
      border-color: var(--primary-color);
    }

    &.selected {
      border-color: var(--primary-color);
      box-shadow: var(--shadow-hairline), var(--shadow-card);
    }

    .head {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .symbol {
      width: 3.5rem;
      flex-shrink: 0;
      filter: var(--image-to-primary-color-filter);
    }

    .titles {
      display: flex;
      flex-direction: column;

      small {
        opacity: 0.8;
      }
    }

    .desc {
      opacity: 0.9;
      max-height: 8rem;
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
      white-space: nowrap;
    }

    b {
      text-align: right;
    }
  }

  .block {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding: 0.5rem 0.6rem;
    border-radius: 0.6rem;
    border: 1px solid rgba(255, 255, 255, 0.08);

    .block-title {
      font-weight: bold;
      letter-spacing: 0.02em;
      color: var(--primary-color);
    }
  }

  .politics {
    width: min(45rem, 100%);
    gap: 0.9rem;

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    label {
      margin: 0;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }

    .glied {
      width: 8rem;
    }
  }

  .summary {
    width: min(45rem, 100%);

    h6 {
      margin: 0 0 0.25rem;
      font-weight: bold;
    }
  }

  .hint {
    opacity: 0.8;
  }
}
</style>
