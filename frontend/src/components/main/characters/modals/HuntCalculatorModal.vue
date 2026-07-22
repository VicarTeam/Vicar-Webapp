<script setup lang="ts">
import { computed, ref, watch } from "vue"
import Modal from "@/components/modal/Modal.vue"
import TipButton from "@/components/editor/TipButton.vue"
import type { ICharacter } from "@/@types/models"
import type { IOption } from "@/components/Dropdown.vue"

interface IDrinkOptionBase {
  id: number
  nameKey: string
  hintKey?: string
  max: number
  time: (v: number) => string
}

interface IDrinkOptionOut {
  id: number
  name: string
  name_hint?: string
  max: number
  time: string
  needed: number
}

const show = ref(false)
const character = ref<ICharacter | null>(null)
const reduceTo = ref(0)
const showDetails = ref(false)
const simulatedHunger = ref<number | null>(null)

const effectiveHunger = computed(() => {
  const c = character.value
  if (!c) return 0
  return simulatedHunger.value ?? c.hunger
})

const showModal = (c: ICharacter) => {
  character.value = c
  showDetails.value = false
  reduceTo.value = 0
  simulatedHunger.value = null

  if (c.cache) reduceTo.value = (c.cache["huntCalculatorReduceTo"] as any) || 0
  if (reduceTo.value > c.hunger) reduceTo.value = c.hunger

  show.value = true
}

watch(simulatedHunger, () => {
  if (reduceTo.value >= effectiveHunger.value) reduceTo.value = 0
})

const reduceToOptions = computed<IOption[]>(() => {
  const c = character.value
  if (!c) return []
  const options: IOption[] = []
  for (let i = 0; i < effectiveHunger.value; i++) {
    options.push({ value: i, name: `Auf \"${i}\" reduzieren`})
  }
  return options
})

const baseOptions = (): IDrinkOptionBase[] => [
  {
    id: 0,
    max: 1,
    nameKey: "Blutkonserven/Leichen(-teile)",
    time: () => "Eine Runde",
  },
  {
    id: 1,
    max: 1,
    nameKey: "Mehrere kleine Tiere (z.B. 3-4 Katzen; tödlich)",
    time: () => "Eine Szene",
  },
  {
    id: 2,
    max: 1,
    nameKey: "Mittlere Tiere (z.B. Hunde; tödlich)",
    time: () => "Eine Runde",
  },
  {
    id: 3,
    max: 1,
    nameKey: "Große Tiere (z.B. Pferde; tödlich)",
    time: () => "Eine Szene",
  },
  {
    id: 4,
    max: 2,
    nameKey: "Menschen",
    hintKey: "1-2 Schlücke (nicht schädlich)",
    time: v => (v === 1 ? `3 Runden` : "Eine Szene"),
  },
  {
    id: 5,
    max: 4,
    nameKey: "Menschen",
    hintKey: "Schädliches Trinken (1 schwerer Schaden pro Hunger; Mensch würfelt Körperkraft + Widerstandsfähigkeit gegen gestilltem Hunger um zu überleben)",
    time: v => `${v} Runden`,
  },
  {
    id: 6,
    max: 5,
    nameKey: "Menschen",
    hintKey: "Tödliches Trinken (leer getrunken)",
    time: () => `5 Runden`,
  },
]

const drinkOptions = computed<IDrinkOptionOut[]>(() => {
  const c = character.value
  if (!c) return []

  const to = reduceTo.value
  const v = effectiveHunger.value - to
  const bp = c.bloodPotency

  const out: IDrinkOptionOut[] = []

  for (const base of baseOptions()) {
    let max = base.max

    if (base.id <= 3) {
      if (bp === 2) max = max / 2
      else if (bp > 2) continue
    }

    if (base.id > 3) {
      if (bp >= 4 && bp <= 5) max = max - 1
      if (bp >= 6 && bp <= 9) max = max - 2
      if (bp >= 10) max = max - 3

      if (to < 2 && bp >= 5 && bp <= 7 && base.id !== 6) continue
      if (to < 3 && bp >= 8 && bp <= 10 && base.id !== 6) continue
    }

    if (max <= 0) continue

    out.push({
      id: base.id,
      name: base.nameKey,
      name_hint: base.hintKey,
      max,
      time: base.time(v),
      needed: Math.ceil(v / max),
    })
  }

  return out
})

