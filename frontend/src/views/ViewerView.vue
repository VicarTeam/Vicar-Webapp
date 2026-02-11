<script setup lang="ts">
import { computed, onMounted, onUnmounted, provide, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useStore } from "@/app/store"

import type { ICharacter } from "@/@types/models"
import { getHumanInteractionMalus } from "@/@types/models"
import type {IMageSheet, M20Ability, M20Attribute, M20Sphere, RequestLevelFn} from "@/@types/m20"

import Tabs from "@/components/tabs/Tabs.vue"
import Tab from "@/components/tabs/Tab.vue"
import IconButton from "@/components/IconButton.vue"
import Avatar from "@/components/Avatar.vue"

import AddExpModal from "@/components/viewer/modals/AddExpModal.vue"
import CharacterInfoModal from "@/components/viewer/modals/CharacterInfoModal.vue"
import DicePoolCalculatorModal from "@/components/main/characters/modals/DicePoolCalculatorModal.vue"
import DiceRollModal from "@/components/viewer/modals/DiceRollModal.vue"
import HuntCalculatorModal from "@/components/main/characters/modals/HuntCalculatorModal.vue"
import SearchHighlightModal from "@/components/main/characters/modals/SearchHighlightModal.vue"
import M20LevelModal from "@/components/viewer/modals/leveling/M20LevelModal.vue"

import CharacterStorage from "@/libs/io/character-storage"
import EventBus from "@/libs/event-bus"
import { VicarSync } from "@/libs/io/vicar-sync"
import RestButton from "@/components/viewer/RestButton.vue";

const store = useStore()
const router = useRouter()
const route = useRoute()

const editingCharacter = computed(() => store.editingCharacter as ICharacter | undefined)
const isLevelMode = computed(() => store.isLevelMode)

const isVampire = computed(() => store.isVampire)
const isWerewolf = computed(() => store.isWerewolf)
const isMage = computed(() => store.isMage)
const isHunter = computed(() => store.isHunter)

const selectedTab = ref<string>("viewer-profile")
const saveText = ref<string>("")
const altDown = ref<boolean>(false)

const dicePoolLeft = ref<{ name: string; value: number } | null>(null)
const dicePoolRight = ref<{ name: string; value: number } | null>(null)
const dicePoolHuman = ref<boolean>(false)
const lastDicePoolSide = ref<"left" | "right">("right")

const addExpModal = ref<InstanceType<typeof AddExpModal> | null>(null)
const characterInfoModal = ref<InstanceType<typeof CharacterInfoModal> | null>(null)
const dicePoolCalculatorModal = ref<InstanceType<typeof DicePoolCalculatorModal> | null>(null)
const diceRollModal = ref<InstanceType<typeof DiceRollModal> | null>(null)
const huntCalculatorModal = ref<InstanceType<typeof HuntCalculatorModal> | null>(null)
const searchHighlightModal = ref<InstanceType<typeof SearchHighlightModal> | null>(null)
const m20LevelModal = ref<InstanceType<typeof M20LevelModal> | null>(null)

const tabProfile = ref<InstanceType<typeof Tab> | null>(null)
const tabInventory = ref<InstanceType<typeof Tab> | null>(null)
const tabAttributes = ref<InstanceType<typeof Tab> | null>(null)
const tabSkills = ref<InstanceType<typeof Tab> | null>(null)
const tabDisciplines = ref<InstanceType<typeof Tab> | null>(null)
const tabBloodRituals = ref<InstanceType<typeof Tab> | null>(null)
const tabTraits = ref<InstanceType<typeof Tab> | null>(null)

const tabRefs: Record<string, typeof tabProfile> = {
  tabProfile,
  tabInventory,
  tabAttributes,
  tabSkills,
  tabDisciplines,
  tabBloodRituals,
  tabTraits,
}

type TabHotkey = {
  tab: keyof typeof tabRefs
  keys: string[]
  condition?: (character: ICharacter) => boolean
}

const TabHotkeys: TabHotkey[] = [
  { tab: "tabProfile", keys: ["ALT+P", "Escape", "ALT+1"] },
  { tab: "tabInventory", keys: ["ALT+I", "ALT+2"] },
  { tab: "tabAttributes", keys: ["ALT+A", "ALT+3"] },
  { tab: "tabSkills", keys: ["ALT+F", "ALT+4"] },
  { tab: "tabDisciplines", keys: ["ALT+D", "ALT+5"] },
  {
    tab: "tabBloodRituals",
    keys: ["ALT+R"],
    condition: (character: ICharacter) =>
      character.bloodRituals.length > 0 || character.clan.id === 4 || character.clan.id === 5,
  },
  { tab: "tabTraits", keys: ["ALT+V", "ALT+6"] },
]

