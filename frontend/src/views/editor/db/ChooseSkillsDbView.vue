<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import EditorForm from "@/components/editor/EditorForm.vue"
import TipButton from "@/components/editor/TipButton.vue"
import WrappedSpinner from "@/components/spinners/WrappedSpinner.vue"
import { DarkborneData } from "@/libs/data/darkborne-data"
import {
  DB_SKILL_PACKAGES,
  DbCategory,
  DbSkill,
  dbSkills,
  getDbCategoryName,
  getDbSkillsOf,
  type IDbSheet,
} from "@/@types/deathborne"
import { useStore } from "@/app/store"

interface ISpecializationDraft {
  skill: string
  name: string
}

const categories = [DbCategory.Body, DbCategory.Social, DbCategory.Mind]

const store = useStore()
const editingCharacter = computed(() => store.editingCharacter as unknown as IDbSheet | undefined)

const ready = ref(false)
const packageKey = ref("")
const assignment = ref<Record<DbSkill, number>>(emptyAssignment())
const humanSpecialization = ref<ISpecializationDraft>({ skill: "", name: "" })
const freeSpecialization = ref<ISpecializationDraft>({ skill: "", name: "" })

function emptyAssignment(): Record<DbSkill, number> {
  const next = {} as Record<DbSkill, number>
  for (const skill of dbSkills) {
    next[skill] = 0
  }
  return next
}

function detectPackage(values: number[]): string {
  const used = values.filter((v) => v > 0).sort((a, b) => b - a)
  for (const pack of DB_SKILL_PACKAGES) {
    const target = [...pack.spread].sort((a, b) => b - a)
    if (used.length === target.length && used.every((v, i) => v === target[i])) {
      return pack.key
    }
  }
  return ""
}

onMounted(async () => {
  try {
    await DarkborneData.load()
  } finally {
    ready.value = DarkborneData.isLoaded
  }

  const c = editingCharacter.value
  if (!c) return

  const detected = detectPackage(dbSkills.map((s) => c.skills[s] ?? 0))
  if (detected) {
    packageKey.value = detected
    const next = emptyAssignment()
    for (const skill of dbSkills) {
      next[skill] = c.skills[skill] ?? 0
    }
    assignment.value = next
  }

  const human = c.specializations[0]
  const free = c.specializations[1]
  if (human) {
    humanSpecialization.value = { skill: human.skill, name: human.name }
  }
  if (free) {
    freeSpecialization.value = { skill: free.skill, name: free.name }
  }
})

const selectedPackage = computed(() => DB_SKILL_PACKAGES.find((p) => p.key === packageKey.value))

function selectPackage(key: string) {
  packageKey.value = key
  assignment.value = emptyAssignment()
  humanSpecialization.value = { skill: "", name: "" }
  freeSpecialization.value = { skill: "", name: "" }
}

const remaining = computed(() => {
  const pool = [...(selectedPackage.value?.spread ?? [])]
  for (const skill of dbSkills) {
    const value = assignment.value[skill]
    if (value <= 0) continue
    const index = pool.indexOf(value)
    if (index >= 0) {
      pool.splice(index, 1)
    }
  }
  return pool.sort((a, b) => b - a)
})

function optionsFor(skill: DbSkill): number[] {
  const values = new Set<number>(remaining.value)
  const current = assignment.value[skill]
  if (current > 0) {
    values.add(current)
  }
  return [...values].sort((a, b) => b - a)
}

function valueOf(skill: string): number {
  return assignment.value[skill as DbSkill] ?? 0
}

function skillName(skill: string): string {
  return DarkborneData.content.skills.find((s) => s.key === skill)?.name ?? skill
}

function skillDescription(skill: string): string {
  return DarkborneData.content.skills.find((s) => s.key === skill)?.description ?? ""
}

const trainedSkills = computed(() => dbSkills.filter((s) => assignment.value[s] > 0))

function specializationValid(entry: ISpecializationDraft): boolean {
  if (!entry.skill || entry.name.trim().length === 0) return false
  return valueOf(entry.skill) > 0
}

const specializationsDistinct = computed(() => {
  const human = humanSpecialization.value
  const free = freeSpecialization.value
  return human.skill !== free.skill || human.name.trim() !== free.name.trim()
})

function onBeforeNext() {
  const c = editingCharacter.value
  if (!c) return

  for (const skill of dbSkills) {
    c.skills[skill] = assignment.value[skill]
  }
  c.specializations = [humanSpecialization.value, freeSpecialization.value].map((entry) => ({
    skill: entry.skill,
    name: entry.name.trim(),
  }))
}

const canGoNext = computed(() => {
  if (!ready.value || !selectedPackage.value) return false
  if (remaining.value.length > 0) return false
  if (!specializationValid(humanSpecialization.value)) return false
  if (!specializationValid(freeSpecialization.value)) return false
  return specializationsDistinct.value
})
</script>

