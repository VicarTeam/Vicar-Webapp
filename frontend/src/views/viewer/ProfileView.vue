<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, ref } from "vue"
import { useStore } from "@/app/store"
import Avatar from "@/components/Avatar.vue"
import MarkdownEditor from "@/components/text/MarkdownEditor.vue"
import Bullet from "@/components/Bullet.vue"
import IconButton from "@/components/IconButton.vue"
import Squares from "@/components/progress/Squares.vue"
import Tabs from "@/components/tabs/Tabs.vue"
import TipButton from "@/components/editor/TipButton.vue"
import LevelButton from "@/components/viewer/LevelButton.vue"
import BloodPotencyModal from "@/components/viewer/modals/leveling/BloodPotencyModal.vue"
import RenownModal from "@/components/viewer/modals/leveling/RenownModal.vue"
import ConfirmDeleteModal from "@/components/viewer/modals/ConfirmDeleteModal.vue"
import Col from "@/components/viewer/Col.vue"
import Row from "@/components/viewer/Row.vue"
import Humanity from "@/components/progress/tracker/Humanity.vue"
import Damage from "@/components/progress/tracker/Damage.vue"
import EventBus from "@/libs/event-bus"
import CharacterStorage from "@/libs/io/character-storage"
import { uploadImage } from "@/libs/io/cdn"
import DataManager from "@/libs/data/data-manager"
import { skillTreeResolver } from "@/libs/resolvers/skilltree-resolver"
import { getResonanceDisciplines } from "@/app/data/v5"
import {
  getGenerationName,
  getResonanceByIndex,
  getSexName,
  type ICharacter,
  type V5Resonance,
  V5ResonanceTemperament
} from "@/@types/models"
import { getHumanInteractionMalus } from "@/@types/models"
import type { IBloodPotencyData } from "@/@types/data"
import type { IW5Renown, IWerewolfW5Sheet, W5RenownKey } from "@/@types/w5"
import { W5RenownKey as RenownKeyEnum } from "@/@types/w5"
import {type RequestLevelFn, type M20Sphere, type IMageSheet, getEssenceName, getEssenceDescription} from "@/@types/m20"
import { M20Sphere as SphereEnum } from "@/@types/m20"
import type {IHunterSheet} from "@/@types/h5.ts";

const store = useStore()

const editingCharacter = computed(() => store.editingCharacter as ICharacter | undefined)

const isVampire = computed(() => store.isVampire)
const isWerewolf = computed(() => store.isWerewolf)
const isMage = computed(() => store.isMage)
const isHunter = computed(() => store.isHunter)

// Referenz: die fünf Garou-Formen (W5) mit Kosten/Modifikatoren – Anzeige auf der
// Profilseite (aus dem alten Frontend übernommen).
const werewolfForms = [
  { name: "Homid", lines: ["Kosten: frei", "Immun gegen Silber"] },
  { name: "Glabro", lines: ["Kosten: 1 Rage-Test", "Körperliche Tests: Bonus von 2 Würfeln", "Soziale Tests: Malus von 2 Würfeln", "Regenerierung: 1 pro Rage-Test"] },
  { name: "Crinos", lines: ["Kosten: 2 Rage-Test", "Pro Runde 1 Willenskraft ausgeben oder in Raserei verfallen", "+4 Leben", "Körperliche Tests: Bonus von 4 Würfeln", "Soziale & Heimlichkeit Tests: Fehlschlag", "Regenerierung: 2 pro Rage-Test", "Biss: +1 schwerer Schaden", "Verursacht Delirium"] },
  { name: "Hispo", lines: ["Kosten: 1 Rage-Test", "Körperliche Tests: Bonus von 2 Würfeln", "Soziale Tests: nur mit Wölfen und Garou", "Regenerierung: 1 pro Rage-Test", "Biss: +1 schwerer Schaden"] },
  { name: "Lupus", lines: ["Kosten: frei", "Immun gegen Silber", "Soziale Tests: nur mit Wölfen und Garou"] },
]

const requestLevel = inject("request-m20-level") as RequestLevelFn | undefined
const updateViewer = inject("update-viewer") as (() => void) | undefined
const showTip = inject("show-tip") as ((content: any, title?: any) => void) | undefined

const avatarUploader = ref<HTMLInputElement | null>(null)
const levelBloodPotencyModal = ref<InstanceType<typeof BloodPotencyModal> | null>(null)
const levelRenownModal = ref<InstanceType<typeof RenownModal> | null>(null)
const confirmDeleteModal = ref<InstanceType<typeof ConfirmDeleteModal> | null>(null)

const isEditName = ref(false)
const editName = ref("")

const RenownKey = RenownKeyEnum
const Sphere = SphereEnum

function onMocGranted() {
  updateViewer?.()
}

onMounted(() => {
  EventBus.$on("moc-granted", onMocGranted)
})

onUnmounted(() => {
  EventBus.$off("moc-granted", onMocGranted)
})

function saveChar(triggerSync = false, instant: boolean = false) {
  if (!editingCharacter.value) return
  CharacterStorage.saveCharacter(editingCharacter.value, triggerSync, instant)
}

function onResonanceSave() {
  const c = editingCharacter.value
  if (!c || !isVampire.value || !c.resonance) return

  const resonanceKey = getResonanceByIndex(c.resonance as unknown as number);
  document.body.classList.add(`vicar-resonance-glow--${resonanceKey}`)
  setTimeout(() => {
    document.body.classList.remove(`vicar-resonance-glow--${resonanceKey}`)
  }, 5000)

  saveChar()
}

function onResonanceTemperamentSave() {
  const c = editingCharacter.value
  if (!c || !isVampire.value || !c.resonanceTemperament) return
  saveChar()
}

function getBloodPotency(): IBloodPotencyData {
  return DataManager.selectedLanguage.bloodPotencyTable.find(x => x.value === getBloodPotencyValue())!
}

function getBloodPotencyValue(): number {
  const c = editingCharacter.value
  if (!c) return 0
  // Effektivwert inkl. aktiver Skill-Tree-Modifikatoren.
  const eff = skillTreeResolver.getEffectiveCharacterValue(c, "bloodPotency", c.bloodPotency).value
  return Math.min(eff, 10)
}

/** Effektive Generation inkl. Skill-Tree-Modifikatoren (für die Anzeige). */
const effectiveGeneration = computed(() => {
  const c = editingCharacter.value
  if (!c) return 0
  return skillTreeResolver.getEffectiveCharacterValue(c, "generation", c.generation).value
})

async function onAvatarUpload(e: Event) {
  const c = editingCharacter.value
  if (!c) return

  const input = e.target as HTMLInputElement
  const file = input?.files?.[0]
  if (!file) return

  // Bild ins CDN (Dateisystem) hochladen statt base64 in den Charakter-Blob zu
  // schreiben; gespeichert wird nur der relative /cdn/<file>-Pfad.
  const url = await uploadImage(file)
  if (input) input.value = ""
  if (!url) {
    console.error("Avatar-Upload fehlgeschlagen")
    return
  }

  c.avatar = url
  saveChar()
  updateViewer?.()
}

function changeAvatar(e: MouseEvent) {
  if (e.shiftKey) avatarUploader.value?.click()
}

function decreaseBloodPotency() {
  const c = editingCharacter.value
  if (!c) return

  confirmDeleteModal.value?.showModal(`Blutmacht ${c.bloodPotency}`, () => {
    c.bloodPotency--
    CharacterStorage.saveCharacter(c)
  })
}

function levelRenown(renownKey: W5RenownKey) {
  const c = editingCharacter.value
  if (!c || !isWerewolf.value) return
  levelRenownModal.value?.showModal(c as any as IWerewolfW5Sheet, renownKey)
}

const resonanceDisciplines = computed(() => {
  if (!isVampire.value) return ""
  const c = editingCharacter.value
  return getResonanceDisciplines(c?.resonance as any as V5Resonance).join(", ")
})

function getRenownValue(key: W5RenownKey): number {
  const c = editingCharacter.value
  if (!c || !isWerewolf.value) return 0
  return (c as any as IWerewolfW5Sheet).renown.find(x => x.key === key)?.value || 0
}

