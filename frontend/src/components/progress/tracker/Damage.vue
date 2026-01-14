<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useStore } from '@/app/store'
import CharacterStorage from '@/libs/io/character-storage'
import type { DamageType, ICharacter } from '@/@types/models'
import { DefaultDamageArray } from '@/@types/models'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  propKey: 'health' | 'willpower'
}>()

const store = useStore()
const editingCharacter = computed(() => store.editingCharacter as ICharacter | undefined)

const typesKey = computed(() => (props.propKey === 'health' ? 'healthDamage' : 'willpowerDamage'))

const fortitudeLevel = computed(() => {
  if (!editingCharacter.value || !store.isVampire) return 0
  for (const d of (editingCharacter.value as any).disciplines ?? []) {
    if (d?.discipline?.id === 7) return Math.min(d.currentLevel ?? 0, 5)
  }
  return 0
})

const hasResilience = computed(() => {
  if (!editingCharacter.value || !store.isVampire) return false
  for (const d of (editingCharacter.value as any).disciplines ?? []) {
    if (d?.discipline?.id === 7) return (d.abilities ?? []).some((a: any) => a?.id === 1)
  }
  return false
})

function getTypes(): DamageType[] {
  const ch = editingCharacter.value as any
  if (!ch) return [] as DamageType[]
  if (!ch[typesKey.value]) {
    ch[typesKey.value] = DefaultDamageArray()
    CharacterStorage.saveCharacter(ch)
  }
  return ch[typesKey.value] as DamageType[]
}

const dots = computed(() => {
  const base = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  if (props.propKey === 'health' && hasResilience.value) return [...base, 11, 12, 13, 14, 15]
  return base
})

function isDisabled(nr: number) {
  const ch = editingCharacter.value as any
  if (!ch) return true
  if (props.propKey === 'health' && hasResilience.value) return nr > (ch.health ?? 0) + fortitudeLevel.value
  return nr > (ch[props.propKey] ?? 0)
}

function getNext(type: DamageType): DamageType {
  if (type === (0 as any) || type === ('None' as any)) return 'Superficial' as any
  if (type === ('Superficial' as any)) return 'Heavy' as any
  if (type === ('Heavy' as any)) return 'Full' as any
  return 'None' as any
}

function onClick(nr: number) {
  const ch = editingCharacter.value as any
  if (!ch) return
  if (isDisabled(nr)) return

  const types = getTypes()
  types[nr - 1] = getNext(types[nr - 1]!)
  CharacterStorage.saveCharacter(ch, true)
}

onMounted(() => {
  const ch = editingCharacter.value as any
  if (!ch) return
  if (!hasResilience.value) return
  if (!ch.healthDamage || ch.healthDamage.length <= 10) {
    ch.healthDamage ||= DefaultDamageArray()
    ch.healthDamage.push(...['None', 'None', 'None', 'None', 'None'] as any)
    CharacterStorage.saveCharacter(ch)
  }
})

function getClasses(nr: number) {
  const types = getTypes()
  const t = types[nr - 1]
  return {
    mll: nr === 6,
    disabled: isDisabled(nr),
    full: t === ('Full' as any),
    superficial: t === ('Superficial' as any),
    heavy: t === ('Heavy' as any)
  }
}
</script>

<template>
  <div v-if="editingCharacter" class="damage" :class="{ wrap: dots.length > 10 }" v-bind="$attrs">
    <span v-for="i in dots" :key="i" class="square" :class="getClasses(i)" @click="onClick(i)">
      <span class="for-cross"></span>
    </span>
  </div>
</template>

<style scoped lang="scss">
.damage {
  display: flex;
  gap: 0.4rem;
  align-items: center;
  user-select: none;
  flex-wrap: nowrap;
  touch-action: manipulation;

  &.wrap {
    flex-wrap: wrap;
  }

  .square {
    position: relative;
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
    transition: transform var(--dur-2) var(--ease-2), filter var(--dur-2) var(--ease-2), opacity var(--dur-2) var(--ease-2);

    &.mll {
      margin-left: 1rem;
    }

    &.disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    &:not(.disabled):active {
      transform: translateY(1px) scale(0.98);
      filter: brightness(0.98);
    }

    &.full {
      background:
        radial-gradient(240px 140px at 20% 10%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 60%),
        linear-gradient(180deg, rgba(255, 255, 255, 0.10), transparent 55%),
        linear-gradient(180deg, color-mix(in srgb, var(--accent) 18%, var(--bg-3)), var(--bg-2));
      border-color: color-mix(in srgb, var(--accent) 55%, rgba(255, 255, 255, 0.12));
      box-shadow: var(--shadow-hairline), 0 14px 34px color-mix(in srgb, var(--accent) 14%, rgba(0, 0, 0, 0.55));
    }

    &.superficial {
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

    &.heavy {
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

      .for-cross {
        display: block;
        position: absolute;
        inset: 0;
        transform: rotate(-90deg);
        background:
          linear-gradient(
              to bottom left,
              transparent calc(50% - 2px),
              color-mix(in srgb, var(--accent) 88%, #ffffff) calc(50% - 1px),
              color-mix(in srgb, var(--accent) 88%, #ffffff) calc(50% + 1px),
              transparent calc(50% + 2px)
          )
          no-repeat 0 0 / 100px 100px;
      }
    }

    .for-cross {
      display: none;
    }
  }
}

@media (max-width: 520px) {
  .damage {
    gap: 0.35rem;

    .square {
      min-width: 16px;
      min-height: 16px;
    }

    .square.mll {
      margin-left: 0.7rem;
    }
  }
}
</style>
