<script setup lang="ts">
import {computed} from 'vue'
import DbSymbol from '@/components/symbols/DbSymbol.vue'
import type {IDarkArt} from '@/libs/data/darkborne-data'

defineOptions({inheritAttrs: false})

const props = defineProps<{
  art: IDarkArt | string
  size?: string
  tint?: boolean
}>()

const file = computed(() => typeof props.art === 'string' ? props.art : props.art.key)
</script>

<template>
  <DbSymbol v-bind="$attrs" folder="arts" :file="file" :size="size" :tint="tint" />
</template>
