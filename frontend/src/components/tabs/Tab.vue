<script setup lang="ts">
import { inject } from 'vue'
import VText from '@/components/text/VText.vue'

const props = defineProps<{
  value: any
  text: string
}>()

const getSelectedValue = inject<() => any>('tabs:getSelectedValue')!
const setSelectedValue = inject<(value: any) => void>('tabs:setSelectedValue')!

function onSelect() {
  setSelectedValue(props.value)
}
</script>

<template>
  <span class="tabs-tab" :class="{ active: getSelectedValue() === value }" role="button" tabindex="0" @click="onSelect">
    <VText :size="1.3" :text="text" />
  </span>
</template>

<style scoped lang="scss">
.tabs-tab {
  padding: 0.55rem 0.75rem;
  margin: 0.25rem;
  text-transform: uppercase;
  cursor: pointer;
  user-select: none;
  border-radius: 14px;
  border: 1px solid transparent;
  color: var(--text-2);
  background: transparent;
  min-height: var(--tap-min);
  display: inline-flex;
  align-items: center;
  transition: transform var(--dur-2) var(--ease-2), background var(--dur-2) var(--ease-2), border-color var(--dur-2) var(--ease-2),
  filter var(--dur-2) var(--ease-2);

  &:hover {
    color: var(--text-1);
    background: color-mix(in srgb, #ffffff 6%, transparent);
    border-color: rgba(255, 255, 255, 0.10);
    filter: brightness(1.04);
  }

  &:active {
    transform: translateY(1px) scale(0.99);
    filter: brightness(0.98);
  }

  &.active {
    color: var(--text-1);
    background:
      radial-gradient(260px 140px at 20% 10%, color-mix(in srgb, var(--accent) 18%, transparent), transparent 60%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.08), transparent 55%),
      linear-gradient(180deg, color-mix(in srgb, var(--accent) 10%, var(--bg-3)), var(--bg-1));
    border-color: color-mix(in srgb, var(--accent) 35%, rgba(255, 255, 255, 0.10));
    box-shadow: var(--shadow-hairline), 0 14px 40px color-mix(in srgb, var(--accent) 12%, rgba(0, 0, 0, 0.60));
  }
}
</style>