const canAccessRituals = computed(() => {
  const c = editingCharacter.value
  if (!c) return false
  if (!isVampire.value) return false
  return (
    c.bloodRituals.length > 0 ||
    c.clan.id === 4 ||
    c.clan.id === 5 ||
    c.fullCustomization ||
    (c.oblivionCeremonies?.length ?? 0) > 0
  )
})

function updaterViewer() {
  store.$patch({})
}

function requestM20Leveling(
  type: "attribute" | "ability" | "sphere" | "arete" | "willpower",
  subject?: M20Ability | M20Attribute | M20Sphere
) {
  m20LevelModal.value?.showModal(type as any, subject as any)
}

function setDicePool(
  type: "attr" | "skill" | "disc",
  name: string,
  value: number,
  isHuman = false
) {
  if (!altDown.value) return

  if (type === "disc" || type === "skill") {
    dicePoolRight.value = { name, value }
    lastDicePoolSide.value = "right"
  } else {
    if (lastDicePoolSide.value === "right") {
      dicePoolLeft.value = { name, value }
      lastDicePoolSide.value = "left"
    } else {
      dicePoolRight.value = { name, value }
      lastDicePoolSide.value = "right"
    }
  }

  dicePoolHuman.value = isHuman
}

provide("update-viewer", updaterViewer)
provide("request-m20-level", requestM20Leveling as unknown as RequestLevelFn)
provide("set-dice-pool", setDicePool)

function onCharUpdated(charId: string) {
  const c = editingCharacter.value
  if (c && c.id === charId) updaterViewer()
}

function clickTabByRefKey(key: keyof typeof tabRefs) {
  const inst = tabRefs[key]!.value
  const el = (inst as any)?.$el as HTMLElement | undefined
  el?.click?.()
}

function onKeyDown(event: KeyboardEvent) {
  if (!isVampire.value) return

  if (event.key === "Alt") altDown.value = true

  if (event.altKey) {
    const hk = TabHotkeys.find(x => x.keys.includes("ALT+" + event.key.toUpperCase()))
    if (hk) {
      const c = editingCharacter.value
      if (c && (!hk.condition || hk.condition(c))) {
        event.preventDefault()
        clickTabByRefKey(hk.tab)
      }
    }
  }

  if (event.key === "Escape") {
    event.preventDefault()
    clickTabByRefKey("tabProfile")
  }

  const c = editingCharacter.value
  if (event.ctrlKey && event.key === " " && c) {
    event.preventDefault()
    dicePoolCalculatorModal.value?.showModal(c, selectedTab.value === "viewer-disciplines")
  }

  if (event.altKey && (event.key === "j" || event.key === "h") && c) {
    event.preventDefault()
    huntCalculatorModal.value?.showModal(c)
  }

  if (event.altKey && event.shiftKey && event.key === "f" && c) {
    event.preventDefault()
    searchHighlightModal.value?.showModal(c)
  }
}

function onKeyUp(event: KeyboardEvent) {
  if (event.key === "Alt") altDown.value = false
}

function switchTab(name: string) {
  if (route.name !== name) router.push({ name }).catch(() => {})
}

function switchLevelMode() {
  const c = editingCharacter.value
  if (!c) return

  const next = !isLevelMode.value
  store.isLevelMode = next

  if (next) VicarSync.beginCharacterLevelSync(c)
  else VicarSync.endCharacterLevelSync(c)
}

async function saveCurrentCharacter() {
  const c = editingCharacter.value
  if (!c) return

  await CharacterStorage.saveCharacter(c)
  saveText.value = "Gespeichert!"
  setTimeout(() => {
    saveText.value = "Speichern"
  }, 1000)
}

function backToMain() {
  const c = editingCharacter.value
  if (c) {
    VicarSync.endCharacterLevelSync(c)
    saveCurrentCharacter()
  }
  store.editingCharacter = undefined
  router.push({ name: "main" }).catch(() => {})
}

