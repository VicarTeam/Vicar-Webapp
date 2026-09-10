<script setup lang="ts">
import { computed, ref } from "vue"
import Modal from "@/components/modal/Modal.vue"
import Bullet from "@/components/Bullet.vue"
import CharacterStorage from "@/libs/io/character-storage"
import { LevelChangeType } from "@/@types/gameline"
import type {ITrait, ITraitPack} from "@/@types/data"
import type {ICharacter, ILockableTrait} from "@/@types/models"
import { useStore } from "@/app/store"

interface ITransformedData extends ILockableTrait {
  pack: ITraitPack;
}

const store = useStore()
const editingCharacter = computed(() => store.editingCharacter as ICharacter | undefined)

const show = ref(false)
const upTrait = ref<ITrait | undefined>(undefined)
const data = ref<ITransformedData | null>(null)
const type = ref<"backgrounds" | "merits" | null>(null)

function getTraitLevel() {
  if (!data.value) return 0
  return parseInt(((data.value as any).customLevel ?? (data.value as any).level).toString())
}

function showModal(d: ITransformedData, t: "backgrounds" | "merits") {
  data.value = d
  type.value = t

  const newLevel = getTraitLevel() + 1
  const base = d.name.replace(/[1-5]/g, "").trim()
  const name = `${base} ${newLevel}`

  upTrait.value = d.pack.advantages.find((x) => x.name === name)
  show.value = true
}

function findRealTrait() {
  const char = editingCharacter.value
  const d = data.value
  if (!char || !d || !type.value) return null
  const upack = (char as any)[type.value].packs.find((p: any) => p.pack.id === d.pack.id)
  if (!upack) return null
  return upack.traits.find((t: any) => t.id === d.id) || null
}

const neededExp = computed(() => 3)

function level() {
  const char = editingCharacter.value
  const d = data.value
  if (!char || !d || !type.value) return
  if (char.exp < neededExp.value) return

  const trait = findRealTrait()
  if (!trait) return

  const oldLv = getTraitLevel()
  const newLv = oldLv + 1

  CharacterStorage.trackLevelChange(char, LevelChangeType.Trait, neededExp.value, `${trait.name}: ${oldLv} → ${newLv}`)

  if (upTrait.value) {
    trait.name = upTrait.value.name
    trait.level = upTrait.value.level
    trait.customLevel = upTrait.value.level
    trait.description = upTrait.value.description
  } else {
    if (trait.customLevel) trait.customLevel++
    else trait.customLevel = parseInt(trait.level.toString()) + 1
  }

  CharacterStorage.saveCharacter(char)
  show.value = false
}

defineExpose({ showModal })
</script>

<template>
  <Modal :shown="show" @close="show = false">
    <div v-if="data && editingCharacter" class="mini-modal">
      <b>Vorzug steigern:</b>

      <div class="centerline">
        {{ getTraitLevel() }} &#8594; {{ getTraitLevel() + 1 }}
        <bullet />
        {{ `Kosten: ${neededExp} EXP` }}
      </div>

      <div class="actions">
        <button class="btn btn-primary" :disabled="neededExp > editingCharacter.exp" @click="level" data-agent="level:confirm">
          Abschließen
        </button>
      </div>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.mini-modal {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.centerline {
  width: 100%;
  text-align: center;
}
.actions {
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
