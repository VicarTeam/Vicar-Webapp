<script setup lang="ts">
import { computed, ref } from "vue"
import EditorForm from "@/components/editor/EditorForm.vue"
import TipButton from "@/components/editor/TipButton.vue"
import { vdzTraitDefs } from "@/app/data/vdz"
import { VDZ_HELP } from "@/libs/data/vdz-helpers"
import { getVdzBloodPool, getVdzTraitCategoryName, type IVdzSheet, type IVdzSheetTrait, type IVdzTraitDef, VdzVirtue } from "@/@types/vdz"
import { useStore } from "@/app/store"

const COST = {
  roadPerDot: 2,
  willPerDot: 1,
}

const MAX_FLAW_BONUS = 7

const store = useStore()
const editingCharacter = computed(() => store.editingCharacter as IVdzSheet | undefined)

// Generation kann durch den Hintergrund "Generation" gesenkt worden sein
const effectiveGeneration = computed(() => {
  const c = editingCharacter.value
  if (!c) return 13
  const genBackground = c.backgrounds.find((b) => b.name === "Generation")
  return Math.max(4, c.generation - (genBackground?.level ?? 0))
})

const bloodPool = computed(() => getVdzBloodPool(effectiveGeneration.value))

const baseRoad = computed(() => {
  const c = editingCharacter.value
  if (!c) return 0
  return c.virtues[VdzVirtue.ConscienceOrConviction] + c.virtues[VdzVirtue.SelfControlOrInstinct]
})

const baseWill = computed(() => editingCharacter.value?.virtues[VdzVirtue.Courage] ?? 1)

const extraRoad = ref(0)
const extraWill = ref(0)

// --- Vorzüge & Schwächen ---
const chosenTraits = ref<IVdzSheetTrait[]>([])
const selectedTraitDef = ref<IVdzTraitDef | null>(null)
const selectedTraitLevel = ref(1)

const traitMerits = computed(() => vdzTraitDefs.filter(t => t.type === "merit"))
const traitFlaws = computed(() => vdzTraitDefs.filter(t => t.type === "flaw"))

const selectedLevelOptions = computed(() => {
  const def = selectedTraitDef.value
  if (!def) return []
  const options: number[] = []
  for (let i = def.minLevel; i <= def.maxLevel; i++) options.push(i)
  return options
})

function onTraitDefChange() {
  selectedTraitLevel.value = selectedTraitDef.value?.minLevel ?? 1
}

function addTrait() {
  const def = selectedTraitDef.value
  if (!def) return
  if (chosenTraits.value.some(t => t.name === def.name)) return
  chosenTraits.value.push({ name: def.name, level: selectedTraitLevel.value, isFlaw: def.type === "flaw" })
  selectedTraitDef.value = null
  selectedTraitLevel.value = 1
}

function removeTrait(name: string) {
  chosenTraits.value = chosenTraits.value.filter(t => t.name !== name)
}

function traitDef(name: string): IVdzTraitDef | undefined {
  return vdzTraitDefs.find(t => t.name === name)
}

const meritCost = computed(() => chosenTraits.value.filter(t => !t.isFlaw).reduce((s, t) => s + t.level, 0))
const rawFlawBonus = computed(() => chosenTraits.value.filter(t => t.isFlaw).reduce((s, t) => s + t.level, 0))
const flawBonus = computed(() => Math.min(MAX_FLAW_BONUS, rawFlawBonus.value))

const costRoad = computed(() => extraRoad.value * COST.roadPerDot)
const costWill = computed(() => extraWill.value * COST.willPerDot)
const totalCost = computed(() => costRoad.value + costWill.value + meritCost.value)

const freebiesAvailable = computed(() => (editingCharacter.value?.freebiePoints ?? 0) + flawBonus.value)
const freebiesLeft = computed(() => freebiesAvailable.value - totalCost.value)

const roadRating = computed(() => Math.min(10, baseRoad.value + extraRoad.value))
const willpower = computed(() => Math.min(10, baseWill.value + extraWill.value))