function getDicePoolName(dicePool: { name: string; value: number } | null): string {
  if (!dicePool) return "nicht ausgewählt"
  return `${dicePool.name} (${dicePool.value})`
}

const dicePoolResult = computed<{ total: number; simple: number; hunger: number } | null>(() => {
  const c = editingCharacter.value
  if (!c || !dicePoolLeft.value || !dicePoolRight.value) return null

  let total = dicePoolLeft.value.value + dicePoolRight.value.value

  if (dicePoolHuman.value) {
    const malus = getHumanInteractionMalus(c)
    if (malus === Number.MIN_SAFE_INTEGER) return { total: -1, simple: 0, hunger: 0 }
    total -= malus
    if (total <= 0) total = 1
  }

  const hunger = Math.min(c.hunger, total)
  const simple = total - hunger
  return { total, simple, hunger }
})

onMounted(() => {
  if (route.name === "viewer") {
    router.push({ name: "viewer-profile" }).catch(() => {})
  }

  selectedTab.value = (route.name as string) || "viewer-profile"

  EventBus.$on("character-updated", onCharUpdated)
  window.addEventListener("keydown", onKeyDown)
  window.addEventListener("keyup", onKeyUp)

  document.title = editingCharacter.value ? `${editingCharacter.value.name} - Vicar` : "Vicar"
})

onUnmounted(() => {
  EventBus.$off("character-updated", onCharUpdated)
  window.removeEventListener("keydown", onKeyDown)
  window.removeEventListener("keyup", onKeyUp)
  document.title = "Vicar"
  store.resetTheme()
})
</script>

<template>
  <div id="viewer-wrapper" class="viewer-wrapper" v-if="editingCharacter">
    <div class="top-bar">
      <div class="actions left">
        <IconButton icon="fa-angles-left" @click="backToMain" />
        <IconButton icon="fa-info" @click="characterInfoModal?.showModal(editingCharacter)" />
        <IconButton
          icon="fa-dice"
          v-if="editingCharacter.connectedFoundryId"
          @click="diceRollModal?.showModal(editingCharacter)"
        />
        <Avatar :src="editingCharacter.avatar" :orientation="editingCharacter.avatarOrientation" class="top-avatar" />
      </div>

      <Tabs class="center" @before-change="switchTab" v-model="selectedTab">
        <Tab value="viewer-profile" text="Profil" ref="tabProfile" />
        <Tab v-if="isMage" value="viewer-tradition" text="Allianz" />
        <Tab value="viewer-inventory" text="Inventar" ref="tabInventory" />
        <Tab value="viewer-attributes" text="Attribute" ref="tabAttributes" />
        <Tab value="viewer-skills" text="Fähigkeiten" ref="tabSkills" />
        <Tab
          v-if="isVampire"
          value="viewer-disciplines"
          text="Disziplinen"
          ref="tabDisciplines"
        />
        <Tab
          v-if="canAccessRituals && isVampire"
          value="viewer-bloodrituals"
          text="Rituale"
          ref="tabBloodRituals"
        />
        <Tab v-if="isWerewolf" value="viewer-gifts" text="Gaben & Riten" />
        <Tab v-if="isHunter" value="viewer-edges" text="Edges" />
        <Tab value="viewer-traits" text="Vorteile & Schwächen" ref="tabTraits" />
      </Tabs>

      <div class="actions right">
        <small v-if="isMage && (editingCharacter as any as IMageSheet).freebiePoints > 0" class="muted">
          Freebie: {{ (editingCharacter as any as IMageSheet).freebiePoints }}
        </small>
        <small class="muted exp">
          EXP: <b>{{ editingCharacter.exp }}</b>
          <IconButton
            v-if="!editingCharacter.justViewing"
            icon="fa-pen"
            class="exp-edit"
            @click="addExpModal?.showModal()"
          />
        </small>
        <RestButton />
        <button
          v-if="!editingCharacter.justViewing"
          class="btn btn-primary"
          @click="switchLevelMode"
        >
          {{ isLevelMode ? "Modus: Leveln" : "Modus: Vorschau" }}
        </button>
        <button
          v-if="!editingCharacter.justViewing"
          class="btn btn-primary"
          @click="saveCurrentCharacter"
        >
          {{ saveText || "Speichern" }}
        </button>
      </div>
    </div>

    <div class="viewer-content">
      <router-view />
    </div>

    <AddExpModal ref="addExpModal" />
    <CharacterInfoModal ref="characterInfoModal" @updated="updaterViewer()" />
    <DicePoolCalculatorModal ref="dicePoolCalculatorModal" />
    <DiceRollModal ref="diceRollModal" />
    <HuntCalculatorModal ref="huntCalculatorModal" />
    <SearchHighlightModal ref="searchHighlightModal" />
    <M20LevelModal ref="m20LevelModal" />

    <div v-if="dicePoolLeft || dicePoolRight" class="simple-dice-calc card">
      <h4 class="card-title">Würfelpool:</h4>
      <i
        @click="dicePoolLeft = null; dicePoolRight = null; lastDicePoolSide = 'right'"
        class="fa-solid fa-xmark close"
      ></i>

      <div class="calc-names">
        <b class="name">{{ getDicePoolName(dicePoolLeft) }}</b>
        +
        <b class="name">{{ getDicePoolName(dicePoolRight) }}</b>
      </div>

      <div class="calc-human">
        <div class="custom-checkbox d-flex align-items-center">
          <input type="checkbox" id="dicehuman" v-model="dicePoolHuman" />
          <label for="dicehuman">Menschliche Interaktion?</label>
        </div>
      </div>

      <div v-if="dicePoolLeft && dicePoolRight" class="calc-result">
        <div v-if="dicePoolResult" class="result-inner">
          <span v-if="dicePoolResult.hunger > 0">
            <b><u>{{ dicePoolResult.total }}</u> </b>
            Würfel davon
            <b style="color: var(--primary-color)">{{ dicePoolResult.hunger }}</b>
            Hungerwürfel und
            <b>{{ dicePoolResult.simple }}</b>
            normale Würfel
          </span>
          <span v-else-if="dicePoolResult.total === -1">Unmöglich (Wasail?!)</span>
          <span v-else><b>{{ dicePoolResult.total }} </b>Würfel</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.viewer-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.top-bar {
  display: flex;
  align-items: stretch;
  gap: 0.75rem;
  border-bottom: 1px solid var(--primary-color);
  flex-shrink: 0;
  padding: 0.5rem 0.75rem;
}

.actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.actions.right {
  gap: 0.75rem;
}

.center {
  flex: 1 1 auto;
  min-width: 0;
}

.top-avatar {
  width: 3rem;
  height: 3rem;
}

.muted {
  color: #afafaf;
}

.exp {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.exp-edit {
  width: 2rem;
  height: 2rem;
}

.viewer-content {
  width: 100%;
  height: calc(100vh - 4.2rem - 3px);
  overflow-x: hidden;
  overflow-y: auto;
}

.simple-dice-calc {
  position: fixed;
  left: 50%;
  bottom: 1rem;
  transform: translateX(-50%);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  z-index: 10;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  opacity: 0.9;
  pointer-events: none;
  font-size: 1.1rem;
  max-width: calc(100vw - 1.5rem);
}

.simple-dice-calc h4 {
  margin: 0;
  font-size: 1.35rem;
  text-align: center;
}

.simple-dice-calc .close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  cursor: pointer;
  font-size: 1.5rem;
  pointer-events: all;
}

.simple-dice-calc .close:hover {
  color: var(--primary-color) !important;
}

.calc-names {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  align-items: center;
  width: min(30rem, 100%);
  text-align: center;
}

.calc-names .name {
  flex: 1;
  text-align: center;
  word-break: break-word;
}

.calc-human {
  margin-top: 0.25rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 20%);
  width: 100%;
  display: flex;
  justify-content: center;
  pointer-events: all;
}

.calc-result {
  margin-top: 0.25rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 20%);
  width: 100%;
}

.result-inner {
  width: 100%;
  display: flex;
  justify-content: center;
  text-align: center;
}

@media (max-width: 900px) {
  .top-bar {
    flex-wrap: wrap;
  }

  .center {
    order: 3;
    width: 100%;
  }

  .actions.left {
    order: 1;
  }

  .actions.right {
    order: 2;
    margin-left: auto;
  }

  .viewer-content {
    height: calc(100vh - 7.6rem);
  }
}

@media (max-width: 520px) {
  .actions.right button {
    padding: 0.4rem 0.6rem;
    font-size: 0.95rem;
  }

  .top-avatar {
    width: 2.5rem;
    height: 2.5rem;
  }

  .viewer-content {
    height: calc(100vh - 9.2rem);
  }
}
</style>
