<script setup lang="ts">
import {computed, onMounted, onUnmounted, ref} from "vue"
import type {ISkillNode, ISkillTree} from "@/@types/skilltree"
import SkillNode from "@/components/skilltree/SkillNode.vue"
import DependencyLines from "@/components/skilltree/DependencyLines.vue"
import {treeBackgroundStyle} from "@/libs/skilltree-background"

const props = defineProps<{
  tree: ISkillTree
  selectedNodeId: string | null
}>()

const emit = defineEmits<{
  (e: "select", nodeId: string): void
  (e: "add", pos: { row: number; col: number }): void
  (e: "move", payload: { id: string; row: number; col: number }): void
}>()

const CELL = 96
const GAP = 16
const stride = CELL + GAP

const gridEl = ref<HTMLElement | null>(null)

const width = computed(() => props.tree.cols * CELL + Math.max(0, props.tree.cols - 1) * GAP)
const height = computed(() => props.tree.rows * CELL + Math.max(0, props.tree.rows - 1) * GAP)

const bgStyle = computed(() => treeBackgroundStyle(props.tree))

const nodeAt = (row: number, col: number): ISkillNode | undefined =>
  props.tree.nodes.find(n => n.row === row && n.col === col)

function cellStyle(row: number, col: number) {
  return {
    left: `${col * stride}px`,
    top: `${row * stride}px`,
    width: `${CELL}px`,
    height: `${CELL}px`,
  }
}

// --- Drag & Drop (Pointer) -------------------------------------------------

const candidateId = ref<string | null>(null)
const pointerId = ref<number | null>(null)
const startX = ref(0)
const startY = ref(0)
const dragging = ref(false)
const ghostX = ref(0)
const ghostY = ref(0)
const draggedNode = computed(() => props.tree.nodes.find(n => n.id === candidateId.value) ?? null)

function onNodePointerDown(node: ISkillNode, e: PointerEvent) {
  if (e.button !== undefined && e.button !== 0) return
  candidateId.value = node.id
  pointerId.value = e.pointerId
  startX.value = e.clientX
  startY.value = e.clientY
  dragging.value = false
  ;(e.currentTarget as HTMLElement)?.setPointerCapture?.(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (candidateId.value === null) return
  if (pointerId.value !== null && e.pointerId !== pointerId.value) return

  if (!dragging.value) {
    const dist = Math.hypot(e.clientX - startX.value, e.clientY - startY.value)
    if (dist < 6) return
    dragging.value = true
  }

  ghostX.value = e.clientX
  ghostY.value = e.clientY
}

function cellFromPoint(x: number, y: number): { row: number; col: number } | null {
  const rect = gridEl.value?.getBoundingClientRect()
  if (!rect) return null
  const col = Math.floor((x - rect.left) / stride)
  const row = Math.floor((y - rect.top) / stride)
  if (row < 0 || col < 0 || row >= props.tree.rows || col >= props.tree.cols) return null
  return {row, col}
}

function onPointerUp(e: PointerEvent) {
  if (candidateId.value === null) return
  if (pointerId.value !== null && e.pointerId !== pointerId.value) return

  const id = candidateId.value

  if (!dragging.value) {
    emit("select", id)
  } else {
    const target = cellFromPoint(e.clientX, e.clientY)
    if (target && !nodeAt(target.row, target.col)) {
      emit("move", {id, row: target.row, col: target.col})
    }
  }

  candidateId.value = null
  pointerId.value = null
  dragging.value = false
}

onMounted(() => {
  window.addEventListener("pointermove", onPointerMove)
  window.addEventListener("pointerup", onPointerUp)
  window.addEventListener("pointercancel", onPointerUp)
})
onUnmounted(() => {
  window.removeEventListener("pointermove", onPointerMove)
  window.removeEventListener("pointerup", onPointerUp)
  window.removeEventListener("pointercancel", onPointerUp)
})
</script>

<template>
  <div class="grid-scroll">
    <div
      ref="gridEl"
      class="grid-canvas"
      :style="{width: `${width}px`, height: `${height}px`}"
    >
      <div v-if="bgStyle" class="bg-layer" :style="bgStyle"></div>

      <DependencyLines
        :nodes="tree.nodes"
        :rows="tree.rows"
        :cols="tree.cols"
        :cell="CELL"
        :gap="GAP"
      />

      <!-- Leere Zellen -->
      <template v-for="row in tree.rows" :key="`r${row}`">
        <button
          v-for="col in tree.cols"
          v-show="!nodeAt(row - 1, col - 1)"
          :key="`c${row}-${col}`"
          type="button"
          class="empty-cell"
          :style="cellStyle(row - 1, col - 1)"
          @click="emit('add', {row: row - 1, col: col - 1})"
          aria-label="Skill hinzufügen"
        >
          <i class="fa-solid fa-plus"></i>
        </button>
      </template>

      <!-- Belegte Zellen -->
      <div
        v-for="node in tree.nodes"
        :key="node.id"
        class="node-slot"
        :class="{dragging: dragging && candidateId === node.id}"
        :style="cellStyle(node.row, node.col)"
      >
        <SkillNode
          :node="node"
          state="neutral"
          :selected="selectedNodeId === node.id"
          @pointerdown="onNodePointerDown(node, $event)"
        />
      </div>
    </div>

    <teleport to="body">
      <div
        v-if="dragging && draggedNode"
        class="drag-ghost"
        :style="{left: `${ghostX}px`, top: `${ghostY}px`, width: `${CELL}px`, height: `${CELL}px`}"
      >
        <SkillNode :node="draggedNode" state="available" :show-cost="false"/>
      </div>
    </teleport>
  </div>
</template>

<style scoped lang="scss">
.grid-scroll {
  width: 100%;
  overflow: auto;
  padding: var(--space-5);
  -webkit-overflow-scrolling: touch;
}

.grid-canvas {
  position: relative;
  margin: auto;
}

.bg-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  border-radius: var(--radius-2);
}

.empty-cell {
  position: absolute;
  border: 1px dashed color-mix(in srgb, var(--accent) 25%, rgba(255, 255, 255, 0.08));
  border-radius: var(--radius-2);
  background: rgba(255, 255, 255, 0.015);
  color: var(--text-3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: border-color var(--dur-2) var(--ease-2), background var(--dur-2) var(--ease-2), color var(--dur-2) var(--ease-2);

  &:hover {
    border-color: var(--accent-border);
    background: var(--accent-mute);
    color: var(--text-1);
  }
}

.node-slot {
  position: absolute;

  &.dragging {
    opacity: 0.35;
  }
}

.drag-ghost {
  position: fixed;
  z-index: 99999;
  pointer-events: none;
  transform: translate(-50%, -50%);
}
</style>