const drinkDetails = computed<string[]>(() => {
  const c = character.value
  if (!c) return []

  const to = reduceTo.value
  const bp = c.bloodPotency
  const set = new Set<string>()

  const add = (id: string) => set.add(id)

  for (const base of baseOptions()) {
    let max = base.max

    if (base.id <= 3) {
      if (bp === 2) {
        max = max / 2
        add("2")
      } else if (bp > 2) {
        add("1")
        continue
      }
    }

    if (base.id > 3) {
      if (bp >= 4 && bp <= 5) {
        max = max - 1
        add("3")
      }
      if (bp >= 6 && bp <= 9) {
        max = max - 2
        add("4")
      }
      if (bp >= 10) {
        max = max - 3
        add("5")
      }

      if (to < 2 && bp >= 5 && bp <= 7 && base.id !== 6) {
        add("6")
        continue
      }
      if (to < 3 && bp >= 8 && bp <= 10 && base.id !== 6) {
        add("7")
      }
    }

    if (max <= 0) continue
  }

  return Array.from(set)
})

interface IVampireFeedingRow {
  id: number
  donor: string
  rate: string
  needed: number
}

const vampireFeedingRows = computed<IVampireFeedingRow[]>(() => {
  const c = character.value
  if (!c) return []

  const bp = c.bloodPotency
  const v = effectiveHunger.value - reduceTo.value
  const rows: IVampireFeedingRow[] = []

  if (bp + 2 <= 10) {
    rows.push({
      id: 0,
      donor: `Blutmacht ${bp + 2} oder höher`,
      rate: "2 gestillte Hunger pro 1 zugefügtem Hunger",
      needed: Math.ceil(v / 2),
    })
  }

  rows.push({
    id: 1,
    donor: `Blutmacht ${Math.max(0, bp - 1)} bis ${Math.min(10, bp + 1)}`,
    rate: "1 gestillter Hunger pro 1 zugefügtem Hunger",
    needed: v,
  })

  if (bp >= 3) {
    rows.push({
      id: 2,
      donor: `Blutmacht ${bp - 2} oder niedriger`,
      rate: "1 gestillter Hunger pro 2 zugefügten Hunger",
      needed: v * 2,
    })
  }

  return rows
})

const restrictionText = computed(() => {
  const c = character.value
  if (!c) return ""
  return c.bloodPotency < 3 ? "Keine" : "Lebendige Menschen"
})

const handleClose = () => {
  const c = character.value
  if (!c) {
    show.value = false
    return
  }

  show.value = false
  c.cache = c.cache || {}

  if (reduceTo.value > 0 && reduceTo.value <= c.hunger) c.cache["huntCalculatorReduceTo"] = reduceTo.value
  else delete c.cache["huntCalculatorReduceTo"]
}

const getDetails = (val: string) => {
  switch (val) {
    case "1":
      return "Keine Tiere und Konserven über Blutmacht 2 (3+)"
    case "2":
      return "Tiere und Konserven sind halbiert bei Blutmacht 2"
    case "3":
      return "Zwischen Blutmacht 4 und 5, geben Menschen 1 Hunger weniger"
    case "4":
      return "Zwischen Blutmacht 5 und 9, geben Menschen 2 Hunger weniger"
    case "5":
      return "Bei Blutmacht 10, geben Menschen 3 Hunger weniger"
    case "6":
      return "Zwischen Blutmacht 5 und 7, müssen Menschen ausgetrunken werden, um Hunger unter 2 zu senken"
    case "7":
      return "Zwischen Blutmacht 8 und 10, müssen Menschen ausgetrunken werden, um Hunger unter 3 zu senken"
    default:
      return ""
  }
};

defineExpose({ showModal })
</script>