function setRenownValue(key: W5RenownKey, value: number) {
  const c = editingCharacter.value
  if (!c || !isWerewolf.value) return
  const sheet = c as any as IWerewolfW5Sheet
  const renown = sheet.renown.find(x => x.key === key)
  if (renown) renown.value = value
  else sheet.renown.push({ key, value } as IW5Renown)
}

const gloryRenown = computed<number>({
  get: () => getRenownValue(RenownKeyEnum.Glory),
  set: v => setRenownValue(RenownKeyEnum.Glory, v),
})

const honorRenown = computed<number>({
  get: () => getRenownValue(RenownKeyEnum.Honor),
  set: v => setRenownValue(RenownKeyEnum.Honor, v),
})

const wisdomRenown = computed<number>({
  get: () => getRenownValue(RenownKeyEnum.Wisdom),
  set: v => setRenownValue(RenownKeyEnum.Wisdom, v),
})

const totalRenown = computed(() => {
  const c: any = editingCharacter.value
  if (!c?.renown) return 0
  return (c.renown as IW5Renown[]).reduce((sum, r) => sum + r.value, 0)
})

const humanityMalus = computed(() => {
  const c = editingCharacter.value
  if (!c || !isVampire.value) return ""
  const dices = getHumanInteractionMalus(c)
  return dices === Number.MIN_SAFE_INTEGER ? "∞ (Wasail)" : String(dices)
})

const mocActive = computed(() => {
  const c = editingCharacter.value
  return !!(isVampire.value && c?.hasCainsMark)
})
</script>

