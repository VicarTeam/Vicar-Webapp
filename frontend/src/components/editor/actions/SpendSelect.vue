<script setup lang="ts">
import { computed, ref, watch } from "vue"

const props = defineProps<{
  max: number
  pool: number
}>()

const emit = defineEmits<{
  (e: "change", value: number): void
}>()

const selectedVal = ref(0)

const arr = computed(() => {
  const out: number[] = []
  for (let i = 1; i <= props.max; i++) out.push(i)
  return out
})

watch(
  () => props.pool,
  () => {
    if (selectedVal.value > props.pool) {
      selectedVal.value = props.pool < 0 ? 0 : props.pool
      emit("change", selectedVal.value)
    }
  }
)
</script>

<template>
  <select class="form-control spend-select" v-model.number="selectedVal" @change="emit('change', selectedVal)">
    <option :value="0">0</option>
    <option v-for="v in arr" :key="v" :value="v" :disabled="v > pool">{{ v }}</option>
  </select>
</template>

<style scoped lang="scss">
.spend-select {
  margin-left: auto;
  text-align: center;
  width: 8rem;
  min-height: 44px;
}
@media (max-width: 520px) {
  .spend-select {
    width: 7rem;
  }
}
</style>
