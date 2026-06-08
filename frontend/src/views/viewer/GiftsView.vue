<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useStore } from "@/app/store"
import type { IW5Gift, IWerewolfW5Sheet } from "@/@types/w5"
import { W5GiftCategory } from "@/@types/w5"
import { getAvailableGiftsForCharacter } from "@/app/data/w5"
import RiteInfoModal from "@/components/viewer/modals/w5/RiteInfoModal.vue"
import GiftInfoModal from "@/components/viewer/modals/w5/GiftInfoModal.vue"
import TipButton from "@/components/editor/TipButton.vue"
import GiftModal from "@/components/viewer/modals/leveling/GiftModal.vue"
import LevelButton from "@/components/viewer/LevelButton.vue"

const store = useStore()
const editingCharacter = computed(() => store.editingCharacter as IWerewolfW5Sheet | undefined)

const riteInfoModal = ref<InstanceType<typeof RiteInfoModal> | null>(null)
const giftInfoModal = ref<InstanceType<typeof GiftInfoModal> | null>(null)
const levelGiftModal = ref<InstanceType<typeof GiftModal> | null>(null)

const gifts = ref<IW5Gift[]>([])

onMounted(() => {
  if (!editingCharacter.value) return
  gifts.value = getAvailableGiftsForCharacter(editingCharacter.value)
})

const totalRenown = computed(() => {
  const c = editingCharacter.value
  if (!c) return 0
  return c.renown.reduce((sum, r) => sum + r.value, 0)
})

function sortedByRenownThenName(arr: IW5Gift[]) {
  return arr.slice().sort((a, b) => (a.totalRenown === b.totalRenown ? a.name.localeCompare(b.name) : a.totalRenown - b.totalRenown))
}

const nativeGifts = computed(() => {
  const c = editingCharacter.value
  if (!c) return []
  return sortedByRenownThenName(c.selectedGifts.filter(x => x.category === W5GiftCategory.Native))
})

const tribalGifts = computed(() => {
  const c = editingCharacter.value
  if (!c) return []
  return sortedByRenownThenName(c.selectedGifts.filter(x => x.category === W5GiftCategory.Tribal))
})

const auspiceGifts = computed(() => {
  const c = editingCharacter.value
  if (!c) return []
  return sortedByRenownThenName(c.selectedGifts.filter(x => x.category === W5GiftCategory.Auspice))
})

const charRites = computed(() => {
  const c = editingCharacter.value
  if (!c) return []
  return c.selectedRites.slice().sort((a, b) => a.name.localeCompare(b.name))
})

function levelNativeGifts() {
  const c = editingCharacter.value
  if (!c) return
  const available = sortedByRenownThenName(gifts.value.filter(x => x.category === W5GiftCategory.Native && x.totalRenown <= totalRenown.value))
  const neededXp = (nativeGifts.value.length + 1) * 2
  levelGiftModal.value?.showModal(W5GiftCategory.Native, neededXp, available)
}

function levelAuspiceGifts() {
  const c = editingCharacter.value
  if (!c) return
  const available = sortedByRenownThenName(gifts.value.filter(x => x.category === W5GiftCategory.Auspice && x.totalRenown <= totalRenown.value))
  const neededXp = (auspiceGifts.value.length + 1) * 2
  levelGiftModal.value?.showModal(W5GiftCategory.Auspice, neededXp, available)
}

function levelTribalGifts() {
  const c = editingCharacter.value
  if (!c) return
  const available = sortedByRenownThenName(gifts.value.filter(x => x.category === W5GiftCategory.Tribal && x.totalRenown <= totalRenown.value))
  const neededXp = (tribalGifts.value.length + 1) * 2
  levelGiftModal.value?.showModal(W5GiftCategory.Tribal, neededXp, available)
}

function levelRites() {
  const neededXp = 5
  levelGiftModal.value?.showModal(W5GiftCategory.Rite, neededXp)
}
</script>

<template>
  <div v-if="editingCharacter" class="gifts-view">
    <div class="card">
      <h5>
        Angeborene Gaben
        <LevelButton @click="levelNativeGifts()" />
      </h5>

      <small v-for="g in nativeGifts" :key="g.id">
        <span>{{ g.name }} ({{ g.totalRenown }})</span>
        <TipButton @click="giftInfoModal?.showModal(g)" :override="true" />
      </small>
    </div>

    <div class="card">
      <h5>
        Auspizium-Gaben
        <LevelButton @click="levelAuspiceGifts()" />
      </h5>

      <small v-for="g in auspiceGifts" :key="g.id">
        <span>{{ g.name }} ({{ g.totalRenown }})</span>
        <TipButton @click="giftInfoModal?.showModal(g)" :override="true" />
      </small>
    </div>

    <div class="card">
      <h5>
        Stammesgaben
        <LevelButton @click="levelTribalGifts()" />
      </h5>

      <small v-for="g in tribalGifts" :key="g.id">
        <span>{{ g.name }} ({{ g.totalRenown }})</span>
        <TipButton @click="giftInfoModal?.showModal(g)" :override="true" />
      </small>
    </div>

    <div class="card">
      <h5>
        Riten
        <LevelButton @click="levelRites()" />
      </h5>

      <small v-for="r in charRites" :key="r.id">
        <span>{{ r.name }}</span>
        <TipButton @click="riteInfoModal?.showModal(r)" :override="true" />
      </small>
    </div>

    <GiftModal ref="levelGiftModal" />
    <RiteInfoModal ref="riteInfoModal" />
    <GiftInfoModal ref="giftInfoModal" />
  </div>
</template>

<style scoped lang="scss">
.gifts-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 1rem;

  .card {
    width: calc(100vw / 4 - 10rem);
    height: fit-content;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    h5 {
      margin: 0;
      font-weight: bold;
      font-size: 1.2rem;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    }

    small {
      display: flex;
      justify-content: space-between;
    }
  }
}
</style>
