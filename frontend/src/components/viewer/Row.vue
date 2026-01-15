<script setup lang="ts">
withDefaults(
  defineProps<{
    wrap?: boolean
    gap?: string
    stackAt?: number
  }>(),
  { wrap: false, stackAt: 900 }
)
</script>

<template>
  <div
    class="row"
    :class="{ wrap }"
    :style="{ gap }"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<style scoped lang="scss">
.row {
  display: flex;
  flex-direction: row;
  align-items: center;
  min-width: 0;
}

.row.wrap {
  flex-wrap: wrap;
}

@media (max-width: 900px) {
  .row.wrap {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
