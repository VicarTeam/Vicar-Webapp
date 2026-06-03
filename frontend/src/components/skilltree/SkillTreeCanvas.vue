<script setup lang="ts">
import {computed} from "vue"
import type {ICharacter} from "@/@types/models"
import type {ICharacterSkillTreeState, ISkillNode} from "@/@types/skilltree"
import SkillNode from "@/components/skilltree/SkillNode.vue"
import DependencyLines from "@/components/skilltree/DependencyLines.vue"
import {skillTreeConstraintResolver} from "@/libs/resolvers/skilltree-constraint-resolver"
import {treeBackgroundStyle} from "@/libs/skilltree-background"

const props = defineProps<{
  char: ICharacter
  state: ICharacterSkillTreeState
  /** Knoten, der gerade freigeschaltet wurde (löst Pop-Animation aus). */
  pulsedId?: string | null
}>()

const emit = defineEmits<{
  (e: "node-click", node: ISkillNode): void
}>()

const CELL = 96
const GAP = 16
const stride = CELL + GAP

const tree = computed(() => props.state.treeSnapshot)
const width = computed(() => tree.value.cols * CELL + Math.max(0, tree.value.cols - 1) * GAP)
const height = computed(() => tree.value.rows * CELL + Math.max(0, tree.value.rows - 1) * GAP)

const bgStyle = computed(() => treeBackgroundStyle(tree.value))

function nodeState(node: ISkillNode): "unlocked" | "available" | "blocked" | "neutral" {
  if (props.state.unlockedSkillIds.includes(node.id)) return "unlocked"
  if (skillTreeConstraintResolver.isBlocked(props.char, props.state, node)) return "blocked"
  if (skillTreeConstraintResolver.canUnlock(props.char, props.state, node).ok) return "available"
  return "neutral"
}

const blockedIds = computed(() =>
  tree.value.nodes
    .filter(n => !props.state.unlockedSkillIds.includes(n.id)
      && skillTreeConstraintResolver.isBlocked(props.char, props.state, n))
    .map(n => n.id),
)

function cellStyle(node: ISkillNode) {
  return {
    left: `${node.col * stride}px`,
    top: `${node.row * stride}px`,
    width: `${CELL}px`,
    height: `${CELL}px`,
  }
}
</script>

<template>
  <div class="canvas-scroll">
    <div class="canvas" :style="{width: `${width}px`, height: `${height}px`}">
      <div v-if="bgStyle" class="bg-layer" :style="bgStyle"></div>

      <DependencyLines
        :nodes="tree.nodes"
        :rows="tree.rows"
        :cols="tree.cols"
        :cell="CELL"
        :gap="GAP"
        :unlocked-ids="state.unlockedSkillIds"
        :blocked-ids="blockedIds"
      />

      <div
        v-for="node in tree.nodes"
        :key="node.id"
        class="node-slot"
        :style="cellStyle(node)"
      >
        <SkillNode
          :node="node"
          :state="nodeState(node)"
          :pulse="node.id === pulsedId"
          @click="emit('node-click', node)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.canvas-scroll {
  width: 100%;
  height: 100%;
  overflow: auto;
  padding: var(--space-5);
  -webkit-overflow-scrolling: touch;
}

.canvas {
  position: relative;
  margin: auto;
}

.bg-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.node-slot {
  position: absolute;
}
</style>
