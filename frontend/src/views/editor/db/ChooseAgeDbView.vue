<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import EditorForm from "@/components/editor/EditorForm.vue"
import TipButton from "@/components/editor/TipButton.vue"
import WrappedSpinner from "@/components/spinners/WrappedSpinner.vue"
import { DarkborneData, type IDarkStartAge } from "@/libs/data/darkborne-data"
import { DB_MAX_ANCHORS } from "@/libs/data/darkborne-rules"
import { DbAnchorKind, DbAnchorState, type IDbAnchor, type IDbSheet } from "@/@types/deathborne"
import { useStore } from "@/app/store"

const store = useStore()
const editingCharacter = computed(() => store.editingCharacter as unknown as IDbSheet | undefined)

const ready = ref(false)
const selectedKey = ref("")

onMounted(async () => {
  try {
    await DarkborneData.load()
  } finally {
    ready.value = DarkborneData.isLoaded
  }

  const c = editingCharacter.value
  if (c && c.anchors.length > 0) {
    selectedKey.value = c.startAge
  }
})

const startAges = computed<IDarkStartAge[]>(() => (ready.value ? DarkborneData.content.startAges : []))
const selectedAge = computed(() => startAges.value.find((a) => a.key === selectedKey.value))

function defaultBloodAge(age: IDarkStartAge): number {
  const numbers = (age.bloodAge.match(/\d+/g) ?? []).map((n) => Number.parseInt(n, 10))
  const first = numbers[0] ?? 0
  const second = numbers[1]
  if (second !== undefined) {
    return Math.round((first + second) / 2)
  }
  if (age.bloodAge.includes("über")) {
    return first
  }
  return Math.max(1, Math.floor(first / 2))
}

function buildAnchors(age: IDarkStartAge): IDbAnchor[] {
  const anchors: IDbAnchor[] = []
  const total = Math.min(DB_MAX_ANCHORS, age.humanAnchors + age.nightAnchors)
  for (let slot = 0; slot < total; slot++) {
    anchors.push({
      slot,
      kind: slot < age.humanAnchors ? DbAnchorKind.Human : DbAnchorKind.Night,
      label: "",
      state: DbAnchorState.Firm,
      forced: false,
    })
  }
  return anchors
}

function selectAge(age: IDarkStartAge) {
  const c = editingCharacter.value
  if (!c) return

  selectedKey.value = age.key
  c.startAge = age.key
  c.bloodStrength = age.bloodStrength
  c.bloodAge = defaultBloodAge(age)
  c.alienation = age.alienation
  c.exp = age.bonusXp
  c.anchors = buildAnchors(age)
}

function traitReductionLabel(age: IDarkStartAge): string {
  return age.humanTraitReduction === 0 ? "keiner, alle auf 3" : `${age.humanTraitReduction} Stufen, keiner unter 1`
}

const passingPending = computed(() => editingCharacter.value?.bloodAge === 0)

const canGoNext = computed(() => {
  const c = editingCharacter.value
  if (!c || !ready.value || !selectedAge.value) return false
  if (!Number.isFinite(c.bloodAge) || c.bloodAge < 0) return false
  if (passingPending.value) return true
  return c.formerLife.trim().length > 0 && c.death.trim().length > 0
})
</script>

