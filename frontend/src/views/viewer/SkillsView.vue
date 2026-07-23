<script setup lang="ts">
import { computed, inject, ref } from "vue"
import { useStore } from "@/app/store"
import Dots from "@/components/progress/Dots.vue"
import {getCategoryName, getSkillDescription, getSkillName, type ICharacter, type ISkillData} from "@/@types/models"
import { isHumanInteractionSkill } from "@/@types/models"
import LevelButton from "@/components/viewer/LevelButton.vue"
import SkillModal from "@/components/viewer/modals/leveling/SkillModal.vue"
import NewSpecializationModal from "@/components/viewer/modals/leveling/NewSpecializationModal.vue"
import TipButton from "@/components/editor/TipButton.vue"
import ConfirmDeleteModal from "@/components/viewer/modals/ConfirmDeleteModal.vue"
import CharacterStorage from "@/libs/io/character-storage"
import { skillTreeResolver } from "@/libs/resolvers/skilltree-resolver"
import { GameLine } from "@/@types/gameline"
import {
  knowledgeAbilities,
  skillAbilities,
  talentAbilities,
  type M20Ability,
  type RequestLevelFn, type IMageSheet, getAbilityName,
} from "@/@types/m20"
import {
  getVdzAbilityName,
  type IVdzSheet,
  type VdzRequestLevelFn,
  vdzKnowledgeAbilities,
  vdzSkillAbilities,
  vdzTalentAbilities,
} from "@/@types/vdz"

const store = useStore()
const editingCharacter = computed(() => store.editingCharacter as ICharacter | undefined)
const isMage = computed(() => editingCharacter.value?.game === GameLine.Mage)
const isDarkAges = computed(() => editingCharacter.value?.game === GameLine.DarkAges)
const requestVdzLevel = inject("request-vdz-level") as VdzRequestLevelFn | undefined

const levelSkillModal = ref<InstanceType<typeof SkillModal> | null>(null)
const levelSpecializationModal = ref<InstanceType<typeof NewSpecializationModal> | null>(null)
const confirmDeleteModal = ref<InstanceType<typeof ConfirmDeleteModal> | null>(null)

const setDicePool = inject("set-dice-pool") as
  | ((type: "attr" | "skill" | "disc", name: string, value: number, isHuman?: boolean) => void)
  | undefined

const requestLevel = inject("request-m20-level") as RequestLevelFn | undefined

/** Effektiver Fähigkeitswert inkl. aktiver Skill-Tree-Modifikatoren. */
function effSkill(key: string) {
  const c = editingCharacter.value
  if (!c) return {value: 0, locked: false, modified: false}
  return skillTreeResolver.getEffectiveSkill(c, key)
}

function hasSpecialization(skill: ISkillData): boolean {
  return !!skill.specialization && skill.specialization.length > 0
}

function deleteSkill(skill: ISkillData | M20Ability) {
  const c = editingCharacter.value as any as IMageSheet
  if (!c) return

  if (!isMage.value) {
    const s = skill as ISkillData
    confirmDeleteModal.value?.showModal(`${getSkillName(s.key)} ${s.value}`, () => {
      s.value--
      CharacterStorage.saveCharacter(c as any)
    })
    return
  }

  const s = skill as M20Ability
  confirmDeleteModal.value?.showModal(`${s} ${c.abilities[s]}`, () => {
    c.abilities[s]--
    CharacterStorage.saveCharacter(c as any)
  })
}

function deleteSkillSpecs(skill: ISkillData) {
  const c = editingCharacter.value
  if (!c) return
  confirmDeleteModal.value?.showModal(skill.specialization.join(", "), () => {
    skill.specialization = []
    CharacterStorage.saveCharacter(c)
  })
}
</script>

