<script setup lang="ts">
import {computed, ref, watch} from "vue"
import {v4 as uuidv4} from "uuid"
import {
  defaultSkillNode,
  getResourceTypeName,
  type ISkillTree,
  SkillTreeResourceType,
} from "@/@types/skilltree"
import SkillTreeGrid from "@/components/skilltree/editor/SkillTreeGrid.vue"
import SkillNodeInspector from "@/components/skilltree/editor/SkillNodeInspector.vue"
import ImageUpload from "@/components/skilltree/editor/ImageUpload.vue"
import SkillTreeStorage from "@/libs/io/skilltree-storage"

const props = defineProps<{
  tree: ISkillTree
}>()

const emit = defineEmits<{
  (e: "back"): void
  (e: "saved", tree: ISkillTree): void
  (e: "deleted", tree: ISkillTree): void
}>()

const selectedNodeId = ref<string | null>(null)
const saving = ref(false)
const error = ref<string | null>(null)

const resourceOptions = Object.values(SkillTreeResourceType).map(t => ({value: t, name: getResourceTypeName(t)}))

const selectedNode = computed(() => props.tree.nodes.find(n => n.id === selectedNodeId.value) ?? null)

function addNode(pos: { row: number; col: number }) {
  const node = defaultSkillNode(uuidv4())
  node.row = pos.row
  node.col = pos.col
  node.name = "Neuer Skill"
  props.tree.nodes.push(node)
  selectedNodeId.value = node.id
}

function moveNode(payload: { id: string; row: number; col: number }) {
  const node = props.tree.nodes.find(n => n.id === payload.id)
  if (!node) return
  node.row = payload.row
  node.col = payload.col
}

function deleteSelectedNode() {
  const id = selectedNodeId.value
  if (!id) return

  // Knoten entfernen
  props.tree.nodes = props.tree.nodes.filter(n => n.id !== id)

  // Verweise (Abhängigkeiten / Constraints) auf den Knoten aufräumen
  for (const n of props.tree.nodes) {
    n.dependencies = n.dependencies.filter(d => d.fromSkillId !== id)
    n.constraints = n.constraints.filter(c =>
      !((c.type === "requires_skill" || c.type === "excludes_skill") && c.data?.skillId === id))
  }

  selectedNodeId.value = null
}

/** Bei Verkleinern des Grids Knoten innerhalb der Grenzen halten. */
function clampNodes() {
  for (const n of props.tree.nodes) {
    n.row = Math.min(n.row, props.tree.rows - 1)
    n.col = Math.min(n.col, props.tree.cols - 1)
  }
}

watch(() => [props.tree.rows, props.tree.cols], clampNodes)

async function save() {
  error.value = null

  if (!props.tree.name.trim()) {
    error.value = "Bitte einen Namen vergeben."
    return
  }
  if (!props.tree.bonusCode.trim()) {
    error.value = "Bitte einen Bonus Code vergeben."
    return
  }

  saving.value = true
  props.tree.version = (props.tree.version ?? 0) + 1

  const result = props.tree.id
    ? await SkillTreeStorage.updateTree(props.tree)
    : await SkillTreeStorage.createTree(props.tree)

  saving.value = false

  if (!result) {
    error.value = "Speichern fehlgeschlagen – ist der Bonus Code evtl. schon vergeben?"
    props.tree.version = Math.max(1, (props.tree.version ?? 1) - 1)
    return
  }

  emit("saved", result)
}
</script>

