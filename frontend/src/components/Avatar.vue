<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const props = defineProps<{
  src: string
  draggable?: boolean
}>()

const emit = defineEmits<{
  (e: 'click', ev: MouseEvent): void
}>()

const realSrc = computed(() => {
  if (!props.src || props.src.trim().length === 0) return '/img/placeholder.jpg'
  return props.src
})

import { computed } from 'vue'
</script>

<template>
  <img
    :src="realSrc"
    class="avatar"
    v-bind="$attrs"
    @click="emit('click', $event)"
    :class="{ 'not-draggable': !draggable }"
  />
</template>

<style scoped lang="scss">
.avatar {
  border-radius: 999px;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  box-shadow: var(--shadow-hairline), 0 14px 44px rgba(0, 0, 0, 0.55);

  &.not-draggable {
    -webkit-user-drag: none;
    user-select: none;
  }
}
</style>
