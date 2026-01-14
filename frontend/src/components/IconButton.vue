<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const props = defineProps<{
  icon: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'click', ev: MouseEvent): void
}>()

function onClick(ev: MouseEvent) {
  if (props.disabled) return
  emit('click', ev)
}
</script>

<template>
  <span class="icon-btn" :class="{ disabled: !!disabled }" v-bind="$attrs" role="button" tabindex="0" @click="onClick">
    <i class="fa-solid" :class="icon"></i>
  </span>
</template>

<style scoped lang="scss">
.icon-btn {
  border: 1px solid color-mix(in srgb, var(--accent) 55%, rgba(255, 255, 255, 0.10));
  color: color-mix(in srgb, var(--accent) 85%, #ffffff);
  border-radius: 999px;
  width: max(var(--tap-min), 3rem);
  height: max(var(--tap-min), 3rem);
  padding: 0.5rem;
  cursor: pointer;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.08), transparent 55%),
    linear-gradient(180deg, var(--bg-3), var(--bg-2));
  box-shadow: var(--shadow-hairline), 0 12px 30px rgba(0, 0, 0, 0.45);
  transition: transform var(--dur-2) var(--ease-2), filter var(--dur-2) var(--ease-2), border-color var(--dur-2) var(--ease-2),
  box-shadow var(--dur-2) var(--ease-2);

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  &:hover {
    filter: brightness(1.05);
    border-color: color-mix(in srgb, var(--accent) 70%, rgba(255, 255, 255, 0.12));
    box-shadow: var(--shadow-hairline), 0 18px 44px color-mix(in srgb, var(--accent) 16%, rgba(0, 0, 0, 0.60));
  }

  &:active {
    transform: translateY(1px) scale(0.99);
    filter: brightness(0.98);
  }
}
</style>
