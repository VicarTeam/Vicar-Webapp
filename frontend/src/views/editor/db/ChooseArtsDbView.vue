<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import EditorForm from "@/components/editor/EditorForm.vue"
import TipButton from "@/components/editor/TipButton.vue"
import WrappedSpinner from "@/components/spinners/WrappedSpinner.vue"
import DbArtSymbol from "@/components/symbols/DbArtSymbol.vue"
import { DarkborneData, type IDarkArt } from "@/libs/data/darkborne-data"
import { dbArtDepth, dbHasInheritance, dbLearnStepsLeft, dbMaxDepth, dbTension } from "@/libs/data/darkborne-rules"
import type { IDbSheet } from "@/@types/deathborne"
import { useStore } from "@/app/store"

const INHERITANCE_BONUS_XP = 10

const store = useStore()
const editingCharacter = computed(() => store.editingCharacter as unknown as IDbSheet | undefined)

const ready = ref(false)

onMounted(async () => {
  try {
    await DarkborneData.load()
  } finally {
    ready.value = DarkborneData.isLoaded
  }
})

const arts = computed<IDarkArt[]>(() => (ready.value ? DarkborneData.content.arts : []))

const totalSteps = computed(() => {
  const c = editingCharacter.value
  if (!c || !ready.value) return 0
  return DarkborneData.startAge(c.startAge)?.learnSteps ?? 0
})

const stepsLeft = computed(() => {
  const c = editingCharacter.value
  if (!c || !ready.value) return 0
  return dbLearnStepsLeft(c)
})

const maxDepth = computed(() => {
  const c = editingCharacter.value
  if (!c || !ready.value) return 0
  return dbMaxDepth(c.bloodStrength)
})

const tensions = computed(() => {
  const c = editingCharacter.value
  if (!c || !ready.value) return []
  return dbTension(c)
})

function depthOf(artKey: string): number {
  const c = editingCharacter.value
  return c ? dbArtDepth(c, artKey) : 0
}

function tensionOf(artKey: string): number {
  const pair = DarkborneData.pairOf(artKey)
  if (!pair) return 0
  return tensions.value.find((t) => t.key === pair.key)?.tension ?? 0
}

function counterName(art: IDarkArt): string {
  return DarkborneData.counterOf(art.key)?.shortName ?? ""
}

function wouldCreateTension(art: IDarkArt): boolean {
  if (depthOf(art.key) > 0) return false
  const counter = DarkborneData.counterOf(art.key)
  return !!counter && depthOf(counter.key) > 0
}

function nextExamples(art: IDarkArt): string[] {
  const next = depthOf(art.key) + 1
  return art.levels.find((l) => l.depth === next)?.examples ?? []
}

function levelTable(art: IDarkArt): string {
  return art.levels
    .map((level) => `Tiefe ${level.depth} (${DarkborneData.depthName(level.depth)}): ${level.examples.join(", ")}`)
    .join("\n\n")
}

function canRaise(art: IDarkArt): boolean {
  return stepsLeft.value > 0 && depthOf(art.key) < maxDepth.value
}

function raise(art: IDarkArt) {
  const c = editingCharacter.value
  if (!c || !canRaise(art)) return

  const entry = c.arts.find((a) => a.key === art.key)
  if (entry) {
    entry.depth += 1
    return
  }
  c.arts.push({ key: art.key, depth: 1, affinity: false })
}

function lower(art: IDarkArt) {
  const c = editingCharacter.value
  if (!c) return

  const index = c.arts.findIndex((a) => a.key === art.key)
  if (index < 0) return

  const entry = c.arts[index]
  if (!entry) return

  entry.depth -= 1
  if (entry.depth <= 0) {
    c.arts.splice(index, 1)
  }
}

const highestDepth = computed(() => {
  const c = editingCharacter.value
  if (!c || c.arts.length === 0) return 0
  return Math.max(...c.arts.map((a) => a.depth))
})

const tiedArtNames = computed(() => {
  const c = editingCharacter.value
  if (!c) return ""
  return c.arts
    .filter((art) => art.depth === highestDepth.value && art.key !== c.sireArt)
    .map((art) => DarkborneData.artName(art.key))
    .join(", ")
})

const hasInheritance = computed(() => {
  const c = editingCharacter.value
  if (!c || !ready.value) return false
  return dbHasInheritance(c)
})

const bonusXp = computed(() => {
  const c = editingCharacter.value
  if (!c || !ready.value) return 0
  return DarkborneData.startAge(c.startAge)?.bonusXp ?? 0
})

const totalXp = computed(() => bonusXp.value + (hasInheritance.value ? INHERITANCE_BONUS_XP : 0))

