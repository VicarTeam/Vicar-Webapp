<script setup lang="ts">
withDefaults(
  defineProps<{
    grow?: boolean
    shrink?: boolean
    centerVertically?: boolean
    centerHorizontally?: boolean
    basis?: string
  }>(),
  { basis: "0" }
)
</script>

<template>
  <div
    v-bind="$attrs"
    class="col"
    :class="{
      grow,
      shrink,
      'center-vertically': centerVertically,
      'center-horizontally': centerHorizontally,
    }"
    :style="{ flexBasis: basis }"
  >
    <slot />
  </div>
</template>

<style scoped lang="scss">
.col {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.col.grow {
  flex-grow: 1;
}

.col.shrink {
  flex-shrink: 0;
}

.col.center-vertically {
  align-items: center;
}

.col.center-horizontally {
  justify-content: center;
}

@media (max-width: 900px) {
  .col {
    width: 100%;
  }
}
</style>
