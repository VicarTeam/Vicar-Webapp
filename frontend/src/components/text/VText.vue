<script setup lang="ts">
const props = defineProps<{
  text: string
  size?: number
}>()

const firstLetter = computed(() => (props.text?.length ? props.text.charAt(0) : ''))
const restOfText = computed(() => (props.text?.length > 1 ? props.text.substring(1) : ''))

const firstSize = computed(() => `${(props.size ?? 1) + 0.2}rem`)
const restSize = computed(() => `${props.size ?? 1}rem`)

import { computed } from 'vue'
</script>

<template>
  <span class="vtext" :style="{ '--vtext-rest': restSize, '--vtext-first': firstSize }">
    <span class="first">{{ firstLetter }}</span>
    <span>{{ restOfText }}</span>
  </span>
</template>

<style scoped lang="scss">
.vtext {
  color: var(--text-1);
  text-transform: uppercase;
  font-weight: 800;
  font-size: var(--vtext-rest);
  font-family: "Cinzel", Serif;

  .first {
    font-weight: 900;
    color: color-mix(in srgb, var(--accent) 88%, #ffffff);
    font-size: var(--vtext-first);
  }
}
</style>
