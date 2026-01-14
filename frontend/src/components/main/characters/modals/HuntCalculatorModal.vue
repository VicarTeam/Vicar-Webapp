<script setup lang="ts">
import { computed, ref } from "vue"
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

const showModal = (c: ICharacter) => {
  character.value = c
  showDetails.value = false
  reduceTo.value = 0

  if (c.cache) reduceTo.value = (c.cache["huntCalculatorReduceTo"] as any) || 0
  if (reduceTo.value > c.hunger) reduceTo.value = c.hunger

  show.value = true
}

const reduceToOptions = computed<IOption[]>(() => {
  const c = character.value
  if (!c) return []
  const options: IOption[] = []
  for (let i = 0; i < c.hunger; i++) {
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
  const v = c.hunger - to
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

  if (reduceTo.value > 0) c.cache["huntCalculatorReduceTo"] = reduceTo.value
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
        <span>Aktueller Hunger: <b>{{ character.hunger }}</b></span>

        <select v-if="character.hunger > 0" v-model.number="reduceTo" class="form-control">
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

      <div v-if="character.hunger > 0" class="hcm__tableWrap">
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
  width: min(46rem, 92vw);
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
