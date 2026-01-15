<script setup lang="ts">
import { computed } from "vue"
import { useStore } from "@/app/store"

const props = withDefaults(
  defineProps<{
    icon?: string
  }>(),
  { icon: "fa-angles-up" },
)

defineEmits<{ (e: "click"): void }>()

const store = useStore()
const isLevelMode = computed(() => store.isLevelMode)
</script>

<template>
  <i class="fa-solid" :class="props.icon" v-bind="$attrs" v-if="isLevelMode" @click="$emit('click')"></i>
</template>

<style scoped lang="scss">
.fa-solid {
  cursor: pointer;
  &:hover {
    color: var(--primary-color);
  }
}
</style>
