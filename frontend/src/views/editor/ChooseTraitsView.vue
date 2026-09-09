<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import EditorForm from "@/components/editor/EditorForm.vue"
import ChooseTraitModal from "@/components/editor/modals/ChooseTraitModal.vue"
import TipButton from "@/components/editor/TipButton.vue"
import XButton from "@/components/editor/XButton.vue"
import { useStore } from "@/app/store"
import { GameLine, type IEdition5Sheet } from "@/@types/gameline"
import {
  Generation,
  type ICharacter,
  type ILockableTrait,
  type IUsingTraitPack,
  type IUsingTraitPacks,
} from "@/@types/models"

const store = useStore()
const editingCharacter = computed(() => store.editingCharacter as IEdition5Sheet | undefined)

const chooseTraitModal = ref<InstanceType<typeof ChooseTraitModal> | null>(null)

const maxTraitPoints = ref(7)
const maxTraitBonus = ref(0)
const maxFlawPoints = ref(2)
const maxFlawBonus = ref(0)

onMounted(() => {
  const char = editingCharacter.value
  if (!char) return

  if (char.game !== GameLine.Mage) {
    maxTraitBonus.value = char.requiredPointSpreads
      .filter((s) => !s.isFlaw)
      .map((s) => s.points)
      .reduce((a, b) => a + b, 0)

    maxFlawBonus.value = char.requiredPointSpreads
      .filter((s) => s.isFlaw)
      .map((s) => s.points)
      .reduce((a, b) => a + b, 0)
  }

  const v5 = char as any as ICharacter
  if (v5["generationEra"] && v5.generationEra === Generation.Ancillae) {
    maxTraitPoints.value += 2
    maxFlawPoints.value += 2
  }

  if (char.game === GameLine.Mage) {
    maxFlawPoints.value = 0
  }
})

function getTraitSuffix(trait: ILockableTrait): string {
  return trait.suffix ? " (" + trait.suffix + ")" : ""
}

function getTraitLevel(trait: ILockableTrait) {
  return parseInt((trait.customLevel ?? trait.level).toString())
}

function isTraitNeededForOtherTrait(pack: IUsingTraitPack, trait: ILockableTrait): boolean {
  for (const existingTrait of pack.traits) {
    if (existingTrait.requirement?.type === "or") {
      if (existingTrait.requirement.values.includes(trait.id)) return true
    }
  }
  return false
}

function removeTrait(pack: IUsingTraitPack, trait: ILockableTrait, isFlaw: boolean) {
  if (trait.isLocked || !trait.isManual) return
  if (isTraitNeededForOtherTrait(pack, trait)) return

  if (isFlaw) {
    pack.flawTraits.splice(pack.flawTraits.indexOf(trait), 1)
  } else {
    pack.traits.splice(pack.traits.indexOf(trait), 1)
  }
}

function getUsedTraitPoints(): number {
  const char = editingCharacter.value
  if (!char) return 0

  const t = (using: IUsingTraitPacks) =>
    using.packs
      .map((pack) =>
        pack.traits
          .filter((trait) => trait.isManual)
          .map((trait) => getTraitLevel(trait))
          .reduce((a, b) => a + b, 0),
      )
      .reduce((a, b) => a + b, 0)

  return t(char.backgrounds) + t(char.merits)
}

function getUsedFlawPoints(): number {
  const char = editingCharacter.value
  if (!char) return 0

  const t = (using: IUsingTraitPacks) =>
    using.packs
      .map((pack) =>
        pack.flawTraits
          .filter((flaw) => flaw.isManual)
          .map((flaw) => getTraitLevel(flaw))
          .reduce((a, b) => a + b, 0),
      )
      .reduce((a, b) => a + b, 0)

  return t(char.backgrounds) + t(char.merits)
}

function hasTraitPointsLeft(): boolean {
  const char = editingCharacter.value
  if (!char) return false
  return getUsedTraitPoints() < maxTraitPoints.value + maxTraitBonus.value && !(char.isElder ?? false)
}

function hasFlawPointsLeft(): boolean {
  const char = editingCharacter.value
  if (!char) return false
  if (char.game === GameLine.Mage) return false
  return getUsedFlawPoints() < maxFlawPoints.value + maxFlawBonus.value && !(char.isElder ?? false)
}

