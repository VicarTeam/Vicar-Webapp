<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue"
import Modal from "@/components/modal/Modal.vue"
import DataManager from "@/libs/data/data-manager"
import {restrictionResolver} from "@/libs/resolvers/restriction-resolver"
import PTActionHandler from "@/libs/ptaction-handler"
import CharacterStorage from "@/libs/io/character-storage"
import {GameLine, LevelChangeType} from "@/@types/gameline"
import {useStore} from "@/app/store"
import type {ICharacter, IUsingTraitPacks} from "@/@types/models"
import {type ITrait, type ITraitPack, TraitSpecialRules} from "@/@types/data"
import {traits} from "@/app/data/w5"
import {traits as m20traits} from "@/app/data/m20"
import {traits as h5traits} from "@/app/data/h5"

export type ChooseTraitData = {
  merits: ITraitPack[]
  backgrounds: ITraitPack[]
}

export type CostsCalculationCallback = (trait: ITrait, level: number) => number

const StatusId = 11

const props = defineProps<{
  gameline?: GameLine
}>()

const store = useStore()
const editingCharacter = computed<ICharacter | undefined>(() => store.editingCharacter as any)

const gameline = computed(() => props.gameline ?? GameLine.Vampire)

const selectedPack = ref<ITraitPack | null>(null)
const selectedTrait = ref<ITrait | null>(null)

const customLevel = ref(0)
const maxCustomLevel = ref(0)
const specialization = ref("")

const show = ref(false)
const isFlaw = ref(false)
const pointsLeft = ref(0)
const data = ref<ChooseTraitData | null>(null)

const calculateCosts = ref<CostsCalculationCallback | null>(null)

const _customPack = ref<ITraitPack | null>(null)
const customTraitType = ref<"merits" | "backgrounds">("merits")
const customTraitLevel = ref(1)
const customTraitName = ref("")
const customTraitDescription = ref("")
const customTraitSpecialization = ref("")

function maxLevel() {
  if (editingCharacter.value?.game === GameLine.Mage) return 10
  return 5
}

function getTraitsForEdition(): ChooseTraitData {
  if (gameline.value === GameLine.Werewolf) {
    return {
      backgrounds: traits.filter((x: any) => x.type === "backgrounds"),
      merits: traits.filter((x: any) => x.type === "merits"),
    }
  }
  if (gameline.value === GameLine.Mage) {
    return {
      backgrounds: m20traits as any,
      merits: [],
    }
  }
  if (gameline.value === GameLine.Hunter) {
    return {
      backgrounds: h5traits.filter((x: any) => x.type === "backgrounds"),
      merits: h5traits.filter((x: any) => x.type === "merits"),
    }
  }

  return {
    backgrounds: DataManager.selectedLanguage.books.flatMap((book: any) => book?.backgrounds ?? []),
    merits: DataManager.selectedLanguage.books.flatMap((book: any) => book?.merits ?? []),
  }
}

onMounted(() => {
  data.value = getTraitsForEdition()
  _customPack.value = {
    id: -42,
    type: "merits",
    name: String((window as any).$t ? (window as any).$t("editor.traits.modals.custom") : "Custom"),
    description: String((window as any).$t ? (window as any).$t("editor.traits.modals.custom.desc") : ""),
    specialRules: TraitSpecialRules.None,
    advantages: [],
    disadvantages: [],
  } as any
})

function showModal(flaw: boolean, left: number, cb: CostsCalculationCallback | null = null) {
  selectedTrait.value = null
  selectedPack.value = null
  isFlaw.value = flaw
  pointsLeft.value = left
  calculateCosts.value = cb
  customLevel.value = 0
  specialization.value = ""
  customTraitLevel.value = 1
  customTraitName.value = ""
  customTraitDescription.value = ""
  customTraitSpecialization.value = ""
  customTraitType.value = "merits"
  show.value = true
}

function getTraitPackBonusSpread(pack: ITraitPack, type: "backgrounds" | "merits", flaw: boolean) {
  const char = editingCharacter.value
  if (!char || char.game === GameLine.Mage) return null
  return (char as any).requiredPointSpreads.find((s: any) => s.type === type && s.isFlaw === flaw && s.packId === pack.id)
}

