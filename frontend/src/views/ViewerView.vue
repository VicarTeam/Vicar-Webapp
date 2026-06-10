<script setup lang="ts">
import { computed, onMounted, onUnmounted, provide, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useStore } from "@/app/store"

import type { ICharacter } from "@/@types/models"
import { DamageType, getHumanInteractionMalus, V5ResonanceTemperament } from "@/@types/models"
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
import DataManager from "@/libs/data/data-manager"
import { skillTreeResolver } from "@/libs/resolvers/skilltree-resolver"
import { getResonanceDisciplines } from "@/app/data/v5"
import { fvttOnline, rollInFvtt } from "@/libs/io/realtime"
import { resolveAssetUrl } from "@/libs/io/cdn"

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

type PoolEntry = { name: string; value: number; type: "attr" | "skill" | "disc" }
const dicePoolLeft = ref<PoolEntry | null>(null)
const dicePoolRight = ref<PoolEntry | null>(null)
const dicePoolExtra = ref<PoolEntry | null>(null)        // 3. Slot: Disziplin als Extra-Bonus (Alt+Shift)
const cursorSlot = ref<"left" | "right">("left")         // füllt den nächsten Nicht-Shift-Klick
const shiftDown = ref<boolean>(false)
const dicePoolHuman = ref<boolean>(false)                // Malus (Menschliche Interaktion)
const dicePoolBloodSurge = ref<boolean>(false)           // Blutschub
const dicePoolWillpower = ref<boolean>(false)            // freie Willenskraft-Felder
const dicePoolHumanity = ref<boolean>(false)             // floor(humanity / 3)
const dicePoolManual = ref<string>("")                   // manueller ±-Eintrag
const dicePoolDifficulty = ref<string>("1")              // Schwierigkeit (nur für FVTT, ändert das Total nicht)

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

  if (type === "disc" && shiftDown.value) {
    // Alt+Shift auf eine Disziplin -> Extra-Bonus (3. Slot), Cursor bleibt.
    dicePoolExtra.value = { name, value, type }
  } else {
    // Alles andere geht an den rotierenden Cursor -> beliebige Kombinationen.
    const slot = cursorSlot.value
    if (slot === "left") dicePoolLeft.value = { name, value, type }
    else dicePoolRight.value = { name, value, type }
    cursorSlot.value = slot === "left" ? "right" : "left"
  }

  // Soziale Werte schalten den Menschlich-Interaktion-Malus ein (nie automatisch aus).
  if (isHuman) dicePoolHuman.value = true
}

// Bonus-Flags per Alt-Klick togglebar (z.B. „Blutschub" in ProfileView), alternativ zur Checkbox.
function toggleDicePoolFlag(flag: "bloodSurge" | "willpower" | "humanity" | "human") {
  if (!altDown.value) return
  if (flag === "bloodSurge") dicePoolBloodSurge.value = !dicePoolBloodSurge.value
  else if (flag === "willpower") dicePoolWillpower.value = !dicePoolWillpower.value
  else if (flag === "humanity") dicePoolHumanity.value = !dicePoolHumanity.value
  else if (flag === "human") dicePoolHuman.value = !dicePoolHuman.value
}

function clearDicePool() {
  dicePoolLeft.value = null
  dicePoolRight.value = null
  dicePoolExtra.value = null
  cursorSlot.value = "left"
  dicePoolHuman.value = false
  dicePoolBloodSurge.value = false
  dicePoolWillpower.value = false
  dicePoolHumanity.value = false
  dicePoolManual.value = ""
}

provide("update-viewer", updaterViewer)
provide("request-m20-level", requestM20Leveling as unknown as RequestLevelFn)
provide("set-dice-pool", setDicePool)
provide("toggle-dice-pool-flag", toggleDicePoolFlag)

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
  if (event.key === "Shift") shiftDown.value = true

  // Alt+Pfeil links/rechts verschiebt den Würfelpool-Cursor (nächster Ziel-Slot).
  if (event.altKey && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
    event.preventDefault()
    cursorSlot.value = event.key === "ArrowLeft" ? "left" : "right"
  }

  // Alt+Shift+Pfeil hoch/runter ändert die Schwierigkeit (+1/-1, min 1).
  if (event.altKey && event.shiftKey && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
    event.preventDefault()
    const cur = parseInt(dicePoolDifficulty.value) || 1
    dicePoolDifficulty.value = String(Math.max(1, cur + (event.key === "ArrowUp" ? 1 : -1)))
    return
  }

  // Alt+Pfeil hoch/runter ändert den manuellen Bonus/Malus (+1/-1).
  if (event.altKey && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
    event.preventDefault()
    const cur = parseInt(dicePoolManual.value) || 0
    dicePoolManual.value = String(cur + (event.key === "ArrowUp" ? 1 : -1))
  }

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
  if (event.key === "Shift") shiftDown.value = false
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