function startAddingTrait(isFlaw: boolean) {
  const char = editingCharacter.value
  if (!char) return

  if (isFlaw) {
    chooseTraitModal.value?.showModal(isFlaw, Infinity)
    return
  }

  if (!hasTraitPointsLeft()) return
  chooseTraitModal.value?.showModal(isFlaw, maxTraitPoints.value + maxTraitBonus.value - getUsedTraitPoints())
}

const canGoNext = computed(() => {
  const char = editingCharacter.value
  if (!char) return false
  return !hasTraitPointsLeft() && !hasFlawPointsLeft()
})

const isMage = computed(() => editingCharacter.value?.game === GameLine.Mage)
</script>

<template>
  <EditorForm :can-go-next="canGoNext" :next-step="isMage ? 'editor-m20-finishing-touches' : 'editor-attributes'">
    <div v-if="editingCharacter" class="page">
      <div class="choose-traits-wrapper">
        <div class="form-group center">
          <label class="required">Gib die folgenden Punkte für Vorzüge und Schwächen aus:</label>
        </div>

        <div class="packs">
          <div class="card pack">
            <span class="head">
              <small>Vorteile: </small>
              <b class="ml-5">{{ getUsedTraitPoints() }}</b>/{{ maxTraitPoints }}{{ maxTraitBonus > 0 ? " (+" + maxTraitBonus + ")" : "" }}
              <TipButton class="ml-10" content="Die +X in den Klammern hinter Vorzüge oder Schwächen bedeutet, dass durch dein vorher gewähltes Jagdverhalten Bonuspunkte auf einen Vorzug oder eine Schwäche verteilt werden müssen. In der aktuellen Version passiert dies noch nicht automatisch und das Programm prüft auch nicht, ob du die Bonuspunkte an den richtigen Stellen verteilst. Hier gilt Vertrauen gegenüber dem Spielerleiter." v-if="maxTraitBonus > 0" />
            </span>

            <div v-for="p in editingCharacter.merits.packs" :key="'m-' + p.pack.id" class="group">
              <div
                v-for="t in [...p.traits].sort((a, b) => a.name.localeCompare(b.name))"
                :key="'mt-' + t.id"
                class="trait"
                :class="{ locked: t.isLocked || !t.isManual }"
              >
                <span class="line">
                  <i>Vorzug</i> - <b>{{ p.pack.name }}</b>: {{ t.name }}{{ getTraitSuffix(t) }} -
                  <small><b>Stufe</b>: {{ getTraitLevel(t) }}</small>
                </span>
                <div class="actions">
                  <TipButton :content="t.description" />
                  <XButton
                    v-if="!t.isLocked && t.isManual && !isTraitNeededForOtherTrait(p, t)"
                    class="ml-5"
                    @click="removeTrait(p, t, false)"
                  />
                </div>
              </div>
            </div>

            <div v-for="p in editingCharacter.backgrounds.packs" :key="'b-' + p.pack.id" class="group">
              <div
                v-for="t in [...p.traits].sort((a, b) => a.name.localeCompare(b.name))"
                :key="'bt-' + t.id"
                class="trait"
                :class="{ locked: t.isLocked || !t.isManual }"
              >
                <span class="line">
                  <i>Hintergrund</i> - <b>{{ p.pack.name }}</b>: {{ t.name }}{{ getTraitSuffix(t) }} -
                  <small><b>Stufe</b>: {{ getTraitLevel(t) }}</small>
                </span>
                <div class="actions">
                  <TipButton :content="t.description" />
                  <XButton
                    v-if="!t.isLocked && t.isManual && !isTraitNeededForOtherTrait(p, t)"
                    class="ml-5"
                    @click="removeTrait(p, t, false)"
                  />
                </div>
              </div>
            </div>

            <button v-if="hasTraitPointsLeft()" class="trait-add" type="button" @click="startAddingTrait(false)" data-agent="trait:add" data-agent-label="Vorzug hinzufügen">
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>

          <div v-if="editingCharacter.game !== GameLine.Mage" class="card pack">
            <span class="head">
              <small>Schwächen: </small>
              <b class="ml-5">{{ getUsedFlawPoints() }}</b>/{{ maxFlawPoints }}{{ maxFlawBonus > 0 ? " (+" + maxFlawBonus + ")" : "" }}
              <TipButton class="ml-10" content="Die +X in den Klammern hinter Vorzüge oder Schwächen bedeutet, dass durch dein vorher gewähltes Jagdverhalten Bonuspunkte auf einen Vorzug oder eine Schwäche verteilt werden müssen. In der aktuellen Version passiert dies noch nicht automatisch und das Programm prüft auch nicht, ob du die Bonuspunkte an den richtigen Stellen verteilst. Hier gilt Vertrauen gegenüber dem Spielerleiter." v-if="maxFlawBonus > 0" />
            </span>

            <div v-for="p in editingCharacter.merits.packs" :key="'mf-' + p.pack.id" class="group">
              <div
                v-for="t in [...p.flawTraits].sort((a, b) => a.name.localeCompare(b.name))"
                :key="'mft-' + t.id"
                class="trait"
                :class="{ locked: t.isLocked || !t.isManual }"
              >
                <span class="line">
                  <i>Vorzug</i> - <b>{{ p.pack.name }}</b>: {{ t.name }}{{ getTraitSuffix(t) }} -
                  <small><b>Stufe</b>: {{ getTraitLevel(t) }}</small>
                </span>
                <div class="actions">
                  <TipButton :content="t.description" />
                  <XButton
                    v-if="!t.isLocked && t.isManual && !isTraitNeededForOtherTrait(p, t)"
                    class="ml-5"
                    @click="removeTrait(p, t, true)"
                  />
                </div>
              </div>
            </div>

            <div v-for="p in editingCharacter.backgrounds.packs" :key="'bf-' + p.pack.id" class="group">
              <div
                v-for="t in [...p.flawTraits].sort((a, b) => a.name.localeCompare(b.name))"
                :key="'bft-' + t.id"
                class="trait"
                :class="{ locked: t.isLocked || !t.isManual }"
              >
                <span class="line">
                  <i>Hintergrund</i> - <b>{{ p.pack.name }}</b>: {{ t.name }}{{ getTraitSuffix(t) }} -
                  <small><b>Stufe</b>: {{ getTraitLevel(t) }}</small>
                </span>
                <div class="actions">
                  <TipButton :content="t.description" />
                  <XButton
                    v-if="!t.isLocked && t.isManual && !isTraitNeededForOtherTrait(p, t)"
                    class="ml-5"
                    @click="removeTrait(p, t, true)"
                  />
                </div>
              </div>
            </div>

            <button class="trait-add" type="button" @click="startAddingTrait(true)" data-agent="flaw:add" data-agent-label="Schwäche hinzufügen">
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>
        </div>
      </div>

      <ChooseTraitModal ref="chooseTraitModal" :gameline="editingCharacter.game" />
    </div>
  </EditorForm>
