<script setup lang="ts">
import {computed} from 'vue'
import Squares from '@/components/progress/Squares.vue'
import IconButton from '@/components/IconButton.vue'

const props = defineProps<{
  value: number
  max: number
  hungerMax?: number
  agentId?: string
  compact?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:value', value: number): void
}>()

const hungerLimit = computed(() => props.hungerMax ?? 5)
const inHunger = computed(() => props.value < 0)
const shown = computed(() => Math.abs(props.value))
const limit = computed(() => (inHunger.value ? hungerLimit.value : props.max))

function apply(value: number) {
  const clamped = Math.max(-hungerLimit.value, Math.min(props.max, value))
  if (clamped !== props.value) {
    emit('update:value', clamped)
  }
}

function step(delta: number) {
  apply(props.value + delta)
}

function onBox(index: number) {
  const target = inHunger.value ? -index : index
  if (target === props.value) {
    apply(inHunger.value ? target + 1 : target - 1)
    return
  }
  apply(target)
}
</script>

<template>
  <div class="cruor-track" :class="{ hungry: inHunger, compact }">
    <div class="head">
      <b class="label">
        {{ inHunger ? "Hunger" : "Cruor" }}
        <slot name="tip" />
      </b>
      <div class="stepper">
        <IconButton
          icon="fa-minus"
          :data-agent="agentId ? agentId + ':minus' : undefined"
          data-agent-label="Cruor senken"
          @click="step(-1)"
        />
        <span class="value">
          <span v-if="inHunger" class="sign">-</span>{{ shown }}
          <span class="scale">/ {{ limit }}</span>
        </span>
        <IconButton
          icon="fa-plus"
          :data-agent="agentId ? agentId + ':plus' : undefined"
          data-agent-label="Cruor erhöhen"
          @click="step(1)"
        />
      </div>
    </div>

    <Squares
      :max="limit"
      :amount="shown"
      :margin-at="inHunger ? -1 : 6"
      :agent-id="agentId"
      :agent-label="inHunger ? 'Hunger auf' : 'Cruor auf'"
      @click="onBox"
    />

    <small class="foot">
      <template v-if="inHunger">
        Jeder Hungerpunkt ist ein Blutwürfel in jedem Wurf. Ein sechster bedeutet Hungerstarre.
      </template>
      <template v-else>
        Unter 0 wird aus dem Vorrat Hunger. Der Zähler läuft weiter, die Überschrift wechselt.
      </template>
    </small>
  </div>
</template>

<style scoped lang="scss">
.cruor-track {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.label {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.stepper {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.value {
  min-width: 4.5rem;
  text-align: center;
  font-weight: 700;
  font-size: 1.1rem;
}

.value .sign {
  opacity: 0.4;
  font-weight: 400;
}

.value .scale {
  opacity: 0.6;
  font-weight: 400;
  font-size: 0.85rem;
}

.foot {
  opacity: 0.7;
  font-style: italic;
}

.cruor-track.hungry :deep(.square.active) {
  background: color-mix(in srgb, #b3123b 75%, var(--accent));
  border-color: color-mix(in srgb, #b3123b 60%, rgba(255, 255, 255, 0.2));
}

.cruor-track.compact .foot {
  display: none;
}

.cruor-track.compact .value {
  min-width: 3.5rem;
  font-size: 1rem;
}
</style>