// Verfügbare V5-Boni (Werte für Labels + Berechnung).
const dicePoolBonuses = computed(() => {
  const c = editingCharacter.value
  if (!c) return { bloodSurge: 0, willpower: 0, humanity: 0, resonance: 0 }

  // Blutschub = bleedingSpurt der (effektiven) Blutmacht.
  const effBP = Math.min(skillTreeResolver.getEffectiveCharacterValue(c, "bloodPotency", c.bloodPotency).value, 10)
  const bpRow = DataManager.selectedLanguage.bloodPotencyTable.find(x => x.value === effBP)
  const bloodSurge = bpRow?.bleedingSpurt ?? 0

  // Freie Willenskraft-Felder = Maximum minus markierte.
  const usedWp = (c.willpowerDamage || []).filter(d => d !== DamageType.None).length
  const willpower = Math.max(0, (c.willpower || 0) - usedWp)

  const humanity = Math.floor((c.humanity || 0) / 3)

  // Resonanz-Bonus (+1) automatisch: Temperament intensiv/akut + favorisierte Disziplin im Pool.
  let resonance = 0
  const temp = c.resonanceTemperament
  if (temp === V5ResonanceTemperament.Intense || temp === V5ResonanceTemperament.Acute) {
    const favored = getResonanceDisciplines(c.resonance as any)
    const discs = [dicePoolLeft.value, dicePoolRight.value, dicePoolExtra.value].filter(
      (e): e is PoolEntry => !!e && e.type === "disc",
    )
    if (discs.some(e => favored.includes(e.name))) resonance = 1
  }

  return { bloodSurge, willpower, humanity, resonance }
})

const dicePoolResult = computed<
  { total: number; simple: number; hunger: number; parts: { label: string; value: number }[] } | null
>(() => {
  const c = editingCharacter.value
  if (!c) return null
  // Schon ab dem ersten Wert rechnen (fehlende Slots zählen als 0).
  if (!dicePoolLeft.value && !dicePoolRight.value && !dicePoolExtra.value) return null

  const parts: { label: string; value: number }[] = []
  if (dicePoolLeft.value) parts.push({ label: dicePoolLeft.value.name, value: dicePoolLeft.value.value })
  if (dicePoolRight.value) parts.push({ label: dicePoolRight.value.name, value: dicePoolRight.value.value })
  if (dicePoolExtra.value) parts.push({ label: dicePoolExtra.value.name, value: dicePoolExtra.value.value })

  const b = dicePoolBonuses.value
  if (dicePoolBloodSurge.value && b.bloodSurge) parts.push({ label: "Blutschub", value: b.bloodSurge })
  if (dicePoolWillpower.value && b.willpower) parts.push({ label: "Willenskraft", value: b.willpower })
  if (dicePoolHumanity.value && b.humanity) parts.push({ label: "Menschlichkeit", value: b.humanity })
  if (b.resonance) parts.push({ label: "Resonanz", value: b.resonance })

  const manual = parseInt(dicePoolManual.value)
  if (!isNaN(manual) && manual !== 0) parts.push({ label: manual > 0 ? "Bonus" : "Malus", value: manual })

  if (dicePoolHuman.value) {
    const malus = getHumanInteractionMalus(c)
    if (malus === Number.MIN_SAFE_INTEGER) return { total: -1, simple: 0, hunger: 0, parts }
    if (malus) parts.push({ label: "Menschl. Interaktion", value: -malus })
  }

  let total = parts.reduce((s, p) => s + p.value, 0)
  if (dicePoolHuman.value && total <= 0) total = 1

  const hunger = Math.min(c.hunger, total)
  const simple = total - hunger
  return { total, simple, hunger, parts }
})

