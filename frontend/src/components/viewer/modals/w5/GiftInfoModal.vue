<script setup lang="ts">
import { ref } from "vue"
import Modal from "@/components/modal/Modal.vue"
import {getGiftCategoryName, getRenownName, type IW5Gift} from "@/@types/w5.ts"

const show = ref(false)
const ability = ref<IW5Gift | null>(null)

function showModal(a: IW5Gift) {
  ability.value = a
  show.value = true
}

defineExpose({ showModal })
</script>

<template>
  <Modal :shown="show" @close="show = false">
    <div v-if="ability" class="ability-info">
      <h6 class="title">{{ ability.name }}</h6>
      <small><i>{{ ability.description }}</i></small>
      <hr />
      <small><b>Entstammung</b>: {{ getGiftCategoryName((ability as any).category) }}</small>
      <small><b>Ansehen ({{ (ability as any).totalRenown }})</b>: {{ getRenownName((ability as any).renown) }}</small>
      <hr />
      <span><b>Kosten</b>: {{ (ability as any).cost }}</span>
      <span><b>Aktion</b>: {{ (ability as any).action }}</span>
      <span v-if="(ability as any).pool"><b>Würfelvorräte</b>: {{ (ability as any).pool }}</span>
      <span><b>System</b>: <span v-html="(ability as any).system" /></span>
      <span><b>Dauer</b>: {{ (ability as any).duration }}</span>
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
