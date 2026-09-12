<script setup lang="ts">
import {computed} from 'vue'
import DbSymbol from '@/components/symbols/DbSymbol.vue'
import type {IDarkHouse} from '@/libs/data/darkborne-data'

defineOptions({inheritAttrs: false})

const props = defineProps<{
  house: IDarkHouse | string
  size?: string
  tint?: boolean
}>()

const file = computed(() => typeof props.house === 'string' ? props.house : props.house.key)
</script>

<template>
  <DbSymbol v-bind="$attrs" folder="houses" :file="file" :size="size" :tint="tint" />
</template>
