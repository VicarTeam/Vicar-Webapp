<script setup lang="ts">
defineOptions({ inheritAttrs: false })

defineProps<{
  disabled?: boolean
  hard?: boolean
}>()
</script>

<template>
  <div class="blur" :class="{ disabled: !!disabled, hard: !!hard }" v-bind="$attrs">
    <slot></slot>
  </div>
</template>

<style scoped lang="scss">
.blur {
  width: 100%;
  height: 100dvh;
  background-color: rgba(0, 0, 0, 0.55);
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-x: hidden;
  overflow-y: auto;
  padding: var(--space-4);
  animation: vicarFadeIn var(--dur-3) var(--ease-2);
}

.blur.disabled {
  background-color: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.blur.hard {
  background-color: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(0.65rem) saturate(130%);
  -webkit-backdrop-filter: blur(0.65rem) saturate(130%);
}

@keyframes vicarFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (max-width: 520px) {
  .blur {
    padding: var(--space-3);
    align-items: flex-start;
  }
}
</style>