function onBeforeNext() {
  const c = editingCharacter.value
  if (!c) return

  const inheritance = dbHasInheritance(c)
  c.affinityArt = inheritance ? c.sireArt : ""
  for (const art of c.arts) {
    art.affinity = inheritance && art.key === c.sireArt
  }
  c.exp = bonusXp.value + (inheritance ? INHERITANCE_BONUS_XP : 0)
}

const canGoNext = computed(() => {
  const c = editingCharacter.value
  if (!c || !ready.value) return false
  return c.sireArt.length > 0 && stepsLeft.value === 0 && c.arts.length > 0
})
</script>

<template>
  <EditorForm :can-go-next="canGoNext" next-step="editor-db-forms" @before-next="onBeforeNext">
    <WrappedSpinner v-if="!ready">Darkborne-Daten werden geladen</WrappedSpinner>

    <div v-else-if="editingCharacter" class="arts-view">
      <div class="card sire">
        <h5>Die eine Frage an die Spielleitung</h5>
        <p class="question">"Was ist das Steckenpferd meines Sires?"</p>
        <small>
          Die Spielleitung nennt eine Kunst. Alles andere über deinen Sire bleibt bei ihr. Trage die Antwort hier ein,
          sie entscheidet über dein Erbe.
        </small>
        <select class="form-control sire-select" v-model="editingCharacter.sireArt" data-agent="db:select:sire-art">
          <option value="" disabled>Kunst wählen</option>
          <option v-for="art in arts" :key="'s' + art.key" :value="art.key">{{ art.shortName }} - {{ art.name }}</option>
        </select>
      </div>

      <div class="card intro">
        <small>
          Verteile deine Lernschritte. Jeder Lernschritt hebt eine Kunst um <b>1 Tiefe</b>, höchstens bis zur höchsten
          Tiefe deines Startalters ({{ maxDepth }}).
        </small>
        <div class="counters">
          <div class="counter">
            <span>Lernschritte übrig</span>
            <b :class="{ done: stepsLeft === 0 }">{{ stepsLeft }} / {{ totalSteps }}</b>
          </div>
          <div class="counter">
            <span>Höchste Tiefe</span>
            <b>{{ maxDepth }}</b>
          </div>
          <div class="counter">
            <span>Bonus-XP</span>
            <b>{{ totalXp }}</b>
          </div>
        </div>
      </div>

      <div class="card inheritance" :class="{ active: hasInheritance }">
        <h6>
          Das Erbe
          <TipButton
            title="Das Erbe"
            content="Affinität gibt es nur als Erbe: wer seine höchste Startkunst in das Steckenpferd seines Sires legt. Eine Kunst mit Affinität kostet dauerhaft neue Tiefe mal 5 statt neue Tiefe mal 7. Das Steckenpferd muss allein an der Spitze stehen, keine andere Kunst darf dieselbe Tiefe haben. Wer seinem Sire nicht folgt, verliert nichts, gewinnt aber auch nichts."
          />
        </h6>
        <small>
          Ist deine höchste Kunst das Steckenpferd deines Sires, erhältst du <b>{{ INHERITANCE_BONUS_XP }} Bonus-XP</b>
          und <b>Affinität</b> in dieser Kunst.
        </small>
        <small v-if="!editingCharacter.sireArt" class="hint">Beantworte zuerst die Frage nach dem Steckenpferd.</small>
        <small v-else-if="hasInheritance" class="good">
          Das Erbe greift: {{ DarkborneData.artName(editingCharacter.sireArt) }} steht allein auf deiner höchsten Tiefe
          ({{ highestDepth }}).
        </small>
        <small v-else-if="depthOf(editingCharacter.sireArt) === highestDepth && highestDepth > 0" class="hint">
          Das Erbe greift nicht: {{ DarkborneData.artName(editingCharacter.sireArt) }} teilt die Tiefe {{ highestDepth }}
          mit {{ tiedArtNames }}. Das Steckenpferd muss allein an der Spitze stehen.
        </small>
        <small v-else class="hint">
          Das Erbe greift nicht. Deine höchste Tiefe ist {{ highestDepth }},
          {{ DarkborneData.artName(editingCharacter.sireArt) }} steht auf {{ depthOf(editingCharacter.sireArt) }}.
        </small>
      </div>

      <div v-if="tensions.length > 0" class="card tension-warning">
        <h6>Spannung</h6>
        <small>
          Du hältst beide Künste eines Paares. Bei jedem Einsatz einer der beiden Künste kommen so viele Blutwürfel in
          den Pool, wie die Spannung beträgt. Eine 1 darauf löst eine Dissonanz-Folge aus.
        </small>
        <div class="line" v-for="tension in tensions" :key="tension.key">
          <span>{{ tension.name }}</span>
          <b>Spannung {{ tension.tension }}</b>
        </div>
      </div>

      <div class="arts">
        <div
          v-for="art in arts"
          :key="art.key"
          class="card art"
          :class="{ owned: depthOf(art.key) > 0, affinity: hasInheritance && art.key === editingCharacter.sireArt }"
        >
          <div class="head">
            <DbArtSymbol :art="art" class="symbol" />
            <div class="titles">
              <b>{{ art.shortName }}</b>
              <small><i>{{ art.name }}</i></small>
            </div>
            <div class="stepper">
              <button
                class="btn incdec"
                :disabled="depthOf(art.key) <= 0"
                :data-agent="'db:art:' + art.key + ':down'"
                @click="lower(art)"
              >
                -
              </button>
              <div class="value">{{ depthOf(art.key) }}</div>
              <button
                class="btn incdec"
                :disabled="!canRaise(art)"
                :data-agent="'db:art:' + art.key + ':up'"
                @click="raise(art)"
              >
                +
              </button>
            </div>
          </div>

          <small class="principle">{{ art.principle }}</small>
          <small class="summary">{{ art.summary }}</small>

          <div class="line">
            <span>Aktuelle Tiefe</span>
            <b>{{ depthOf(art.key) > 0 ? depthOf(art.key) + " - " + DarkborneData.depthName(depthOf(art.key)) : "nicht gelernt" }}</b>
          </div>
          <div class="line">
            <span>Gegenkunst</span>
            <b v-if="counterName(art)">{{ counterName(art) }}</b>
            <b v-else>keine, die Urkunst erzeugt Instabilität</b>
          </div>

          <div v-if="nextExamples(art).length > 0" class="block">
            <small class="block-title">
              Nächster Lernschritt: Tiefe {{ depthOf(art.key) + 1 }} - {{ DarkborneData.depthName(depthOf(art.key) + 1) }}
              <TipButton :title="art.shortName" :content="levelTable(art)" />
            </small>
            <small v-for="(example, index) in nextExamples(art)" :key="index">{{ example }}</small>
          </div>
          <small v-else-if="depthOf(art.key) >= maxDepth" class="hint">
            Höchste Tiefe deines Startalters erreicht.
          </small>

          <small v-if="tensionOf(art.key) > 0" class="warn">
            Spannung {{ tensionOf(art.key) }}: Du hältst auch {{ counterName(art) }}. Beide Künste bringen ab jetzt
            Blutwürfel in jeden Pool.
          </small>
          <small v-else-if="wouldCreateTension(art)" class="warn">
            Lernst du diese Kunst, entsteht Spannung mit {{ counterName(art) }}.
          </small>
        </div>
      </div>
    </div>
  </EditorForm>
