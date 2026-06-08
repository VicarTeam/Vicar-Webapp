<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  amount: number
  max?: number
  marginAt?: number
  renegade?: boolean
}>()

const dots = computed(() => {
  const maxVal = Math.max(props.amount, props.max ?? 0)
  return Array.from({ length: maxVal }, (_, idx) => idx + 1)
})

function isMargin(i: number) {
  return i === (props.marginAt ?? -1)
}
</script>

<template>
  <div class="dots" v-bind="$attrs">
    <span
      v-for="i in dots"
      :key="i"
      class="dot"
      :class="{
        active: i <= amount,
        'ml-10': isMargin(i),
        'vicar-renegade-border': !!renegade,
        'vicar-renegade-bg': !!renegade,
        glow: !!renegade
      }"
    ></span>
  </div>
</template>

<style scoped lang="scss">
.dots {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
  user-select: none;
  flex-wrap: wrap;
  touch-action: manipulation;

  .dot {
    border-radius: 999px;
    width: 0.7rem;
    height: 0.7rem;
    min-width: 14px;
    min-height: 14px;
    border: 1px solid color-mix(in srgb, var(--accent) 55%, rgba(255, 255, 255, 0.10));
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.06), transparent 55%),
      linear-gradient(180deg, var(--bg-3), var(--bg-2));
    box-shadow: var(--shadow-hairline), 0 10px 22px rgba(0, 0, 0, 0.35);
    transition: filter var(--dur-2) var(--ease-2), border-color var(--dur-2) var(--ease-2);

    &.active {
      background: var(--accent);
      border-color: color-mix(in srgb, var(--accent) 55%, rgba(255, 255, 255, 0.12));
      box-shadow: var(--shadow-hairline), 0 14px 34px color-mix(in srgb, var(--accent) 14%, rgba(0, 0, 0, 0.55));
    }
  }
}

@media (max-width: 520px) {
  .dots {
    gap: 0.4rem;

    .dot {
      min-width: 12px;
      min-height: 12px;
    }
  }
}
</style>
