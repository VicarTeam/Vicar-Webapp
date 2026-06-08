<script setup lang="ts">
import { computed, ref } from "vue"
import { useStore } from "@/app/store"
import type { ICharacter, ILockableTrait, IUsingTraitPacks } from "@/@types/models"
import type { ITraitPack } from "@/@types/data"
import TipButton from "@/components/editor/TipButton.vue"
import LevelButton from "@/components/viewer/LevelButton.vue"
import TraitModal from "@/components/viewer/modals/leveling/TraitModal.vue"
import ChooseTraitModal from "@/components/editor/modals/ChooseTraitModal.vue"
import RemoveTraitModal from "@/components/viewer/modals/RemoveTraitModal.vue"
import { GameLine } from "@/@types/gameline"

export interface ITransformedData extends ILockableTrait {
  pack: ITraitPack
}

const store = useStore()
const editingCharacter = computed(() => store.editingCharacter as ICharacter | undefined)

const levelTraitModal = ref<InstanceType<typeof TraitModal> | null>(null)
const chooseTraitModal = ref<InstanceType<typeof ChooseTraitModal> | null>(null)
const removeTraitModal = ref<InstanceType<typeof RemoveTraitModal> | null>(null)

function addNewTrait() {
  chooseTraitModal.value?.showModal(false, Infinity, (_trait: any, level: number) => level * 3)
}

function addNewFlaw() {
  chooseTraitModal.value?.showModal(true, Infinity)
}

function getTransformedData(upacks: IUsingTraitPacks, isFlaw: boolean): ITransformedData[] {
  const arr: ITransformedData[] = []
  for (const upack of upacks.packs) {
    for (const trait of upack[isFlaw ? "flawTraits" : "traits"]) {
      arr.push({ ...(trait as any), pack: upack.pack })
    }
  }
  return arr
}

function getTraitSuffix(trait: ITransformedData): string {
  if (trait.suffix) return ` (${trait.suffix})`
  return ""
}

function getTraitLevel(trait: ITransformedData) {
  return parseInt(String((trait as any).customLevel ?? trait.level), 10)
}

const maxLevel = computed(() => {
  const c = editingCharacter.value
  if (!c) return 5
  return c.game === GameLine.Mage ? 10 : 5
})

const isMage = computed(() => editingCharacter.value?.game === GameLine.Mage)
</script>

<template>
  <div v-if="editingCharacter" class="traits-view">
    <div class="trait card">
      <div class="title">
        <b>Vorteile</b>
        <LevelButton icon="fa-plus" class="ml-10" @click="addNewTrait" />
      </div>

      <div class="list">
        <div class="entry" v-for="t in getTransformedData(editingCharacter.merits, false)" :key="t.id ?? t.name">
          <LevelButton v-if="getTraitLevel(t) < maxLevel" @click="levelTraitModal?.showModal(t, 'merits')" />
          <i class="iconbtnprim fa-solid fa-xmark" v-bind="$attrs" v-if="editingCharacter.fullCustomization" @click="removeTraitModal?.showModal(t, 'merits', false)" />
          <div class="name">
            <small>
              <i style="color: #989898">Vorzug</i>
              - {{ t.pack.name }}: {{ t.name }}{{ getTraitSuffix(t) }} -
              <i><b>Stufe</b>: {{ getTraitLevel(t) }}</i>
            </small>
          </div>
          <TipButton class="tip" :content="t.description" />
        </div>

        <div class="entry" v-for="t in getTransformedData(editingCharacter.backgrounds, false)" :key="t.id ?? t.name">
          <LevelButton v-if="getTraitLevel(t) < maxLevel" @click="levelTraitModal?.showModal(t, 'backgrounds')" />
          <i class="iconbtnprim fa-solid fa-xmark" v-bind="$attrs" v-if="editingCharacter.fullCustomization" @click="removeTraitModal?.showModal(t, 'backgrounds', false)" />
          <div class="name">
            <small>
              <i style="color: #989898">Hintergrund</i>
              - {{ t.pack.name }}: {{ t.name }}{{ getTraitSuffix(t) }} -
              <i><b>Stufe</b>: {{ getTraitLevel(t) }}</i>
            </small>
          </div>
          <TipButton class="tip" :content="t.description" />
        </div>
      </div>
    </div>

    <div v-if="!isMage" class="trait card">
      <div class="title">
        <b>Schwächen</b>
        <LevelButton icon="fa-plus" class="ml-10" @click="addNewFlaw" />
      </div>

      <div class="list">
        <div class="entry" v-for="t in getTransformedData(editingCharacter.merits, true)" :key="t.id ?? t.name">
          <i class="iconbtnprim fa-solid fa-xmark" v-bind="$attrs" v-if="editingCharacter.fullCustomization" @click="removeTraitModal?.showModal(t, 'merits', true)" />
          <div class="name">
            <small>
              <i style="color: #989898">Vorzug</i>
              - {{ t.pack.name }}: {{ t.name }}{{ getTraitSuffix(t) }} -
              <i><b>Stufe</b>: {{ getTraitLevel(t) }}</i>
            </small>
          </div>
          <TipButton class="tip" :content="t.description" />
        </div>

        <div class="entry" v-for="t in getTransformedData(editingCharacter.backgrounds, true)" :key="t.id ?? t.name">
          <i class="iconbtnprim fa-solid fa-xmark" v-bind="$attrs" v-if="editingCharacter.fullCustomization" @click="removeTraitModal?.showModal(t, 'backgrounds', true)" />
          <div class="name">
            <small>
              <i style="color: #989898">Hintergrund</i>
              - {{ t.pack.name }}: {{ t.name }}{{ getTraitSuffix(t) }} -
              <i><b>Stufe</b>: {{ getTraitLevel(t) }}</i>
            </small>
          </div>
          <TipButton class="tip" :content="t.description" />
        </div>
      </div>
    </div>

    <TraitModal ref="levelTraitModal" />
    <ChooseTraitModal ref="chooseTraitModal" :gameline="editingCharacter.game" />
    <RemoveTraitModal ref="removeTraitModal" />
  </div>
</template>

<style scoped lang="scss">
.traits-view {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 7rem;

  .trait {
    display: flex;
    flex-direction: column;
    width: 40rem;
    gap: 0.5rem;

    .title {
      width: 100%;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    }

    .list {
      width: 100%;
      display: flex;
      flex-direction: column;

      .entry {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .name {
          flex-grow: 1;
        }

        .tip {
          flex-shrink: 0;
        }
      }
    }
  }
}
</style>
