<script setup lang="ts">
import {computed} from "vue"
import type {ISkillNode} from "@/@types/skilltree"
import {resolveAssetUrl} from "@/libs/io/cdn"

defineOptions({inheritAttrs: false})

const props = withDefaults(defineProps<{
  node: ISkillNode
  /** Visueller Zustand des Knotens. */
  state?: "neutral" | "available" | "unlocked" | "locked" | "blocked"
  selected?: boolean
  /** Ressourcen-Kürzel für das Kosten-Badge (z.B. "EP"). */
  costLabel?: string
  showCost?: boolean
  /** Löst eine einmalige Freischalt-Animation aus. */
  pulse?: boolean
}>(), {
  state: "neutral",
  selected: false,
  costLabel: "",
  showCost: true,
  pulse: false,
})

const emit = defineEmits<{
  (e: "click", ev: MouseEvent): void
  (e: "pointerdown", ev: PointerEvent): void
}>()

const iconKind = computed<"fa" | "img" | "none">(() => {
  const icon = props.node.icon?.trim()
  if (!icon) return "none"
  if (icon.includes("fa-")) return "fa"
  if (icon.startsWith("data:") || icon.startsWith("http") || icon.startsWith("/")) return "img"
  return "none"
})
</script>

<template>
  <div
    class="skill-node"
    :class="[`state--${state}`, {selected, pulse}]"
    v-bind="$attrs"
    role="button"
    tabindex="0"
    @click="emit('click', $event)"
    @pointerdown="emit('pointerdown', $event)"
  >
    <div class="node-icon">
      <i v-if="iconKind === 'fa'" class="fa-solid" :class="node.icon"></i>
      <img v-else-if="iconKind === 'img'" :src="resolveAssetUrl(node.icon)" :alt="node.name" draggable="false"/>
      <i v-else class="fa-solid fa-star"></i>
    </div>

    <div class="node-name">{{ node.name || "Skill" }}</div>

    <div v-if="showCost && node.cost > 0" class="node-cost badge">
      {{ node.cost }}<span v-if="costLabel"> {{ costLabel }}</span>
    </div>

    <i v-if="state === 'locked'" class="lock-icon fa-solid fa-lock"></i>
    <i v-if="node.subTreeBonusCode" class="portal-icon fa-solid fa-diagram-project" title="Öffnet einen Sub-Baum"></i>
  </div>
</template>

<style scoped lang="scss">
.skill-node {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.4rem;
  border-radius: var(--radius-2);
  border: 1px solid color-mix(in srgb, var(--accent) 22%, rgba(255, 255, 255, 0.08));
  background:
    linear-gradient(180deg, var(--shine-2), transparent 55%),
    linear-gradient(180deg, var(--bg-3), var(--bg-2));
  box-shadow: var(--shadow-hairline);
  cursor: pointer;
  position: relative;
  text-align: center;
  user-select: none;
  transition: transform var(--dur-2) var(--ease-2), filter var(--dur-2) var(--ease-2),
  border-color var(--dur-2) var(--ease-2), box-shadow var(--dur-2) var(--ease-2), opacity var(--dur-3) var(--ease-2);

  &:hover {
    filter: brightness(1.06);
    border-color: var(--accent-border);
  }

  &.selected {
    border-color: var(--accent);
    box-shadow: 0 0 0 2px var(--accent-glow), var(--shadow-raise);
  }

  .node-icon {
    font-size: 1.4rem;
    color: color-mix(in srgb, var(--accent) 80%, #ffffff);
    line-height: 1;

    img {
      width: 1.8rem;
      height: 1.8rem;
      object-fit: contain;
    }
  }

  .node-name {
    font-size: 0.72rem;
    color: var(--text-2);
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .node-cost {
    position: absolute;
    top: -0.5rem;
    right: -0.5rem;
    font-size: 0.62rem;
    padding: 0.1rem 0.4rem;
  }

  .lock-icon {
    position: absolute;
    bottom: -0.4rem;
    right: -0.4rem;
    font-size: 0.7rem;
    color: var(--text-3);
    background: var(--bg-1);
    border-radius: 999px;
    padding: 0.25rem;
  }

  .portal-icon {
    position: absolute;
    bottom: -0.4rem;
    left: -0.4rem;
    font-size: 0.7rem;
    color: color-mix(in srgb, var(--accent) 75%, #ffffff);
    background: var(--bg-1);
    border-radius: 999px;
    padding: 0.25rem;
  }
}

/* --- Zustände --- */
.state--available {
  border-color: var(--accent-border);
  box-shadow: 0 0 18px var(--accent-mute), var(--shadow-hairline);

  .node-name {
    color: var(--text-1);
  }
}

.state--unlocked {
  border-color: var(--accent);
  background:
    radial-gradient(120px 80px at 50% 0%, var(--accent-mute), transparent 70%),
    linear-gradient(180deg, var(--bg-3), var(--bg-2));
  box-shadow: 0 12px 34px var(--accent-glow), var(--shadow-hairline);

  .node-icon {
    color: var(--accent-contrast);
  }

  .node-name {
    color: var(--text-1);
  }
}

.state--locked {
  border-color: var(--accent);
  opacity: 0.95;
}

.state--blocked {
  opacity: 0.4;
  filter: grayscale(0.7);
  cursor: not-allowed;
}

.skill-node.pulse {
  animation: st-node-pop var(--dur-3) var(--ease-2);
  z-index: 2;
}

@keyframes st-node-pop {
  0% {
    transform: scale(0.6);
    box-shadow: 0 0 0 var(--accent-glow);
  }
  45% {
    transform: scale(1.18);
    box-shadow: 0 0 44px var(--accent), 0 0 0 3px var(--accent-glow);
  }
  100% {
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .skill-node.pulse {
    animation: none;
  }
}
</style>
