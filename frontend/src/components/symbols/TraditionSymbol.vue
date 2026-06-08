<script setup lang="ts">
import SymbolImage from '@/components/symbols/SymbolImage.vue'
import type { IM20Tradition } from '@/@types/m20'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  tradition: IM20Tradition
}>()
</script>

<template>
  <SymbolImage v-bind="$attrs" variant="traditions" :file="`${tradition.id}`" ext="webp" fallback="/img/ankh.png" hideOnError />
</template>