function getTraitPackBonus(pack: ITraitPack, type: "backgrounds" | "merits", flaw: boolean) {
  return getTraitPackBonusSpread(pack, type, flaw)?.points ?? 0
}

function doesTraitExist(char: ICharacter, pack: ITraitPack, traitId: number, flaw: boolean) {
  const exists = (using: IUsingTraitPacks) => {
    const p = using.packs.find((x: any) => x.pack.id === pack.id)
    if (!p) return false
    const list = flaw ? p.flawTraits : p.traits
    return !!list.find((t: any) => t.id === traitId)
  }

  if ((pack as any).type === "merits") return exists((char as any).merits)
  if ((pack as any).type === "backgrounds") return exists((char as any).backgrounds)
  return false
}

function filterTraits(pack: ITraitPack, list: ITrait[]) {
  const char = editingCharacter.value
  if (char?.game === GameLine.Vampire) {
    if (!isFlaw.value && pack.id === StatusId && (char as any).clan?.id === 15 && !calculateCosts.value) return []
  }

  const pointsRequirement = list.filter((t) => (t as any).level <= pointsLeft.value)
  const usedFiltered = pointsRequirement.filter((t) => !doesTraitExist(char!, pack, (t as any).id, isFlaw.value))
  const fulfilsRestrictions = usedFiltered.filter((t) => {
    const r = (t as any).restriction
    if (r) return restrictionResolver.resolve(char!, r)
    return true
  })
  return fulfilsRestrictions.filter((t) => {
    const req = (t as any).requirement
    if (req && req.type === "or") return req.values.some((r: number) => doesTraitExist(char!, pack, r, isFlaw.value))
    return true
  })
}

function filterTraitPacks(packs: ITraitPack[]) {
  const char = editingCharacter.value
  return DataManager.filterRestrictions(char, packs).filter((pack: any) => filterTraits(pack, [...pack[isFlaw.value ? "disadvantages" : "advantages"]]).length > 0)
}

function selectTrait(trait: ITrait | null) {
  selectedTrait.value = trait
  specialization.value = ""
  if (trait) {
    customLevel.value = (trait as any).level
    maxCustomLevel.value = getMaxCustomLevel()
  }
}

function getMaxCustomLevel() {
  if (!selectedTrait.value) return 0

  let currentMax = Infinity
  for (let i = (selectedTrait.value as any).level; i <= maxLevel(); i++) {
    if (i > pointsLeft.value) break
    currentMax = i
  }

  const change = (val: number) => {
    if (val < currentMax) currentMax = val
  }

  const rr = (selectedTrait.value as any).restrictRepeats
  if (rr) {
    if (rr.size) {
      if (doesTraitExist(editingCharacter.value!, selectedPack.value!, rr.size, isFlaw.value)) change(rr.amount)
    } else {
      change(rr.amount)
    }
  }

  return currentMax
}

const minCustomLevel = computed(() => (selectedTrait.value as any)?.level ?? 0)

const traitsList = computed(() => {
  if (!selectedPack.value) return []
  return filterTraits(selectedPack.value, [...(selectedPack.value as any)[isFlaw.value ? "disadvantages" : "advantages"]]).sort((a: any, b: any) => a.name.localeCompare(b.name))
})

const merits = computed(() => {
  const d = data.value
  if (!d) return []
  return filterTraitPacks([...d.merits]).sort((a: any, b: any) => a.name.localeCompare(b.name))
})

const backgrounds = computed(() => {
  const d = data.value
  const char = editingCharacter.value
  if (!d) return []
  return filterTraitPacks([...d.backgrounds])
    .filter((x: any) => {
      if (char?.game === GameLine.Vampire) {
        if (!isFlaw.value && (char as any).clan?.id === 15 && x.id === 11) return false
      }
      return true
    })
    .sort((a: any, b: any) => a.name.localeCompare(b.name))
})

const isReadyForNormalUse = computed(() => {
  const char = editingCharacter.value
  if (!selectedPack.value || !selectedTrait.value) return false
  if (!calculateCosts.value) return true
  return calculateCosts.value(selectedTrait.value, customLevel.value) <= (char?.exp ?? 0)
})

