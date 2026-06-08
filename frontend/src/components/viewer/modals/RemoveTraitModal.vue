<script setup lang="ts">
import { ref } from "vue"
import Modal from "@/components/modal/Modal.vue"
import CharacterStorage from "@/libs/io/character-storage.ts"
import type {ICharacter, ILockableTrait} from "@/@types/models.ts"
import { useStore } from "@/app/store.ts"
import type {ITraitPack} from "@/@types/data.ts";

interface ITransformedData extends ILockableTrait {
  pack: ITraitPack;
}

const store = useStore()

const show = ref(false)
const trait = ref<ITransformedData | null>(null)
const type = ref<"backgrounds" | "merits">("backgrounds")
const isFlaw = ref(false)

function showModal(t: ITransformedData, tp: "backgrounds" | "merits", fl: boolean) {
  trait.value = t
  type.value = tp
  isFlaw.value = fl
  show.value = true
}

function deleteTrait() {
  const char = store.editingCharacter as ICharacter | undefined
  if (!char || !trait.value) return

  const upack = (char as any)[type.value].packs.find((p: any) => p.pack.id === trait.value!.pack.id)
  if (!upack) return

  const arr = isFlaw.value ? upack.flawTraits : upack.traits
  const idx = arr.findIndex((x: any) => !x.isLocked && x.id === trait.value!.id)
  if (idx === -1) return

  arr.splice(idx, 1)
  CharacterStorage.saveCharacter(char)
  show.value = false
}

defineExpose({ showModal })
</script>

<template>
  <Modal :shown="show" @close="show = false">
    <div v-if="trait && store.editingCharacter" class="confirm">
      <span>{{ `Möchtest du wirklich ${trait.name} löschen? Dieser Vorgang kann nicht rückgängig gemacht werden. Bitte spreche dies vorher mit dem Spielerleiter ab!` }}</span>
      <button class="btn btn-primary" @click="deleteTrait">Löschen</button>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.confirm {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  text-align: center;
}
</style>