<template>
  <Modal :shown="show" @close="handleClose" v-if="character">
    <div class="hcm">
      <b class="hcm__title">{{ `Jagd für "${character.name}" berechnen` }}:</b>

      <div class="hcm__top">
        <span>
          Aktueller Hunger: <b>{{ character.hunger }}</b>
          <template v-if="simulatedHunger !== null"> (simuliert: <b>{{ simulatedHunger }}</b>)</template>
        </span>

        <select v-if="character.hunger === 0" v-model="simulatedHunger" class="form-control">
          <option :value="null">Keinen Hunger simulieren</option>
          <option v-for="i in 5" :key="i" :value="i">Hunger {{ i }} simulieren</option>
        </select>

        <span v-if="simulatedHunger !== null" class="hcm__simHint">
          Rein fiktive Ansicht — der echte Hunger bleibt unverändert.
        </span>

        <select v-if="effectiveHunger > 0" v-model.number="reduceTo" class="form-control">
          <option v-for="option in reduceToOptions" :key="option.value" :value="option.value">
            {{ option.name }}
          </option>
        </select>
      </div>

      <div class="hcm__divider"></div>

      <span class="hcm__restriction">
        Einschränkung:
        <b>{{ restrictionText }}</b>
        <TipButton
          v-if="character.bloodPotency >= 3"
          content="Das Jagdverhalten ist eine Präferenz, keine Einschränkung!"
          class="hcm__tip"
        />
      </span>

      <div class="hcm__divider"></div>

      <div v-if="effectiveHunger > 0" class="hcm__tableWrap">
        <table class="table">
          <thead>
          <tr>
            <th>Quelle</th>
            <th>Dauer</th>
            <th>Max. Menge</th>
            <th>Benötigte Anzahl</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="o in drinkOptions" :key="o.id + ':' + o.max">
            <td>
              {{ o.name }}
              <span v-if="o.name_hint">({{ o.name_hint }})</span>
            </td>
            <td>{{ o.time }}</td>
            <td>{{ o.max }}</td>
            <td>{{ o.needed }}</td>
          </tr>
          </tbody>
        </table>
      </div>

      <div class="hcm__divider"></div>

      <b class="hcm__sectionTitle">
        Von Vampiren trinken
        <TipButton
          content="Entscheidend ist die Blutmacht des Spenders im Vergleich zur eigenen. Zugefügter Hunger meint den Hunger, den der Spender durch das Trinken erleidet."
          class="hcm__tip"
        />
      </b>

      <div class="hcm__tableWrap">
        <table class="table">
          <thead>
          <tr>
            <th>Spender</th>
            <th>Verhältnis</th>
            <th v-if="effectiveHunger > 0">Zugefügter Hunger</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="row in vampireFeedingRows" :key="row.id">
            <td>{{ row.donor }}</td>
            <td>{{ row.rate }}</td>
            <td v-if="effectiveHunger > 0">{{ row.needed }}</td>
          </tr>
          </tbody>
        </table>
      </div>

      <div class="hcm__divider"></div>

      <button class="btn hcm__detailsBtn" @click="showDetails = !showDetails">
        <i class="fas fa-chevron-down" :class="showDetails ? 'fa-rotate-180' : ''" />
        Details
      </button>

      <ul v-if="showDetails" class="hcm__details">
        <li v-for="detail in drinkDetails" :key="detail">
          {{ getDetails(detail) }}
        </li>
      </ul>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.hcm {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.hcm__title {
  text-align: center;
  font-family: var(--font-display, Cinzel), serif;
  letter-spacing: 0.04em;
}

.hcm__top {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;

  select {
    width: 100%;
  }
}

.hcm__divider {
  width: 100%;
  height: 1px;
  background: rgba(255, 255, 255, 0.12);
  margin: 0.5rem 0;
}

.hcm__restriction {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
  text-align: center;
  flex-wrap: wrap;
}

.hcm__tip {
  margin-left: 0.25rem;
}

.hcm__simHint {
  font-size: 0.85em;
  font-style: italic;
  opacity: 0.75;
  text-align: center;
}

.hcm__sectionTitle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-align: center;
}

.hcm__tableWrap {
  width: 100%;
  overflow: auto;
  -webkit-overflow-scrolling: touch;

  table {
    min-width: 36rem;
  }

  @media (max-width: 520px) {
    table {
      min-width: 32rem;
    }
  }
}

.hcm__detailsBtn {
  align-self: center;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.hcm__details {
  margin: 0;
  padding-left: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
