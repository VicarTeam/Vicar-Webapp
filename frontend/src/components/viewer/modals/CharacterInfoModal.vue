<script setup lang="ts">
import { computed, ref } from "vue"
import Modal from "@/components/modal/Modal.vue"
import BookSelection, { type ActivatableBook } from "@/components/editor/BookSelection.vue"
import CharacterStorage from "@/libs/io/character-storage.ts"
import { migrationResolver } from "@/libs/resolvers/migration-resolver.ts"
import { HomebrewIdOffset } from "@/libs/data/homebrew-manager.ts"
import DataManager from "@/libs/data/data-manager.ts"
import {defaultBooks, type IHomebrewDiscipline} from "@/@types/data.ts"
import {AvatarOrientation, GameLine} from "@/@types/gameline.ts"
import TipButton from "@/components/editor/TipButton.vue"
import LevelHistoryModal from "@/components/viewer/modals/LevelHistoryModal.vue"
import { type ICharacter, CurrentCharacterVersion } from "@/@types/models.ts"
import { useStore } from "@/app/store.ts"

const store = useStore()

const levelHistoryModal = ref<InstanceType<typeof LevelHistoryModal> | null>(null)

const show = ref(false)
const character = ref<ICharacter | null>(null)
const activatedBooks = ref<ActivatableBook[]>([])

const homebrewUpdating = ref(false)
const homebrewUpdated = ref(false)
const bonusCode = ref("")

const isVampire = computed(() => {
  const g = store.editingCharacter?.game
  return g === GameLine.Vampire || !g
})

const isHomebrewActive = computed(() => activatedBooks.value.some((b) => b.id >= HomebrewIdOffset && b.active))

function isNotUpToDate() {
  const c: any = character.value
  if (!c) return false
  return !c.version || c.version < (CurrentCharacterVersion as any)
}

function showModal(c: ICharacter) {
  character.value = c
  ;(character.value as any).fullCustomization = (character.value as any).fullCustomization || false

  if (isVampire.value) {
    ;(character.value as any).useAdavancedDisciplines = (character.value as any).useAdavancedDisciplines || false
    ;(character.value as any).allowLearningOfAllPowers = (character.value as any).allowLearningOfAllPowers || false
    activatedBooks.value = defaultBooks().map((b) => ({
      id: b.id,
      active: (character.value as any).books?.includes(b.id) ?? false,
    }))
  } else {
    activatedBooks.value = []
  }

  bonusCode.value = ""
  show.value = true
}

function save() {
  if (!character.value) return
  CharacterStorage.saveCharacter(character.value)
}

function migrateChar() {
  if (!character.value) return
  migrationResolver.migrate(character.value)
}

function openLevelHistory() {
  if (!character.value) return
  levelHistoryModal.value?.showModal(character.value)
}

async function updateHomebrewContent() {
  if (!character.value) return
  if (homebrewUpdating.value) return

  homebrewUpdated.value = false
  homebrewUpdating.value = true

  let success = false

  try {
    if (character.value.clan.id >= HomebrewIdOffset) {
      const updatedClan = DataManager.findAvailableClan((character.value as any).books, character.value.clan.id)
      if (updatedClan) character.value.clan = updatedClan
    }

    for (const d of character.value.disciplines) {
      if ((d.discipline as IHomebrewDiscipline).creator) {
        const updatedDiscipline = DataManager.normalDisciplinesAsArray().find(
          (disc) => disc.id === (d.discipline.id < HomebrewIdOffset ? d.discipline.id + HomebrewIdOffset : d.discipline.id),
        )
        if (updatedDiscipline) {
          d.discipline = updatedDiscipline

          const abilities = DataManager.normalDisciplineAbilitiesAsArray(d.discipline).flat()
          for (const a of d.abilities) {
            const newAbility = abilities.find((ab) => ab.id === a.id)
            if (newAbility) {
              a.name = (newAbility as any).name
              a.summary = (newAbility as any).summary
              a.costs = (newAbility as any).costs
              a.system = (newAbility as any).system
              a.alternatives = (newAbility as any).alternatives
              a.duration = (newAbility as any).duration
              a.combination = (newAbility as any).combination
              a.diceSupplies = (newAbility as any).diceSupplies
              a.requirement = (newAbility as any).requirement
              a.minBloodPotency = (newAbility as any).minBloodPotency
            }
          }
        }
      }
    }

    save()
    success = true
  } catch (e) {
    console.error(e)
    success = false
  } finally {
    homebrewUpdating.value = false
  }

  if (success) {
    homebrewUpdated.value = true
    setTimeout(() => (homebrewUpdated.value = false), 5000)
  }
}

