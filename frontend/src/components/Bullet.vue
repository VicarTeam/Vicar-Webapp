<script setup lang="ts">
defineOptions({ inheritAttrs: false })
</script>

<template>
  <span class="bullet" v-bind="$attrs">&#8226;</span>
</template>

<style scoped lang="scss">
.bullet {
  color: color-mix(in srgb, var(--accent) 88%, #ffffff);
}
</style>
