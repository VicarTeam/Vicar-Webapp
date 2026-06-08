<script setup lang="ts">
import SymbolImage from '@/components/symbols/SymbolImage.vue'
import type { IW5Tribe } from '@/@types/w5'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  tribe: IW5Tribe
}>()
</script>

<template>
  <SymbolImage v-bind="$attrs" variant="tribes" :file="`${tribe.id}`" ext="webp" fallback="/img/ankh.png" hideOnError />
</template>
