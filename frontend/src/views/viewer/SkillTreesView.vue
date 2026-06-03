<script setup lang="ts">
import {computed, ref} from "vue"
import {useStore} from "@/app/store"
import type {ICharacter} from "@/@types/models"
import {type ICharacterSkillTreeState, type ISkillNode, SkillTreeResourceType} from "@/@types/skilltree"
import SkillTreeCanvas from "@/components/skilltree/SkillTreeCanvas.vue"
import UnlockSkillModal from "@/components/skilltree/modals/UnlockSkillModal.vue"
import {skillTreeResolver} from "@/libs/resolvers/skilltree-resolver"
import {skillTreeConstraintResolver} from "@/libs/resolvers/skilltree-constraint-resolver"
import {formatModifier} from "@/libs/skilltree-format"
import CharacterStorage from "@/libs/io/character-storage"

const store = useStore()
const editingCharacter = computed(() => store.editingCharacter as ICharacter | undefined)

const states = computed<ICharacterSkillTreeState[]>(() => editingCharacter.value?.skillTrees ?? [])
const selectedIndex = ref(0)
const selectedState = computed<ICharacterSkillTreeState | undefined>(() => states.value[selectedIndex.value])

const unlockModal = ref<InstanceType<typeof UnlockSkillModal> | null>(null)
const pulsedNodeId = ref<string | null>(null)
let pulseTimer: number | undefined

const activeModifiers = computed(() =>
  editingCharacter.value ? skillTreeResolver.getActiveModifiers(editingCharacter.value) : [],
)

const resourceLabel = computed(() =>
  selectedState.value ? skillTreeConstraintResolver.resourceLabel(selectedState.value) : "",
)

const resourceAvailable = computed(() => {
  if (!editingCharacter.value || !selectedState.value) return 0
  return skillTreeConstraintResolver.availableResource(editingCharacter.value, selectedState.value)
})

const isCustomResource = computed(() =>
  selectedState.value?.treeSnapshot.resourceType === SkillTreeResourceType.Custom,
)

function onNodeClick(node: ISkillNode) {
  if (!editingCharacter.value || !selectedState.value) return
  unlockModal.value?.showModal(editingCharacter.value, selectedState.value, node)
}

function onUnlocked(nodeId: string) {
  pulsedNodeId.value = nodeId
  window.clearTimeout(pulseTimer)
  pulseTimer = window.setTimeout(() => (pulsedNodeId.value = null), 700)
}

function saveCustomResource() {
  if (editingCharacter.value) CharacterStorage.saveCharacter(editingCharacter.value)
}
</script>

<template>
  <div v-if="editingCharacter" class="skilltrees-view">
    <div v-if="states.length === 0" class="empty">
      <i class="fa-solid fa-diagram-project"></i>
      <p>Noch keine Skill-Bäume freigeschaltet. Gib einen Bonus Code in den Charakter-Infos ein.</p>
    </div>

    <template v-else>
      <div v-if="states.length > 1" class="tree-pills">
        <button
          v-for="(s, i) in states"
          :key="s.treeId"
          type="button"
          class="pill"
          :class="{active: i === selectedIndex}"
          @click="selectedIndex = i"
        >
          <i class="fa-solid" :class="s.treeSnapshot.icon && s.treeSnapshot.icon.includes('fa-') ? s.treeSnapshot.icon : 'fa-diagram-project'"></i>
          {{ s.treeSnapshot.name }}
        </button>
      </div>

      <div v-if="selectedState" class="layout">
        <div class="canvas-wrap card">
          <div class="tree-head">
            <div>
              <b class="tree-name">{{ selectedState.treeSnapshot.name }}</b>
              <p class="tree-desc">{{ selectedState.treeSnapshot.description }}</p>
            </div>
            <div class="resource">
              <span class="res-label">{{ resourceLabel }}</span>
              <template v-if="isCustomResource">
                <input
                  type="number"
                  class="form-control res-input"
                  v-model.number="selectedState.customResource"
                  @change="saveCustomResource"
                />
              </template>
              <span v-else-if="resourceAvailable === Infinity" class="res-value">aktiv</span>
              <span v-else class="res-value">{{ resourceAvailable }}</span>
            </div>
          </div>

          <SkillTreeCanvas :char="editingCharacter" :state="selectedState" :pulsed-id="pulsedNodeId" @node-click="onNodeClick" />
        </div>

        <aside class="summary card">
          <b>Freigeschaltete Effekte</b>
          <div v-if="activeModifiers.length === 0" class="empty-hint">
            Noch keine Skills freigeschaltet.
          </div>
          <ul v-else class="mod-list">
            <li v-for="(entry, i) in activeModifiers" :key="i">
              <span class="mod-skill">{{ entry.node.name }}</span>
              <span class="mod-text">{{ formatModifier(entry.modifier) }}</span>
            </li>
          </ul>
        </aside>
      </div>
    </template>

    <UnlockSkillModal ref="unlockModal" @unlocked="onUnlocked" />
  </div>
</template>

<style scoped lang="scss">
.skilltrees-view {
  width: 100%;
  height: 100%;
  padding: var(--space-4);
  min-height: 0;
}

.empty {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  color: var(--text-3);

  i {
    font-size: 2.5rem;
    opacity: 0.5;
  }
}

.tree-pills {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-3);

  .pill {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: var(--bg-2);
    color: var(--text-2);
    cursor: pointer;
    transition: all var(--dur-2) var(--ease-2);

    &.active {
      border-color: var(--accent);
      color: var(--text-1);
      box-shadow: 0 0 14px var(--accent-glow);
    }
  }
}

.layout {
  display: grid;
  grid-template-columns: 1fr 18rem;
  gap: var(--space-4);
  height: calc(100% - 1rem);
  min-height: 0;
}

.canvas-wrap {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  padding: 0;
}

.tree-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4);
  border-bottom: 1px solid color-mix(in srgb, var(--accent) 14%, rgba(255, 255, 255, 0.06));

  .tree-name {
    font-family: var(--font-display);
    font-size: 1.1rem;
  }

  .tree-desc {
    margin: var(--space-1) 0 0;
    color: var(--text-3);
    font-size: 0.85rem;
  }

  .resource {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: var(--space-1);
    flex-shrink: 0;

    .res-label {
      font-size: 0.72rem;
      color: var(--text-3);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .res-value {
      font-family: var(--font-display);
      font-size: 1.2rem;
      color: color-mix(in srgb, var(--accent) 70%, #ffffff);
    }

    .res-input {
      width: 6rem;
      text-align: right;
    }
  }
}

.summary {
  overflow-y: auto;
  min-height: 0;
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);

  .mod-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);

    li {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding-bottom: var(--space-2);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .mod-skill {
      font-size: 0.78rem;
      color: var(--text-3);
    }

    .mod-text {
      color: var(--text-1);
    }
  }

  .empty-hint {
    color: var(--text-3);
    font-size: 0.85rem;
    font-style: italic;
  }
}

@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
    height: auto;
  }
}
</style>
