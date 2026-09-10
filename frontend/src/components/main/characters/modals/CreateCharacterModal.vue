<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useRouter } from "vue-router"
import Modal from "@/components/modal/Modal.vue"
import BookSelection from "@/components/editor/BookSelection.vue"
import { EditorHistory } from "@/libs/editor-history"
import { useStore } from "@/app/store"
import type { ICharacter, ICharacterDirectory } from "@/@types/models"
import { DefaultCharacter, Generation, Sex } from "@/@types/models"
import { GameLine } from "@/@types/gameline"
import { NewW5Sheet } from "@/@types/w5"
import { NewMageSheet } from "@/@types/m20"
import { NewH5Sheet } from "@/@types/h5"
import { NewVdzSheet, getVdzBloodPool } from "@/@types/vdz"

const router = useRouter()
const store = useStore()

const show = ref(false)
const name = ref("")
const gameline = ref<GameLine>(GameLine.Vampire)
const sex = ref<Sex>(Sex.Divers)
const generation = ref(13)
const generationEra = ref<Generation>(Generation.Children)
const dir = ref<ICharacterDirectory | undefined>(undefined)
const folderId = ref<string | undefined>(undefined)

const bookSelection = ref<InstanceType<typeof BookSelection> | null>(null)

const resetForm = () => {
  name.value = ""
  gameline.value = GameLine.Vampire
  sex.value = Sex.Divers
  generationEra.value = Generation.Children
  generation.value = 13
}

const showModal = (d?: ICharacterDirectory) => {
  dir.value = d
  folderId.value = undefined
  resetForm()
  show.value = true
}

const showModalInFolder = (folder: string) => {
  dir.value = undefined
  folderId.value = folder
  resetForm()
  show.value = true
}

const onEraChange = () => {
  switch (generationEra.value) {
    case Generation.Children:
      generation.value = 13
      break
    case Generation.Newborn:
      generation.value = 12
      break
    case Generation.Ancillae:
      generation.value = 11
      break
    case Generation.Older:
      generation.value = 9
      break
    case Generation.Elder:
      generation.value = 5
      break
  }
}

const eraMin = computed(() => {
  switch (generationEra.value) {
    case Generation.Children:
      return 12
    case Generation.Newborn:
      return 12
    case Generation.Ancillae:
      return 10
    default:
      return 0
  }
})

const eraMax = computed(() => {
  switch (generationEra.value) {
    case Generation.Children:
      return 16
    case Generation.Newborn:
      return 13
    case Generation.Ancillae:
      return 11
    case Generation.Elder:
      return 10
    default:
      return Number.POSITIVE_INFINITY
  }
})

const newChar = (): any => {
  if (gameline.value === GameLine.Vampire) return DefaultCharacter()
  if (gameline.value === GameLine.Werewolf) return NewW5Sheet()
  if (gameline.value === GameLine.Mage) return NewMageSheet()
  if (gameline.value === GameLine.Hunter) return NewH5Sheet()
  if (gameline.value === GameLine.DarkAges) return NewVdzSheet()
  return undefined
}

const applyEra = (char: ICharacter) => {
  switch (char.generationEra) {
    case Generation.Children:
      char.bloodPotency = char.generation >= 14 ? 0 : 1
      break
    case Generation.Newborn:
      char.bloodPotency = 1
      char.exp = 15
      break
    case Generation.Ancillae:
      char.bloodPotency = 2
      char.exp = 35
      char.humanity--
      break
    case Generation.Older:
      char.exp = 1000
      break
    case Generation.Elder:
      char.exp = 666666
      char.bloodPotency = 10
      char.isElder = true
      for (const cat of char.categories) {
        for (const a of cat.attributes) a.value = 5
        for (const s of cat.skills) s.value = 5
      }
      break
  }
}

