<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import Modal from "@/components/modal/Modal.vue"
import Bullet from "@/components/Bullet.vue"
import CharacterStorage from "@/libs/io/character-storage"
import { LevelChangeType } from "@/@types/gameline"
import { useStore } from "@/app/store"
import { DarkborneData, type IDarkArtForm } from "@/libs/data/darkborne-data"
import {
  DB_ESTABLISHED_FORM_MAX_LEVEL,
  DB_MAX_DEPTH,
  dbAlienationCost,
  dbArtCost,
  dbArtDepth,
  dbAttributeCost,
  dbBackgroundCost,
  dbBloodStrengthCost,
  dbEstablishedFormCost,
  dbHealth,
  dbMaxDepth,
  dbOwnFormCost,
  dbSkillCost,
  dbSpecializationCost,
  dbWilleCost,
} from "@/libs/data/darkborne-rules"
import { DbAttribute, DbFormKind, type IDbSheet } from "@/@types/deathborne"

type DbLevelType =
  | "attribute"
  | "skill"
  | "specialization"
  | "background"
  | "wille"
  | "art"
  | "new-art"
  | "established-form"
  | "own-form"
  | "blood-strength"
  | "alienation"
  | ""

const ART_SOURCES: { key: string, name: string, requirement: string, price: string, factor: number }[] = [
  {
    key: "unterweisung",
    name: "Unterweisung",
    requirement: "ein Lehrer mit mindestens Tiefe 2, eine Woche Übung",
    price: "ein Gefallen beim Lehrer",
    factor: 1,
  },
  {
    key: "blutlehre",
    name: "Blutlehre",
    requirement: "das Cruor des Lehrers trinken",
    price: "Blutbindung +1",
    factor: 1,
  },
  {
    key: "durchbruch",
    name: "Durchbruch",
    requirement: "ein dramatisches Ereignis, in dem die Kunst aus Not erwacht",
    price: "doppelte XP und eine Instabilität",
    factor: 2,
  },
]

const BLOOD_STRENGTH_CONDITIONS: string[] = [
  "Ein Ereignis, das das Blut verändert: ein Ritual, mächtiges Cruor, extreme Nutzung einer Kunst",
  "Ein menschlicher Anker wird erschüttert, nach Wahl des Spielers",
  "Die neue Stufe bringt sofort ihren Preis mit",
]

const store = useStore()
const sheet = computed(() => store.editingCharacter as unknown as IDbSheet | undefined)

const ready = ref(DarkborneData.isLoaded)
const show = ref(false)
const modalKey = ref("")
const type = ref<DbLevelType>("")
const subject = ref<string>("")

const selectedArt = ref("")
const selectedSource = ref("unterweisung")
const selectedForm = ref("")
const selectedBackground = ref("")
const selectedSkill = ref("")
const specializationName = ref("")
const formName = ref("")
const formLevel = ref(1)
const formEffect = ref("")
const formLimits = ref("")
const formImprovised = ref(false)
const conditionsConfirmed = ref(false)

onMounted(async () => {
  if (!DarkborneData.isLoaded) {
    await DarkborneData.load()
  }
  ready.value = true
})

function showModal(t: DbLevelType, s?: string) {
  modalKey.value = `${Date.now()}-${Math.random()}`
  type.value = t
  subject.value = s ?? ""
  selectedArt.value = t === "art" ? (s ?? "") : ""
  selectedSource.value = "unterweisung"
  selectedForm.value = ""
  selectedBackground.value = ""
  selectedSkill.value = ""
  specializationName.value = ""
  formName.value = ""
  formLevel.value = 1
  formEffect.value = ""
  formLimits.value = ""
  formImprovised.value = false
  conditionsConfirmed.value = false
  show.value = true
}

function close() {
  show.value = false
  type.value = ""
}

function onArtChange() {
  selectedForm.value = ""
  formLevel.value = 1
}

function attributeName(key: string): string {
  if (!ready.value) return key
  return DarkborneData.content.attributes.find(a => a.key === key)?.name ?? key
}

function skillName(key: string): string {
  if (!ready.value) return key
  return DarkborneData.content.skills.find(s => s.key === key)?.name ?? key
}

const skills = computed(() => (ready.value ? DarkborneData.content.skills : []))
const backgrounds = computed(() => (ready.value ? DarkborneData.content.backgrounds : []))

const ownedArts = computed(() => {
  const c = sheet.value
  if (!c || !ready.value) return []
  return c.arts.map(owned => ({
    key: owned.key,
    depth: owned.depth,
    name: DarkborneData.artName(owned.key),
  }))
})