const canGoNext = computed(() => freebiesLeft.value >= 0)

function onBeforeNext() {
  const c = editingCharacter.value
  if (!c) return

  c.generation = effectiveGeneration.value
  c.roadRating = roadRating.value
  c.willpower = willpower.value
  c.bloodPool = bloodPool.value[0]
  c.traits = [...chosenTraits.value]
  c.freebiePoints = freebiesLeft.value
}
</script>

<template>
  <EditorForm :can-go-next="canGoNext" :is-finish="true" @before-next="onBeforeNext">
    <div v-if="editingCharacter" class="finishing-view">
      <div class="card header">
        <h4>Letzte Handgriffe</h4>
        <p>
          Dein <b>Wegwert</b> ergibt sich aus den beiden Weg-Tugenden, deine <b>Willenskraft</b> aus deinem Mut,
          dein <b>Blutvorrat</b> aus deiner Generation.
          Du hast <b>15 Freie Punkte</b> — hier kannst du Wegwert (2 pro Punkt) und Willenskraft (1 pro Punkt) steigern.
          Übrige Freie Punkte bleiben erhalten und können später für Attribute (5), Fähigkeiten (2),
          Disziplinen (7), Hintergründe (1) und Tugenden (2) ausgegeben werden.
        </p>

        <div class="freebies">
          Verfügbar: <b>{{ freebiesAvailable }}</b> —
          Geplant: <b>{{ totalCost }}</b> —
          Übrig: <b :class="{ neg: freebiesLeft < 0 }">{{ freebiesLeft }}</b>
        </div>
      </div>

      <div class="grid">
        <div class="card">
          <h6>
            Wegwert ({{ editingCharacter.road?.name ?? "Weg" }})
            <TipButton :content="VDZ_HELP.roadRating + ` — Startwert = ${editingCharacter.road?.virtues.conscienceOrConviction ?? ''} + ${editingCharacter.road?.virtues.selfControlOrInstinct ?? ''}.`" />
          </h6>
          <div class="row">
            <button class="btn incdec" :disabled="extraRoad <= 0" @click="extraRoad--">−</button>
            <div class="value">{{ roadRating }}</div>
            <button class="btn incdec" :disabled="roadRating >= 10 || (totalCost + COST.roadPerDot) > freebiesAvailable" @click="extraRoad++">+</button>
          </div>
          <small>Basis: {{ baseRoad }} &nbsp;|&nbsp; Kosten: {{ costRoad }}</small>
        </div>

        <div class="card">
          <h6>
            Willenskraft
            <TipButton :content="VDZ_HELP.virtueCourage + ' Du gibst Willenskraft aus, um automatische Erfolge zu erzielen oder der Bestie zu widerstehen.'" />
          </h6>
          <div class="row">
            <button class="btn incdec" :disabled="extraWill <= 0" @click="extraWill--">−</button>
            <div class="value">{{ willpower }}</div>
            <button class="btn incdec" :disabled="willpower >= 10 || (totalCost + COST.willPerDot) > freebiesAvailable" @click="extraWill++">+</button>
          </div>
          <small>Basis (Mut): {{ baseWill }} &nbsp;|&nbsp; Kosten: {{ costWill }}</small>
        </div>

        <div class="card">
          <h6>
            Blutvorrat
            <TipButton :content="VDZ_HELP.bloodPool" />
          </h6>
          <div class="derived">
            <div><span>Generation:</span> <b>{{ effectiveGeneration }}.</b></div>
            <div><span>Max. Blutvorrat:</span> <b>{{ bloodPool[0] }}</b></div>
            <div><span>Punkte pro Runde:</span> <b>{{ bloodPool[1] }}</b></div>
          </div>
        </div>
      </div>

      <div class="card traits">
        <h6>
          Vorzüge &amp; Schwächen (optional)
          <TipButton content="Vorzüge kosten Freie Punkte in Höhe ihrer Stufe. Schwächen bringen zusätzliche Freie Punkte ein — maximal 7. Sprich ungewöhnliche Kombinationen mit deiner Erzählerin ab." />
        </h6>

        <div class="trait-add">
          <select class="form-control" v-model="selectedTraitDef" @change="onTraitDefChange">
            <option :value="null" disabled>Vorzug oder Schwäche wählen …</option>
            <optgroup label="Vorzüge">
              <option v-for="t in traitMerits" :key="'m' + t.id" :value="t">
                {{ t.name }} ({{ getVdzTraitCategoryName(t.category) }}, {{ t.minLevel === t.maxLevel ? t.minLevel : `${t.minLevel}-${t.maxLevel}` }} P.)
              </option>
            </optgroup>
            <optgroup label="Schwächen">
              <option v-for="t in traitFlaws" :key="'f' + t.id" :value="t">
                {{ t.name }} ({{ getVdzTraitCategoryName(t.category) }}, +{{ t.minLevel === t.maxLevel ? t.minLevel : `${t.minLevel}-${t.maxLevel}` }} P.)
              </option>
            </optgroup>
          </select>

          <select v-if="selectedLevelOptions.length > 1" class="form-control level-select" v-model.number="selectedTraitLevel">
            <option v-for="n in selectedLevelOptions" :key="n" :value="n">{{ n }}</option>
          </select>

          <button class="btn btn-primary" :disabled="!selectedTraitDef" @click="addTrait">Hinzufügen</button>
        </div>

        <small v-if="selectedTraitDef" class="trait-desc">{{ selectedTraitDef.description }}</small>

        <div v-if="chosenTraits.length > 0" class="trait-list">
          <div v-for="t in chosenTraits" :key="t.name" class="trait-row" :class="{ flaw: t.isFlaw }">
            <small>
              <b>{{ t.name }}</b> ({{ t.isFlaw ? "+" : "−" }}{{ t.level }} P.)
              <TipButton v-if="traitDef(t.name)" :content="traitDef(t.name)!.description" />
            </small>
            <button class="btn remove" @click="removeTrait(t.name)"><i class="fa-solid fa-xmark" /></button>
          </div>
        </div>

        <small v-if="rawFlawBonus > MAX_FLAW_BONUS" class="warn">
          Schwächen bringen maximal {{ MAX_FLAW_BONUS }} zusätzliche Punkte — überschüssige Punkte verfallen.
        </small>
      </div>

      <div class="guards">
        <span v-if="freebiesLeft < 0">Zu wenig Freie Punkte.</span>
      </div>
    </div>
  </EditorForm>