<template>
  <div class="editor">
    <div class="editor-bar">
      <button type="button" class="iconbtn" title="Zurück" @click="emit('back')">
        <i class="fa-solid fa-arrow-left"></i>
      </button>
      <div class="title">{{ tree.name || "Neuer Skill Tree" }}</div>
      <div class="spacer"></div>
      <button
        v-if="tree.id"
        type="button"
        class="btn danger"
        @click="emit('deleted', tree)"
      >
        Löschen
      </button>
      <button type="button" class="btn btn-primary" :disabled="saving" @click="save">
        {{ saving ? "Speichert…" : "Speichern" }}
      </button>
    </div>

    <div v-if="error" class="error-banner">{{ error }}</div>

    <div class="editor-body">
      <div class="grid-area">
        <SkillTreeGrid
          :tree="tree"
          :selected-node-id="selectedNodeId"
          @select="selectedNodeId = $event"
          @add="addNode"
          @move="moveNode"
        />
      </div>

      <aside class="panel card">
        <SkillNodeInspector
          v-if="selectedNode"
          :tree="tree"
          :node="selectedNode"
          @delete="deleteSelectedNode"
        />

        <div v-else class="meta">
          <b>Baum-Einstellungen</b>

          <label class="field">
            <span>Name</span>
            <input type="text" class="form-control" v-model="tree.name" placeholder="Name des Skill Trees"/>
          </label>

          <label class="field">
            <span>Beschreibung</span>
            <textarea class="form-control" rows="3" v-model="tree.description"></textarea>
          </label>

          <div class="field">
            <span>Icon</span>
            <ImageUpload v-model="tree.icon" rounded label="Icon hochladen"/>
          </div>

          <div class="field">
            <span>Hintergrundbild (optional)</span>
            <ImageUpload v-model="tree.backgroundImage" label="Hintergrund hochladen"/>
          </div>

          <template v-if="tree.backgroundImage">
            <div class="dims">
              <label class="field">
                <span>Darstellung</span>
                <select class="form-control" v-model="tree.backgroundSize">
                  <option value="cover">Füllend (Cover)</option>
                  <option value="contain">Einpassen (Contain)</option>
                  <option value="auto">Originalgröße</option>
                  <option value="tile">Kacheln</option>
                </select>
              </label>
              <label class="field">
                <span>Ausrichtung</span>
                <select class="form-control" v-model="tree.backgroundPosition">
                  <option value="top left">Oben links</option>
                  <option value="top">Oben</option>
                  <option value="top right">Oben rechts</option>
                  <option value="left">Links</option>
                  <option value="center">Zentriert</option>
                  <option value="right">Rechts</option>
                  <option value="bottom left">Unten links</option>
                  <option value="bottom">Unten</option>
                  <option value="bottom right">Unten rechts</option>
                </select>
              </label>
            </div>
            <label class="field">
              <span>Deckkraft: {{ tree.backgroundOpacity ?? 100 }}%</span>
              <input type="range" min="0" max="100" step="5" v-model.number="tree.backgroundOpacity"/>
            </label>
          </template>

          <label class="field">
            <span>Bonus Code (eindeutig)</span>
            <input type="text" class="form-control" v-model="tree.bonusCode" placeholder="z.B. NOSFERATU_TRICKS"/>
          </label>

          <label class="field">
            <span>Ressource zum Leveln</span>
            <select class="form-control" v-model="tree.resourceType">
              <option v-for="o in resourceOptions" :key="o.value" :value="o.value">{{ o.name }}</option>
            </select>
          </label>

          <label v-if="tree.resourceType === SkillTreeResourceType.Custom" class="field">
            <span>Name der eigenen Ressource</span>
            <input type="text" class="form-control" v-model="tree.resourceName" placeholder="z.B. Blutpunkte"/>
          </label>

          <label v-if="tree.resourceType === SkillTreeResourceType.BonusCode" class="field">
            <span>Benötigter Bonus Code zum Leveln</span>
            <input type="text" class="form-control" v-model="tree.resourceBonusCode" placeholder="Bonus Code"/>
          </label>

          <div class="dims">
            <label class="field">
              <span>Zeilen</span>
              <input type="number" min="1" max="20" class="form-control" v-model.number="tree.rows"/>
            </label>
            <label class="field">
              <span>Spalten</span>
              <input type="number" min="1" max="20" class="form-control" v-model.number="tree.cols"/>
            </label>
          </div>

          <p class="hint">
            Leere Zelle anklicken, um einen Skill anzulegen. Skills lassen sich per Ziehen verschieben.
          </p>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped lang="scss">
.editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.editor-bar {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid color-mix(in srgb, var(--accent) 16%, rgba(255, 255, 255, 0.08));

  .title {
    font-family: var(--font-display);
    font-size: 1.1rem;
  }

  .spacer {
    flex: 1;
  }
}

.error-banner {
  margin: var(--space-3) var(--space-4) 0;
  padding: var(--space-3);
  border-radius: var(--radius-1);
  background: color-mix(in srgb, #ff5a5a 14%, transparent);
  border: 1px solid color-mix(in srgb, #ff5a5a 40%, transparent);
  color: color-mix(in srgb, #ff5a5a 80%, #ffffff);
  font-size: 0.85rem;
}

.editor-body {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 1fr 24rem;
  gap: var(--space-4);
  padding: var(--space-4);
}

.grid-area {
  min-width: 0;
  min-height: 0;
  display: flex;
  border-radius: var(--card-border-radius);
  background:
    radial-gradient(800px 400px at 30% 0%, var(--accent-mute), transparent 60%),
    var(--bg-1);
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
}

.panel {
  overflow-y: auto;
  min-height: 0;
  padding: 0;
}

.meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4);
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);

  > span {
    font-size: 0.8rem;
    color: var(--text-2);
  }
}

.dims {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

.hint {
  font-size: 0.78rem;
  color: var(--text-3);
}

.btn.danger {
  color: color-mix(in srgb, #ff5a5a 85%, #ffffff);
  border-color: color-mix(in srgb, #ff5a5a 40%, transparent);
}

@media (max-width: 900px) {
  .editor-body {
    grid-template-columns: 1fr;
  }
}
</style>