// Würfelpool an FoundryVTT (VicarTT) schicken. Payload entspricht VampiricDiceRoller.roll.
function rollDicePoolInFvtt() {
  const c = editingCharacter.value
  const r = dicePoolResult.value
  if (!c || !r || r.total === -1) return

  let avatar = resolveAssetUrl(c.avatar)
  if (avatar && !/^https?:/.test(avatar)) avatar = new URL(avatar, window.location.origin).href

  rollInFvtt({
    username: DataManager.loggedInAs || "",
    vampire: { name: c.name, avatar: avatar || "" },
    roll: {
      normalDices: r.simple,
      hungerDices: r.hunger,
      difficulty: Math.max(1, parseInt(dicePoolDifficulty.value) || 1),
    },
  })
}

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
        <Tab
          v-if="(editingCharacter.skillTrees?.length ?? 0) > 0"
          value="viewer-skilltrees"
          text="Skill-Bäume"
        />
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

    <div v-if="dicePoolLeft || dicePoolRight || dicePoolExtra" class="simple-dice-calc card">
      <h4 class="card-title">Würfelpool:</h4>
      <i @click="clearDicePool" class="fa-solid fa-xmark close" title="Leeren"></i>

      <div class="calc-names">
        <b class="name slot" :class="{ 'cursor-target': cursorSlot === 'left' }">{{ getDicePoolName(dicePoolLeft) }}</b>
        +
        <b class="name slot" :class="{ 'cursor-target': cursorSlot === 'right' }">{{ getDicePoolName(dicePoolRight) }}</b>
        <template v-if="dicePoolExtra">
          <span>+</span>
          <b class="name extra">
            {{ getDicePoolName(dicePoolExtra) }}
            <i class="fa-solid fa-xmark extra-close" @click="dicePoolExtra = null" title="Extra entfernen"></i>
          </b>
        </template>
      </div>

      <div class="calc-toggles">
        <label class="custom-checkbox"><input type="checkbox" v-model="dicePoolHuman" /> Menschl. Interaktion</label>
        <label class="custom-checkbox"><input type="checkbox" v-model="dicePoolBloodSurge" /> Blutschub (+{{ dicePoolBonuses.bloodSurge }})</label>
        <label class="custom-checkbox"><input type="checkbox" v-model="dicePoolWillpower" /> Willenskraft (+{{ dicePoolBonuses.willpower }})</label>
        <label class="custom-checkbox"><input type="checkbox" v-model="dicePoolHumanity" /> Menschlichkeit (+{{ dicePoolBonuses.humanity }})</label>
        <span class="manual">± <input type="number" v-model="dicePoolManual" placeholder="0" /></span>
        <span class="manual">Schw. <input type="number" min="1" v-model="dicePoolDifficulty" /></span>
      </div>

      <div v-if="dicePoolResult" class="calc-result">
        <div class="result-inner">
          <span v-if="dicePoolResult.total === -1">Unmöglich (Wassail?!)</span>
          <span v-else-if="dicePoolResult.hunger > 0">
            <b><u>{{ dicePoolResult.total }}</u> </b>
            Würfel davon
            <b style="color: var(--primary-color)">{{ dicePoolResult.hunger }}</b>
            Hungerwürfel und
            <b>{{ dicePoolResult.simple }}</b>
            normale Würfel
          </span>
          <span v-else><b>{{ dicePoolResult.total }} </b>Würfel</span>
        </div>
        <div v-if="dicePoolResult.total !== -1" class="result-breakdown">
          <span v-for="(p, i) in dicePoolResult.parts" :key="i">
            {{ p.label }} <b>{{ p.value >= 0 ? "+" : "−" }}{{ Math.abs(p.value) }}</b>
          </span>
        </div>
        <button
          v-if="fvttOnline && dicePoolResult.total !== -1"
          class="btn btn-primary fvtt-roll-btn"
          @click="rollDicePoolInFvtt"
        >
          <i class="fa-solid fa-dice-d20"></i> In FVTT würfeln
        </button>
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
  text-align: center;
  word-break: break-word;
}

.calc-names .name.slot {
  flex: 1;
  padding: 0.15rem 0.4rem;
  border-radius: 8px;
  transition: box-shadow 150ms ease;
}

/* Zeigt, welchen Slot der nächste Alt-Klick füllt. */
.calc-names .name.cursor-target {
  box-shadow: inset 0 0 0 2px var(--primary-color);
}

.calc-names .name.extra {
  flex: 0 0 auto;
  color: var(--primary-color);
}

.extra-close {
  cursor: pointer;
  pointer-events: all;
  margin-left: 0.3rem;
  font-size: 0.85rem;
  opacity: 0.7;
}
.extra-close:hover { opacity: 1; }

.calc-toggles {
  margin-top: 0.25rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 20%);
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1rem;
  justify-content: center;
  align-items: center;
  pointer-events: all;
  font-size: 0.95rem;
}
.calc-toggles .custom-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
}
.calc-toggles .manual {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}
.calc-toggles .manual input {
  width: 3.5rem;
  min-height: 0;
  padding: 0.2rem 0.4rem;
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

.result-breakdown {
  margin-top: 0.4rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.6rem;
  justify-content: center;
  font-size: 0.85rem;
  opacity: 0.75;
}

.fvtt-roll-btn {
  pointer-events: all;
  margin-top: 0.6rem;
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
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
