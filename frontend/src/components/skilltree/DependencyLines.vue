<script setup lang="ts">
import {computed, onMounted, onUnmounted, ref} from "vue"
import {DependencyKind, DependencyStyle, type ISkillNode} from "@/@types/skilltree"

/**
 * SVG-Overlay, das die Abhängigkeitslinien zwischen Skills zeichnet.
 * Wird sowohl im Editor als auch im Viewer genutzt.
 *
 * Aktive Linien (beide Enden freigeschaltet) werden mit einem fließenden
 * Energie-Effekt + Partikel animiert; blockierte Linien verblassen.
 */
const props = withDefaults(defineProps<{
  nodes: ISkillNode[]
  rows: number
  cols: number
  /** Kantenlänge einer Zelle in px. */
  cell: number
  /** Abstand zwischen Zellen in px. */
  gap: number
  /** Wenn gesetzt: Linien zwischen zwei freigeschalteten Skills werden "aktiv" dargestellt. */
  unlockedIds?: string[]
  /** Knoten, die aktuell blockiert sind – zugehörige Linien verblassen. */
  blockedIds?: string[]
}>(), {
  gap: 16,
})

// Eindeutiges Präfix pro Instanz, damit mehrere Canvas-Overlays sich nicht stören.
let _counter = 0
const uid = ++_counter

interface Edge {
  id: string
  d: string
  kind: DependencyKind
  active: boolean
  blocked: boolean
}

const motionOk = ref(true)
let mq: MediaQueryList | null = null
function updateMotion() {
  motionOk.value = !(mq?.matches)
}

onMounted(() => {
  mq = window.matchMedia("(prefers-reduced-motion: reduce)")
  motionOk.value = !mq.matches
  mq.addEventListener?.("change", updateMotion)
})
onUnmounted(() => {
  mq?.removeEventListener?.("change", updateMotion)
})

const stride = computed(() => props.cell + props.gap)
const width = computed(() => props.cols * props.cell + Math.max(0, props.cols - 1) * props.gap)
const height = computed(() => props.rows * props.cell + Math.max(0, props.rows - 1) * props.gap)

function center(node: ISkillNode): { x: number; y: number } {
  return {
    x: node.col * stride.value + props.cell / 2,
    y: node.row * stride.value + props.cell / 2,
  }
}

function pathFor(style: DependencyStyle, x1: number, y1: number, x2: number, y2: number): string {
  switch (style) {
    case DependencyStyle.Square: {
      const midY = (y1 + y2) / 2
      return `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`
    }
    case DependencyStyle.Bezier: {
      const midY = (y1 + y2) / 2
      return `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`
    }
    case DependencyStyle.Diagonal:
    default:
      return `M ${x1} ${y1} L ${x2} ${y2}`
  }
}

const edges = computed<Edge[]>(() => {
  const result: Edge[] = []
  const byId = new Map(props.nodes.map(n => [n.id, n]))
  const unlocked = props.unlockedIds
  const blocked = props.blockedIds

  let i = 0
  for (const node of props.nodes) {
    const to = center(node)
    for (const dep of node.dependencies ?? []) {
      const source = byId.get(dep.fromSkillId)
      if (!source) continue
      const from = center(source)
      const active = !!unlocked && unlocked.includes(node.id) && unlocked.includes(source.id)
      const isBlocked = !active && !!blocked && (blocked.includes(node.id) || blocked.includes(source.id))
      result.push({
        id: `st-edge-${uid}-${i++}`,
        d: pathFor(dep.style, from.x, from.y, to.x, to.y),
        kind: dep.kind,
        active,
        blocked: isBlocked,
      })
    }
  }
  return result
})
</script>

<template>
  <svg
    class="dependency-lines"
    :viewBox="`0 0 ${width} ${height}`"
    :width="width"
    :height="height"
    preserveAspectRatio="none"
  >
    <g v-for="edge in edges" :key="edge.id">
      <path
        :id="edge.id"
        :d="edge.d"
        class="edge"
        :class="[`kind--${edge.kind}`, {active: edge.active, blocked: edge.blocked}]"
        fill="none"
      />

      <template v-if="edge.active && motionOk">
        <path :d="edge.d" class="edge-flow" fill="none"/>
        <circle r="3" class="particle">
          <animateMotion dur="2.2s" repeatCount="indefinite">
            <mpath :href="`#${edge.id}`"/>
          </animateMotion>
        </circle>
      </template>
    </g>
  </svg>
</template>

<style scoped lang="scss">
.dependency-lines {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: visible;
}

.edge {
  stroke: color-mix(in srgb, var(--accent) 35%, rgba(255, 255, 255, 0.10));
  stroke-width: 2;
  transition: stroke var(--dur-3) var(--ease-2), opacity var(--dur-3) var(--ease-2), filter var(--dur-3) var(--ease-2);
}

.kind--cosmetic {
  stroke-dasharray: 5 6;
  stroke: color-mix(in srgb, var(--accent) 22%, rgba(255, 255, 255, 0.08));
}

.edge.active {
  stroke: var(--accent);
  stroke-width: 3;
  filter: drop-shadow(0 0 6px var(--accent-glow));
}

.edge.blocked {
  opacity: 0.15;
  filter: grayscale(1);
}

.edge-flow {
  stroke: var(--accent-contrast);
  stroke-width: 2;
  stroke-dasharray: 5 15;
  opacity: 0.65;
  filter: drop-shadow(0 0 4px var(--accent-glow));
  animation: st-flow 0.9s linear infinite;
}

.particle {
  fill: var(--accent-contrast);
  filter: drop-shadow(0 0 5px var(--accent));
}

@keyframes st-flow {
  to {
    stroke-dashoffset: -20;
  }
}

@media (prefers-reduced-motion: reduce) {
  .edge-flow {
    animation: none;
  }
}
</style>