</template>

<style scoped lang="scss">
.page {
  width: 100%;
  height: 100%;
  padding: clamp(1rem, 4vw, 5rem);
  display: flex;
  justify-content: center;
  align-items: center;
}

.choose-traits-wrapper {
  width: min(1200px, 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.center {
  text-align: center;
}

.packs {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  align-items: start;
}

.pack {
  margin: 0;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.head {
  width: 100%;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 0.35rem;
  padding-bottom: 0.65rem;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.10);
  flex-wrap: wrap;
}

.group {
  width: 100%;
}

.trait {
  width: 100%;
  display: flex;
  padding: 0.55rem 0.6rem;
  gap: 0.75rem;
  align-items: center;
  border-radius: 12px;
  transition: filter var(--dur-2) var(--ease-2), border-color var(--dur-2) var(--ease-2), transform var(--dur-2) var(--ease-2);
  border: 1px solid transparent;
  &:hover {
    border-color: rgba(255, 255, 255, 0.10);
    filter: brightness(1.03);
  }
  &.locked {
    opacity: 0.7;
    cursor: not-allowed;
    user-select: none;
    &:hover {
      border-color: transparent;
      filter: none;
    }
  }
}

.line {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.actions {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
}

.trait-add {
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.65rem 0.75rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.10);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), transparent 55%),
    linear-gradient(180deg, var(--bg-3), var(--bg-2));
  box-shadow: var(--shadow-hairline);
  cursor: pointer;
  user-select: none;
  transition: transform var(--dur-2) var(--ease-2), filter var(--dur-2) var(--ease-2), border-color var(--dur-2) var(--ease-2);
  &:hover {
    transform: translateY(-1px);
    filter: brightness(1.03);
    border-color: rgba(255, 255, 255, 0.16);
  }
  &:active {
    transform: translateY(0);
    filter: brightness(0.99);
  }
}

@media (max-width: 980px) {
  .packs {
    grid-template-columns: 1fr;
  }
  .page {
    align-items: flex-start;
  }
}
</style>
