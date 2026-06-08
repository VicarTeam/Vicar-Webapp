<script setup lang="ts">
import {inject} from "vue";

const props = withDefaults(
  defineProps<{
    content?: any
    title?: any
    override?: boolean
    danger?: boolean
  }>(),
  {
    content: "",
    title: null,
    override: false,
    danger: false,
  }
)

const emit = defineEmits<{
  (e: "click"): void
}>()

const showTip = inject<(content: any, title?: any) => void>("show-tip")

function click() {
  if (props.override) {
    emit("click")
    return
  }
  showTip?.(props.content, props.title)
}
</script>

<template>
  <i
    class="fa-solid tip-btn"
    :class="{ danger: danger, 'fa-circle-question': !danger, 'fa-triangle-exclamation': danger }"
    @click="click"
  ></i>
</template>

<style scoped lang="scss">
.tip-btn {
  cursor: pointer;
  font-size: 1.15em;
  line-height: 1;
  padding: 0.35rem;
  border-radius: 0.6rem;
  transition: transform 120ms ease, filter 160ms ease, color 160ms ease, background-color 160ms ease;
  &:hover {
    color: var(--primary-color);
    background-color: rgba(255, 255, 255, 0.06);
    transform: translateY(-1px);
  }
  &:active {
    transform: translateY(0);
  }
  &.danger {
    color: var(--primary-color-light);
    &:hover {
      color: var(--primary-color);
    }
  }
}
</style>
