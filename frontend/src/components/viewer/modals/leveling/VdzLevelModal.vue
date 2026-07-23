<script setup lang="ts">
import { computed, ref } from "vue"
import Modal from "@/components/modal/Modal.vue"
import Bullet from "@/components/Bullet.vue"
import CharacterStorage from "@/libs/io/character-storage"
import { LevelChangeType } from "@/@types/gameline"
import { getVdzAbilityName, getVdzAttributeName, type IVdzSheet, type VdzAbility, type VdzAttribute, VdzVirtue } from "@/@types/vdz"
import { useStore } from "@/app/store"

type LevelType = "attribute" | "ability" | "discipline" | "virtue" | "road" | "willpower" | "background" | ""
type Subject = VdzAbility | VdzAttribute | VdzVirtue | string | undefined

const store = useStore()
const editingCharacter = computed(() => store.editingCharacter as IVdzSheet | undefined)

const show = ref(false)
const modalKey = ref("")
const type = ref<LevelType>("attribute")
const subject = ref<Subject>(undefined)

function showModal(t: LevelType, s?: Subject) {
  modalKey.value = `${Date.now()}-${Math.random()}`
  type.value = t
  subject.value = s
  show.value = true
}

const isClanDiscipline = computed(() => {
  const c = editingCharacter.value
  if (!c || type.value !== "discipline") return false
  return (c.clan?.disciplines ?? []).includes(subject.value as string)
})

const currentValue = computed<number>(() => {
  const c = editingCharacter.value
  if (!c) return 0
  switch (type.value) {
    case "attribute":
      return c.attributes[subject.value as VdzAttribute] ?? 0
    case "ability":
      return c.abilities[subject.value as VdzAbility] ?? 0
    case "discipline":
      return c.disciplines.find(d => d.name === subject.value)?.level ?? 0
    case "virtue":
      return c.virtues[subject.value as VdzVirtue] ?? 0
    case "road":
      return c.roadRating ?? 0
    case "willpower":
      return c.willpower ?? 0
    case "background":
      return c.backgrounds.find(b => b.name === subject.value)?.level ?? 0
    default:
      return 0
  }
})

function setValue(v: number) {
  const c = editingCharacter.value
  if (!c) return
  switch (type.value) {
    case "attribute":
      c.attributes[subject.value as VdzAttribute] = v
      break
    case "ability":
      c.abilities[subject.value as VdzAbility] = v
      break
    case "discipline": {
      const d = c.disciplines.find(x => x.name === subject.value)
      if (d) d.level = v
      else c.disciplines.push({ name: subject.value as string, level: v })
      break
    }
    case "virtue":
      c.virtues[subject.value as VdzVirtue] = v
      break
    case "road":
      c.roadRating = v
      break
    case "willpower":
      c.willpower = v
      break
    case "background": {
      const b = c.backgrounds.find(x => x.name === subject.value)
      if (b) b.level = v
      else c.backgrounds.push({ name: subject.value as string, level: v })
      break
    }
  }
}

const oldValue = computed(() => currentValue.value)
const newValue = computed(() => oldValue.value + 1)

const freebieCost = computed(() => {
  switch (type.value) {
    case "attribute":
      return 5
    case "ability":
      return 2
    case "discipline":
      return 7
    case "virtue":
      return 2
    case "road":
      return 2
    case "willpower":
      return 1
    case "background":
      return 1
    default:
      return 0
  }
})

// Erfahrungskosten nach V20 Dark Ages (neue Fähigkeit/Disziplin = Pauschale, sonst
// neuer Wert × Multiplikator; Willenskraft = aktueller Wert).
const xpCost = computed(() => {
  const n = newValue.value
  switch (type.value) {
    case "attribute":
      return n * 4
    case "ability":
      return oldValue.value === 0 ? 3 : n * 2
    case "discipline":
      if (oldValue.value === 0) return 10
      return isClanDiscipline.value ? n * 5 : n * 7
    case "virtue":
      return n * 2
    case "road":
      return n * 2
    case "willpower":
      return Math.max(1, oldValue.value)
    case "background":
      return Infinity // Hintergründe nur über Freie Punkte (bzw. Spielleiter)
    default:
      return Infinity
  }
})

