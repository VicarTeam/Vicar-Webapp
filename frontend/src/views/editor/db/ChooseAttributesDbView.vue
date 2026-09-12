<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import EditorForm from "@/components/editor/EditorForm.vue"
import TipButton from "@/components/editor/TipButton.vue"
import WrappedSpinner from "@/components/spinners/WrappedSpinner.vue"
import { DarkborneData } from "@/libs/data/darkborne-data"
import { dbHealth } from "@/libs/data/darkborne-rules"
import {
  DB_ATTRIBUTE_SPREAD,
  DbAttribute,
  DbCategory,
  dbAttributes,
  getDbAttributesOf,
  getDbCategoryName,
  type IDbSheet,
} from "@/@types/deathborne"
import { useStore } from "@/app/store"

const START_WILLE = 2
const categories = [DbCategory.Body, DbCategory.Mind, DbCategory.Social]

const store = useStore()
const editingCharacter = computed(() => store.editingCharacter as unknown as IDbSheet | undefined)

const ready = ref(false)
const assignment = ref<Record<DbAttribute, number>>(emptyAssignment())

function emptyAssignment(): Record<DbAttribute, number> {
  const next = {} as Record<DbAttribute, number>
  for (const attribute of dbAttributes) {
    next[attribute] = 0
  }
  return next
}

function matchesSpread(values: number[]): boolean {
  const sorted = [...values].sort((a, b) => b - a)
  const target = [...DB_ATTRIBUTE_SPREAD].sort((a, b) => b - a)
  return sorted.length === target.length && sorted.every((v, i) => v === target[i])
}

onMounted(async () => {
  try {
    await DarkborneData.load()
  } finally {
    ready.value = DarkborneData.isLoaded
  }

  const c = editingCharacter.value
  if (!c || !matchesSpread(dbAttributes.map((a) => c.attributes[a] ?? 0))) return

  const next = emptyAssignment()
  for (const attribute of dbAttributes) {
    next[attribute] = c.attributes[attribute] ?? 0
  }
  assignment.value = next
})

const remaining = computed(() => {
  const pool = [...DB_ATTRIBUTE_SPREAD]
  for (const attribute of dbAttributes) {
    const value = assignment.value[attribute]
    if (value <= 0) continue
    const index = pool.indexOf(value)
    if (index >= 0) {
      pool.splice(index, 1)
    }
  }
  return pool.sort((a, b) => b - a)
})

function optionsFor(attribute: DbAttribute): number[] {
  const values = new Set<number>(remaining.value)
  const current = assignment.value[attribute]
  if (current > 0) {
    values.add(current)
  }
  return [...values].sort((a, b) => b - a)
}

function valueOf(attribute: DbAttribute): number {
  return assignment.value[attribute]
}

function attributeName(attribute: DbAttribute): string {
  return DarkborneData.content.attributes.find((a) => a.key === attribute)?.name ?? attribute
}

function attributeDescription(attribute: DbAttribute): string {
  return DarkborneData.content.attributes.find((a) => a.key === attribute)?.description ?? ""
}

const willeDescription = computed(() => {
  if (!ready.value) return ""
  return DarkborneData.content.attributes.find((a) => a.key === "wille")?.description ?? ""
})

const health = computed(() => {
  const kraft = valueOf(DbAttribute.Kraft)
  return kraft > 0 ? kraft + 5 : 0
})

function onBeforeNext() {
  const c = editingCharacter.value
  if (!c) return

  for (const attribute of dbAttributes) {
    c.attributes[attribute] = valueOf(attribute)
  }
  c.wille = START_WILLE
  c.willePool = START_WILLE
  c.health = dbHealth(c)
}

const canGoNext = computed(() => {
  if (!ready.value) return false
  if (remaining.value.length > 0) return false
  return dbAttributes.every((a) => valueOf(a) > 0)
})
</script>

<template>
  <EditorForm :can-go-next="canGoNext" next-step="editor-db-skills" @before-next="onBeforeNext">
    <WrappedSpinner v-if="!ready">Darkborne-Daten werden geladen</WrappedSpinner>

    <div v-else-if="editingCharacter" class="attributes-view">
      <div class="card intro">
        <small>
          Verteile die Werte <b>4, 3, 3, 2, 2, 1</b> auf deine sechs Attribute. Jeder Wert wird genau einmal vergeben.
          <b>Wille</b> beginnt immer bei {{ START_WILLE }} und wird nicht verteilt.
        </small>
        <div class="pool">
          <span>Noch nicht vergeben:</span>
          <template v-if="remaining.length > 0">
            <b v-for="(value, index) in remaining" :key="index" class="chip">{{ value }}</b>
          </template>
          <b v-else class="done">alles verteilt</b>
        </div>
      </div>

      <div class="panels">
        <div v-for="category in categories" :key="category" class="card panel">
          <h6>{{ getDbCategoryName(category) }}</h6>

          <div class="rows">
            <div v-for="attribute in getDbAttributesOf(category)" :key="attribute" class="row">
              <label>
                {{ attributeName(attribute) }}
                <TipButton :title="attributeName(attribute)" :content="attributeDescription(attribute)" />
              </label>
              <select class="form-control" v-model.number="assignment[attribute]" :data-agent="'db:attr:' + attribute">
                <option :value="0">-</option>
                <option v-for="value in optionsFor(attribute)" :key="value" :value="value">{{ value }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="card panel">
          <h6>Wille und abgeleitete Werte</h6>

          <div class="rows">
            <div class="row">
              <label>
                Wille
                <TipButton title="Wille" :content="willeDescription" />
              </label>
              <b class="fixed">{{ START_WILLE }}</b>
            </div>
            <div class="row">
              <label>
                Wille-Vorrat
                <TipButton title="Wille-Vorrat" content="Der Wille-Vorrat entspricht deinem Wille-Wert. Du zahlst daraus, um Zwänge abzulehnen und Folgen zu widerstehen." />
              </label>
              <b class="fixed">{{ START_WILLE }}</b>
            </div>
            <div class="row">
              <label>
                Gesundheit
                <TipButton title="Gesundheit" content="Die Gesundheit ist Kraft + 5. Sie wächst also mit, sobald du Kraft verteilt hast." />
              </label>
              <b class="fixed">{{ health > 0 ? health : "-" }}</b>
            </div>
          </div>

          <small class="hint">Kraft + 5 ergibt deine Gesundheitsleiste. Der Cruor-Vorrat folgt später aus der Blutstärke.</small>
        </div>
      </div>
    </div>
  </EditorForm>
</template>

<style scoped lang="scss">
.attributes-view {
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
      width: 6rem;
    }

    .fixed {
      width: 6rem;
      text-align: center;
    }
  }

  .hint {
    opacity: 0.8;
  }
}
</style>
