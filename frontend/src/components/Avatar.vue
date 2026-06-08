<script setup lang="ts">
import {AvatarOrientation} from "@/@types/gameline.ts";

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  src: string
  draggable?: boolean
  orientation?: AvatarOrientation;
}>()

const emit = defineEmits<{
  (e: 'click', ev: MouseEvent): void
}>()

const realOrientation = computed(() => {
  if (!props.orientation) return AvatarOrientation.Center
  return props.orientation
})

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
    :class="{ 'not-draggable': !draggable, ['avatar-' + realOrientation]: true }"
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

  &.avatar-center {
    object-fit: cover;
    object-position: center;
  }

  &.avatar-top {
    object-fit: cover;
    object-position: top;
  }

  &.avatar-bottom {
    object-fit: cover;
    object-position: bottom;
  }
}
</style>