<template>
  <div v-if="editingCharacter" class="profile-view">
    <input
      ref="avatarUploader"
      type="file"
      hidden
      accept="image/png, image/gif, image/jpeg"
      @change="onAvatarUpload"
    />

    <div class="meta">
      <Avatar
        :src="editingCharacter.avatar"
        :orientation="editingCharacter.avatarOrientation"
        class="avatar"
        :draggable="true"
        @click="changeAvatar($event)"
      />

      <div class="info">
        <div v-if="!isEditName" class="name">
          {{ editingCharacter.name }}
          <IconButton class="name-btn" icon="fa-pen" @click="editName = editingCharacter.name; isEditName = true" />
        </div>

        <div v-else class="name edit">
          <input class="form-control name-input" type="text" v-model="editName" />
          <IconButton icon="fa-check" @click="editingCharacter.name = editName; isEditName = false" />
          <IconButton icon="fa-x" @click="isEditName = false" />
        </div>

        <span v-if="isVampire" class="side">
          {{ getSexName(editingCharacter.sex) }}
          <Bullet />
          <i> Clan:</i> {{ editingCharacter.clan.name }}
          <Bullet />
          {{ editingCharacter.clan.slogan }}
          <TipButton :content="editingCharacter.clan.curse" />
        </span>

        <span v-else-if="isWerewolf" class="side">
          {{ getSexName(editingCharacter.sex) }}
          <Bullet />
          <i> Stamm:</i> {{ (editingCharacter as any as IWerewolfW5Sheet).tribe.name }}
          <Bullet />
          <i> Patrongeist:</i> {{ (editingCharacter as any as IWerewolfW5Sheet).tribe.patron.name }}
          <Bullet />
          <i> Gunst <TipButton :content="(editingCharacter as any as IWerewolfW5Sheet).tribe.favor" /></i>
          <Bullet class="ml-xxs" />
          <i> Bann <TipButton :content="(editingCharacter as any as IWerewolfW5Sheet).tribe.ban" /></i>
        </span>

        <span v-else-if="isMage" class="side">
          {{ getSexName(editingCharacter.sex) }}
          <Bullet />
          <i class="clickable" @click="showTip?.('Basierend auf diesen Tendenzen hat jede Figur Persönlichkeitsarchetypen: ein Wesen und ein Verhalten, die zeigen, wie sie mit ihrer Welt interagiert. Das Wesen spiegelt das Innere der Figur wider, während das Verhalten zeigt, wie sie sich anderen Leuten präsentiert. Je nach Figur können diese beiden Eigenschaften ziemlich ähnlich oder total unterschiedlich sein. Unser Unternehmenshai könnte sich zum Beispiel als Kreuzritter präsentieren, der eine bessere Welt aufbaut; unter dieser Fassade ist er aber eigentlich ein Trickster, der es liebt, die Erwartungen seiner Kollegen zu unterlaufen. Unser Unternehmenshai zum Beispiel könnte sich als Kreuzritter präsentieren, der eine bessere Welt aufbaut; unter diesem Verhalten ist er jedoch eigentlich ein Trickster, der Freude daran hat, die Erwartungen seiner Kollegen zu unterlaufen. Die Natur eines Magiers hängt normalerweise stark von seiner Essenz ab. Diese Tendenz beeinflusst, was der Charakter wirklich will und wertschätzt. Im Laufe der Chronik wirst du die Willenskraft deines Charakters Willenskraft-Eigenschaft, indem du Dinge tust, die seine Natur stärken und die Bedürfnisse seines inneren Selbst befriedigen. Das Auftreten hingegen kann eine reine Fassade sein. Es könnte ein ehrliches Spiegelbild der inneren Landschaft des Magiers sein, aber wahrscheinlich ist es das nicht. Selbst die ausgeglichensten Menschen schützen ihr wahres Ich vor der Öffentlichkeit. Besonders in der tückischen Welt der Erwachten sind Leute, die ihre intimen Wahrheiten offenbaren – und damit der Welt einen wahren Namen geben, den sie gegen sie verwenden kann – sind ziemlich selten. Zusammengenommen sagen dir diese miteinander verbundenen Elemente viel darüber, wer dein Charakter ist, was er braucht, wie er sich verhält und wer seine Freunde und Feinde sein könnten. Ein Unternehmenshai mit dem Namen Malcolm Jamal Leonard könnte ein Ngoma Trickster sein, der seine Führungsposition und sein Crusader , um große Unternehmen zu infiltrieren und zu untergraben, um ein Ziel zu verfolgen, das außer ihm niemand versteht. Seine Questing Essence inspiriert ihn dazu, eine bessere Welt zu schaffen ... nachdem er die Herrscher der aktuellen Welt gestürzt und sich und seine Verbündeten dabei bereichert hat! Sobald du weißt, wer dein Charakter ist, finde heraus, was er tun kann.')"> Wesen:</i>
          {{ (editingCharacter as any as IMageSheet).nature.name }}
          <TipButton :content="(editingCharacter as any as IMageSheet).nature.description" class="mr-xxs" />
          <Bullet />
          <i class="clickable" @click="showTip?.('Basierend auf diesen Tendenzen hat jede Figur Persönlichkeitsarchetypen: ein Wesen und ein Verhalten, die zeigen, wie sie mit ihrer Welt interagiert. Das Wesen spiegelt das Innere der Figur wider, während das Verhalten zeigt, wie sie sich anderen Leuten präsentiert. Je nach Figur können diese beiden Eigenschaften ziemlich ähnlich oder total unterschiedlich sein. Unser Unternehmenshai könnte sich zum Beispiel als Kreuzritter präsentieren, der eine bessere Welt aufbaut; unter dieser Fassade ist er aber eigentlich ein Trickster, der es liebt, die Erwartungen seiner Kollegen zu unterlaufen. Unser Unternehmenshai zum Beispiel könnte sich als Kreuzritter präsentieren, der eine bessere Welt aufbaut; unter diesem Verhalten ist er jedoch eigentlich ein Trickster, der Freude daran hat, die Erwartungen seiner Kollegen zu unterlaufen. Die Natur eines Magiers hängt normalerweise stark von seiner Essenz ab. Diese Tendenz beeinflusst, was der Charakter wirklich will und wertschätzt. Im Laufe der Chronik wirst du die Willenskraft deines Charakters Willenskraft-Eigenschaft, indem du Dinge tust, die seine Natur stärken und die Bedürfnisse seines inneren Selbst befriedigen. Das Auftreten hingegen kann eine reine Fassade sein. Es könnte ein ehrliches Spiegelbild der inneren Landschaft des Magiers sein, aber wahrscheinlich ist es das nicht. Selbst die ausgeglichensten Menschen schützen ihr wahres Ich vor der Öffentlichkeit. Besonders in der tückischen Welt der Erwachten sind Leute, die ihre intimen Wahrheiten offenbaren – und damit der Welt einen wahren Namen geben, den sie gegen sie verwenden kann – sind ziemlich selten. Zusammengenommen sagen dir diese miteinander verbundenen Elemente viel darüber, wer dein Charakter ist, was er braucht, wie er sich verhält und wer seine Freunde und Feinde sein könnten. Ein Unternehmenshai mit dem Namen Malcolm Jamal Leonard könnte ein Ngoma Trickster sein, der seine Führungsposition und sein Crusader , um große Unternehmen zu infiltrieren und zu untergraben, um ein Ziel zu verfolgen, das außer ihm niemand versteht. Seine Questing Essence inspiriert ihn dazu, eine bessere Welt zu schaffen ... nachdem er die Herrscher der aktuellen Welt gestürzt und sich und seine Verbündeten dabei bereichert hat! Sobald du weißt, wer dein Charakter ist, finde heraus, was er tun kann.')"> Verhalten:</i>
          {{ (editingCharacter as any as IMageSheet).demeanor.name }}
          <TipButton :content="(editingCharacter as any as IMageSheet).demeanor.description" class="mr-xxs" />
          <Bullet />
          <i class="clickable" @click="showTip?.('Noch wichtiger für die Kernidentität deines Magiers ist die Essenz seines Avatars: der innere Antrieb, der seine Einstellung zum Leben und zur Magie prägt. Dieses mystische innere Selbst gibt dir einen groben Überblick über die allgemeine Persönlichkeit deines Magiers. Ein dynamischer Magier würde zum Beispiel seine Ziele mit intensiver Leidenschaft verfolgen, während ein musterorientierter Magier nach Stabilität und Beständigkeit streben würde. Übrigens solltest du daran denken, dass jeder Magiercharakter mindestens einen Punkt im Avatar-Hintergrund haben sollte. Starke Avatare (also solche mit mehr Punkten in dieser Eigenschaft) drücken ein stärkeres Gefühl der Essenz durch den Magier aus. Ein Charakter mit nur einem Punkt in seinem Avatar wird zum Beispiel gelegentlich seine dynamische Essenz spüren, und einer mit Avatar 5 wäre so dynamisch, dass er selten länger als ein paar Minuten still sitzen könnte.')"> Essenz:</i>
          {{ getEssenceName((editingCharacter as any as IMageSheet).essence) }}
          <TipButton :content="getEssenceDescription((editingCharacter as any as IMageSheet).essence)" class="mr-xxs" />
          <Bullet />
          <i class="clickable" @click="showTip?.('Die Allianzen/Bündnisse sind die großen Fraktionen der Magi. Jede von ihnen steht für ein anderes Paradigma, also für eine eigene Wahrheit darüber, wie die Welt funktioniert und warum Magie möglich ist. Sie sind Schulen, Gemeinschaften und Glaubensrichtungen zugleich. Wenn ein Magus einer Tradition beitritt, bedeutet das mehr als nur eine Zugehörigkeit – er übernimmt ein Erbe, eine Geschichte und eine bestimmte Art, Wirklichkeit zu formen. Eine Tradition bestimmt damit: wie du Magie beschreibst und wirkst, welche Sphäre deine „natürliche Stärke“ ist (Affinitätssphären), und mit wem du in der Welt von Mage verbündet oder verfeindet bist.')"> Allianz:</i>
          {{ (editingCharacter as any as IMageSheet).tradition.name }}
        </span>

        <span v-else-if="isHunter" class="side">
          {{ getSexName(editingCharacter.sex) }}
          <Bullet />
          <i> Credo:</i> {{ (editingCharacter as any as IHunterSheet).creed.name }}
          <Bullet />
          <i class="clickable" @click="showTip?.('Jeder Jäger hat einen bestimmten Antrieb, der ihn dazu bringt, gegen das Übernatürliche vorzugehen. Du wählst den Antrieb deines Charakters bei der Charaktererstellung (siehe S. 57) und jeder hat einen starken Einfluss auf die Sichtweise des Jägers. Motivationen können das Credo eines Charakters ergänzen, aber auch eine Opposition dazu andeuten: Jäger sind komplexe Individuen und können sich die Umstände ihrer Erleuchtungsmomente oft nicht aussuchen (obwohl die Spieler das tun ...). Motivationen geben die Charakterisierung des Jägers vor, bestimmen aber auch bestimmte Konsequenzen für einige Ergebnisse, die mit Verzweiflungswürfeln zu tun haben (siehe oben). Diese Liste von Antrieben soll nicht vollständig sein. Zukünftige Hunter-Ergänzungen können zusätzliche Antriebe enthalten, oder die Spieler können gemeinsam mit ihren Storytellern neue erfinden. Neue Triebe sollten sich von den bestehenden unterscheiden und nicht nur eine eng gefasste Situation darstellen. (Ein Trieb, der als „Neugierig” konzipiert ist, sollte zum Beispiel besser als „Neugier” behandelt werden.) Letztendlich sollen Triebe die Jäger in Schwierigkeiten bringen und ihnen gleichzeitig durch Verzweiflungswürfel außergewöhnliches Potenzial bieten.')"> Antrieb:</i>
          {{ (editingCharacter as any as IHunterSheet).drive.name }}
          <TipButton :content="(editingCharacter as any as IHunterSheet).drive.description" class="mr-xxs" />
          <i class="ml-xs"> Erlösung:</i>
          <TipButton :content="(editingCharacter as any as IHunterSheet).drive.redemption" class="mr-xxs" />
        </span>

        <span v-if="isVampire && !mocActive" class="side subline">
          <i>Generation:</i>
          <input v-if="editingCharacter.fullCustomization" class="form-control inline" v-model.number="editingCharacter.generation" />
          <span v-else>{{ effectiveGeneration }}</span>
          ({{ getGenerationName(editingCharacter.generationEra) }})
          <Bullet />
          <i>Jagdverhalten:</i> {{ editingCharacter.predatorType.name }}
        </span>

        <span v-if="isVampire && mocActive" class="side subline">
          <i>Generation:</i> 1 (
          <input v-if="editingCharacter.fullCustomization" class="form-control inline" v-model.number="editingCharacter.generation" />
          <span v-else>{{ effectiveGeneration }}</span>
          )
          <Bullet />
          <i>Jagdverhalten:</i> {{ editingCharacter.predatorType.name }}
        </span>
      </div>

      <div class="stats">
        <div class="row">
          <div v-if="isVampire" class="stat sire">
            <b>Erzeuger/in:</b>
            <small v-if="!editingCharacter.fullCustomization">{{ editingCharacter.sire }}</small>
            <input v-else class="form-control" type="text" v-model="editingCharacter.sire" />
          </div>

          <div class="stat" id="hlst-health">
            <b>Gesundheit:</b>
            <Damage prop-key="health" />
          </div>

          <div class="stat" id="hlst-willpower">
            <b>
              <LevelButton
                v-if="isMage && editingCharacter.willpower < 10"
                class="mr-xxs"
                @click="requestLevel?.('willpower')"
              />
              Willenskraft:
            </b>
            <Damage prop-key="willpower" />
          </div>

          <div v-if="isHunter" class="stat">
            <b>Verzweiflung:</b>
            <Squares
              :max="1"
              :amount="(editingCharacter as any as IHunterSheet).despair"
              @click="v => { (editingCharacter as any as IHunterSheet).despair = v === (editingCharacter as any as IHunterSheet).despair ? 0 : v; saveChar(true) }"
            />
          </div>
        </div>

        <div class="row">
          <div v-if="isVampire" class="stat wide" id="hlst-blood">
            <b>
              Blutmacht:
              <LevelButton
                v-if="editingCharacter.bloodPotency < 10 && editingCharacter.cainsMarkLevel !== -5"
                @click="levelBloodPotencyModal?.showModal()"
              />
              <i
                v-if="editingCharacter.fullCustomization && editingCharacter.bloodPotency > 0"
                class="iconbtnprim fa-solid fa-minus"
                @click="decreaseBloodPotency"
              />
            </b>
            <Squares :max="10" :amount="getBloodPotencyValue()" :margin-at="6" target-type="bloodpotency" />
          </div>

          <div v-if="isVampire" class="stat" id="hlst-humanity">
            <b>
              Menschlichkeit:
              <TipButton v-if="editingCharacter.humanity <= 5" :content="`Malus auf menschliche Interaktionen durch geringere Menschlichkeit: ${humanityMalus} Würfel Abzug`" :danger="true" />
            </b>
            <Humanity />
          </div>

          <div v-if="isVampire" class="stat" id="hlst-hunger">
            <b>Hunger:</b>
            <Squares
              :max="5"
              :amount="editingCharacter.hunger"
              @click="v => { editingCharacter!.hunger = v === editingCharacter!.hunger ? 0 : v; saveChar(true, true) }"
            />
          </div>

          <div v-else-if="isWerewolf" class="stat">
            <b>Rage: <TipButton content="Rage ist die unbändige Wut der Garou und ihre wichtigste Ressource im Spiel. Sie bewegt sich auf einer Skala von 0 bis 5 Punkten und verändert sich ständig je nach Situation. Meist beginnen Garou mit 1 Punkt, wenn sie ausgeruht und friedlich sind, oder mit 3 Punkten, wenn sie sich in Gefahr befinden – im Zweifel mit 2 Punkten. Jeder Rage-Punkt ersetzt einen normalen Würfel im Pool, wobei Rage-Würfel wie gewöhnliche Würfel funktionieren, aber bei einer 1 oder 2 ein brutales Ergebnis liefern: Mit einem einzelnen solchen Würfel scheitert der Wurf, mehrere brutale Ergebnisse bedeuten ein zerstörerisches Fehlschlagen. Geht es jedoch um Gewalt oder Schaden, erzeugt ein brutaler Ausgang stattdessen +4 Erfolge.