</template>

<style scoped lang="scss">
.finishing-view {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;

  .card {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    border-radius: 0.75rem;

    h4,
    h6 {
      margin-bottom: 0;
    }
  }

  .header p {
    margin: 0;
  }

  .freebies {
    margin-top: 0.25rem;

    .neg {
      color: #b00020;
    }
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
    gap: 1rem;
  }

  .row {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    .btn.incdec {
      min-width: 2.25rem;
      height: 2.25rem;
      font-size: 1.5rem;
      font-weight: bold;
      padding: 0;
      line-height: 1;
    }

    .value {
      min-width: 3rem;
      text-align: center;
      font-weight: 600;
      font-size: 1.1rem;
    }
  }

  .derived {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;

    span {
      opacity: 0.85;
    }
  }

  .guards {
    color: #b00020;
    display: flex;
    justify-content: center;
    font-weight: 600;
  }

  .traits {
    .trait-add {
      display: flex;
      gap: 0.5rem;
      align-items: center;

      select:first-child {
        flex-grow: 1;
      }

      .level-select {
        width: 5rem;
      }
    }

    .trait-desc {
      opacity: 0.85;
    }

    .trait-list {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      margin-top: 0.25rem;
    }

    .trait-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;

      &.flaw b {
        color: var(--primary-color);
      }

      .remove {
        min-width: 1.8rem;
        height: 1.8rem;
        padding: 0;
        line-height: 1;
      }
    }

    .warn {
      color: #e8c66b;
    }
  }
}
</style>
