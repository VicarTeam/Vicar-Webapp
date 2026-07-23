<script setup lang="ts">
import SymbolImage from "@/components/symbols/SymbolImage.vue"
import type { IVdzClan } from "@/@types/vdz"

defineOptions({ inheritAttrs: false })

defineProps<{
  clan: IVdzClan
}>()
</script>

<template>
  <SymbolImage
    v-if="clan.symbolId"
    v-bind="$attrs"
    className="clan-symbol"
    variant="clans"
    :file="`${clan.symbolId}`"
    ext="png"
    fallback="/img/ankh.png"
  />
  <!-- Einträge ohne eigenes V5-Symbol (v.a. Blutlinien) zeigen sauber das Ankh. -->
  <img
    v-else
    v-bind="$attrs"
    class="clan-symbol subject-symbol"
    src="/img/ankh.png"
    alt=""
    draggable="false"
  />
</template>

<style scoped>
/* Fallback-Ankh mit derselben Färbung wie die echten Symbole. */
.subject-symbol {
  object-fit: contain;
  filter: var(--image-to-accent-filter);
}
</style>