const learnableArts = computed(() => {
  const c = sheet.value
  if (!c || !ready.value) return []
  return DarkborneData.content.arts.filter(art => !c.arts.some(owned => owned.key === art.key))
})

const artDepthCap = computed(() => {
  const c = sheet.value
  if (!c) return 0
  return Math.min(dbMaxDepth(c.bloodStrength), DB_MAX_DEPTH)
})

const availableForms = computed<IDarkArtForm[]>(() => {
  const c = sheet.value
  if (!c || !ready.value || !selectedArt.value) return []
  const depth = Math.min(dbArtDepth(c, selectedArt.value), DB_ESTABLISHED_FORM_MAX_LEVEL)
  return DarkborneData.formsOf(selectedArt.value, depth).filter(form => !c.forms.some(f => f.key === form.key))
})

const ownFormLevels = computed(() => {
  const c = sheet.value
  if (!c || !selectedArt.value) return []
  const depth = dbArtDepth(c, selectedArt.value)
  const levels: number[] = []
  for (let i = 1; i <= depth; i++) {
    levels.push(i)
  }
  return levels
})

const activeBackground = computed(() => subject.value || selectedBackground.value)

const affinity = computed(() => {
  const c = sheet.value
  if (!c || !selectedArt.value) return false
  const owned = c.arts.find(a => a.key === selectedArt.value)
  if (owned) return owned.affinity
  return c.affinityArt === selectedArt.value
})

const currentValue = computed(() => {
  const c = sheet.value
  if (!c) return 0
  switch (type.value) {
    case "attribute":
      return c.attributes[subject.value] ?? 0
    case "skill":
      return c.skills[subject.value] ?? 0
    case "background":
      return c.backgrounds.find(b => b.key === activeBackground.value)?.level ?? 0
    case "wille":
      return c.wille
    case "art":
      return dbArtDepth(c, selectedArt.value)
    case "blood-strength":
      return c.bloodStrength
    default:
      return 0
  }
})

const newValue = computed(() => currentValue.value + 1)

const sourceFactor = computed(() => ART_SOURCES.find(s => s.key === selectedSource.value)?.factor ?? 1)

const newArtBaseCost = computed(() => dbArtCost(1, affinity.value))

const costs = computed(() => {
  const c = sheet.value
  if (!c) return Infinity
  switch (type.value) {
    case "attribute":
      return dbAttributeCost(newValue.value)
    case "skill":
      return dbSkillCost(newValue.value)
    case "specialization":
      return dbSpecializationCost()
    case "background":
      return dbBackgroundCost(newValue.value)
    case "wille":
      return dbWilleCost(newValue.value)
    case "art":
      return dbArtCost(newValue.value, affinity.value)
    case "new-art":
      return newArtBaseCost.value * sourceFactor.value
    case "established-form":
      return dbEstablishedFormCost()
    case "own-form":
      return formImprovised.value
        ? Math.ceil(dbOwnFormCost(formLevel.value) / 2)
        : dbOwnFormCost(formLevel.value)
    case "blood-strength":
      return dbBloodStrengthCost(newValue.value, c.glied)
    case "alienation":
      return dbAlienationCost()
    default:
      return Infinity
  }
})

const maxReached = computed(() => {
  switch (type.value) {
    case "attribute":
    case "skill":
    case "wille":
      return newValue.value > 5
    case "background":
      return newValue.value > 3
    case "art":
      return newValue.value > artDepthCap.value
    case "blood-strength":
      return newValue.value > 10
    default:
      return false
  }
})

const selectionValid = computed(() => {
  const c = sheet.value
  if (!c) return false
  switch (type.value) {
    case "attribute":
    case "skill":
      return subject.value !== ""
    case "specialization":
      return selectedSkill.value !== "" && specializationName.value.trim() !== ""
    case "background":
      return activeBackground.value !== ""
    case "art":
      return selectedArt.value !== ""
    case "new-art":
      return selectedArt.value !== ""
    case "established-form":
      return selectedArt.value !== "" && selectedForm.value !== ""
    case "own-form":
      return selectedArt.value !== "" && formName.value.trim() !== "" && ownFormLevels.value.includes(formLevel.value)
    case "blood-strength":
      return conditionsConfirmed.value
    case "alienation":
      return c.alienation
    case "wille":
      return true
    default:
      return false
  }
})

