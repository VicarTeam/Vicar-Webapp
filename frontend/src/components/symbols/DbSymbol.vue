<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import {getImageUrl} from '@/libs/assets'

defineOptions({inheritAttrs: false})

const props = defineProps<{
  folder: 'houses' | 'arts'
  file: string
  size?: string
  tint?: boolean
}>()

const errored = ref(false)

watch(() => [props.folder, props.file], () => {
  errored.value = false
})

const src = computed(() => getImageUrl(`darkborne/${props.folder}`, `${props.file}.png`))
</script>

<template>
  <img
    v-if="!errored && file"
    v-bind="$attrs"
    class="db-symbol"
    :class="{ tinted: tint }"
    :style="size ? { width: size, height: size } : undefined"
    :src="src"
    alt=""
    draggable="false"
    @error="errored = true"
  />
</template>

<style scoped lang="scss">
.db-symbol {
  width: 100%;
  height: auto;
  object-fit: contain;
  -webkit-user-drag: none;
  transition: opacity var(--dur-2) var(--ease-2), transform var(--dur-2) var(--ease-2);
}

.db-symbol.tinted {
  filter: var(--image-to-accent-filter);
}
</style>
