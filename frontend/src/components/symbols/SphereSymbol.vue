<script setup lang="ts">
import SymbolImage from '@/components/symbols/SymbolImage.vue'
import type { M20Sphere } from '@/@types/m20'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  sphere: M20Sphere
}>()
</script>

<template>
  <SymbolImage v-bind="$attrs" variant="spheres" :file="`${sphere}`" ext="webp" fallback="/img/ankh.png" hideOnError />
</template>
