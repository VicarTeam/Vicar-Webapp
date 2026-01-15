<script setup lang="ts">
import { computed, ref } from "vue"
import Modal from "@/components/modal/Modal.vue"
import Bullet from "@/components/Bullet.vue"
import ChooseDisciplineAbilityModal from "@/components/editor/modals/ChooseDisciplineAbilityModal.vue"
import DataManager from "@/libs/data/data-manager"
import CharacterStorage from "@/libs/io/character-storage"
import { levelResolver } from "@/libs/resolvers/level-resolver"
import { LevelChangeType } from "@/@types/gameline"
import type { IDiscipline } from "@/@types/data"
import type { ICharacter, ILeveledDisciplineAbility } from "@/@types/models"
import { useStore } from "@/app/store"

const store = useStore()
const editingCharacter = computed(() => store.editingCharacter as ICharacter | undefined)

const show = ref(false)
const discipline = ref<IDiscipline | null>(null)
const ability = ref<ILeveledDisciplineAbility | null>(null)

const chooseAbilityModal = ref<InstanceType<typeof ChooseDisciplineAbilityModal> | null>(null)

function showModal() {
  discipline.value = null
  ability.value = null
  show.value = true
}

function chooseAbility() {
  if (!discipline.value) return

  chooseAbilityModal.value?.showModal(
    {
      abilities: [],
      currentLevel: 1,
      discipline: discipline.value,
      points: 1,
    } as any,
    (a: ILeveledDisciplineAbility) => {
      ability.value = a
    },
  )
}

const disciplines = computed<IDiscipline[]>(() => {
  const char = editingCharacter.value
  if (!char) return []

  const out: IDiscipline[] = []
  for (const book of DataManager.selectedLanguage.books) {
    for (const clan of book.clans) {
      for (const d of clan.disciplines) {
        const already = char.disciplines.find((x) => x.discipline.id === d.id)
        const exists = out.find((x) => x.id === d.id)
        if (!already && !exists) out.push(d)
      }
    }
  }
  return out.sort((a, b) => a.name.localeCompare(b.name))
})

const neededExp = computed(() => {
  const char = editingCharacter.value
  const d = discipline.value
  if (!char || !d) return Infinity

  const dummy = { discipline: d, points: 0, currentLevel: 1, abilities: [] } as any

  if (char.clan?.id === 15) {
    return levelResolver.resolveCaitiffDiscipline(char, dummy)
  }

  const isClan = DataManager.isClanDiscipline(char.clan, d)
  return (isClan ? levelResolver.resolveClanDiscipline : levelResolver.resolveOtherDiscipline)(char, dummy)
})

function level() {
  const char = editingCharacter.value
  if (!char || !discipline.value || !ability.value) return
  if (char.exp < neededExp.value) return

  CharacterStorage.trackLevelChange(
    char,
    LevelChangeType.Discipline,
    neededExp.value,
    `Disziplin: ${discipline.value.name} hinzugefügt`,
  )

  char.disciplines.push({
    discipline: discipline.value,
    currentLevel: 2,
    points: 0,
    abilities: [ability.value],
  } as any)

  char.disciplines = char.disciplines.sort((a, b) => b.currentLevel - a.currentLevel)

  CharacterStorage.saveCharacter(char)
  show.value = false
}

defineExpose({ showModal })
</script>

<template>
  <Modal :shown="show" @close="show = false">
    <div class="new-disc-modal">
      <b>Neue Disziplin erlernen:</b>

      <select v-model="discipline" class="form-control" @change="chooseAbility">
        <option v-for="d in disciplines" :key="d.id" :value="d">{{ d.name }}</option>
      </select>

      <div v-if="discipline" class="centerline">
        <span v-if="ability">{{ ability.name }} <bullet /> </span>
        {{ `Kosten: ${neededExp} EXP` }}
      </div>

      <div class="actions">
        <button class="btn btn-primary" :disabled="neededExp > (editingCharacter?.exp ?? 0) || !discipline || !ability" @click="level">
          Abschließen
        </button>
      </div>

      <ChooseDisciplineAbilityModal ref="chooseAbilityModal" />
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.new-disc-modal {
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
