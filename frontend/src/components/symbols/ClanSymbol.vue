<script setup lang="ts">
import SymbolImage from '@/components/symbols/SymbolImage.vue'
import type { IClan } from '@/@types/models'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  clan: IClan
}>()
</script>

<template>
  <SymbolImage
    v-bind="$attrs"
    className="clan-symbol"
    variant="clans"
    :file="`${clan.id}`"
    ext="png"
    fallback="/img/ankh.png"
  />
</template>
