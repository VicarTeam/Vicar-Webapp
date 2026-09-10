<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '@/app/store'
import CharacterStorage from '@/libs/io/character-storage'
import type { ICharacter } from '@/@types/models'

defineOptions({ inheritAttrs: false })

const store = useStore()
const editingCharacter = computed(() => store.editingCharacter as ICharacter | undefined)

const dots = computed(() => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

const onRedPath = computed(() => (editingCharacter.value as any)?.cainsMarkLevel === -5)
const blockedDueToBlackPath = computed(() => (editingCharacter.value as any)?.cainsMarkLevel === 5)

function isFilled(nr: number) {
  return nr <= ((editingCharacter.value as any)?.humanity ?? 0)
}

function getStains() {
  return ((editingCharacter.value as any)?.stains ?? 0) as number
}

function isStain(nr: number) {
  const hum = ((editingCharacter.value as any)?.humanity ?? 0) as number
  return nr > hum && 10 - getStains() < nr
}

function onClick(nr: number, e: MouseEvent) {
  const ch = editingCharacter.value as any
  if (!ch) return
  if (blockedDueToBlackPath.value) return

  if (e.shiftKey) {
    const stain = 10 - (nr - 1)
    ch.stains = stain === ch.stains ? 0 : stain
  } else {
    ch.humanity = nr === ch.humanity ? 0 : nr
  }

  CharacterStorage.saveCharacter(ch, true)
}
</script>

<template>
  <div v-if="editingCharacter" class="humanity" :class="{ redpath: onRedPath, blackblocked: blockedDueToBlackPath }" v-bind="$attrs">
    <span
      v-for="i in dots"
      :key="i"
      class="square"
      :class="{ filled: isFilled(i), through: isStain(i), 'ml-10': i === 6 }"
      :data-agent="'set:humanity:' + i"
      :data-agent-label="'Menschlichkeit auf ' + i"
      @click="onClick(i, $event)"
    ></span>
  </div>
</template>

<style scoped lang="scss">
.humanity {
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

    &.filled {
      background: var(--accent);
      border-color: color-mix(in srgb, var(--accent) 55%, rgba(255, 255, 255, 0.12));
      box-shadow: var(--shadow-hairline), 0 14px 34px color-mix(in srgb, var(--accent) 14%, rgba(0, 0, 0, 0.55));
    }

    &.through {
      background:
        linear-gradient(
            to bottom left,
            transparent calc(50% - 2px),
            color-mix(in srgb, var(--accent) 88%, #ffffff) calc(50% - 1px),
            color-mix(in srgb, var(--accent) 88%, #ffffff) calc(50% + 1px),
            transparent calc(50% + 2px)
        )
        no-repeat 0 0 / 100px 100px;
      transform: rotate(90deg);
    }

    &:active {
      transform: translateY(1px) scale(0.98);
      filter: brightness(0.98);
    }
  }

  &.redpath .square {
    border-color: #fff093;

    &.filled {
      background:
        radial-gradient(240px 140px at 20% 10%, rgba(255, 240, 147, 0.30), transparent 60%),
        linear-gradient(180deg, rgba(255, 255, 255, 0.10), transparent 55%),
        linear-gradient(180deg, rgba(255, 240, 147, 0.35), rgba(255, 240, 147, 0.18));
      box-shadow: 0 0 10px rgba(255, 240, 147, 0.55);
    }

    &.through {
      background:
        linear-gradient(
            to bottom left,
            transparent calc(50% - 2px),
            #fff093 calc(50% - 1px),
            #fff093 calc(50% + 1px),
            transparent calc(50% + 2px)
        )
        no-repeat 0 0 / 100px 100px;
      transform: rotate(90deg);
    }
  }

  &.blackblocked {
    cursor: not-allowed;
    opacity: 0.7;

    .square {
      cursor: not-allowed;
      border-color: rgba(0, 0, 0, 0.9);

      &.filled {
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.07), transparent 55%),
          linear-gradient(180deg, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.78));
      }

      &.through {
        background:
          linear-gradient(to bottom left, transparent calc(50% - 2px), rgba(0, 0, 0, 0.95) calc(50% - 1px), rgba(0, 0, 0, 0.95) calc(50% + 1px), transparent calc(50% + 2px))
          no-repeat 0 0 / 100px 100px;
        transform: rotate(90deg);
      }
    }
  }
}

@media (max-width: 520px) {
  .humanity {
    gap: 0.4rem;

    .square {
      min-width: 16px;
      min-height: 16px;
    }
  }
}
</style>