const hasRequirement = computed(() => {
  const c = sheet.value
  if (!c || type.value === "" || maxReached.value || !selectionValid.value) return false
  return costs.value !== Infinity && c.exp >= costs.value
})

const subjectLabel = computed(() => {
  switch (type.value) {
    case "attribute":
      return attributeName(subject.value)
    case "skill":
      return skillName(subject.value)
    case "specialization":
      return "Spezialisierung"
    case "background":
      return backgrounds.value.find(b => b.key === activeBackground.value)?.name ?? "Hintergrund"
    case "wille":
      return "Wille"
    case "art":
      return DarkborneData.isLoaded && selectedArt.value ? DarkborneData.artName(selectedArt.value) : "Blutkunst"
    case "new-art":
      return "Neue Blutkunst"
    case "established-form":
      return "Gefestigte Form"
    case "own-form":
      return "Eigene Form"
    case "blood-strength":
      return "Blutstärke"
    case "alienation":
      return "Entfremdung ablegen"
    default:
      return ""
  }
})

const showsSteps = computed(() =>
  type.value === "attribute" ||
  type.value === "skill" ||
  type.value === "background" ||
  type.value === "wille" ||
  type.value === "art" ||
  type.value === "blood-strength",
)

const levelChangeType = computed<LevelChangeType>(() => {
  switch (type.value) {
    case "attribute":
      return LevelChangeType.DB_Attribute
    case "skill":
      return LevelChangeType.DB_Skill
    case "specialization":
      return LevelChangeType.DB_Specialization
    case "background":
      return LevelChangeType.DB_Background
    case "wille":
      return LevelChangeType.DB_Wille
    case "art":
    case "new-art":
      return LevelChangeType.DB_Art
    case "established-form":
    case "own-form":
      return LevelChangeType.DB_Form
    case "blood-strength":
      return LevelChangeType.DB_BloodStrength
    case "alienation":
      return LevelChangeType.DB_Alienation
    default:
      return LevelChangeType.Unknown
  }
})

function formKeyFor(name: string): string {
  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "")
  return `own_${slug || "form"}_${Date.now().toString(36)}`
}

function changeText(): string {
  const c = sheet.value
  if (!c) return ""
  switch (type.value) {
    case "specialization":
      return `${skillName(selectedSkill.value)}: ${specializationName.value.trim()}`
    case "new-art": {
      const source = ART_SOURCES.find(s => s.key === selectedSource.value)
      return `${DarkborneData.artName(selectedArt.value)} auf Tiefe 1 durch ${source?.name ?? selectedSource.value}`
    }
    case "established-form": {
      const form = DarkborneData.form(selectedForm.value)
      return `${DarkborneData.artName(selectedArt.value)}: ${form?.name ?? selectedForm.value}`
    }
    case "own-form":
      return `${DarkborneData.artName(selectedArt.value)}: ${formName.value.trim()} (Stufe ${formLevel.value})`
    case "alienation":
      return "Entfremdung abgelegt"
    default:
      return `${subjectLabel.value}: ${currentValue.value} → ${newValue.value}`
  }
}

function apply() {
  const c = sheet.value
  if (!c) return
  switch (type.value) {
    case "attribute":
      c.attributes[subject.value] = newValue.value
      if (subject.value === DbAttribute.Kraft) {
        c.health = dbHealth(c)
      }
      break
    case "skill":
      c.skills[subject.value] = newValue.value
      break
    case "specialization":
      c.specializations.push({ skill: selectedSkill.value, name: specializationName.value.trim() })
      break
    case "background": {
      const key = activeBackground.value
      const existing = c.backgrounds.find(b => b.key === key)
      if (existing) {
        existing.level = newValue.value
      } else {
        c.backgrounds.push({ key, level: newValue.value, note: "" })
      }
      break
    }
    case "wille":
      c.wille = newValue.value
      break
    case "art": {
      const owned = c.arts.find(a => a.key === selectedArt.value)
      if (owned) {
        owned.depth = newValue.value
      }
      break
    }
    case "new-art":
      c.arts.push({ key: selectedArt.value, depth: 1, affinity: affinity.value })
      break
    case "established-form": {
      const form = DarkborneData.form(selectedForm.value)
      if (!form) break
      c.forms.push({
        art: selectedArt.value,
        key: form.key,
        name: form.name,
        level: form.level,
        kind: DbFormKind.Established,
        effect: form.effect,
        limits: form.limits,
      })
      break
    }
    case "own-form":
      c.forms.push({
        art: selectedArt.value,
        key: formKeyFor(formName.value),
        name: formName.value.trim(),
        level: formLevel.value,
        kind: DbFormKind.Own,
        effect: formEffect.value.trim(),
        limits: formLimits.value.trim(),
      })
      break
    case "blood-strength":
      c.bloodStrength = newValue.value
      break
    case "alienation":
      c.alienation = false
      break
  }
}