const isReadyForCustom = computed(() => {
  const sp = selectedPack.value
  const cp = _customPack.value
  return !!sp && !!cp && sp.id === cp.id && customTraitName.value.length > 0 && customTraitDescription.value.length > 0 && customTraitLevel.value >= 1 && customTraitLevel.value <= maxLevel()
})

const isReady = computed(() => isReadyForNormalUse.value || isReadyForCustom.value)

function addSelectedTrait() {
  const char = editingCharacter.value
  const sp = selectedPack.value
  const cp = _customPack.value
  if (!isReady.value || !sp || !char) return

  const isCustom = !!cp && sp.id === cp.id

  if (!isCustom) {
    const upack = PTActionHandler.initializeTraitPack(char, sp, (sp as any).type)
    ;(isFlaw.value ? upack.flawTraits : upack.traits).push({
      ...(selectedTrait.value as any),
      customLevel: customLevel.value,
      suffix: specialization.value,
      isLocked: false,
      isManual: true,
    })

    if (calculateCosts.value) {
      const c = calculateCosts.value(selectedTrait.value!, customLevel.value)
      CharacterStorage.trackLevelChange(char, isFlaw.value ? LevelChangeType.Flaw : LevelChangeType.Trait, c, selectedTrait.value!.name + " (Level " + customLevel.value + ") hinzugefügt")
      CharacterStorage.saveCharacter(char)
    }
  } else {
    const upack = PTActionHandler.initializeTraitPack(char, cp!, customTraitType.value)
    ;(isFlaw.value ? upack.flawTraits : upack.traits).push({
      id: 42 * Date.now(),
      name: customTraitName.value,
      description: customTraitDescription.value,
      level: customTraitLevel.value as any,
      customLevel: customTraitLevel.value,
      suffix: customTraitSpecialization.value,
      isLocked: false,
      isManual: true,
      isRepeatable: false,
      actions: [],
    })
  }

  show.value = false
}

watch(
  () => selectedPack.value,
  () => selectTrait(null)
)

defineExpose({ showModal })
</script>