const startCreateCharacter = () => {
  const n = name.value.trim()
  if (!n) return

  const char = newChar()
  if (!char) return

  char.name = n
  char.sex = sex.value

  store.directoryForCharCreation = dir.value
  store.folderForCharCreation = folderId.value

  if (gameline.value === GameLine.Vampire) {
    char.generation = generation.value
    char.generationEra = generationEra.value
    char.books = bookSelection.value?.activeBooks() ?? []
    applyEra(char)
  }

  if (gameline.value === GameLine.DarkAges) {
    char.generation = Math.min(13, Math.max(4, generation.value))
    char.bloodPool = getVdzBloodPool(char.generation)[0]
  }

  EditorHistory.push(char)
  store.editingCharacter = char

  if (gameline.value === GameLine.Vampire) router.push({ name: "editor-clan" })
  else if (gameline.value === GameLine.Werewolf) router.push({ name: "editor-auspice" })
  else if (gameline.value === GameLine.Mage) router.push({ name: "editor-identity" })
  else if (gameline.value === GameLine.Hunter) router.push({ name: "editor-creed" })
  else if (gameline.value === GameLine.DarkAges) router.push({ name: "editor-vdz-clan" })

  show.value = false
}

const vdzGenerationOptions = computed(() => {
  const gens = [13, 12, 11, 10, 9, 8, 7, 6, 5, 4]
  return gens.map(g => {
    const [max, perTurn] = getVdzBloodPool(g)
    return { gen: g, label: `${g}. Generation — Blutvorrat ${max}, max. ${perTurn} Blut/Runde` }
  })
})

const GAME_TIPS: Record<GameLine, Record<number, string>> = {
  [GameLine.Vampire]: {
    1: "Wie hieß dein Charakter zu Lebzeiten?",
    2: "Was hast du getan?",
    3: "Wo und wann hast du die Umarmung empfangen?",
    4: "Wie heißt du jetzt?",
    5: "Wo bist du jetzt?",
  },
  [GameLine.Werewolf]: {
    1: "Wann und wo hast du dich das erste Mal verwandelt?",
    2: "Wen hast du dabei verletzt oder beschützt?",
    3: "Was bedeutet dir dein Rudel oder deine Familie?",
    4: "Bist du schon in Rage verfallen? Wenn ja, warum?",
    5: "Welcher Ort fühlt sich für dich wie „Zuhause“ an?",
  },
  [GameLine.Mage]: {
    1: "Wann hast du das erste Mal gespürt, dass die Welt mehr ist, als sie scheint?",
    2: "Wo warst du, als du erwacht bist?",
    3: "Wer hat dir zuerst geglaubt – und wer hat dich ausgelacht?",
    4: "Wovor hättest du Angst, wenn andere deine Kräfte entdecken würden?",
    5: "Welche Vision oder welches Ziel treibt dich an?",
  },
  [GameLine.Hunter]: {
    1: "Wann hast du das erste Mal etwas gesehen, das du nicht erklären konntest?",
    2: "Was hat dich davon überzeugt, dass Monster wirklich existieren?",
    3: "Wen konntest du mit deiner Wahrheit überzeugen – und wer hat sich von dir abgewandt?",
    4: "Was treibt dich an, dich gegen die Dunkelheit zu stellen?",
    5: "Was würdest du opfern, um die Menschheit zu schützen?",
  },
  [GameLine.DarkAges]: {
    1: "Wer warst du im Jahr 1242 – Bauer, Ritter, Mönch, Kaufmann?",
    2: "Wer hat dir den Kuss geschenkt, und warum gerade dir?",
    3: "Woran glaubst du noch – Gott, Ehre, Blut oder gar nichts?",
    4: "Welchem Weg folgst du, um nicht der Bestie zu verfallen?",
    5: "Was bindet dich noch an die Welt der Sterblichen?",
  },
}

const getCreateTip = (gameLine: GameLine, questionNr: number): string => {
  return GAME_TIPS[gameLine]?.[questionNr] ?? ""
}

watch(gameline, gl => store.overrideGameLine = gl)
watch(show, val => {
  if (!val) {
    store.overrideGameLine = undefined
    store.resetTheme()
  }
})

defineExpose({ showModal, showModalInFolder })
</script>