const canPayWithFP = computed(() => {
  const c = editingCharacter.value
  if (!c) return false
  return (c.freebiePoints ?? 0) >= freebieCost.value
})

const spendType = computed<"FP" | "XP">(() => (canPayWithFP.value ? "FP" : "XP"))

const maxReached = computed(() => {
  const max = type.value === "road" || type.value === "willpower" ? 10 : 5
  return newValue.value > max
})

const hasRequirement = computed(() => {
  const c = editingCharacter.value
  if (!c || type.value === "" || maxReached.value) return false
  if (spendType.value === "FP") return canPayWithFP.value
  return xpCost.value !== Infinity && (c.exp ?? 0) >= xpCost.value
})

const costs = computed(() => (spendType.value === "FP" ? freebieCost.value : xpCost.value))

const subjectLabel = computed(() => {
  const c = editingCharacter.value
  switch (type.value) {
    case "attribute":
      return getVdzAttributeName(subject.value as VdzAttribute)
    case "ability":
      return getVdzAbilityName(subject.value as VdzAbility)
    case "discipline":
    case "background":
      return subject.value as string
    case "virtue": {
      const road = c?.road
      if (subject.value === VdzVirtue.ConscienceOrConviction) return road?.virtues.conscienceOrConviction ?? "Gewissen/Überzeugung"
      if (subject.value === VdzVirtue.SelfControlOrInstinct) return road?.virtues.selfControlOrInstinct ?? "Selbstbeherrschung/Instinkt"
      return "Mut"
    }
    case "road":
      return c?.road?.name ?? "Weg"
    case "willpower":
      return "Willenskraft"
    default:
      return ""
  }
})

const levelChangeType = computed<LevelChangeType>(() => {
  switch (type.value) {
    case "attribute":
      return LevelChangeType.VDZ_Attribute
    case "ability":
      return LevelChangeType.VDZ_Ability
    case "discipline":
      return LevelChangeType.VDZ_Discipline
    case "virtue":
      return LevelChangeType.VDZ_Virtue
    case "road":
      return LevelChangeType.VDZ_Road
    case "willpower":
      return LevelChangeType.VDZ_Willpower
    case "background":
      return LevelChangeType.VDZ_Background
    default:
      return LevelChangeType.Unknown
  }
})

function levelUp() {
  const c = editingCharacter.value
  if (!c || !hasRequirement.value) return

  if (spendType.value === "FP") {
    c.freebiePoints = Math.max(0, (c.freebiePoints ?? 0) - freebieCost.value)
  } else {
    CharacterStorage.trackLevelChange(
      c as any,
      levelChangeType.value,
      xpCost.value,
      `${subjectLabel.value}: ${oldValue.value} → ${newValue.value}`,
    )
  }

  setValue(newValue.value)
  CharacterStorage.saveCharacter(c as any)

  show.value = false
  type.value = ""
}

defineExpose({ showModal })
</script>

<template>
  <Modal :shown="show" @close="show = false; type = ''">
    <div v-if="show" class="mini-modal" :key="modalKey + '-m'">
      <div class="centerline" :key="modalKey + '-i'">
        <b>{{ subjectLabel }}</b>: {{ oldValue }} &#8594; {{ newValue }}
        <bullet />
        Kosten: {{ costs === Infinity ? "—" : costs }} {{ spendType }}
      </div>

      <div v-if="type === 'background' && !canPayWithFP" class="alert alert-warning warn" :key="modalKey + '-a'">
        Hintergründe können nur mit Freien Punkten gesteigert werden.
      </div>

      <div class="actions">
        <button class="btn btn-primary" :disabled="!hasRequirement" @click="levelUp" :key="modalKey + '-b'">
          Abschließen
        </button>
      </div>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.mini-modal {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.centerline {
  width: 100%;
  text-align: center;
}

.warn {
  text-align: center;
}

.actions {
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