Rage kann auf verschiedene Weise steigen: durch das erste Heulen zum Mond in einer Nacht, durch Schmerz oder starken emotionalen Stress (maximal einmal pro Runde), durch Szenen des Aufputsches wie Stammesrituale oder durch bestimmte Gaben. Steigt Rage über 5 hinaus, verursacht das Schaden an der Willenskraft des Garou. Umgekehrt sinkt Rage, wenn sie für bestimmte Effekte aufgebraucht wird, etwa zur Selbstheilung, beim Gestaltwandeln, beim Aufrechterhalten einer Form oder für bestimmte Gaben; manche Kräfte können Rage auch direkt verringern.

Immer wenn Rage eingesetzt wird, ist ein Rage-Test erforderlich: Der Spieler würfelt einen einzelnen Würfel. Bei Erfolg bleibt der Rage-Wert unverändert, bei Misserfolg sinkt er um 1 Punkt. Der Test wird zusammen mit der eigentlichen Handlung geworfen, aber mit einem klar erkennbaren Würfel, damit das Ergebnis sofort ersichtlich ist. Fällt Rage auf 0, verliert der Garou sämtliche übernatürlichen Kräfte – er kann keine Formen halten, keine Riten wirken und keine Gaben einsetzen. Rage kann nicht unter 0 sinken; überschüssige Abzüge werden ignoriert. Um wieder Rage zu gewinnen, muss der Garou den Mond anheulen oder ein Ritual nutzen, das diese Ressource ausdrücklich zurückbringt." /></b>
            <Squares
              :max="5"
              :amount="(editingCharacter as any as IWerewolfW5Sheet).rage"
              @click="v => { (editingCharacter as any as IWerewolfW5Sheet).rage = v === (editingCharacter as any as IWerewolfW5Sheet).rage ? 0 : v; saveChar(true, true) }"
            />
          </div>
        </div>
      </div>
    </div>

    <Tabs />

    <div class="simple">
      <div class="column">
        <div class="form-group">
          <label>Chronik: <TipButton content="Die Chronik beschreibt die Kampagne bzw. eine Zusammenfassung von Geschichten, die die Charaktere durchlaufen. Wie die Chronik benannt wird ist vom Spielleiter festzulegen." /></label>
          <input class="form-control" type="text" v-model="editingCharacter.chronicle" @input="saveChar()" />
        </div>

        <div v-if="isMage" class="form-group">
          <label>Fokus:</label>
          <MarkdownEditor :model-value="(editingCharacter as any as IMageSheet).focus" @update:model-value="v => { (editingCharacter as any as IMageSheet).focus = v; saveChar() }" />
        </div>
        <div v-else class="form-group">
          <label>Grundsätze der Chronik: <TipButton content="Die Grundsätze der Chronik beschreibt eine Reihe von Regeln, die die Spieler mit ihrem Spielleiter für die bespielende Chronik festgesetzt werden. Jeder Spieler sollte sich an diese Grundsätze halten, auch wenn der Glaube des Charakters nicht komplett damit übereinstimmt. Eine Verletzung würde jedoch nur moralische Sanktionen oder die Degeneration des Charakters mit sich führen. Für weitere Informationen siehe Grundregelwerk V5 S. 172." /></label>
          <MarkdownEditor v-model="editingCharacter.chroniclePrinciples" @change="saveChar()" />
        </div>
      </div>

      <div class="column">
        <div class="form-group">
          <label>Konzept: <TipButton content="Das Konzept ist eine kurze Zusammenfassung (am besten nur ein Wort), die den Charakter oder die Tätigkeit dieses beschreibt." /></label>
          <input class="form-control" type="text" v-model="editingCharacter.concept" @input="saveChar()" />
        </div>

        <div v-if="isMage" class="form-group">
          <label>Wunder: <TipButton content="Ein Wunder ist ein Hintergrund, der für verschiedene magische Gegenstände steht. Jeder Gegenstandstyp hat einen anderen Namen, den die Erwachten Technokraten benutzen. Artefakte (und Erfindungen) können nur von Magiern benutzt werden und nutzen die Arete-Werte ihres Benutzers. Sie können normalerweise nur ein paar Sachen machen. Einige Artefakte haben stattdessen einen einzigen dauerhaften Effekt und können von Schläfern benutzt werden. Zauber (und Gadgets) sind verbrauchbare magische Gegenstände. Sie werden in Bündeln und nicht als Einzelstücke hergestellt. Schläfer können Zauber benutzen, wenn dies mit ihrem Paradigma vereinbar ist. Fetische werden mit Spirit statt mit Prime hergestellt und erfordern Verhandlungen mit Geistern, um sie herzustellen. Die Garou und andere sich verändernde Rassen sehen die Fetische der Erwachten mit Argwohn, besonders wenn der Magier den Geist in den Fetisch gezwungen hat, anstatt sich seine Zusammenarbeit durch Chiminage zu verdienen. Periapts (und Matrizen), auch Soulgems genannt, enthalten die Quintessenz einer bestimmten Resonanz. Talismane (und Geräte) sind magische Gegenstände, die sogar Schläfer benutzen können, da sie ihre eigene Arete-Bewertung haben; sie können in der Regel mehrere Dinge tun, und viele haben Periapts daran befestigt. Ihre Herstellung erfordert jedoch Willenskraft. Grimoires (und Principiae) können Arete ohne Suche erhöhen und erfordern den Einsatz von 1 permanentem Punkt Willenskraft, aber Kopien können ohne Einsatz von Willenskraft angefertigt werden. Primers sind spezielle Grimoires/Principiae, die Arete 1 lehren – das heißt, sie können das Erwachen bewirken. Für ihre Herstellung sind zwei permanente Willenskraftpunkte erforderlich. Tomes sind ebenfalls spezielle Grimoires, die seltene und mächtige Roten beschreiben und es ermöglichen, deren Schwierigkeitsgrad zu verringern. Amulette (und Gizmos) sind Gegenstände mit „schlafender” Magie, die unter bestimmten Umständen aktiviert wird. Sie werden mit Zeit und/oder Entropie hergestellt. Reliquien sind lebende Wunder. Dieser Untertyp ergänzt einige andere: Reliquien-Talisman, Reliquien-Periapt (auch Seelenblume genannt) usw." /></label>
          <MarkdownEditor :model-value="(editingCharacter as any as IMageSheet).wonders" @update:model-value="v => { (editingCharacter as any as IMageSheet).wonders = v; saveChar() }" />
        </div>
        <div v-else class="form-group">
          <label>Anker & Überzeugungen: <TipButton content="Wähle ein bis drei Überzeugungen und genau so viele Anker. Überzeugungen sind die Richtlinien die dein Charakter von sich aus befolgen muss und auch will, selbst bis über den Tod (oder eher Untot). Eine Überzeugung kann z.B. sein 'Du sollst nicht töten' oder 'Die Wahrheit ist heilig; du sollst nicht lügen'. Das Verstoßen gegen eine Überzeugung kann Makel mit sich bringen, oder Makel die im Rahmen einer Überzeugung erteilt werden, durch die Überzeugung abgemildert werden.
            Anker sind Personen, die zu Lebzeiten die Wichtigkeit des Lebens gestützt haben. Anker müssen lebende Menschen sein und sollte ein Anker verletzt werden oder gar sterben, kann das zum Verlust von Menschlickeit führen. Ein Anker kann z.B. der Liebespartner oder ein Kind sein." /></label>
          <MarkdownEditor v-model="editingCharacter.anchorsAndBeliefs" @change="saveChar()" />
        </div>
      </div>

      <div class="column">
        <div v-if="isVampire || isHunter" class="form-group">
          <label>Ambition: <TipButton content="Die Ambition ist das was dein Charakter in der Chronik antreibt voran zu streiten. Ein höheres Ziel als der Überlebensantrieb. Sollte eine Ambition während der Chronik erreicht werden, sollte eine neue Ambition gewählt werden. Ambitionen müssen im Spiel messabr sein, z.B. 'Ich hege die Ambition, Menschlichkeit 10 zu erreichen'. Wurde in einer Spielsitzung auf die Amibition hingearbeitet - der SL entscheidet - so kann ein Punkt Schwerer Schaden Willenskraft wieder hergestellt werden." /></label>
          <input class="form-control" type="text" v-model="editingCharacter.ambition" @input="saveChar()" />
        </div>

        <div v-else-if="isWerewolf" class="form-group compact">
          <label class="center bold">Verfall</label>
          <div class="split">
            <div class="stack">
              <label>Harano <TipButton content="Harano beschreibt den Zustand tiefer Hoffnungslosigkeit, in den ein Garou geraten kann, wenn er erkennt, dass sein Kampf umsonst scheint. Ein Garou im Harano verliert den Glauben an Gaia, kann die Verbindung zu seinem Patron-Geist aufgeben und im schlimmsten Fall sogar die Fähigkeit, sich zu verwandeln. Besonders häufig sind Anführer betroffen, doch früher oder später kann jede Garou von Selbstzweifeln übermannt werden.

