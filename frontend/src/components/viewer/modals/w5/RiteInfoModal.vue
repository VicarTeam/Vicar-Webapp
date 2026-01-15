<script setup lang="ts">
import { ref } from "vue"
import Modal from "@/components/modal/Modal.vue"
import type { IW5Rite } from "@/@types/w5.ts"

const show = ref(false)
const ability = ref<IW5Rite | null>(null)

function showModal(a: IW5Rite) {
  ability.value = a
  show.value = true
}

defineExpose({ showModal })
</script>

<template>
  <Modal :shown="show" @close="show = false">
    <div v-if="ability" class="ability-info">
      <h6 class="title">{{ ability.name }}</h6>
      <small><i>{{ (ability as any).description }}</i></small>
      <hr />
      <small v-if="!(ability as any).pool || !(ability as any).system">
        <b>Sozialer Ritus</b>: Soziale Riten haben nicht zwangsläufig einen mechanischen Effekt, sind aber wichtig für die Kultur der Garou. Sie helfen, Beziehungen zu stärken, Respekt zu zeigen und die Gemeinschaft zu festigen.
      </small>
      <span v-if="(ability as any).pool"><b>Würfelpool</b>: {{ (ability as any).pool }}</span>
      <span v-if="(ability as any).system"><b>System</b>: <span v-html="(ability as any).system" /></span>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.ability-info {
  width: 100%;
  max-height: min(60vh, 50rem);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  gap: 1rem;
  -webkit-overflow-scrolling: touch;
}

.title {
  margin-bottom: 0;
}
</style>
