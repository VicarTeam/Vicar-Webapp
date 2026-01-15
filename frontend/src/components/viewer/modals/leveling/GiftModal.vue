<script setup lang="ts">
import { computed, ref } from "vue"
import Modal from "@/components/modal/Modal.vue"
import Bullet from "@/components/Bullet.vue"
import CharacterStorage from "@/libs/io/character-storage"
import { LevelChangeType } from "@/@types/gameline"
import {getGiftCategoryName, getRenownName, type IW5Gift, type IW5Rite, type IWerewolfW5Sheet} from "@/@types/w5"
import { W5GiftCategory } from "@/@types/w5"
import { rites } from "@/app/data/w5"
import { useStore } from "@/app/store"

const store = useStore()

const show = ref(false)
const category = ref<W5GiftCategory>(W5GiftCategory.Rite)
const neededXp = ref(0)

const gifts = ref<IW5Gift[]>([])
const riteList = ref<IW5Rite[]>([])
const selected = ref<IW5Gift | IW5Rite | null>(null)

const editingCharacter = computed(() => store.editingCharacter as IWerewolfW5Sheet | undefined)

function showModal(cat: W5GiftCategory, xp: number, availableGifts?: IW5Gift[]) {
  const char = editingCharacter.value
  if (!char) return

  category.value = cat
  neededXp.value = xp
  selected.value = null

  const takenGifts = new Set((char.selectedGifts || []).map((g) => g.id))
  const takenRites = new Set((char.selectedRites || []).map((r) => r.id))

  gifts.value = (availableGifts || []).filter((g) => !takenGifts.has(g.id))
  riteList.value = rites.filter((r) => !takenRites.has(r.id)).sort((a, b) => a.name.localeCompare(b.name))

  show.value = true
}

function addSelected() {
  const char = editingCharacter.value
  const sel = selected.value
  if (!char || !sel) return
  if (char.exp < neededXp.value) return

  CharacterStorage.trackLevelChange(
    char as any,
    LevelChangeType.Gift,
    neededXp.value,
    `${category.value === W5GiftCategory.Rite ? "Ritus" : "Gabe"}: ${sel.name} hinzugefügt`,
  )

  if (category.value === W5GiftCategory.Rite) {
    char.selectedRites.push({ ...(sel as IW5Rite) })
  } else {
    char.selectedGifts.push({ ...(sel as IW5Gift) })
  }

  CharacterStorage.saveCharacter(char as any)
  show.value = false
}

defineExpose({ showModal })
</script>

<template>
  <Modal :shown="show" @close="show = false">
    <div v-if="editingCharacter" class="gift-modal">
      <h5 class="title">
        <span v-if="category === W5GiftCategory.Rite">Ritus hinzufügen <bullet /> {{ neededXp }} XP</span>
        <span v-else>{{ getGiftCategoryName(category) }} hinzufügen <bullet /> {{ neededXp }} XP</span>
      </h5>

      <select
        v-if="category !== W5GiftCategory.Rite"
        class="form-control"
        v-model="selected"
      >
        <option :value="null" disabled>Wähle eine Gabe</option>
        <option v-for="item in gifts" :key="item.id" :value="item">
          {{ item.name }} ({{ (item as any).totalRenown }})
        </option>
      </select>

      <select
        v-else
        class="form-control"
        v-model="selected"
      >
        <option :value="null" disabled>Wähle einen Ritus</option>
        <option v-for="item in riteList" :key="item.id" :value="item">
          {{ item.name }}
        </option>
      </select>

      <div v-if="selected && category !== W5GiftCategory.Rite" class="gift-info">
        <small><i>{{ (selected as any).description }}</i></small>
        <hr />
        <small><b>Entstammung</b>: {{ getGiftCategoryName((selected as any).category) }}</small>
        <small><b>Ansehen ({{ (selected as any).totalRenown }})</b>: {{ getRenownName((selected as any).renown) }}</small>
        <hr />
        <span><b>Kosten</b>: {{ (selected as any).cost }}</span>
        <span><b>Aktion</b>: {{ (selected as any).action }}</span>
        <span v-if="(selected as any).pool"><b>Würfelpool</b>: {{ (selected as any).pool }}</span>
        <span><b>System</b>: <span v-html="(selected as any).system" /></span>
        <span><b>Dauer</b>: {{ (selected as any).duration }}</span>
      </div>

      <div v-else-if="selected" class="gift-info">
        <small><i>{{ (selected as any).description }}</i></small>
        <hr />
        <small v-if="!(selected as any).pool || !(selected as any).system">
          <b>Sozialer Ritus</b>: Soziale Riten haben nicht zwangsläufig einen mechanischen Effekt, sind aber wichtig für die Kultur der Garou. Sie helfen, Beziehungen zu stärken, Respekt zu zeigen und die Gemeinschaft zu festigen.
        </small>
        <span v-if="(selected as any).pool"><b>Würfelvorräte</b>: {{ (selected as any).pool }}</span>
        <span v-if="(selected as any).system"><b>System</b>: <span v-html="(selected as any).system" /></span>
      </div>

      <div class="actions">
        <button
          v-if="editingCharacter.exp >= neededXp && selected"
          class="btn btn-primary"
          @click="addSelected"
        >
          Hinzufügen
        </button>
      </div>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.gift-modal {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.title {
  margin: 0;
  font-weight: bold;
  font-size: 1.2rem;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  padding-bottom: 0.5rem;
}

.gift-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: min(55vh, 30rem);
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

.actions {
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
