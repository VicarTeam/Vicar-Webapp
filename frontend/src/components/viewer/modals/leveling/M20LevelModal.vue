<script setup lang="ts">
import { computed, ref } from "vue"
import Modal from "@/components/modal/Modal.vue"
import Bullet from "@/components/Bullet.vue"
import CharacterStorage from "@/libs/io/character-storage"
import { LevelChangeType } from "@/@types/gameline"
import type { IM20Tradition, IMageSheet, M20Ability, M20Attribute, M20Sphere } from "@/@types/m20"
import { useStore } from "@/app/store"

type LevelType = "attribute" | "ability" | "sphere" | "arete" | "willpower" | ""
type Subject = M20Ability | M20Attribute | M20Sphere | undefined

const store = useStore()
const editingCharacter = computed(() => store.editingCharacter as IMageSheet | undefined)

const show = ref(false)
const modalKey = ref("")
const type = ref<LevelType>("attribute")
const subject = ref<Subject>(undefined)

function showModal(t: LevelType, s?: M20Ability | M20Attribute | M20Sphere) {
  modalKey.value = `${Date.now()}-${Math.random()}`
  type.value = t
  subject.value = s
  show.value = true
}

const tradition = computed<IM20Tradition | undefined>(() => editingCharacter.value?.tradition as any)
const affinitySpheres = computed<M20Sphere[]>(() => tradition.value?.affinitySpheres ?? [])
function isAffinitySphere(s: M20Sphere) {
  return affinitySpheres.value.includes(s)
}

const currentValue = computed<number>(() => {
  const c = editingCharacter.value
  if (!c) return 0
  switch (type.value) {
    case "attribute":
      return c.attributes[subject.value as M20Attribute] ?? 0
    case "ability":
      return c.abilities[subject.value as M20Ability] ?? 0
    case "sphere":
      return (c.spheres as any)[subject.value as M20Sphere] ?? 0
    case "arete":
      return c.arete ?? 0
    case "willpower":
      return c.willpower ?? 0
    default:
      return 0
  }
})

function setValue(v: number) {
  const c = editingCharacter.value
  if (!c) return
  switch (type.value) {
    case "attribute":
      c.attributes[subject.value as M20Attribute] = v
      break
    case "ability":
      c.abilities[subject.value as M20Ability] = v
      break
    case "sphere":
      ;(c.spheres as any)[subject.value as M20Sphere] = v
      break
    case "arete":
      c.arete = v
      break
    case "willpower":
      c.willpower = v
      break
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
    case "sphere":
      return 7
    case "arete":
      return 4
    case "willpower":
      return 1
    default:
      return 0
  }
})

const xpCost = computed(() => {
  const c = editingCharacter.value
  if (!c) return Infinity
  const n = newValue.value
  switch (type.value) {
    case "attribute":
      return n * 4
    case "ability":
      return 3
    case "sphere": {
      const s = subject.value as M20Sphere
      if (oldValue.value === 0) return 10
      return isAffinitySphere(s) ? n * 7 : n * 8
    }
    case "arete":
      return n * 8
    case "willpower":
      return n
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

const sphereAreteLimitViolated = computed(() => {
  const c = editingCharacter.value
  if (!c) return false
  if (type.value !== "sphere") return false
  const arete = c.arete ?? 1
  return newValue.value > arete
})

const hasRequirement = computed(() => {
  const c = editingCharacter.value
  if (!c || type.value === "") return false
  if (sphereAreteLimitViolated.value) return false

  if (spendType.value === "FP") return canPayWithFP.value
  return (c.exp ?? 0) >= xpCost.value
})

const costs = computed(() => (spendType.value === "FP" ? freebieCost.value : xpCost.value))

function levelChangeLabel(): string {
  switch (type.value) {
    case "attribute":
      return "Attribut"
    case "ability":
      return "Fähigkeit"
    case "sphere":
      return "Sphäre"
    case "arete":
      return "Arete"
    case "willpower":
      return "Willenskraft"
    default:
      return ""
  }
}

const levelChangeType = computed<LevelChangeType>(() => {
  switch (type.value) {
    case "attribute":
      return LevelChangeType.M20_Attribute
    case "ability":
      return LevelChangeType.M20_Ability
    case "sphere":
      return LevelChangeType.M20_Sphere
    case "arete":
      return LevelChangeType.M20_Arete
    case "willpower":
      return LevelChangeType.M20_Willpower
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
      `${levelChangeLabel()}: ${oldValue.value} → ${newValue.value}`,
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
        {{ oldValue }} &#8594; {{ newValue }}
        <bullet />
        Kosten: {{ costs }} {{ spendType }}
      </div>

      <div v-if="sphereAreteLimitViolated" class="alert alert-warning warn" :key="modalKey + '-a'">
        Sphären dürfen Arete nicht übersteigen.
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