function levelUp() {
  const c = sheet.value
  if (!c || !hasRequirement.value) return

  CharacterStorage.trackLevelChange(c as any, levelChangeType.value, costs.value, changeText())
  apply()
  CharacterStorage.saveCharacter(c as any)

  close()
}

defineExpose({ showModal })
</script>

<template>
  <Modal :shown="show" @close="close">
    <div v-if="show && sheet" class="db-level-modal" :key="modalKey">
      <div class="head">
        <b class="title">{{ subjectLabel }}</b>
        <small class="exp">
          <template v-if="showsSteps">{{ currentValue }} &#8594; {{ newValue }}<Bullet /></template>
          Kosten: {{ costs === Infinity ? "-" : costs }} XP
          <Bullet />
          Verfügbar: {{ sheet.exp }} XP
        </small>
      </div>

      <div v-if="type === 'specialization'" class="body">
        <small class="hint">Eine Spezialisierung gibt +1 Würfel, wenn sie zur Situation passt.</small>
        <select class="form-control" v-model="selectedSkill" data-agent="db:level:specialization:skill">
          <option value="" disabled>Fertigkeit wählen</option>
          <option v-for="skill in skills" :key="skill.key" :value="skill.key">
            {{ skill.name }} ({{ sheet.skills[skill.key] ?? 0 }})
          </option>
        </select>
        <input
          class="form-control"
          v-model="specializationName"
          placeholder="Worin genau, zum Beispiel Verhöre"
          data-agent="db:level:specialization:name"
        />
      </div>

      <div v-else-if="type === 'background' && !subject" class="body">
        <select class="form-control" v-model="selectedBackground" data-agent="db:level:background">
          <option value="" disabled>Hintergrund wählen</option>
          <option v-for="background in backgrounds" :key="background.key" :value="background.key">{{ background.name }}</option>
        </select>
      </div>

      <div v-else-if="type === 'art'" class="body">
        <select class="form-control" v-model="selectedArt" data-agent="db:level:art">
          <option value="" disabled>Kunst wählen</option>
          <option v-for="art in ownedArts" :key="art.key" :value="art.key">{{ art.name }} (Tiefe {{ art.depth }})</option>
        </select>
        <small class="hint">
          Höchste Tiefe durch Blutstärke {{ sheet.bloodStrength }}: {{ artDepthCap }}
          <Bullet />
          {{ affinity ? "Mit Affinität: neue Tiefe mal 5" : "Ohne Affinität: neue Tiefe mal 7" }}
        </small>
      </div>

      <div v-else-if="type === 'new-art'" class="body">
        <select class="form-control" v-model="selectedArt" data-agent="db:level:new-art">
          <option value="" disabled>Kunst wählen</option>
          <option v-for="art in learnableArts" :key="art.key" :value="art.key">{{ art.shortName }}</option>
        </select>

        <small class="hint">Eine neue Kunst beginnt bei Tiefe 1 und braucht eine Quelle im Spiel.</small>

        <label v-for="source in ART_SOURCES" :key="source.key" class="source" :class="{ active: selectedSource === source.key }">
          <input type="radio" v-model="selectedSource" :value="source.key" :data-agent="'db:level:new-art:source:' + source.key" />
          <span class="source-text">
            <b>{{ source.name }}: {{ newArtBaseCost * source.factor }} XP</b>
            <small>{{ source.requirement }}</small>
            <small class="price">Preis: {{ source.price }}</small>
          </span>
        </label>
      </div>

      <div v-else-if="type === 'established-form'" class="body">
        <select class="form-control" v-model="selectedArt" data-agent="db:level:established-form:art" @change="onArtChange">
          <option value="" disabled>Kunst wählen</option>
          <option v-for="art in ownedArts" :key="art.key" :value="art.key">{{ art.name }} (Tiefe {{ art.depth }})</option>
        </select>

        <select class="form-control" v-model="selectedForm" :disabled="!selectedArt" data-agent="db:level:established-form:form">
          <option value="" disabled>Form wählen</option>
          <option v-for="form in availableForms" :key="form.key" :value="form.key">
            {{ form.name }} (Stufe {{ form.level }}, Schwierigkeit {{ form.difficulty }}, {{ form.cost }} Cruor)
          </option>
        </select>

        <small v-if="selectedArt && availableForms.length === 0" class="hint">
          Für diese Kunst sind keine weiteren gefestigten Formen bis zur eigenen Tiefe offen.
        </small>
        <small class="hint">
          Gefestigte Formen geben +2 Würfel, kosten 1 Cruor und reichen höchstens bis Wirkungsstufe {{ DB_ESTABLISHED_FORM_MAX_LEVEL }}.
        </small>
      </div>

      <div v-else-if="type === 'own-form'" class="body">
        <select class="form-control" v-model="selectedArt" data-agent="db:level:own-form:art" @change="onArtChange">
          <option value="" disabled>Kunst wählen</option>
          <option v-for="art in ownedArts" :key="art.key" :value="art.key">{{ art.name }} (Tiefe {{ art.depth }})</option>
        </select>

        <input class="form-control" v-model="formName" placeholder="Name der Form" data-agent="db:level:own-form:name" />

        <select class="form-control" v-model.number="formLevel" :disabled="!selectedArt" data-agent="db:level:own-form:level">
          <option v-for="level in ownFormLevels" :key="level" :value="level">Wirkungsstufe {{ level }}</option>
        </select>

        <textarea class="form-control" v-model="formEffect" rows="2" placeholder="Wirkung: was genau geschieht" data-agent="db:level:own-form:effect" />
        <textarea class="form-control" v-model="formLimits" rows="2" placeholder="Grenzen: was sie nicht kann" data-agent="db:level:own-form:limits" />

        <label class="check">
          <input type="checkbox" v-model="formImprovised" data-agent="db:level:own-form:improvised" />
          <small>Diese Wirkung wurde dreimal erfolgreich improvisiert, halber Preis.</small>
        </label>

        <small class="hint">Schwierigkeit und Cruor sind Wirkungsstufe minus 1, mindestens 1.</small>
      </div>

      <div v-else-if="type === 'blood-strength'" class="body">
        <small class="hint">Blutstärke steigt nicht durch Übung, sie verdichtet sich. Alle vier Bedingungen müssen erfüllt sein.</small>
        <ul class="conditions">
          <li>XP: neue Blutstärke mal 10 plus das eigene Glied, hier {{ newValue }} mal 10 plus {{ sheet.glied }}</li>
          <li v-for="(condition, index) in BLOOD_STRENGTH_CONDITIONS" :key="index">{{ condition }}</li>
        </ul>
        <label class="check">
          <input type="checkbox" v-model="conditionsConfirmed" data-agent="db:level:blood-strength:confirm" />
          <small>Ereignis, Ankererschütterung und Preis der neuen Stufe sind mit der SL geklärt.</small>
        </label>
      </div>

      <div v-else-if="type === 'alienation'" class="body">
        <small class="hint">
          Entfremdung gibt Schwierigkeit +1 bei moderner Technik, heutigen Umgangsformen und aktueller Sprache.
          Sie lässt sich ablegen, wenn sich die Figur im Spiel mit der Gegenwart auseinandergesetzt hat.
        </small>
        <div v-if="!sheet.alienation" class="alert alert-info">Diese Figur ist nicht entfremdet.</div>
      </div>

      <div v-if="maxReached" class="alert alert-warning">Der höchste Wert ist erreicht.</div>
      <div v-else-if="costs !== Infinity && sheet.exp < costs" class="alert alert-warning">
        Nicht genug Erfahrungspunkte. Es fehlen {{ costs - sheet.exp }} XP.
      </div>

      <div class="actions">
        <button class="btn btn-primary" :disabled="!hasRequirement" data-agent="db:level:confirm" @click="levelUp">
          Abschließen
        </button>
      </div>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.db-level-modal {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.head {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  text-align: center;

  .title {
    font-size: 1.15rem;
  }

  .exp {
    color: var(--text-2);
  }
}

.body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.hint {
  color: var(--text-3);
}

.source {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.5rem 0.6rem;
  border-radius: var(--radius-1);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;

  &.active {
    border-color: var(--accent-border);
    background: var(--accent-mute);
  }

  .source-text {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }

  small {
    color: var(--text-2);
  }

  .price {
    color: var(--text-3);
  }
}

.check {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.conditions {
  margin: 0;
  padding-left: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  color: var(--text-2);
}

.alert {
  margin: 0;
  text-align: center;
}

.actions {
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
