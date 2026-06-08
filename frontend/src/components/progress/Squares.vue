<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '@/app/store'
import CharacterStorage from '@/libs/io/character-storage'
import type { ICharacter } from '@/@types/models'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  amount: number
  max?: number
  marginAt?: number
  targetType?: string
}>()

const emit = defineEmits<{
  (e: 'click', v: number): void
}>()

const store = useStore()
const editingCharacter = computed(() => store.editingCharacter as ICharacter | undefined)

const dots = computed(() => {
  const maxVal = Math.max(props.amount, props.max ?? 0)
  return Array.from({ length: maxVal }, (_, idx) => idx + 1)
})

const blockedDueToRedPathBloodPotency = computed(() => {
  if (props.targetType !== 'bloodpotency') return false
  const ch = editingCharacter.value as any
  return ch?.cainsMarkLevel === -5
})

function isMargin(i: number) {
  return i === (props.marginAt ?? -1)
}

function onClick(i: number) {
  if (blockedDueToRedPathBloodPotency.value) return
  emit('click', i)
  if (editingCharacter.value) CharacterStorage.saveCharacter(editingCharacter.value as any)
}
</script>

<template>
  <div class="squares" :class="{ bpblocked: blockedDueToRedPathBloodPotency }" v-bind="$attrs">
    <span
      v-for="i in dots"
      :key="i"
      class="square"
      :class="{ active: i <= amount, 'ml-10': isMargin(i) }"
      @click="onClick(i)"
    ></span>
  </div>
</template>

<style scoped lang="scss">
.squares {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  user-select: none;
  flex-wrap: wrap;
  touch-action: manipulation;

  .square {
    width: 1rem;
    height: 1rem;
    min-width: 18px;
    min-height: 18px;
    cursor: pointer;
    border-radius: 6px;
    border: 1px solid color-mix(in srgb, var(--accent) 55%, rgba(255, 255, 255, 0.10));
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.06), transparent 55%),
      linear-gradient(180deg, var(--bg-3), var(--bg-2));
    box-shadow: var(--shadow-hairline), 0 10px 22px rgba(0, 0, 0, 0.35);
    transition: transform var(--dur-2) var(--ease-2), filter var(--dur-2) var(--ease-2), border-color var(--dur-2) var(--ease-2);

    &.active {
      background: var(--accent);
      border-color: color-mix(in srgb, var(--accent) 55%, rgba(255, 255, 255, 0.12));
      box-shadow: var(--shadow-hairline), 0 14px 34px color-mix(in srgb, var(--accent) 14%, rgba(0, 0, 0, 0.55));
    }

    &:active {
      transform: translateY(1px) scale(0.98);
      filter: brightness(0.98);
    }
  }

  &.bpblocked {
    opacity: 0.35;
    cursor: not-allowed;

    .square {
      cursor: not-allowed;
      border-color: #fff093;

      &.active {
        background:
          radial-gradient(240px 140px at 20% 10%, rgba(255, 240, 147, 0.30), transparent 60%),
          linear-gradient(180deg, rgba(255, 255, 255, 0.10), transparent 55%),
          linear-gradient(180deg, rgba(255, 240, 147, 0.35), rgba(255, 240, 147, 0.18));
        box-shadow: 0 0 10px rgba(255, 240, 147, 0.55);
      }
    }
  }
}

@media (max-width: 520px) {
  .squares {
    gap: 0.4rem;

    .square {
      min-width: 16px;
      min-height: 16px;
    }
  }
}
</style>
