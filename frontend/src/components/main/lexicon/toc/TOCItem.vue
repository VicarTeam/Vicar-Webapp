<script setup lang="ts">
import { inject } from "vue"

withDefaults(
  defineProps<{
    title: string
    paragraph: string
    icon?: string
  }>(),
  {
    icon: "",
  }
)

const emit = defineEmits<{
  (e: "iconclick"): void
}>()

const goToParagraph = inject<(paragraph: string) => void>("go-to-paragraph")
</script>

<template>
  <div class="toc-item">
    <span class="head">
      <span class="title toc-hoverable" @click="goToParagraph?.(paragraph)">{{ title }}</span>
      <i v-if="icon" class="icon fa-solid" :class="icon" @click="emit('iconclick')"></i>
    </span>
    <slot></slot>
  </div>
</template>

<style scoped lang="scss">
.toc-hoverable {
  &:hover {
    color: var(--primary-color-light);
  }
  &:active {
    color: var(--primary-color);
  }
}
.toc-item {
  width: 100%;
  padding: 1rem 0 1rem 1.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  user-select: none;
  font-weight: 800;
  .head {
    width: 100%;
    display: flex;
    align-content: center;
    gap: 0.5rem;
    .title {
      flex: 1 1 auto;
      min-height: 44px;
      display: flex;
      align-items: center;
    }
    .icon {
      flex: 0 0 auto;
      min-height: 44px;
      display: flex;
      align-items: center;
      padding: 0 0.5rem;
      border-radius: 0.6rem;
      transition: color 160ms ease, background-color 160ms ease, transform 140ms ease;
      &:hover {
        color: var(--primary-color);
        background-color: rgba(255, 255, 255, 0.06);
        transform: translateY(-1px);
      }
      &:active {
        transform: translateY(0);
      }
    }
  }
}

@media (max-width: 1000px) {
  .toc-item {
    padding: 0.5rem 0.75rem;
    width: auto;
  }
}
</style>