Spielmechanisch wird ein Harano-Test fällig, wenn ein Garou einen schweren Rückschlag erleidet oder wenn ein Touchstone durch sein Handeln oder Nichthandeln bedroht oder verletzt wird. Der Wurfpool entspricht dabei der Anzahl bereits markierter Kästchen auf den Harano- und Hauglosk-Trackern zusammen, mindestens jedoch 1 Würfel. Rage-Würfel werden hier nicht benutzt. Die Schwierigkeit ist meist 1, kann aber vom Spielleiter erhöht werden. Misslingt der Wurf, wird ein Kästchen auf dem Harano-Tracker von rechts nach links gefüllt. Ist die Leiste voll, verfällt der Garou endgültig dem Harano, gibt den Dienst an Gaia auf und scheidet als spielbarer Charakter aus.

In absoluter Verzweiflung kann ein Spielercharakter freiwillig ein Harano-Kästchen füllen, um sofort seinen Rage-Wert auf 5 zu setzen. Dies ist jedoch nur einmal pro Spielsitzung erlaubt und kann vom Spielleiter untersagt werden, wenn es sich um eine kurze One-Shot-Runde handelt." /></label>
              <Squares :max="5" :amount="(editingCharacter as any as IWerewolfW5Sheet).harano" @click="v => { (editingCharacter as any as IWerewolfW5Sheet).harano = v === (editingCharacter as any as IWerewolfW5Sheet).harano ? 0 : v; saveChar(true) }" />
            </div>
            <div class="stack">
              <label class="right"><TipButton content="Hauglosk bezeichnet den Zustand fanatischer Hingabe an den Kampf der Garou, bei dem Mitgefühl und Gnade verloren gehen. Ein Garou in diesem Zustand handelt rücksichtslos nach dem Motto „der Zweck heiligt die Mittel“ und ignoriert mögliche Folgen seiner Handlungen. Dabei handelt es sich nicht bloß um blinde Raserei, sondern um ein tief verwurzeltes, oft dauerhaftes Muster, das viele Garou nie wieder verlassen.

Regeltechnisch wird ein Hauglosk-Test immer dann fällig, wenn ein Garou ein zentrales Gebot (Tenet) der Chronik verletzt. Der Würfelpool entspricht der Anzahl bereits markierter Kästchen auf dem Harano- und Hauglosk-Tracker zusammen, mindestens jedoch 1 Würfel; Rage-Würfel werden hier nicht genutzt. Die Schwierigkeit beträgt in der Regel 1, kann aber durch den Spielleiter angepasst werden. Scheitert der Wurf, wird ein Kästchen auf dem Hauglosk-Tracker von rechts nach links gefüllt. Ist dieser vollständig, verfällt der Garou endgültig dem Hauglosk, wird zu einem unrettbaren Fanatiker und geht als Spielercharakter verloren.

In Zeiten großer Not darf ein Spielercharakter freiwillig ein Kästchen auf dem Hauglosk-Tracker füllen, um allen erlittenen Willenskraftschaden sofort zu heilen. Diese Möglichkeit besteht nur einmal pro Spielsitzung und kann in One-Shot-Abenteuern vom Spielleiter eingeschränkt werden." /> Hauglosk</label>
              <Squares :max="5" :amount="(editingCharacter as any as IWerewolfW5Sheet).hauglosk" @click="v => { (editingCharacter as any as IWerewolfW5Sheet).hauglosk = v === (editingCharacter as any as IWerewolfW5Sheet).hauglosk ? 0 : v; saveChar(true) }" />
            </div>
          </div>
        </div>

        <div v-else-if="isMage" class="form-group compact">
          <label class="center bold">
            Quintessenz &amp; Paradoxon <TipButton content="Quintessenz ist die reine Lebensenergie des Kosmos – die Substanz, aus der alles besteht. Sie fließt durch die Schöpfung, gespeist von Knotenpunkten und Artefakten, und kann von einem Magus aufgenommen und gelenkt werden. Quintessenz ist die Währung der Magie: Mit ihr verstärkst du Zauber, senkst Schwierigkeiten und gibst deinen Effekten Dauer und Kraft. Dein Avatar ist das Gefäß, in dem du sie speichern kannst.

Doch wo Licht ist, ist auch Schatten: Paradoxon ist die Rückkopplung der Realität gegen jene, die sie zu offen verbiegen. Jedes Mal, wenn du „vulgäre“ Magie vor den Augen der Welt wirkst oder einen Zauber verpatzt, sammelst du Paradoxon an. Zu viel davon und die Wirklichkeit schlägt zurück – mit Rückstößen, Flüchen, bizarren Mutationen oder Wahnsinn. Erreichst du einen kritischen Punkt, kann dich Paradoxon in Quiet stürzen, dich zerreißen oder dich sogar in einen Marauder verwandeln.

