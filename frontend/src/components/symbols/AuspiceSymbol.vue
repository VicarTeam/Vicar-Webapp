<script setup lang="ts">
import SymbolImage from '@/components/symbols/SymbolImage.vue'
import type { IW5Auspice } from '@/@types/w5'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  auspice: IW5Auspice
}>()
</script>

<template>
  <SymbolImage
    v-bind="$attrs"
    variant="auspices"
    :file="`${auspice.key}`"
    ext="png"
    hideOnError
  />
</template>
