<script setup lang="ts">
import type { IMdSegment } from "@/components/main/lexicon/lexicon-markdown"

defineProps<{
  segments: IMdSegment[]
}>()
</script>

<template>
  <template v-for="(seg, i) in segments" :key="i">
    <code v-if="seg.code" class="lx-code">{{ seg.text }}</code>
    <b v-else-if="seg.bold && seg.italic"><i>{{ seg.text }}</i></b>
    <b v-else-if="seg.bold">{{ seg.text }}</b>
    <i v-else-if="seg.italic">{{ seg.text }}</i>
    <template v-else>{{ seg.text }}</template>
  </template>
</template>

<style scoped lang="scss">
.lx-code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  background: rgba(255, 255, 255, 0.08);
  padding: 0.05em 0.3em;
  border-radius: 6px;
  font-size: 0.92em;
}
</style>
