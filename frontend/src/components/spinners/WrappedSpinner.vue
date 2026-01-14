<script setup lang="ts">
import Spinner from '@/components/spinners/Spinner.vue'

defineOptions({ inheritAttrs: false })
</script>

<template>
  <div class="loading-wrapper" v-bind="$attrs">
    <div class="loader">
      <Spinner />
      <slot></slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
.loading-wrapper {
  user-select: none;
  width: 100%;
  height: 100%;
  min-height: 12rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}

.loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
}
</style>
