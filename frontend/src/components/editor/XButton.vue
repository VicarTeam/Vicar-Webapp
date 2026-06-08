<script setup lang="ts">
const emit = defineEmits<{
  (e: "click"): void
}>()
</script>

<template>
  <i class="fa-solid fa-xmark close-icon" @click="emit('click')"></i>
</template>

<style scoped lang="scss">
.close-icon {
  cursor: pointer;
  font-size: 1.15em;
  line-height: 1;
  padding: 0.35rem;
  border-radius: 0.6rem;
  transition: transform 120ms ease, filter 160ms ease, color 160ms ease, background-color 160ms ease;
  &:hover {
    color: var(--primary-color);
    background-color: rgba(255, 255, 255, 0.06);
    transform: translateY(-1px);
  }
  &:active {
    transform: translateY(0);
  }
}
</style>
