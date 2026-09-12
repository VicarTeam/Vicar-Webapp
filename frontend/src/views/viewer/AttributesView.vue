<script setup lang="ts">
import { computed, inject, ref } from "vue"
import { useStore } from "@/app/store"
import {
  getAttributeDescription,
  getAttributeName,
  getCategoryName,
  type IAttributeData,
  type ICharacter
} from "@/@types/models"
import { isHumanInteractionAttribute } from "@/@types/models"
import Dots from "@/components/progress/Dots.vue"
import LevelButton from "@/components/viewer/LevelButton.vue"
import AttributeModal from "@/components/viewer/modals/leveling/AttributeModal.vue"
import TipButton from "@/components/editor/TipButton.vue"
import ConfirmDeleteModal from "@/components/viewer/modals/ConfirmDeleteModal.vue"
import CharacterStorage from "@/libs/io/character-storage"
import { skillTreeResolver } from "@/libs/resolvers/skilltree-resolver"
import { GameLine } from "@/@types/gameline"
import {
  type M20Attribute,
  mentalAttributes,
  physicalAttributes,
  socialAttributes,
  getAttributeName as getM20AttributeName,
  type RequestLevelFn, type IMageSheet,
} from "@/@types/m20"
import {
  getVdzAttributeName,
  type IVdzSheet,
  type VdzRequestLevelFn,
  vdzMentalAttributes,
  vdzPhysicalAttributes,
  vdzSocialAttributes,
} from "@/@types/vdz"
import {
  DbCategory,
  getDbAttributeName,
  getDbAttributesOf,
  getDbCategoryName,
  type IDbSheet,
} from "@/@types/deathborne"

const store = useStore()
const editingCharacter = computed(() => store.editingCharacter as ICharacter | undefined)

const isMage = computed(() => editingCharacter.value?.game === GameLine.Mage)
const isDarkAges = computed(() => editingCharacter.value?.game === GameLine.DarkAges)
const isDeathborne = computed(() => editingCharacter.value?.game === GameLine.Deathborne)
const dbSheet = computed(() => editingCharacter.value as unknown as IDbSheet)
const requestDbLevel = inject("request-db-level") as ((type: string, subject?: unknown) => void) | undefined
const requestVdzLevel = inject("request-vdz-level") as VdzRequestLevelFn | undefined

const levelAttributeModal = ref<InstanceType<typeof AttributeModal> | null>(null)
const confirmDeleteModal = ref<InstanceType<typeof ConfirmDeleteModal> | null>(null)

const setDicePool = inject("set-dice-pool") as
  | ((type: "attr" | "skill" | "disc", name: string, value: number, isHuman?: boolean) => void)
  | undefined

const requestLevel = inject("request-m20-level") as RequestLevelFn | undefined

/** Effektiver Attributwert inkl. aktiver Skill-Tree-Modifikatoren. */
function effAttr(key: string) {
  const c = editingCharacter.value
  if (!c) return {value: 0, locked: false, modified: false}
  return skillTreeResolver.getEffectiveAttribute(c, key)
}

function deleteAttribute(attr: IAttributeData | M20Attribute) {
  const c = editingCharacter.value as any as IMageSheet
  if (!c) return

  if (!isMage.value) {
    const a = attr as IAttributeData
    confirmDeleteModal.value?.showModal(`${getAttributeName(a.key)} ${a.value}`, () => {
      a.value--
      CharacterStorage.saveCharacter(c as any)
    })
    return
  }

  const a = attr as M20Attribute
  confirmDeleteModal.value?.showModal(`${a} ${c.attributes[a]}`, () => {
    c.attributes[a]--
    CharacterStorage.saveCharacter(c as any)
  })
}
</script>

