<script setup lang="ts">
import { computed } from "vue"

const props = defineProps<{
  difficulty?: number
  tips?: string[]
}>()

const difficultyName = computed(() => {
  switch (props.difficulty) {
    case 1:
      return "Leicht"
    case 2:
      return "Mittel"
    case 3:
      return "Schwer"
    default:
      return null
  }
})
</script>

<template>
  <div v-if="difficultyName || (tips && tips.length > 0)" class="dh">
    <span v-if="difficultyName" class="dh__badge" :class="`dh__badge--${difficulty}`">
      Schwierigkeit: {{ difficultyName }}
    </span>

    <ul v-if="tips && tips.length > 0" class="dh__tips">
      <li v-for="(tip, i) in tips" :key="i">{{ tip }}</li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.dh {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}

.dh__badge {
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: bold;
  border: 1px solid transparent;
  box-shadow: var(--shadow-hairline);
}

.dh__badge--1 {
  color: #8fdc8f;
  border-color: rgba(143, 220, 143, 0.45);
  background: rgba(143, 220, 143, 0.08);
}

.dh__badge--2 {
  color: #e8c66b;
  border-color: rgba(232, 198, 107, 0.45);
  background: rgba(232, 198, 107, 0.08);
}

.dh__badge--3 {
  color: #e07a7a;
  border-color: rgba(224, 122, 122, 0.45);
  background: rgba(224, 122, 122, 0.08);
}

.dh__tips {
  margin: 0;
  padding-left: 1.15rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.9rem;
  opacity: 0.92;
  text-align: left;
}
</style>
