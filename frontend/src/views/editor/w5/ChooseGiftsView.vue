<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import EditorForm from "@/components/editor/EditorForm.vue"
import TipButton from "@/components/editor/TipButton.vue"
import GiftInfoModal from "@/components/viewer/modals/w5/GiftInfoModal.vue"
import RiteInfoModal from "@/components/viewer/modals/w5/RiteInfoModal.vue"
import { getAvailableGiftsForCharacter, rites } from "@/app/data/w5"
import type { IW5Gift, IW5Rite, IWerewolfW5Sheet } from "@/@types/w5"
import { W5GiftCategory } from "@/@types/w5"
import { useStore } from "@/app/store"

const store = useStore()
const editingCharacter = computed(() => store.editingCharacter as IWerewolfW5Sheet | undefined)

const giftInfoModal = ref<InstanceType<typeof GiftInfoModal> | null>(null)
const riteInfoModal = ref<InstanceType<typeof RiteInfoModal> | null>(null)

const gifts = ref<IW5Gift[]>([])

const nativeGift = ref<IW5Gift | null>(null)
const auspiceGift = ref<IW5Gift | null>(null)
const tribeGift = ref<IW5Gift | null>(null)
const rite = ref<IW5Rite | null>(null)

onMounted(() => {
  if (!editingCharacter.value) return
  gifts.value = getAvailableGiftsForCharacter(editingCharacter.value)
})

function isGiftSelected(g: IW5Gift) {
  return nativeGift.value?.id === g.id || auspiceGift.value?.id === g.id || tribeGift.value?.id === g.id
}

function openGiftInfo(g: IW5Gift) {
  giftInfoModal.value?.showModal(g)
}

function openRiteInfo(r: IW5Rite) {
  riteInfoModal.value?.showModal(r)
}

const charactersRenown = computed(() => {
  const char = editingCharacter.value
  if (!char) return 0
  return (char.renown || []).reduce((acc, r) => acc + (r.value ?? 0), 0)
})

const selectableNativeGifts = computed(() => {
  const char = editingCharacter.value
  if (!char) return []
  return gifts.value
    .filter(g => g.category === W5GiftCategory.Native && !isGiftSelected(g) && charactersRenown.value >= g.totalRenown)
    .sort((a, b) => a.totalRenown === b.totalRenown ? a.name.localeCompare(b.name) : a.totalRenown - b.totalRenown)
})

const selectableAuspiceGifts = computed(() => {
  const char = editingCharacter.value
  if (!char) return []
  return gifts.value
    .filter(g => g.category === W5GiftCategory.Auspice && !isGiftSelected(g) && charactersRenown.value >= g.totalRenown)
    .sort((a, b) => a.totalRenown === b.totalRenown ? a.name.localeCompare(b.name) : a.totalRenown - b.totalRenown)
})

const selectableTribeGifts = computed(() => {
  const char = editingCharacter.value
  if (!char) return []
  return gifts.value
    .filter(g => g.category === W5GiftCategory.Tribal && !isGiftSelected(g) && charactersRenown.value >= g.totalRenown)
    .sort((a, b) => a.totalRenown === b.totalRenown ? a.name.localeCompare(b.name) : a.totalRenown - b.totalRenown)
})

const selectableRites = computed(() => {
  return rites.filter(r => r.id !== (rite.value?.id ?? -1))
})

function onBeforeNext() {
  const char = editingCharacter.value
  if (!char) return

  if (nativeGift.value) char.selectedGifts.push({ ...nativeGift.value })
  if (auspiceGift.value) char.selectedGifts.push({ ...auspiceGift.value })
  if (tribeGift.value) char.selectedGifts.push({ ...tribeGift.value })
  if (rite.value) char.selectedRites.push({ ...rite.value })
}

const canGoNext = computed(() => !!nativeGift.value && !!auspiceGift.value && !!tribeGift.value && !!rite.value)
</script>

<template>
  <EditorForm :can-go-next="canGoNext" :is-finish="true" @before-next="onBeforeNext">
    <div v-if="editingCharacter" class="outer">
      <div class="choose-gift-wrapper">
        <label class="required">
          Gaben <TipButton content="Gaben sind übernatürliche Kräfte, die du über Geistwesen, Stamm und Auspizium erlangst." />
          &amp;
          Riten <TipButton content="Riten sind Zeremonien und spirituelle Praktiken, die dir besondere Effekte ermöglichen." />
          :
        </label>

        <i>Wähle je eine Gabe (Nativ, Auspizium, Stamm) sowie einen Ritus.</i>

        <div class="gift-selection">
          <div class="card">
            <h5>Nativ:</h5>
            <select class="form-control" v-model="nativeGift">
              <option :value="null" disabled>Bitte wählen</option>
              <option v-for="g in selectableNativeGifts" :key="g.id" :value="g">{{ g.name }} ({{ g.totalRenown }})</option>
            </select>
            <small v-if="nativeGift">{{ nativeGift.description }}</small>
            <button v-if="nativeGift" class="btn btn-primary" @click="openGiftInfo(nativeGift)">Mehr lesen</button>
          </div>

          <div class="card">
            <h5>Auspizium:</h5>
            <select class="form-control" v-model="auspiceGift">
              <option :value="null" disabled>Bitte wählen</option>
              <option v-for="g in selectableAuspiceGifts" :key="g.id" :value="g">{{ g.name }} ({{ g.totalRenown }})</option>
            </select>
            <small v-if="auspiceGift">{{ auspiceGift.description }}</small>
            <button v-if="auspiceGift" class="btn btn-primary" @click="openGiftInfo(auspiceGift)">Mehr lesen</button>
          </div>

          <div class="card">
            <h5>Stamm:</h5>
            <select class="form-control" v-model="tribeGift">
              <option :value="null" disabled>Bitte wählen</option>
              <option v-for="g in selectableTribeGifts" :key="g.id" :value="g">{{ g.name }} ({{ g.totalRenown }})</option>
            </select>
            <small v-if="tribeGift">{{ tribeGift.description }}</small>
            <button v-if="tribeGift" class="btn btn-primary" @click="openGiftInfo(tribeGift)">Mehr lesen</button>
          </div>

          <div class="card">
            <h5>Ritus:</h5>
            <select class="form-control" v-model="rite">
              <option :value="null" disabled>Bitte wählen</option>
              <option v-for="r in selectableRites" :key="r.id" :value="r">{{ r.name }}</option>
            </select>
            <small v-if="rite">{{ rite.description }}</small>
            <button v-if="rite" class="btn btn-primary" @click="openRiteInfo(rite)">Mehr lesen</button>
          </div>
        </div>
      </div>

      <RiteInfoModal ref="riteInfoModal" />
      <GiftInfoModal ref="giftInfoModal" />
    </div>
  </EditorForm>
</template>

<style scoped lang="scss">
.outer {
  width: 100%;
  height: 100%;
  padding: 5rem;
  display: flex;
  justify-content: center;
}

.choose-gift-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  .gift-selection {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    gap: 2rem;
    margin-top: 1rem;

    .card {
      width: calc(100vw / 4 - 10rem);
      height: fit-content;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;

      h5 {
        margin: 0;
        font-weight: 800;
        font-size: 1.2rem;
      }

      small {
        text-align: left;
      }
    }
  }
}
</style>
