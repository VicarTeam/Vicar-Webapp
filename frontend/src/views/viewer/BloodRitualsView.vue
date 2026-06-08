<script setup lang="ts">
import { computed, ref } from "vue"
import { useStore } from "@/app/store"
import LevelButton from "@/components/viewer/LevelButton.vue"
import ChooseBloodRitualModal from "@/components/editor/modals/ChooseBloodRitualModal.vue"
import type { ICharacter, IDisciplineSelection } from "@/@types/models"
import type { IBloodRitual, IOblivionCeremony } from "@/@types/data"
import TipButton from "@/components/editor/TipButton.vue"
import BloodRitualInfoModal from "@/components/viewer/modals/BloodRitualInfoModal.vue"
import ConfirmDeleteModal from "@/components/viewer/modals/ConfirmDeleteModal.vue"
import CharacterStorage from "@/libs/io/character-storage"
import ChooseOblivionCeremonyModal from "@/components/editor/modals/ChooseOblivionCeremonyModal.vue"
import OblivionCeremonyInfoModal from "@/components/viewer/modals/OblivionCeremonyInfoModal.vue"

const store = useStore()
const editingCharacter = computed(() => store.editingCharacter as ICharacter | undefined)

const levelBloodRitualModal = ref<InstanceType<typeof ChooseBloodRitualModal> | null>(null)
const levelOblivionCeremonyModal = ref<InstanceType<typeof ChooseOblivionCeremonyModal> | null>(null)
const bloodRitualInfoModal = ref<InstanceType<typeof BloodRitualInfoModal> | null>(null)
const oblivionCeremonyInfoModal = ref<InstanceType<typeof OblivionCeremonyInfoModal> | null>(null)
const confirmDeleteModal = ref<InstanceType<typeof ConfirmDeleteModal> | null>(null)

function addNewBloodRitual() {
  const c = editingCharacter.value
  if (!c) return
  const selection: IDisciplineSelection | undefined = c.disciplines.find(d => d.discipline.id === 3)
  if (!selection) return
  levelBloodRitualModal.value?.showModal(() => {}, selection, Infinity, true)
}

function addNewOblivionCeremony() {
  const c = editingCharacter.value
  if (!c) return
  const selection: IDisciplineSelection | undefined = c.disciplines.find(d => d.discipline.id === 11)
  if (!selection) return
  levelOblivionCeremonyModal.value?.showModal(() => {}, selection, Infinity)
}

function deleteBloodRitual(ritual: IBloodRitual) {
  const c = editingCharacter.value
  if (!c) return
  confirmDeleteModal.value?.showModal(ritual.name, () => {
    c.bloodRituals = (c.bloodRituals || []).filter(x => x.id !== ritual.id)
    CharacterStorage.saveCharacter(c)
  })
}

function deleteOblivionCeremony(ritual: IOblivionCeremony) {
  const c = editingCharacter.value
  if (!c) return
  confirmDeleteModal.value?.showModal(ritual.name, () => {
    c.oblivionCeremonies = (c.oblivionCeremonies || []).filter(x => x.id !== ritual.id)
    CharacterStorage.saveCharacter(c)
  })
}

const sortedBloodRituals = computed<IBloodRitual[]>(() => {
  const c = editingCharacter.value
  if (!c) return []
  return [...(c.bloodRituals || [])].sort((a, b) => (a.level !== b.level ? a.level - b.level : a.name.localeCompare(b.name)))
})

const sortedOblivionCeremonies = computed<IOblivionCeremony[]>(() => {
  const c = editingCharacter.value
  if (!c) return []
  return [...(c.oblivionCeremonies || [])].sort((a, b) => (a.level !== b.level ? a.level - b.level : a.name.localeCompare(b.name)))
})

const showBloodRituals = computed(() => {
  const c = editingCharacter.value
  if (!c) return false
  return (c.bloodRituals?.length ?? 0) > 0 || c.fullCustomization
})

const showOblivionCeremonies = computed(() => {
  const c = editingCharacter.value
  if (!c) return false
  return (((c.oblivionCeremonies?.length ?? 0) > 0) ||
    c.clan?.id === 4 ||
    c.clan?.id === 5 || c.fullCustomization)
})
</script>

<template>
  <div v-if="editingCharacter" class="bloodrituals-view">
    <div v-if="showBloodRituals" class="rituals card">
      <div class="title">
        <b>Blutrituale</b>
        <LevelButton icon="fa-plus" class="ml-10" @click="addNewBloodRitual" />
      </div>
      <div class="list">
        <div class="entry" v-for="r in sortedBloodRituals" :key="r.id">
          <div class="name">
            <i class="iconbtnprim fa-solid fa-xmark" v-if="editingCharacter.fullCustomization" @click="deleteBloodRitual(r)" />
            <small>
              {{ r.name }} - Stufe: {{ r.level }}
            </small>
          </div>
          <TipButton class="tip" :override="true" @click="bloodRitualInfoModal?.showModal(r)" />
        </div>
      </div>
    </div>

    <div v-if="showOblivionCeremonies" class="rituals card">
      <div class="title">
        <b>Vergessenheitszeremonien</b>
        <LevelButton icon="fa-plus" class="ml-10" @click="addNewOblivionCeremony" />
      </div>
      <div class="list">
        <div class="entry" v-for="r in sortedOblivionCeremonies" :key="r.id">
          <div class="name">
            <i class="iconbtnprim fa-solid fa-xmark" v-if="editingCharacter.fullCustomization" @click="deleteOblivionCeremony(r)" />
            <small>
              {{ r.name }} - Stufe: {{ r.level }}
            </small>
          </div>
          <TipButton class="tip" :override="true" @click="oblivionCeremonyInfoModal?.showModal(r)" />
        </div>
      </div>
    </div>

    <ChooseBloodRitualModal ref="levelBloodRitualModal" />
    <ChooseOblivionCeremonyModal ref="levelOblivionCeremonyModal" />
    <BloodRitualInfoModal ref="bloodRitualInfoModal" />
    <OblivionCeremonyInfoModal ref="oblivionCeremonyInfoModal" />
    <ConfirmDeleteModal ref="confirmDeleteModal" />
  </div>
</template>

<style scoped lang="scss">
.bloodrituals-view {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  .rituals {
    margin: auto;
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
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .tip {
          flex-shrink: 0;
        }
      }
    }
  }
}
</style>