Regeln: Du speicherst Quintessenz entsprechend deines Avatar-Werts und kannst sie beim Wirken einsetzen. Paradoxon sammelst du als Punkte an; jeder Punkt erhöht die Gefahr eines Backlash. Ab ca. 20 Punkten bist du ein wandelnder Riss in der Realität. Paradoxon kannst du abbauen, indem du für eine Weile keine Magie wirkst – doch je stärker du die Wirklichkeit brichst, desto stärker wird sie zurückschlagen." />
          </label>
          <div class="split">
            <div class="stack">
              <label>Quintessenz</label>
              <Squares :max="10" :amount="(editingCharacter as any as IMageSheet).quintessence" @click="v => { (editingCharacter as any as IMageSheet).quintessence = v === (editingCharacter as any as IMageSheet).quintessence ? 0 : v; saveChar(true) }" />
            </div>
            <div class="stack">
              <label class="right">Paradoxon</label>
              <Squares :max="10" :amount="(editingCharacter as any as IMageSheet).paradox" @click="v => { (editingCharacter as any as IMageSheet).paradox = v === (editingCharacter as any as IMageSheet).paradox ? 0 : v; saveChar(true) }" />
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>Geschichte:</label>
          <MarkdownEditor v-model="editingCharacter.backstory" @change="saveChar()" />
        </div>
      </div>

      <div class="column">
        <div v-if="isVampire || isHunter" class="form-group">
          <label>Verlangen: <TipButton content="Das Verlangen ist ähnlich wie eine Ambition ein Antrieb in der Chronik, jedoch anders als bei der Ambition eher temporärer Natur. Verlangen können z.B. pro Spielsitzung festgelegt werden und sind dazu da um sie in der Spielsitzung auszuspielen. Das Verlangen ist somit eine Spielmechanik, die es verhindern soll, dass Spieler mehr aktiv als passiv agieren. Ein solches Verlangen kann z.B. sein 'Ich möchte heute eine Brünette vernaschen'." /></label>
          <input class="form-control" type="text" v-model="editingCharacter.desire" @input="saveChar()" />
        </div>

        <div v-else-if="isWerewolf" class="form-group compact">
          <label class="center bold">Ansehen ({{ totalRenown }})</label>
          <div class="split">
            <div class="stack">
              <label>
                Ruhm
                <LevelButton v-if="gloryRenown < 5" @click="levelRenown(RenownKey.Glory)" />
              </label>
              <Squares :max="5" :amount="gloryRenown" @click="v => { gloryRenown = v === gloryRenown ? 0 : v; saveChar(true) }" />
            </div>
            <div class="stack">
              <label class="center">
                Ehre
                <LevelButton v-if="honorRenown < 5" @click="levelRenown(RenownKey.Honor)" />
              </label>
              <Squares :max="5" :amount="honorRenown" @click="v => { honorRenown = v === honorRenown ? 0 : v; saveChar(true) }" />
            </div>
            <div class="stack">
              <label class="right">
                Weisheit
                <LevelButton v-if="wisdomRenown < 5" @click="levelRenown(RenownKey.Wisdom)" />
              </label>
              <Squares :max="5" :amount="wisdomRenown" @click="v => { wisdomRenown = v === wisdomRenown ? 0 : v; saveChar(true) }" />
            </div>
          </div>
        </div>

        <div v-else-if="isMage" class="form-group compact">
          <label class="center bold">
            <LevelButton v-if="(editingCharacter as any as IMageSheet).arete < 10" @click="requestLevel?.('arete')" />
            Arete (Erleuchtung) <TipButton content="Arete ist der göttliche Funke, die Exzellenz, die einen Magus von gewöhnlichen Menschen unterscheidet. Sie ist Ausdruck seines Erwachens, seiner inneren Größe und seines Weges zur Vollendung. Manche nennen es Erleuchtung, andere Vollkommenheit oder einfach nur Genialität – doch allen ist gemeinsam, dass Arete die Fähigkeit ist, die Welt nach dem eigenen Willen zu formen.

Die Reise beginnt auf der Stufe des Schläfers, der noch in den Illusionen der Welt gefangen ist. Mit dem Erwachen wird er Initiiert, erhält den ersten Blick hinter den Schleier und wächst mit Begabung und Schulung zu einem disziplinierten Anwender seiner Künste. Wer weiter voranschreitet, wird gebieterisch in seinem Auftreten, meistert schließlich die Kunst und erlangt tiefes Verständnis. Auf den höchsten Stufen folgt Weisheit, wahre Erleuchtung und schließlich die Transzendenz, in der der Magus selbst zur Verkörperung der Magie wird.