<template>
  <Modal :shown="show" with-close @close="show = false">
    <div class="ccm">
      <div class="ccm__tip">
        <b><i class="fa-solid fa-circle-question"></i> Bevor du startest!</b>
        <div class="ccm__sub">Mach dir ein paar Gedanken und versuche folgende Fragen zu beantworten:</div>
        <ul class="ccm__qs">
          <li v-for="i in [1, 2, 3, 4, 5]" :key="i">
            {{getCreateTip(gameline, i)}}
          </li>
        </ul>
        <div class="ccm__divider"></div>
      </div>

      <div class="ccm__segment">
        <div class="sex-select">
          <div :class="{ active: gameline === GameLine.Vampire }" @click="gameline = GameLine.Vampire" data-agent="char:gameline:V5">V5</div>
          <div :class="{ active: gameline === GameLine.Werewolf }" @click="gameline = GameLine.Werewolf" data-agent="char:gameline:W5">W5</div>
          <div :class="{ active: gameline === GameLine.Mage }" @click="gameline = GameLine.Mage" data-agent="char:gameline:M20">M20</div>
          <div :class="{ active: gameline === GameLine.Hunter }" @click="gameline = GameLine.Hunter" data-agent="char:gameline:H5">H5</div>
          <div :class="{ active: gameline === GameLine.DarkAges }" @click="gameline = GameLine.DarkAges" data-agent="char:gameline:VDZ">VDZ</div>
        </div>
      </div>

      <div class="ccm__divider"></div>

      <div class="ccm__segment">
        <label class="required">Name des Charakters:</label>
        <input class="form-control" type="text" placeholder="Name des Charakters" v-model="name" data-agent="input:char-name" />
      </div>

      <div v-if="gameline === GameLine.DarkAges" class="ccm__segment">
        <label class="required">Generation:</label>
        <select class="form-control" v-model.number="generation" data-agent="select:generation">
          <option v-for="o in vdzGenerationOptions" :key="o.gen" :value="o.gen">{{ o.label }}</option>
        </select>
        <small class="ccm__hint">Je niedriger die Generation, desto mächtiger das Blut — aber desto näher an den Ahnen und ihrer Aufmerksamkeit.</small>
      </div>

      <div v-if="gameline === GameLine.Vampire" class="ccm__segment">
        <label class="required">Generation:</label>
        <div class="ccm__row">
          <select v-model="generationEra" @change="onEraChange" class="form-control" data-agent="select:generation-era">
            <option :value="Generation.Children">Kinder</option>
            <option :value="Generation.Newborn">Neugeborene</option>
            <option :value="Generation.Ancillae">Ancillae</option>
            <option :value="Generation.Older">älter/benutzerdefiniert</option>
            <option :value="Generation.Elder">Methusa/Antediluvian</option>
          </select>
          <input class="form-control" type="number" :min="eraMin" :max="eraMax" v-model.number="generation" inputmode="numeric" data-agent="input:generation" />
        </div>
      </div>

      <div class="ccm__segment">
        <label class="required">Geschlecht:</label>
        <div class="sex-select">
          <div :class="{ active: sex === Sex.Male }" @click="sex = Sex.Male" data-agent="char:sex:male">männlich</div>
          <div :class="{ active: sex === Sex.Divers }" @click="sex = Sex.Divers" data-agent="char:sex:divers">divers</div>
          <div :class="{ active: sex === Sex.Female }" @click="sex = Sex.Female" data-agent="char:sex:female">weiblich</div>
        </div>
      </div>

      <div v-if="gameline === GameLine.Vampire" class="ccm__segment">
        <label>Verwendete Bücher:</label>
        <BookSelection ref="bookSelection" />
      </div>

      <button class="btn btn-primary ccm__cta" @click="startCreateCharacter" data-agent="char:start">
        Erstellung starten
      </button>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.ccm {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ccm__tip {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ccm__sub {
  opacity: 0.9;
}

.ccm__hint {
  opacity: 0.7;
  font-style: italic;
}

.ccm__qs {
  margin: 0.25rem 0 0;
  padding-left: 1.25rem;
  font-size: 1.05rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.ccm__divider {
  width: 100%;
  height: 1px;
  background: rgba(255, 255, 255, 0.12);
  margin: 0.75rem 0;
}

.ccm__segment {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ccm__row {
  display: flex;
  gap: 0.75rem;
  @media (max-width: 520px) {
    flex-direction: column;
  }
}

.ccm__cta {
  width: 100%;
}

.sex-select {
  display: flex;
  border: 2px solid var(--primary-color);
  border-radius: 1rem;
  overflow: hidden;

  div {
    cursor: pointer;
    user-select: none;
    text-align: center;
    flex: 1 1 0;
    padding: 0.65rem 0.5rem;
    border-right: 1px solid rgba(255, 255, 255, 0.12);

    &:last-child {
      border-right: 0;
    }

    &.active {
      background: var(--primary-color);
      color: var(--text-color-on-primary-color-bg, #fff);
    }
  }
}
</style>