<template>
  <div v-if="editingCharacter" class="skills-view">
    <div v-if="!isMage && !isDarkAges" class="card category" v-for="cat in editingCharacter.categories" :key="cat.name">
      <div class="cat-head"><b>{{ getCategoryName(cat.name) }}</b></div>

      <div class="skill" :class="{ modified: effSkill(skill.key).modified }" v-for="skill in cat.skills" :key="skill.key" :id="`hlsk-${skill.key}`">
        <LevelButton v-if="skill.value < 5 && !effSkill(skill.key).locked" @click="levelSkillModal?.showModal(skill)" />
        <LevelButton @click="levelSpecializationModal?.showModal(skill)" icon="fa-plus" />
        <i class="iconbtnprim fa-solid fa-minus" v-if="editingCharacter.fullCustomization && skill.value > 0 && !effSkill(skill.key).locked" @click="deleteSkill(skill)" />
        <i class="iconbtnprim fa-solid fa-trash" v-if="editingCharacter.fullCustomization && skill.specialization.length > 0" @click="deleteSkillSpecs(skill)" />

        <small class="name" @click.self="setDicePool?.('skill', getSkillName(skill.key), effSkill(skill.key).value, isHumanInteractionSkill(skill.key))">
          <TipButton :content="getSkillDescription(skill.key)" />
          {{ getSkillName(skill.key) }}
          <i v-if="effSkill(skill.key).locked" class="fa-solid fa-lock lock-hint" />
          <span v-if="hasSpecialization(skill)" class="specs">
            <i>
            (
              <span style="display: inline-flex; gap: 0.25rem; flex-wrap: wrap;">
                <span
                  v-for="s in skill.specialization"
                  :key="s"
                  class="spec"
                  @click="setDicePool?.('skill', `${getSkillName(skill.key)} (${s})`, effSkill(skill.key).value + 1, isHumanInteractionSkill(skill.key))"
                >
                  {{ s }}
                </span>
              </span>
            )
            </i>
          </span>
        </small>

        <Dots :amount="effSkill(skill.key).value" :max="5" />
      </div>
    </div>

    <template v-if="isDarkAges">
      <div
        class="card category"
        v-for="group in [
          { name: 'Talente', abilities: vdzTalentAbilities },
          { name: 'Fertigkeiten', abilities: vdzSkillAbilities },
          { name: 'Kenntnisse', abilities: vdzKnowledgeAbilities },
        ]"
        :key="group.name"
      >
        <div class="cat-head"><b>{{ group.name }}</b></div>
        <div class="skill" v-for="a in group.abilities" :key="a">
          <LevelButton v-if="(editingCharacter as any as IVdzSheet).abilities[a] < 5" @click="requestVdzLevel?.('ability', a)" />
          <small class="name" @click="setDicePool?.('skill', getVdzAbilityName(a), (editingCharacter as any as IVdzSheet).abilities[a])">{{ getVdzAbilityName(a) }}</small>
          <Dots :amount="(editingCharacter as any as IVdzSheet).abilities[a]" :max="5" />
        </div>
      </div>
    </template>

    <div v-if="isMage" class="card category">
      <div class="cat-head"><b>Talente</b></div>
      <div class="skill" v-for="a in talentAbilities" :key="a">
        <LevelButton v-if="(editingCharacter as any as IMageSheet).abilities[a] < 5" @click="requestLevel?.('ability', a)" />
        <i class="iconbtnprim fa-solid fa-minus" v-if="editingCharacter.fullCustomization && (editingCharacter as any as IMageSheet).abilities[a] > 0" @click="deleteSkill(a)" />
        <small class="name">{{ getAbilityName(a) }}</small>
        <Dots :amount="(editingCharacter as any as IMageSheet).abilities[a]" :max="5" />
      </div>
    </div>

    <div v-if="isMage" class="card category">
      <div class="cat-head"><b>Fertigkeiten</b></div>
      <div class="skill" v-for="a in skillAbilities" :key="a">
        <LevelButton v-if="(editingCharacter as any as IMageSheet).abilities[a] < 5" @click="requestLevel?.('ability', a)" />
        <i class="iconbtnprim fa-solid fa-minus" v-if="editingCharacter.fullCustomization && (editingCharacter as any as IMageSheet).abilities[a] > 0" @click="deleteSkill(a)" />
        <small class="name">{{ getAbilityName(a) }}</small>
        <Dots :amount="(editingCharacter as any as IMageSheet).abilities[a]" :max="5" />
      </div>
    </div>

    <div v-if="isMage" class="card category">
      <div class="cat-head"><b>Kenntnisse</b></div>
      <div class="skill" v-for="a in knowledgeAbilities" :key="a">
        <LevelButton v-if="(editingCharacter as any as IMageSheet).abilities[a] < 5" @click="requestLevel?.('ability', a)" />
        <i class="iconbtnprim fa-solid fa-minus" v-if="editingCharacter.fullCustomization && (editingCharacter as any as IMageSheet).abilities[a] > 0" @click="deleteSkill(a)" />
        <small class="name">{{ getAbilityName(a) }}</small>
        <Dots :amount="(editingCharacter as any as IMageSheet).abilities[a]" :max="5" />
      </div>
    </div>

    <SkillModal ref="levelSkillModal" />
    <NewSpecializationModal ref="levelSpecializationModal" />
    <ConfirmDeleteModal ref="confirmDeleteModal" />
  </div>
</template>

<style scoped lang="scss">
.skills-view {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4rem;
  padding: 1rem;
  flex-wrap: wrap;

  .category {
    display: flex;
    flex-direction: column;
    width: min(40rem, 100%);
    gap: 0.5rem;
  }

  .cat-head {
    width: 100%;
    text-align: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  }

  .skill {
    display: flex;
    align-items: center;

    .name {
      flex-grow: 1;
      cursor: pointer;
      user-select: none;
    }

    .lock-hint {
      margin-left: 0.35rem;
      font-size: 0.7rem;
      color: var(--text-3);
    }

    &.modified .name {
      color: color-mix(in srgb, var(--accent) 45%, var(--text-1));
    }
  }

  .specs {
    color: #a6a6a6;
    margin-left: 0.35rem;
  }

  .spec {
    cursor: pointer;
  }
}
</style>