</template>

<style scoped lang="scss">
.arts-view {
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

  .sire {
    width: min(60rem, 100%);
    align-items: center;
    text-align: center;
    border: 1px solid var(--primary-color);
    box-shadow: var(--shadow-hairline), var(--shadow-card);

    h5 {
      margin: 0;
      font-weight: bold;
    }

    .question {
      margin: 0;
      font-size: 1.25rem;
      font-family: Cinzel, serif;
      color: var(--primary-color);
    }

    .sire-select {
      width: min(30rem, 100%);
    }
  }

  .intro,
  .inheritance,
  .tension-warning {
    width: min(60rem, 100%);
  }

  .inheritance {
    &.active {
      border: 1px solid var(--primary-color);
    }

    h6 {
      margin: 0;
      font-weight: bold;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }

    .good {
      color: var(--primary-color);
    }
  }

  .tension-warning h6 {
    margin: 0;
    font-weight: bold;
    color: var(--primary-color);
  }

  .counters {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .counter {
    display: flex;
    flex-direction: column;

    span {
      font-size: 0.85rem;
      opacity: 0.8;
    }

    b {
      font-size: 1.1rem;
    }

    .done {
      color: var(--primary-color);
    }
  }

  .arts {
    display: flex;
    align-items: stretch;
    justify-content: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .art {
    width: 22rem;
    border: 1px solid rgba(255, 255, 255, 0.08);

    &.owned {
      border-color: rgba(255, 255, 255, 0.25);
    }

    &.affinity {
      border-color: var(--primary-color);
    }

    .head {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .symbol {
      width: 2.75rem;
      flex-shrink: 0;
      filter: var(--image-to-primary-color-filter);
    }

    .titles {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      min-width: 0;

      small {
        opacity: 0.8;
      }
    }

    .principle {
      font-style: italic;
      opacity: 0.9;
    }

    .summary {
      max-height: 7rem;
      overflow: auto;
      -webkit-overflow-scrolling: touch;
      opacity: 0.85;
    }
  }

  .stepper {
    display: flex;
    align-items: center;
    gap: 0.35rem;
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
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
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