<template>
  <EditorForm :can-go-next="canGoNext" next-step="editor-db-arts" @before-next="onBeforeNext">
    <WrappedSpinner v-if="!ready">Darkborne-Daten werden geladen</WrappedSpinner>

    <div v-else-if="editingCharacter" class="skills-view">
      <div class="card intro">
        <small>
          Wähle ein Fertigkeitenpaket und verteile dessen Werte auf die 15 Fertigkeiten. Jeder Wert wird genau einmal
          vergeben, alle übrigen Fertigkeiten bleiben auf 0.
        </small>
        <small class="hint">
          Der Preis der Wahl ist ehrlich: Der Spezialist kann wenige Dinge sehr gut, der Generalist viele nur ordentlich.
        </small>

        <div class="packages">
          <div
            v-for="pack in DB_SKILL_PACKAGES"
            :key="pack.key"
            class="package"
            :class="{ selected: packageKey === pack.key }"
            :data-agent="'db:skill-package:' + pack.key"
            :data-agent-label="pack.name"
            @click="selectPackage(pack.key)"
          >
            <b>{{ pack.name }}</b>
            <small>{{ pack.description }}</small>
          </div>
        </div>

        <div v-if="selectedPackage" class="pool">
          <span>Noch nicht vergeben:</span>
          <template v-if="remaining.length > 0">
            <b v-for="(value, index) in remaining" :key="index" class="chip">{{ value }}</b>
          </template>
          <b v-else class="done">alles verteilt</b>
        </div>
      </div>

      <div v-if="selectedPackage" class="panels">
        <div v-for="category in categories" :key="category" class="card panel">
          <h6>{{ getDbCategoryName(category) }}</h6>

          <div class="rows">
            <div v-for="skill in getDbSkillsOf(category)" :key="skill" class="row">
              <label>
                {{ skillName(skill) }}
                <TipButton :title="skillName(skill)" :content="skillDescription(skill)" />
              </label>
              <select class="form-control" v-model.number="assignment[skill]" :data-agent="'db:skill:' + skill">
                <option :value="0">0</option>
                <option v-for="value in optionsFor(skill)" :key="value" :value="value">{{ value }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div v-if="selectedPackage" class="card specs">
        <h6>
          Spezialisierungen
          <TipButton
            title="Spezialisierungen"
            content="Eine Spezialisierung ist ein enger Bereich innerhalb einer Fertigkeit, etwa Medizin (Chirurgie) oder Schießen (Scharfschütze). Passt sie zur Handlung, gibt sie +1 Würfel. Spezialisierungen stammen meist aus dem früheren Leben einer Figur."
          />
        </h6>
        <small class="hint">
          Zwei Spezialisierungen, mindestens eine aus deinem Menschenleben. Wählbar sind nur Fertigkeiten mit
          mindestens 1 Punkt.
        </small>

        <div class="spec-row">
          <div class="spec-label">
            <b>Aus deinem Menschenleben</b>
            <small>Was hast du als Mensch wirklich gekonnt?</small>
          </div>
          <select class="form-control" v-model="humanSpecialization.skill" data-agent="db:spec:human:skill">
            <option value="" disabled>Fertigkeit wählen</option>
            <option v-for="skill in trainedSkills" :key="'h' + skill" :value="skill">
              {{ skillName(skill) }} ({{ valueOf(skill) }})
            </option>
          </select>
          <input
            class="form-control"
            type="text"
            placeholder="Enger Bereich, etwa Chirurgie"
            v-model="humanSpecialization.name"
            data-agent="db:spec:human:name"
          />
        </div>

        <div class="spec-row">
          <div class="spec-label">
            <b>Freie Spezialisierung</b>
            <small>Aus dem Menschenleben oder aus deinen Nächten.</small>
          </div>
          <select class="form-control" v-model="freeSpecialization.skill" data-agent="db:spec:free:skill">
            <option value="" disabled>Fertigkeit wählen</option>
            <option v-for="skill in trainedSkills" :key="'f' + skill" :value="skill">
              {{ skillName(skill) }} ({{ valueOf(skill) }})
            </option>
          </select>
          <input
            class="form-control"
            type="text"
            placeholder="Enger Bereich, etwa Scharfschütze"
            v-model="freeSpecialization.name"
            data-agent="db:spec:free:name"
          />
        </div>

        <small v-if="!specializationsDistinct" class="warn">
          Die beiden Spezialisierungen dürfen nicht identisch sein.
        </small>
      </div>
    </div>
  </EditorForm>
</template>

<style scoped lang="scss">
.skills-view {
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

  .packages {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 0.25rem;
  }

  .package {
    flex: 1 1 14rem;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding: 0.6rem 0.75rem;
    border-radius: 0.6rem;
    cursor: pointer;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: border-color 160ms ease, transform 160ms ease;

    &:hover {
      transform: translateY(-2px);
      border-color: var(--primary-color);
    }

    &.selected {
      border-color: var(--primary-color);
      box-shadow: var(--shadow-hairline);
    }

    small {
      opacity: 0.85;
    }
  }

  .pool {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.4rem;
    font-size: 0.9rem;

    span {
      opacity: 0.8;
    }

    .chip {
      min-width: 1.9rem;
      text-align: center;
      padding: 0.15rem 0.45rem;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.12);
    }

    .done {
      color: var(--primary-color);
    }
  }

  .panels {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    flex-wrap: wrap;
    gap: 1.5rem;
  }

  .panel {
    width: 20rem;

    h6 {
      margin: 0 0 0.25rem;
      font-weight: bold;
      text-align: center;
    }
  }

  .rows {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;

    label {
      margin: 0;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }

    select {
      width: 5.5rem;
    }
  }

  .specs {
    width: min(60rem, 100%);

    h6 {
      margin: 0;
      font-weight: bold;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }
  }

  .spec-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.6rem;

    .spec-label {
      display: flex;
      flex-direction: column;
      width: 16rem;

      small {
        opacity: 0.8;
      }
    }

    select {
      width: 14rem;
    }

    input {
      flex: 1 1 14rem;
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
