<script setup lang="ts">
import {onMounted, ref} from "vue"
import {useRouter} from "vue-router"
import {defaultSkillTree, getResourceTypeName, type ISkillTree} from "@/@types/skilltree"
import SkillTreeStorage from "@/libs/io/skilltree-storage"
import SkillTreeEditor from "@/components/skilltree/editor/SkillTreeEditor.vue"
import {resolveAssetUrl} from "@/libs/io/cdn"

const router = useRouter()

const loading = ref(true)
const mode = ref<"list" | "edit">("list")
const editingTree = ref<ISkillTree | null>(null)
const trees = ref<ISkillTree[]>([])

async function refresh() {
  loading.value = true
  trees.value = await SkillTreeStorage.loadOwnTrees(true)
  loading.value = false
}

onMounted(refresh)

function createNew() {
  editingTree.value = defaultSkillTree()
  mode.value = "edit"
}

function edit(tree: ISkillTree) {
  // Arbeitskopie, damit die Liste erst nach dem Speichern aktualisiert wird.
  editingTree.value = JSON.parse(JSON.stringify(tree))
  mode.value = "edit"
}

function backToList() {
  mode.value = "list"
  editingTree.value = null
  refresh()
}

function onSaved() {
  backToList()
}

async function onDeleted(tree: ISkillTree) {
  if (!window.confirm(`Skill Tree "${tree.name}" wirklich löschen?`)) return
  await SkillTreeStorage.deleteTree(tree)
  backToList()
}
</script>

<template>
  <div class="skilltree-manager">
    <template v-if="mode === 'list'">
      <div class="manager-head">
        <button type="button" class="iconbtn" title="Zurück zur App" @click="router.push('/')">
          <i class="fa-solid fa-arrow-left"></i>
        </button>
        <h1>Skill-Bäume</h1>
        <div class="spacer"></div>
        <button type="button" class="btn btn-primary" @click="createNew">
          <i class="fa-solid fa-plus"></i> Neuer Skill Tree
        </button>
      </div>

      <div v-if="loading" class="state-hint">Lädt…</div>

      <div v-else-if="trees.length === 0" class="state-hint">
        Noch keine Skill-Bäume erstellt. Lege deinen ersten an!
      </div>

      <div v-else class="tree-grid">
        <button
          v-for="tree in trees"
          :key="tree.id"
          type="button"
          class="card tree-card"
          @click="edit(tree)"
        >
          <div class="tree-icon">
            <img v-if="tree.icon && !tree.icon.includes('fa-')" :src="resolveAssetUrl(tree.icon)" alt=""/>
            <i v-else class="fa-solid" :class="tree.icon && tree.icon.includes('fa-') ? tree.icon : 'fa-diagram-project'"></i>
          </div>
          <div class="tree-info">
            <div class="tree-name">{{ tree.name }}</div>
            <div class="tree-desc">{{ tree.description || "Keine Beschreibung" }}</div>
            <div class="tree-meta">
              <span class="badge">{{ tree.nodes.length }} Skills</span>
              <span class="badge">{{ getResourceTypeName(tree.resourceType) }}</span>
              <span class="code"><i class="fa-solid fa-key"></i> {{ tree.bonusCode }}</span>
            </div>
          </div>
        </button>
      </div>
    </template>

    <SkillTreeEditor
      v-else-if="editingTree"
      :tree="editingTree"
      @back="backToList"
      @saved="onSaved"
      @deleted="onDeleted"
    />
  </div>
</template>

<style scoped lang="scss">
.skilltree-manager {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.manager-head {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-5) var(--space-6);

  h1 {
    font-family: var(--font-display);
    font-size: 1.6rem;
    margin: 0;
  }

  .spacer {
    flex: 1;
  }
}

.state-hint {
  padding: var(--space-6);
  color: var(--text-3);
}

.tree-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
  gap: var(--space-4);
  padding: 0 var(--space-6) var(--space-6);
  overflow-y: auto;
}

.tree-card {
  display: flex;
  gap: var(--space-4);
  text-align: left;
  align-items: flex-start;
  cursor: pointer;
  padding: var(--space-4);

  .tree-icon {
    font-size: 1.6rem;
    color: color-mix(in srgb, var(--accent) 80%, #ffffff);
    flex-shrink: 0;

    img {
      width: 2.2rem;
      height: 2.2rem;
      object-fit: contain;
      border-radius: var(--radius-1);
    }
  }

  .tree-info {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .tree-name {
    font-weight: 700;
    color: var(--text-1);
  }

  .tree-desc {
    font-size: 0.85rem;
    color: var(--text-3);
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .tree-meta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    align-items: center;
    font-size: 0.75rem;

    .code {
      color: var(--text-2);
      font-family: var(--font-display);
    }
  }
}
</style>
