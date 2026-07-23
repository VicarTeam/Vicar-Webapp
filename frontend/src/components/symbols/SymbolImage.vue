<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { getImageUrl } from '@/libs/assets'

defineOptions({ inheritAttrs: false })

type Variant =
  | 'auspices'
  | 'clans'
  | 'patron_spirits'
  | 'spheres'
  | 'traditions'
  | 'tribes'

const props = defineProps<{
  variant: Variant
  file: string
  ext?: string
  fallback?: string
  hideOnError?: boolean
  className?: string
}>()

const errored = ref(false)

// Fehlerzustand zurücksetzen, sobald sich die Quelle ändert – sonst bleibt ein
// einmal fehlgeschlagenes Bild (z.B. Blutlinie ohne Symbol) auch nach dem
// Wechsel zu einem gültigen Bild ausgeblendet.
watch(
  () => [props.variant, props.file],
  () => {
    errored.value = false
  }
)

const src = computed(() => {
  if (errored.value) return props.fallback ?? ''
  const ext = props.ext ?? 'webp'
  const filename = props.file.endsWith(`.${ext}`) ? props.file : `${props.file}.${ext}`
  return getImageUrl(props.variant, filename)
})

function onError() {
  errored.value = true
}
</script>

<template>
  <img
    v-bind="$attrs"
    :class="['subject-symbol', className, { errored }]"
    :src="src"
    alt=""
    @error="onError"
    draggable="false"
  />
</template>

<style scoped lang="scss">
.subject-symbol {
  width: 35%;
  height: auto;
  max-height: 15rem;
  margin: auto;
  object-fit: contain;
  float: left;
  -webkit-user-drag: none;
  filter: var(--image-to-accent-filter);
  opacity: 0.98;
  transform: translateZ(0);
  transition: opacity var(--dur-2) var(--ease-2), filter var(--dur-2) var(--ease-2);
}

.subject-symbol.errored {
  display: none;
}

@media (max-width: 520px) {
  .subject-symbol {
    width: 44%;
    max-height: 10rem;
  }
}
</style>
