<script setup lang="ts">
import Blur from '@/components/modal/Blur.vue'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<{
  shown?: boolean
  withClose?: boolean
  withBlur?: boolean
}>(), {
  shown: false,
  withClose: true,
  withBlur: true
})

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <Blur v-if="shown" :disabled="!withBlur" hard>
    <div class="modal-card card" v-bind="$attrs">
      <button v-if="withClose" type="button" class="modal-close iconbtn" @click="emit('close')">
        <i class="fa-solid fa-xmark"></i>
      </button>
      <div class="card-content">
        <slot></slot>
      </div>
    </div>
  </Blur>
</template>

<style scoped lang="scss">
.modal-card {
  width: min(46rem, calc(100vw - 2 * var(--space-4)));
  max-height: min(80dvh, 46rem);
  overflow-x: hidden;
  overflow-y: auto;
  margin: auto;
  position: relative;
  float: none;
}

.modal-close {
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  font-size: 1.25rem;
}

.card-content {
  padding: var(--space-4);
}

@media (max-width: 520px) {
  .modal-card {
    width: min(46rem, calc(100vw - 2 * var(--space-3)));
    max-height: 86dvh;
  }

  .card-content {
    padding: var(--space-3);
  }
}
</style>