<template>
  <EditorForm :can-go-next="canGoNext" next-step="editor-db-lineage" :is-cancel="true">
    <WrappedSpinner v-if="!ready">Darkborne-Daten werden geladen</WrappedSpinner>

    <div v-else-if="editingCharacter" class="age-view">
      <div class="card intro">
        <small>
          Wähle, wie lange dein Vesper schon in der Nacht steht. Das Startalter legt Blutstärke, höchste Tiefe,
          Bonus-XP und die Verteilung deiner Anker fest.
        </small>
        <small class="price">
          Der Preis ist ehrlich: Ein höheres Startalter bringt mehr Macht, aber weniger Menschliches. Du verlierst
          menschliche Anker, Menschenzüge und startest politisch belastet.
        </small>
      </div>

      <div class="ages">
        <div
          v-for="age in startAges"
          :key="age.key"
          class="card age"
          :class="{ selected: selectedKey === age.key }"
          :data-agent="'db:age:' + age.key"
          :data-agent-label="age.name"
          @click="selectAge(age)"
        >
          <h6>{{ age.name }}</h6>
          <small class="blood-age">Blutalter: {{ age.bloodAge }}</small>

          <div class="block gain">
            <small class="block-title">Das bekommst du</small>
            <div class="line"><span>Blutstärke</span><b>{{ age.bloodStrength }}</b></div>
            <div class="line"><span>Höchste Tiefe</span><b>{{ age.maxDepth }}</b></div>
            <div class="line"><span>Lernschritte</span><b>{{ age.learnSteps }}</b></div>
            <div class="line"><span>Bonus-XP</span><b>{{ age.bonusXp }}</b></div>
          </div>

          <div class="block cost">
            <small class="block-title">Das kostet es</small>
            <div class="line"><span>Anker</span><b>{{ age.humanAnchors }} menschlich / {{ age.nightAnchors }} nächtlich</b></div>
            <div class="line"><span>Menschenzug-Abzug</span><b>{{ traitReductionLabel(age) }}</b></div>
            <div class="line"><span>Altlasten</span><b>{{ age.burdens }}</b></div>
            <div class="line"><span>Entfremdung</span><b>{{ age.alienation ? "ja, Schwierigkeit +1 in der Gegenwart" : "nein" }}</b></div>
          </div>

          <small class="desc">{{ age.description }}</small>
        </div>
      </div>

      <div v-if="selectedAge" class="card details">
        <div class="form-group">
          <label class="required">
            Blutalter in Jahren
            <TipButton
              title="Blutalter"
              content="Das Blutalter sind die Jahre seit dem Ersten Schlag. Es legt die Startkategorie fest und damit Budget, Anker und Menschenzüge. Der Wert ist vorbelegt, du darfst ihn innerhalb der Spanne deiner Kategorie frei wählen."
            />
          </label>
          <input
            class="form-control"
            type="number"
            min="0"
            v-model.number="editingCharacter.bloodAge"
            data-agent="db:input:blood-age"
          />
          <small class="hint">Spanne deiner Kategorie: {{ selectedAge.bloodAge }}</small>
          <small class="hint">
            Setz das Blutalter auf 0, wenn der Rote Übergang noch aussteht und erst im Spiel vollzogen wird.
          </small>
        </div>

        <div class="divider"></div>

        <small v-if="passingPending" class="hint pending">
          Blutalter 0: Der Rote Übergang steht noch aus. Dein Tod liegt also noch vor dir, und beide Felder bleiben
          optional. Du kannst sie nach Session 0 im Charakterbogen nachtragen.
        </small>

        <small class="hint">
          Aus diesen beiden Antworten entstehen deine Spezialisierungen und die ersten menschlichen Anker. Bleib konkret:
          ein Name, ein Ort, ein Satz.
        </small>

        <div class="form-group">
          <label :class="{ required: !passingPending }">
            Früheres Leben
            <TipButton
              title="Wer warst du?"
              content="Beruf, Familie, Heimat, Überzeugungen. Was hast du in deinem ersten Leben geliebt, und was davon existiert noch? Daraus wachsen später deine Spezialisierungen und deine menschlichen Anker."
            />
          </label>
          <textarea
            class="form-control"
            rows="3"
            :placeholder="passingPending ? 'Wer bist du, solange du noch lebst?' : 'Wer warst du als Mensch?'"
            v-model="editingCharacter.formerLife"
            data-agent="db:input:former-life"
          ></textarea>
        </div>

        <div class="form-group">
          <label :class="{ required: !passingPending }">
            Dein Tod
            <TipButton
              title="Wie bist du gestorben?"
              content="Jeder Vesper war ein Mensch und jeder Mensch stirbt, bevor der Erste Schlag kommt. Dein Tod prägt, was von dir geblieben ist, und liefert oft den ersten nächtlichen Anker."
            />
          </label>
          <textarea
            class="form-control"
            rows="3"
            :placeholder="passingPending ? 'Steht noch aus, im Spiel nachtragen' : 'Wie bist du gestorben?'"
            v-model="editingCharacter.death"
            data-agent="db:input:death"
          ></textarea>
        </div>
      </div>
    </div>
  </EditorForm>
</template>

<style scoped lang="scss">
.age-view {
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

    .price {
      opacity: 0.85;
    }
  }

  .ages {
    display: flex;
    align-items: stretch;
    justify-content: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .age {
    width: 20rem;
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

    h6 {
      margin: 0;
      font-weight: bold;
      text-align: center;
    }

    .blood-age {
      text-align: center;
      opacity: 0.8;
    }

    .desc {
      opacity: 0.9;
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
      letter-spacing: 0.02em;
    }

    &.cost .block-title {
      color: var(--primary-color);
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

      b {
        text-align: right;
      }
    }
  }

  .details {
    width: min(45rem, 100%);
    gap: 0.75rem;

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
  }

  .hint {
    opacity: 0.8;
  }

.hint.pending {
  color: var(--accent-contrast);
  background: color-mix(in srgb, var(--accent) 22%, transparent);
  border-left: 2px solid var(--accent);
  padding: 0.5rem 0.75rem;
  border-radius: 0.35rem;
  font-style: normal;
}

  .divider {
    width: 100%;
    height: 1px;
    background: rgba(255, 255, 255, 0.08);
    margin: 0.25rem 0;
  }
}
</style>