<template>
  <Modal :shown="show" v-if="editingCharacter && data" @close="show = false">
    <div class="wrap">
      <div class="top">
        <b class="top-title">{{ isFlaw ? 'Schwäche hinzufügen' : 'Vorteil hinzufügen' }}:</b>

        <select class="form-control categorized" v-model="selectedPack">
          <option v-if="merits.length > 0" class="category" disabled>Vorzüge</option>
          <option v-for="m in merits" :key="'m' + m.id" :value="m">
            {{ m.name }}{{ getTraitPackBonus(m, "merits", isFlaw) > 0 ? "(+" + getTraitPackBonus(m, "merits", isFlaw) + ")" : "" }}
          </option>

          <option v-if="backgrounds.length > 0" class="category" disabled>Hintergründe</option>
          <option v-for="b in backgrounds" :key="'b' + b.id" :value="b">
            {{ b.name }}{{ getTraitPackBonus(b, "backgrounds", isFlaw) > 0 ? "(+" + getTraitPackBonus(b, "backgrounds", isFlaw) + ")" : "" }}
          </option>

          <option disabled></option>
          <option v-if="_customPack" style="font-style: italic; text-align: center" :value="_customPack">[GM] Benutzerdefiniert</option>
        </select>
      </div>

      <div class="pack" v-if="selectedPack && _customPack && selectedPack.id !== _customPack.id">
        <small>{{ selectedPack.description }}</small>

        <div class="trait-pack-content">
          <div class="traits">
            <div class="trait" v-for="trait in traitsList" :key="trait.id" @click="selectTrait(trait)" :class="{ selected: trait === selectedTrait }">
              <b>{{ trait.name }}</b> - <small><i><b>Stufe</b>: {{ trait.level }}</i></small>
            </div>
          </div>

          <div class="border"></div>

          <div class="info" :class="{ 'not-selected': !selectedTrait }">
            <small v-if="!selectedTrait">Du musst links etwas auswählen!</small>
            <small v-else>{{ selectedTrait.description }}</small>
          </div>
        </div>
      </div>

      <div class="pack" v-else-if="selectedPack && _customPack && selectedPack.id === _customPack.id">
        <small>{{ selectedPack.description }}</small>

        <div class="custom">
          <div class="form-group">
            <label>Typ (Vorzug oder Hintergrund):</label>
            <select class="form-control" v-model="customTraitType">
              <option value="merits">Vorzug</option>
              <option value="backgrounds">Hintergrund</option>
            </select>
          </div>

          <div class="form-group">
            <label>Stufe:</label>
            <select class="form-control" v-model="customTraitLevel">
              <option v-for="i in maxLevel()" :key="i" :value="i">{{ i }}</option>
            </select>
          </div>

          <div class="form-group">
            <label>Name:</label>
            <input class="form-control" type="text" v-model="customTraitName" />
          </div>

          <div class="form-group">
            <label>Beschreibung:</label>
            <textarea class="form-control" v-model="customTraitDescription" style="resize: horizontal" />
          </div>

          <div class="form-group">
            <label>(optional) Spezialisierung festlegen:</label>
            <input class="form-control" type="text" v-model="customTraitSpecialization" />
          </div>
        </div>
      </div>

      <div class="optional-trait-options" v-if="selectedTrait">
        <div class="form-group half">
          <label>(optional) Stufe erhöhen:</label>
          <input class="form-control" type="number" v-model="customLevel" :min="minCustomLevel" :max="maxCustomLevel" />
        </div>
        <div class="form-group half">
          <label>(optional) Spezialisierung festlegen:</label>
          <input class="form-control" type="text" v-model="specialization" />
        </div>
      </div>

      <div class="bottom">
        <span v-if="selectedTrait && calculateCosts" class="mb-10">{{ `Kosten: ${calculateCosts(selectedTrait, customLevel)} EXP` }}</span>
        <button class="btn btn-primary" :disabled="!isReady" @click="addSelectedTrait">Auswählen</button>
      </div>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
$border: 1px solid var(--primary-color) !important;

.wrap {
  width: min(60rem, calc(100vw - 2rem));
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.top {
  width: 100%;
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}
.top-title {
  flex-grow: 1;
}

.trait-pack-content {
  padding-bottom: 1rem;
  display: flex;
  gap: 1rem;
  flex-direction: row;
  $height: 20rem;
  & > div {
    height: $height;
    display: flex;
    flex-direction: column;
    &:not(.border) {
      overflow-x: hidden;
      overflow-y: auto;
    }
    &.traits {
      flex-grow: 1;
      gap: 0.4rem;
      .trait {
        user-select: none;
        cursor: pointer;
        padding: 0.3rem 0.7rem;
        border-radius: 6px;
        font-size: 1.15rem;
        &.selected {
          background-color: rgba(255, 255, 255, 0.2);
        }
        &:not(.selected):hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
      }
    }
    &.border {
      width: 1px;
      border-left: $border;
    }
    &.info {
      width: 40%;
      &.not-selected {
        justify-content: center;
        align-items: center;
        font-style: italic;
        color: rgba(255, 255, 255, 0.4);
        user-select: none;
        text-align: center;
        padding: 0 0.5rem;
      }
    }
  }
}

.pack {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.custom {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.optional-trait-options {
  width: 100%;
  border: $border;
  padding: 1.2rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  .form-group {
    margin: 0;
  }
  .half {
    width: min(22rem, 100%);
    flex: 1 1 16rem;
  }
}

.form-control.categorized {
  width: fit-content;
  max-width: 100%;
  .category {
    text-align: center;
    font-weight: 800;
    color: #fff;
  }
}

.bottom {
  margin-top: 0.75rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .btn {
    min-height: 44px;
    width: min(18rem, 100%);
  }
}

@media (max-width: 700px) {
  .trait-pack-content {
    flex-direction: column;
    & > div {
      height: auto;
    }
    .border {
      display: none;
    }
    .info {
      width: 100% !important;
      min-height: 5rem;
    }
    .traits {
      max-height: 40vh;
    }
  }
}
</style>