Regeln: Dein Arete-Wert bestimmt, wie viele Würfel du für Zaubereffekte nutzt und wie mächtig deine Magie sein kann. Keine Sphäre darf höher sein als dein Arete. Um Arete zu steigern, musst du eine Suche bestehen – eine visionäre Prüfung, in der du dich selbst überwindest. Auf niedrigen Stufen bist du an Instrumente und Rituale gebunden; mit wachsender Erleuchtung kannst du diese Hilfsmittel Stück für Stück ablegen, bis du keine Werkzeuge mehr brauchst, sondern selbst zum Katalysator der Wirklichkeit wirst." />
          </label>
          <div class="center grow">
            <Squares :max="10" :amount="(editingCharacter as any as IMageSheet).arete" @click="v => { (editingCharacter as any as IMageSheet).arete = v === (editingCharacter as any as IMageSheet).arete ? 0 : v; saveChar(true) }" />
          </div>
        </div>

        <div class="form-group">
          <label>Notizen:</label>
          <MarkdownEditor v-model="editingCharacter.notes" @change="saveChar()" />
        </div>
      </div>
    </div>

    <Tabs />

    <div class="details">
      <Row v-if="isVampire" class="row-full" wrap>
        <Col class="col-third">
          <Row><b>Blutschub</b>: <TipButton content="Jeder Vampir kann sein Blut anrufen, um seine Attribute vorübergehend zu verstärken, sei es körperlich, gesellschaftlich oder geistig. Wenn der Charakter einen Blutschub auslösen möchte, kann der Spieler eine bestimmte Anzahl von Würfeln zu einem Würfelvorrat eines Attributs hinzufügen. Die Anzahl der Würfel, die ein Blutschub gewährt, hängt von der Blutmacht des Charakters ab; Charaktere können Blutschub nur einmal pro Probe verwenden. Ein Blutschub erfordert einen Wallungs-Check. Blutschub gilt nur für einen einzigen Würfelwurf. (Durch einen Blutschub hinzugewonnene Würfel, bleiben auch für eine Wiederholung durch Willenskraft erhalten.) Charaktere können keinen Blutschub für Proben auf Willenskraft oder Menschlichkeit, für Proben, die sich über mehrere Szenen erstrecken oder Ein-Wurf-Kämpfe (S. 296) verwenden, ebenso wenig, wenn die Erzählerin sie nicht erlaubt. Automatische Erfolge (S. 120) oder „Nimm die Hälfte“ gelten nicht für Proben, die durch einen Blutschub gesteigert werden." /></Row>
          <Row><small>{{ getBloodPotency().bleedingSpurt }} Würfel</small></Row>
        </Col>
        <Col class="col-third">
          <Row><b>Heilung pro Wallungs-Check</b>: <TipButton content="Vampire sind tot, somit heilen sie auch nicht auf natürliche Weise. Ihr untotes Gerüst kann sich noch immer selbst zusammenflicken, wenn sie sich ausreichend anstrengen. Leichten Schaden an der Gesundheit heilen: Je nach Blutmacht kann ein Vampir mit einem einzigen Wallungs-Check einen oder mehrere Punkte Leichten Schaden an seiner Gesundheit heilen. Vampire können pro Runde einen Wallungs- Check durchführen, um Leichten Schaden an der Gesundheit zu heilen. Schweren Schaden an der Gesundheit heilen: Um Schweren Schaden zu heilen, muss ein Vampir bis zum nächsten Sonnenuntergang warten und anschließend drei Wallungs- Checks zusätzlich zum regulären Wallungs- Check beim Erwachen ablegen. Hierdurch wird ein Punkt Schwerer Schaden geheilt, ebenso eine Lähmende Verletzung oder ähnliche Beeinträchtigung. Ein Vampir kann nur einen Punkt Schweren Schaden pro Nacht heilen. Es gilt ebenso wie beim Erwachen, wenn der Hunger des Vampirs durch diese Wallungs-Checks über Hunger 5 steigt, fällt er eher in Starre, als dass er eine Probe gegen Hungerraserei ablegen muss." /></Row>
          <Row><small>{{ getBloodPotency().healedDamage }} Punkt(e) leichter Schaden</small></Row>
        </Col>
        <Col class="col-third">
          <Row><b>Disziplinsbonus</b>: <TipButton content="Wie viele Würfel zum Vorrat bei einer Disziplinsprobe hinzugefügt werden dürfen." /></Row>
          <Row><small>{{ getBloodPotency().disciplineBonus }} Würfel</small></Row>
        </Col>
      </Row>

      <Row v-if="isVampire" class="row-full mt" wrap>
        <Col class="col-third">
          <Row><b>Wiederholung Wallung</b>: <TipButton content="Definiert bis zu welcher Disziplinsstufe ein Wallungs-Check für das Einsetzen einer Kraft einmalig neu gewürfelt werden darf." /></Row>
          <Row><small>{{ `Stufe ${getBloodPotency().rouseRepeatDisciplineLevel} und darunter` }}</small></Row>
        </Col>
        <Col class="col-third">
          <Row><b>Schwere des Fluchs</b>:</Row>
          <Row><small>{{ getBloodPotency().baneLevel }}</small></Row>
        </Col>
        <Col class="col-third">
          <Row><b>Beuteauschluss</b>:</Row>
          <Row><small>{{ getBloodPotency().pray }}</small></Row>
        </Col>
      </Row>

      <Row v-if="isVampire" class="row-full mt-lg" wrap>
        <Col class="col-third">
          <label class="nowrap"><b>Resonanz</b>:</label>
          <select class="form-control fit" v-model="editingCharacter.resonance" @change="onResonanceSave" style="width: 16rem">
            <option :disabled="true" :value="undefined">-- Bitte wählen --</option>
            <option :value="(0 as any)">Keine</option>
            <option :value="(1 as any)">Cholerisch (wütend)</option>
            <option :value="(2 as any)">Melancholisch (traurig/verängstigt)</option>
            <option :value="(3 as any)">Phlegmatisch (gelassen/faul)</option>
            <option :value="(4 as any)">Sanguinisch (fröhlich/geil)</option>
            <option :value="(5 as any)">Tierblut</option>
            <option :value="(6 as any)">Leer</option>
          </select>
          <small class="nowrap" style="margin-top: 1rem">↪ Temperament:</small>
          <select class="form-control fit" v-model="editingCharacter.resonanceTemperament" @change="onResonanceTemperamentSave" style="width: 16rem">
            <option :disabled="true" :value="undefined">-- Bitte wählen --</option>
            <option :value="V5ResonanceTemperament.Negligible">Kein/vernachlässigbar</option>
            <option :value="V5ResonanceTemperament.Fleeting">flüchtig</option>
            <option :value="V5ResonanceTemperament.Intense">intensiv</option>
            <option :value="V5ResonanceTemperament.Acute">akut</option>
            <option :value="V5ResonanceTemperament.Dyscrasia">Dyskrasie</option>
          </select>
        </Col>
        <Col class="col-third">
          <Row v-if="resonanceDisciplines"><b>Resonanzvorteile</b></Row>
          <Row v-if="resonanceDisciplines"><small>{{ resonanceDisciplines }}</small></Row>
        </Col>
        <Col class="col-third" />
      </Row>

      <Row v-if="isMage" class="row-full mt" wrap>
        <Col class="col-full center">
          <div class="headline">
            <Bullet /><Bullet /><Bullet />
            <b>Sphären <TipButton content="Sphären sind die grundlegenden Bausteine der Magie im Mage: The Ascension-Universum. Jede Sphäre repräsentiert einen Aspekt der Realität, den ein Magus beeinflussen und formen kann. Durch das Studium und die Meisterung dieser Sphären erlangen Magier die Fähigkeit, Wunder zu vollbringen, die die Grenzen des Möglichen sprengen." /></b>
            <Bullet /><Bullet /><Bullet />
          </div>
        </Col>
      </Row>

      <Row v-if="isMage" class="row-full mt" wrap>
        <Col class="col-spheres">
          <div class="sphere-line">
            <span>
              <LevelButton v-if="(editingCharacter as any as IMageSheet).spheres[Sphere.Correspondence] < 5" @click="requestLevel?.('sphere', Sphere.Correspondence as any as M20Sphere)" />
              Korrespondenz <TipButton content="Raum ist nur eine Illusion, ein Schleier über der wahren Natur des Seins. Die Sphäre der Korrespondenz erlaubt es, Orte zu sehen, Distanzen zu überwinden und selbst die Gesetze von Nähe und Ferne zu beugen. Ein Meister dieser Kunst kann sich von einem Ort zum anderen bewegen, als wären sie nur einen Schritt entfernt, oder durch Wände hindurch blicken, als wären sie Luft. In Verbindung mit Kräften kann ein Blitz aus weiter Ferne einschlagen, oder mit Leben Heilung aus der Distanz geschehen." />
            </span>
            <Squares :max="5" :amount="(editingCharacter as any as IMageSheet).spheres[Sphere.Correspondence]" />
          </div>
          <div class="sphere-line">
            <span>
              <LevelButton v-if="(editingCharacter as any as IMageSheet).spheres[Sphere.Entropy] < 5" @click="requestLevel?.('sphere', Sphere.Entropy as any as M20Sphere)" />
              Entropie <TipButton content="Alles vergeht, alles fällt ins Chaos – und alles wird neu geboren. Die Sphäre der Entropie ist die Kunst, Wahrscheinlichkeit, Schicksal und Zerfall zu beherrschen. Mit ihr kann man das Glück auf die eigene Seite ziehen, einen Würfelwurf entscheiden lassen oder den Lauf des Schicksals verändern. Man kann Waffen versagen lassen, Herzen erkranken oder Feinde ins Unglück stürzen. In den Händen eines Meisters ist Entropie sowohl die Klinge des Verfalls als auch das Werkzeug der Erneuerung." />
            </span>
            <Squares :max="5" :amount="(editingCharacter as any as IMageSheet).spheres[Sphere.Entropy]" />
          </div>
          <div class="sphere-line">
            <span>
              <LevelButton v-if="(editingCharacter as any as IMageSheet).spheres[Sphere.Forces] < 5" @click="requestLevel?.('sphere', Sphere.Forces as any as M20Sphere)" />
              Kräfte <TipButton content="Feuer, Licht, Elektrizität, Gravitation – all die Energien des Kosmos sind nur Strömungen, die geformt werden wollen. Die Sphäre der Kräfte erlaubt es, Naturgesetze zu lenken: Flammen zu entfachen, Schatten zu zerreißen, Stürme zu rufen oder die Luft selbst zum Beben zu bringen. In Kombination mit Korrespondenz können Energieblitze über große Distanzen gelenkt werden, und mit der Urkraft lassen sich Waffen aus reiner, strahlender Macht erschaffen." />
            </span>
            <Squares :max="5" :amount="(editingCharacter as any as IMageSheet).spheres[Sphere.Forces]" />
          </div>
        </Col>

        <Col class="col-spheres">
          <div class="sphere-line">
            <span>
              <LevelButton v-if="(editingCharacter as any as IMageSheet).spheres[Sphere.Life] < 5" @click="requestLevel?.('sphere', Sphere.Life as any as M20Sphere)" />
              Leben <TipButton content="Alles Leben pulsiert, wächst und wandelt sich. Mit der Sphäre des Lebens lernt der Magus, den Körper zu verstehen und zu formen – Wunden zu heilen, Krankheiten zu lindern oder selbst den eigenen Körper in eine andere Gestalt zu verwandeln. Sie kann Menschen stärken, Tiere verwandeln oder Fleisch in tödliche Waffen verwandeln. Zusammen mit Materie kann man Fleisch zu Stein oder Stein zu Fleisch machen, und mit Geist lassen sich sogar die Seelen an Körper binden." />
            </span>
            <Squares :max="5" :amount="(editingCharacter as any as IMageSheet).spheres[Sphere.Life]" />
          </div>
          <div class="sphere-line">
            <span>
              <LevelButton v-if="(editingCharacter as any as IMageSheet).spheres[Sphere.Matter] < 5" @click="requestLevel?.('sphere', Sphere.Matter as any as M20Sphere)" />
              Materie <TipButton content="Stein, Metall, Holz – all das sind nur Muster, die man neu ordnen kann. Die Sphäre der Materie erlaubt es, Stoffe zu verwandeln, Metalle zu schmelzen oder Gold aus Schutt zu erschaffen. Ein geübter Magus kann Objekte reparieren oder Waffen aus reiner Fantasie entstehen lassen. Mit Kräften erschafft man Bomben, mit Leben unnatürliche Hybride, und mit Urkraft lassen sich dauerhafte Wunder in die Welt rufen." />
            </span>
            <Squares :max="5" :amount="(editingCharacter as any as IMageSheet).spheres[Sphere.Matter]" />
          </div>
          <div class="sphere-line">
            <span>
              <LevelButton v-if="(editingCharacter as any as IMageSheet).spheres[Sphere.Mind] < 5" @click="requestLevel?.('sphere', Sphere.Mind as any as M20Sphere)" />
              Verstand <TipButton content="Jeder Gedanke, jedes Gefühl ist ein Faden im Netz des Bewusstseins. Die Sphäre des Verstands eröffnet den Weg in den Kopf eines jeden Wesens – Telepathie, Illusion, Kontrolle und Inspiration. Sie erlaubt es, Emotionen zu formen, Gedanken zu lesen oder Illusionen so real erscheinen zu lassen, dass die Sinne sich täuschen lassen. Verbunden mit Korrespondenz kann man telepathisch über jede Distanz sprechen, und mit Zeit lassen sich Erinnerungen ändern oder löschen." />
            </span>
            <Squares :max="5" :amount="(editingCharacter as any as IMageSheet).spheres[Sphere.Mind]" />
          </div>
        </Col>

        <Col class="col-spheres">
          <div class="sphere-line">
            <span>
              <LevelButton v-if="(editingCharacter as any as IMageSheet).spheres[Sphere.Spirit] < 5" @click="requestLevel?.('sphere', Sphere.Spirit as any as M20Sphere)" />
              Geist <TipButton content="Jenseits des Spiegels liegt die Umbra, die Welt der Geister. Mit der Sphäre des Geistes kann man mit diesen Wesen sprechen, sie rufen, bannen oder ihnen folgen. Man öffnet Tore in andere Welten, verhandelt mit Totems oder ruft Ahnengeister herbei. Zusammen mit Korrespondenz lassen sich Portale zwischen den Welten erschaffen, und mit Urkraft kann man Geister stärken oder vernichten. Geist ist das Tor zum Unsichtbaren – und zum Unheimlichen." />
            </span>
            <Squares :max="5" :amount="(editingCharacter as any as IMageSheet).spheres[Sphere.Spirit]" />
          </div>
          <div class="sphere-line">
            <span>
              <LevelButton v-if="(editingCharacter as any as IMageSheet).spheres[Sphere.Time] < 5" @click="requestLevel?.('sphere', Sphere.Time as any as M20Sphere)" />
              Zeit <TipButton content="Die große Strömung, in der wir alle schwimmen. Die Sphäre der Zeit erlaubt es, den Fluss der Sekunden zu fühlen, in die Zukunft zu blicken oder die Bewegung zu beschleunigen. Ein Magus kann sein eigenes Handeln schneller machen, den Lauf einer Schlacht verzögern oder einen Blick in kommende Gefahren werfen. In Verbindung mit Entropie kann man Schicksal über Jahrhunderte weben, und mit Korrespondenz an verschiedenen Orten zu unterschiedlichen Zeiten erscheinen." />
            </span>
            <Squares :max="5" :amount="(editingCharacter as any as IMageSheet).spheres[Sphere.Time]" />
          </div>
          <div class="sphere-line">
            <span>
              <LevelButton v-if="(editingCharacter as any as IMageSheet).spheres[Sphere.Prime] < 5" @click="requestLevel?.('sphere', Sphere.Prime as any as M20Sphere)" />
              Urkraft <TipButton content="Die Quelle aller Magie, die rohe Essenz des Seins: Quintessenz. Mit der Sphäre Urkraft wird aus Magie Wirklichkeit. Sie erlaubt es, Energie aus dem Nichts zu formen, Zauber zu nähren und Muster zu stärken. Urkraft ist der Funke, der allen anderen Sphären die Dauer und Kraft gibt. Ohne sie sind erschaffene Dinge nur Illusionen – mit ihr werden sie real. Zusammen mit Kräften entsteht reines, brennendes Feuer, mit Materie beständige Objekte, mit Geist göttliche Manifestationen." />
            </span>
            <Squares :max="5" :amount="(editingCharacter as any as IMageSheet).spheres[Sphere.Prime]" />
          </div>
        </Col>
      </Row>

      <Row v-if="isWerewolf" class="row-full mt" wrap>
        <Col class="col-full center">
          <div class="headline">
            <Bullet /><Bullet /><Bullet />
            <b>Formen des Garou</b>
            <Bullet /><Bullet /><Bullet />
          </div>
        </Col>
      </Row>

      <Row v-if="isWerewolf" class="row-full mt" wrap>
        <Col v-for="f in werewolfForms" :key="f.name" class="col-form">
          <Row><b>{{ f.name }}</b></Row>
          <Row v-for="(line, i) in f.lines" :key="i"><small>{{ line }}</small></Row>
        </Col>
      </Row>
    </div>

    <BloodPotencyModal ref="levelBloodPotencyModal" />
    <RenownModal ref="levelRenownModal" />
    <ConfirmDeleteModal ref="confirmDeleteModal" />
  </div>