function enterBonusCode() {
  if (!character.value) return
  if (bonusCode.value.trim().length === 0) return

  try {
    const code = bonusCode.value.trim().toUpperCase().split(" ").join("_")
    if (code === "KAINS_MAL") {
      if (!(character.value as any).hasCainsMark) {
        show.value = false
      }
    }
  } finally {
    bonusCode.value = ""
  }
}

defineExpose({ showModal })
</script>

<template>
  <Modal :shown="show" @close="show = false">
    <div v-if="character" class="character-info">
      <div v-if="isVampire" class="form-group">
        <label><b>Verwendete Bücher:</b></label>
        <BookSelection :disabled="true" :books="activatedBooks" />
      </div>

      <div class="form-group">
        <label><b>Verwendete Erfahrung:</b></label>
        <i class="usedexp">
          {{ character.usedExp || 0 }} EXP
          <TipButton :override="true" @click="openLevelHistory" />
        </i>
      </div>

      <div class="form-group" :class="{ 'mb-0': !isNotUpToDate() }">
        <label><b>Spielleiter-Regeln:</b></label>

        <div v-if="isVampire" class="custom-checkbox d-flex align-items-center">
          <input type="checkbox" id="disc" v-model="(character as any).useAdavancedDisciplines" @change="save" />
          <label for="disc">Erweiterte Disziplinen</label>
        </div>

        <div v-if="isVampire" class="custom-checkbox d-flex align-items-center">
          <input type="checkbox" id="pow" v-model="(character as any).allowLearningOfAllPowers" @change="save" />
          <label for="pow">Alle Kräfte erlernen können</label>
        </div>

        <div class="custom-checkbox d-flex align-items-center">
          <input type="checkbox" id="cust" v-model="(character as any).fullCustomization" @change="save" />
          <label for="cust">Volle Editierbarkeit</label>
        </div>
      </div>

      <div v-if="isVampire && isNotUpToDate()" class="center">
        <button class="btn btn-primary" @click="migrateChar">Migrieren</button>
      </div>

      <div v-if="isVampire" class="form-group mb-0">
        <b>Avatarausrichtung:</b>
        <select class="form-control" v-model="character!.avatarOrientation">
          <option :value="AvatarOrientation.Top">Oben</option>
          <option :value="undefined">Zentriert</option>
          <option :value="AvatarOrientation.Bottom">Unten</option>
        </select>
      </div>

      <div v-if="isVampire" class="form-group mb-0">
        <b>Bonuscode:</b>
        <input type="text" class="form-control" v-model="bonusCode" @keydown.enter="enterBonusCode" />
      </div>

      <div v-if="isVampire && isHomebrewActive" class="center">
        <button class="btn btn-primary" :disabled="homebrewUpdating" @click="updateHomebrewContent">
          {{ homebrewUpdated ? "Aktualisiert!" : "Homebrew-Content aktualisieren" }}
        </button>
      </div>
    </div>

    <LevelHistoryModal ref="levelHistoryModal" />
  </Modal>
</template>

<style scoped lang="scss">
.character-info {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.usedexp {
  opacity: 0.7;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.center {
  width: 100%;
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
