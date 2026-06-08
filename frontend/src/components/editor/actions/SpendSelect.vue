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

const allowedMax = computed(() => Math.max(0, Math.min(props.max, selectedVal.value + props.pool)))

watch(
  () => props.pool,
  () => {
    if (selectedVal.value > allowedMax.value) {
      selectedVal.value = allowedMax.value
      emit("change", selectedVal.value)
    }
  }
)
</script>

<template>
  <select
    class="form-control spend-select"
    v-model.number="selectedVal"
    @change="emit('change', selectedVal)"
  >
    <option :value="0">0</option>

    <option
      v-for="v in arr"
      :key="v"
      :value="v"
      :disabled="v > allowedMax"
    >
      {{ v }}
    </option>
  </select>
</template>