<template>
  <div v-if="editingCharacter" class="attributes-view">
    <div v-if="!isMage && !isDarkAges && !isDeathborne" class="card category" v-for="cat in editingCharacter.categories" :key="cat.name">
      <div class="cat-head"><b>{{ getCategoryName(cat.name) }}</b></div>

      <div class="attribute" :class="{ modified: effAttr(attr.key).modified }" v-for="attr in cat.attributes" :key="attr.key" :id="`hlat-${attr.key}`">
        <LevelButton v-if="attr.value < 5 && !effAttr(attr.key).locked" @click="levelAttributeModal?.showModal(attr)" :data-agent="'level:attr:' + attr.key" />
        <i class="iconbtnprim fa-solid fa-minus" v-if="editingCharacter.fullCustomization && attr.value > 0 && !effAttr(attr.key).locked" @click="deleteAttribute(attr)" />
        <small class="name" @click="setDicePool?.('attr', getAttributeName(attr.key), effAttr(attr.key).value, isHumanInteractionAttribute(attr.key))">
          <TipButton :content="getAttributeDescription(attr.key)" />
          {{ getAttributeName(attr.key) }}
          <i v-if="effAttr(attr.key).locked" class="fa-solid fa-lock lock-hint" />
        </small>
        <Dots :amount="effAttr(attr.key).value" :max="5" />
      </div>
    </div>

    <template v-if="isDarkAges">
      <div
        class="card category"
        v-for="group in [
          { name: 'Körperlich', attrs: vdzPhysicalAttributes },
          { name: 'Gesellschaftlich', attrs: vdzSocialAttributes },
          { name: 'Geistig', attrs: vdzMentalAttributes },
        ]"
        :key="group.name"
      >
        <div class="cat-head"><b>{{ group.name }}</b></div>
        <div class="attribute" v-for="a in group.attrs" :key="a">
          <LevelButton v-if="(editingCharacter as any as IVdzSheet).attributes[a] < 5" @click="requestVdzLevel?.('attribute', a)" />
          <small class="name" @click="setDicePool?.('attr', getVdzAttributeName(a), (editingCharacter as any as IVdzSheet).attributes[a])">{{ getVdzAttributeName(a) }}</small>
          <Dots :amount="(editingCharacter as any as IVdzSheet).attributes[a]" :max="5" />
        </div>
      </div>
    </template>

    <template v-if="isDeathborne">
      <div
        class="card category"
        v-for="category in [DbCategory.Body, DbCategory.Mind, DbCategory.Social]"
        :key="category"
      >
        <div class="cat-head"><b>{{ getDbCategoryName(category) }}</b></div>
        <div class="attribute" v-for="a in getDbAttributesOf(category)" :key="a">
          <LevelButton
            v-if="(dbSheet.attributes[a] ?? 0) < 5"
            @click="requestDbLevel?.('attribute', a)"
            :data-agent="'level:db-attr:' + a"
          />
          <small class="name" @click="setDicePool?.('attr', getDbAttributeName(a), dbSheet.attributes[a] ?? 0)">
            {{ getDbAttributeName(a) }}
          </small>
          <Dots :amount="dbSheet.attributes[a] ?? 0" :max="5" />
        </div>
      </div>

      <div class="card category">
        <div class="cat-head"><b>Wille</b></div>
        <div class="attribute">
          <LevelButton v-if="dbSheet.wille < 5" @click="requestDbLevel?.('wille')" data-agent="level:db-wille" />
          <small class="name" @click="setDicePool?.('attr', 'Wille', dbSheet.wille)">Wille</small>
          <Dots :amount="dbSheet.wille" :max="5" />
        </div>
        <div class="attribute">
          <small class="name">Vorrat</small>
          <Dots :amount="dbSheet.willePool" :max="dbSheet.wille" />
        </div>
      </div>
    </template>

    <div v-if="isMage" class="card category">
      <div class="cat-head"><b>Körperlich</b></div>
      <div class="attribute" v-for="a in physicalAttributes" :key="a">
        <LevelButton v-if="(editingCharacter as any as IMageSheet).attributes[a] < 5" @click="requestLevel?.('attribute', a)" />
        <i class="iconbtnprim fa-solid fa-minus" v-if="editingCharacter.fullCustomization && (editingCharacter as any as IMageSheet).attributes[a] > 0" @click="deleteAttribute(a)" />
        <small class="name">{{ getM20AttributeName(a) }}</small>
        <Dots :amount="(editingCharacter as any as IMageSheet).attributes[a]" :max="5" />
      </div>
    </div>

    <div v-if="isMage" class="card category">
      <div class="cat-head"><b>Sozial</b></div>
      <div class="attribute" v-for="a in socialAttributes" :key="a">
        <LevelButton v-if="(editingCharacter as any as IMageSheet).attributes[a] < 5" @click="requestLevel?.('attribute', a)" />
        <i class="iconbtnprim fa-solid fa-minus" v-if="editingCharacter.fullCustomization && (editingCharacter as any as IMageSheet).attributes[a] > 0" @click="deleteAttribute(a)" />
        <small class="name">{{ getM20AttributeName(a) }}</small>
        <Dots :amount="(editingCharacter as any as IMageSheet).attributes[a]" :max="5" />
      </div>
    </div>

    <div v-if="isMage" class="card category">
      <div class="cat-head"><b>Geistig</b></div>
      <div class="attribute" v-for="a in mentalAttributes" :key="a">
        <LevelButton v-if="(editingCharacter as any as IMageSheet).attributes[a] < 5" @click="requestLevel?.('attribute', a)" />
        <i class="iconbtnprim fa-solid fa-minus" v-if="editingCharacter.fullCustomization && (editingCharacter as any as IMageSheet).attributes[a] > 0" @click="deleteAttribute(a)" />
        <small class="name">{{ getM20AttributeName(a) }}</small>
        <Dots :amount="(editingCharacter as any as IMageSheet).attributes[a]" :max="5" />
      </div>
    </div>

    <AttributeModal ref="levelAttributeModal" />
    <ConfirmDeleteModal ref="confirmDeleteModal" />
  </div>
</template>

<style scoped lang="scss">
.attributes-view {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5rem;
  padding: 1rem;
  flex-wrap: wrap;

  .category {
    display: flex;
    flex-direction: column;
    width: min(30rem, 100%);
    gap: 0.5rem;
  }

  .cat-head {
    width: 100%;
    text-align: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  }

  .attribute {
    display: flex;
    align-items: center;
    gap: 1rem;

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
}
</style>
