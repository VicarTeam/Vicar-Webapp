<script setup lang="ts">
import { ref } from "vue"
import TOCItem from "@/components/main/lexicon/toc/TOCItem.vue"

defineProps<{
  title: string
  paragraph: string
}>()

const open = ref(false)
</script>

<template>
  <TOCItem
    class="toc-menu"
    :title="title"
    :paragraph="paragraph"
    :icon="open ? 'fa-chevron-up' : 'fa-chevron-down'"
    @iconclick="open = !open"
  >
    <div class="items" v-if="open">
      <slot></slot>
    </div>
  </TOCItem>
</template>

<style scoped lang="scss">
.toc-menu {
  .items {
    width: 100%;
    display: flex;
    flex-direction: column;
    font-weight: normal !important;
  }
}
</style>
