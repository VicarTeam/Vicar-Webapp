<script setup lang="ts">
import { computed, ref } from "vue"
import { useStore } from "@/app/store"
import TipButton from "@/components/editor/TipButton.vue"
import ConfirmDeleteModal from "@/components/viewer/modals/ConfirmDeleteModal.vue"
import CharacterStorage from "@/libs/io/character-storage"
import { vdzTraitDefs } from "@/app/data/vdz"
import { getVdzTraitCategoryName, type IVdzSheet, type IVdzTraitDef } from "@/@types/vdz"

const store = useStore()
const editingCharacter = computed(() => store.editingCharacter as IVdzSheet | undefined)

const confirmDeleteModal = ref<InstanceType<typeof ConfirmDeleteModal> | null>(null)

const selectedTraitDef = ref<IVdzTraitDef | null>(null)
const selectedTraitLevel = ref(1)

const merits = computed(() => (editingCharacter.value?.traits ?? []).filter(t => !t.isFlaw))
const flaws = computed(() => (editingCharacter.value?.traits ?? []).filter(t => t.isFlaw))

const availableMerits = computed(() => {
  const c = editingCharacter.value
  if (!c) return []
  return vdzTraitDefs.filter(t => t.type === "merit" && !(c.traits ?? []).some(x => x.name === t.name))
})

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

const canAfford = computed(() => {
  const c = editingCharacter.value
  const def = selectedTraitDef.value
  if (!c || !def) return false
  return (c.freebiePoints ?? 0) >= selectedTraitLevel.value
})

function addMerit() {
  const c = editingCharacter.value
  const def = selectedTraitDef.value
  if (!c || !def || !canAfford.value) return

  if (!c.traits) c.traits = []
  c.traits.push({ name: def.name, level: selectedTraitLevel.value, isFlaw: false })
  c.freebiePoints = Math.max(0, (c.freebiePoints ?? 0) - selectedTraitLevel.value)

  selectedTraitDef.value = null
  selectedTraitLevel.value = 1
  CharacterStorage.saveCharacter(c as any)
}

function removeTrait(name: string) {
  const c = editingCharacter.value
  if (!c) return
  confirmDeleteModal.value?.showModal(name, () => {
    c.traits = (c.traits ?? []).filter(t => t.name !== name)
    CharacterStorage.saveCharacter(c as any)
  })
}

function traitDef(name: string): IVdzTraitDef | undefined {
  return vdzTraitDefs.find(t => t.name === name)
}
</script>

<template>
  <div v-if="editingCharacter" class="vdz-traits-view">
    <div class="card">
      <b class="title">Vorzüge</b>

      <div v-if="merits.length === 0" class="empty"><small>Keine Vorzüge.</small></div>

      <div v-for="t in merits" :key="t.name" class="trait-row">
        <small class="name">
          <TipButton v-if="traitDef(t.name)" :content="traitDef(t.name)!.description" />
          {{ t.name }}
          <span v-if="traitDef(t.name)" class="cat">({{ getVdzTraitCategoryName(traitDef(t.name)!.category) }})</span>
        </small>
        <b class="lvl">{{ t.level }} P.</b>
        <button v-if="!editingCharacter.justViewing" class="btn remove" @click="removeTrait(t.name)"><i class="fa-solid fa-xmark" /></button>
      </div>

      <template v-if="!editingCharacter.justViewing">
        <div class="divider"></div>

        <b class="subtitle">
          Vorzug erwerben (Freie Punkte: {{ editingCharacter.freebiePoints ?? 0 }})
          <TipButton content="Neue Vorzüge kosten Freie Punkte in Höhe ihrer Stufe. Nachträglicher Erwerb sollte erzählerisch begründet und mit der Erzählerin abgesprochen sein." />
        </b>

        <div class="trait-add">
          <select class="form-control" v-model="selectedTraitDef" @change="onTraitDefChange">
            <option :value="null" disabled>Vorzug wählen …</option>
            <option v-for="t in availableMerits" :key="t.id" :value="t">
              {{ t.name }} ({{ getVdzTraitCategoryName(t.category) }}, {{ t.minLevel === t.maxLevel ? t.minLevel : `${t.minLevel}-${t.maxLevel}` }} P.)
            </option>
          </select>

          <select v-if="selectedLevelOptions.length > 1" class="form-control level-select" v-model.number="selectedTraitLevel">
            <option v-for="n in selectedLevelOptions" :key="n" :value="n">{{ n }}</option>
          </select>

          <button class="btn btn-primary" :disabled="!selectedTraitDef || !canAfford" @click="addMerit">Kaufen</button>
        </div>

        <small v-if="selectedTraitDef" class="trait-desc">{{ selectedTraitDef.description }}</small>
        <small v-if="selectedTraitDef && !canAfford" class="warn">Nicht genug Freie Punkte.</small>
      </template>
    </div>

    <div class="card">
      <b class="title">Schwächen</b>

      <div v-if="flaws.length === 0" class="empty"><small>Keine Schwächen.</small></div>

      <div v-for="t in flaws" :key="t.name" class="trait-row flaw">
        <small class="name">
          <TipButton v-if="traitDef(t.name)" :content="traitDef(t.name)!.description" />
          {{ t.name }}
          <span v-if="traitDef(t.name)" class="cat">({{ getVdzTraitCategoryName(traitDef(t.name)!.category) }})</span>
        </small>
        <b class="lvl">+{{ t.level }} P.</b>
        <button v-if="!editingCharacter.justViewing" class="btn remove" @click="removeTrait(t.name)"><i class="fa-solid fa-xmark" /></button>
      </div>

      <small class="hint">Neue Schwächen im laufenden Spiel vergibt die Erzählerin (z.B. durch Verletzungen oder Flüche).</small>
    </div>

    <ConfirmDeleteModal ref="confirmDeleteModal" />
  </div>
</template>

<style scoped lang="scss">
.vdz-traits-view {
  width: 100%;
  min-height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 2rem;
  padding: 1.5rem;
  flex-wrap: wrap;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  width: min(34rem, 100%);
}

.title {
  font-size: 1.3rem;
}

.trait-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;

  .name {
    flex-grow: 1;
  }

  .cat {
    opacity: 0.7;
  }

  &.flaw .lvl {
    color: var(--primary-color);
  }

  .remove {
    min-width: 1.8rem;
    height: 1.8rem;
    padding: 0;
    line-height: 1;
  }
}

.divider {
  width: 100%;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0.5rem 0;
}

.subtitle {
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

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

.warn {
  color: #e07a7a;
}

.hint {
  opacity: 0.7;
  font-style: italic;
}
</style>
