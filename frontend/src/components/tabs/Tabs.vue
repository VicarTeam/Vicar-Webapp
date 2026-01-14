<script setup lang="ts">
import { provide } from 'vue'

defineOptions({ inheritAttrs: false })

const model = defineModel<any>()

const emit = defineEmits<{
  (e: 'before-change', v: any): void
}>()

function setSelectedValue(v: any) {
  emit('before-change', v)

  model.value = v
}

function getSelectedValue() {
  return model.value
}

provide('tabs:setSelectedValue', setSelectedValue)
provide('tabs:getSelectedValue', getSelectedValue)
</script>

<template>
  <div class="tabs" v-bind="$attrs">
    <slot></slot>
  </div>
</template>

<style scoped lang="scss">
.tabs {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 0.75rem;
  border-bottom: 1px solid color-mix(in srgb, var(--accent) 45%, rgba(255, 255, 255, 0.10));
  padding-bottom: 0.25rem;
  flex-wrap: wrap;
}

@media (max-width: 520px) {
  .tabs {
    justify-content: flex-start;
    gap: 0.5rem;
  }
}
</style>