</template>

<style scoped lang="scss">
.profile-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.avatar {
  width: 12rem;
  height: 12rem;
  cursor: pointer;
  flex-shrink: 0;
}

.meta {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
}

.info {
  display: flex;
  flex-direction: column;
  min-width: 16rem;
  flex-grow: 1;
}

.name {
  display: flex;
  align-items: center;
  font-size: 1.8rem;
  font-weight: bold;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.name-btn {
  width: 3rem;
  height: 3rem;
}

.name.edit {
  align-items: center;
}

.name-input {
  width: min(20rem, 100%);
}

.side {
  font-size: 1.2rem;
  font-weight: normal;
  color: #9f9f9f;
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  align-items: center;
}

.subline {
  margin-top: 0.2rem;
}

.inline {
  display: inline-block;
  width: 6rem;
  margin: 0 0.35rem;
  text-align: center;
}

.stats {
  width: fit-content;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 16rem;
}

.stats .row {
  display: flex;
  gap: 2rem;
}

.stat {
  width: auto;
  max-width: 100%;
}

@media (max-width: 900px) {
  .meta {
    flex-direction: column;
    align-items: center;
  }

  .stats .row {
    flex-direction: column;
    gap: 2rem;
  }
}

.stat.wide {
  width: 18rem;
}

.stat.sire {
  width: 18rem;
  display: flex;
  flex-direction: column;
}

.simple {
  padding: 1.25rem;
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
}

.simple .column {
  display: flex;
  gap: 0.5rem;
  flex-direction: column;
}

.simple textarea {
  resize: vertical;
  min-height: 12rem;
  font-family: var(--font-sans);
  font-size: 1.1rem;
}

.form-group.compact {
  min-height: 6rem;
  display: flex;
  flex-direction: column;
}

.split {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.stack {
  display: flex;
  flex-direction: column;
}

.center {
  text-align: center;
  justify-content: center;
  align-items: center;
}

.bold {
  font-weight: bold;
}

.right {
  text-align: right;
}

.grow {
  flex: 1;
  display: flex;
  justify-content: center;
}

.details {
  width: 100%;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.row-full {
  width: 100%;
}

.mt {
  margin-top: 1rem;
}

.mt-lg {
  margin-top: 2rem;
}

.col-full {
  width: 100%;
}

.headline {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.nowrap {
  white-space: nowrap;
}

.fit {
  width: fit-content;
  max-width: 100%;
}

.col-third {
  flex: 1 1 0;
  justify-content: center;
  align-items: center;
}

.col-spheres {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 18rem;
}

.col-form {
  flex: 1 1 0;
  align-items: center;
  min-width: 11rem;
  text-align: center;
  gap: 0.25rem;

  small { color: var(--text-2); }
}

@media (max-width: 900px) {
  .col-third,
  .col-spheres,
  .col-form {
    flex: 1 1 100%;
    min-width: 0;
  }
}

.sphere-line {
  width: min(30rem, 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--primary-color);
  padding-bottom: 0.5rem;
  margin-bottom: 0.5rem;
  gap: 1rem;
}

.clickable {
  cursor: pointer;
  user-select: none;
}

.mr-xxs {
  margin-right: 0.25rem;
}

.ml-xs {
  margin-left: 0.5rem;
}

.ml-xxs {
  margin-left: 0.25rem;
}

@media (max-width: 900px) {
  .meta {
    padding: 1rem;
    gap: 1rem;
  }

  .avatar {
    width: 9rem;
    height: 9rem;
  }

  .stats {
    flex: 1 1 100%;
  }

  .stat,
  .stat.wide,
  .stat.sire {
    width: min(18rem, 100%);
  }

  .col-third,
  .col-spheres {
    width: 100%;
  }

  .sphere-line {
    width: 100%;
  }
}

@media (max-width: 520px) {
  .avatar {
    width: 7.5rem;
    height: 7.5rem;
  }

  .name {
    font-size: 1.4rem;
  }

  .side {
    font-size: 1.05rem;
  }

  .split {
    flex-direction: column;
    align-items: stretch;
  }

  .inline {
    width: 5rem;
  }
}
</style>
