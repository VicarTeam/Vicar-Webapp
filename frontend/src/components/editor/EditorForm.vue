<script setup lang="ts">
import { computed } from "vue"
import { useRouter } from "vue-router"
import { useStore } from "@/app/store"
import type { ICharacter, ICharacterDirectory } from "@/@types/models"
import { AttributeKeys } from "@/@types/models"
import { GameLine } from "@/@types/gameline"
import CharacterStorage from "@/libs/io/character-storage"
import { EditorHistory } from "@/libs/editor-history"
import FileCreator from "@/libs/io/file-creator"
import DataManager from "@/libs/data/data-manager"

const props = withDefaults(
  defineProps<{
    showOnly?: boolean
    fallbackHistoryChar?: ICharacter | null
    isCancel?: boolean
    isFinish?: boolean
    canGoNext: boolean
    nextStep?: string
    preserveStateOnBack?: boolean
  }>(),
  {
    showOnly: false,
    fallbackHistoryChar: null,
    isCancel: false,
    isFinish: false,
    nextStep: "",
    preserveStateOnBack: false,
  }
)

const emit = defineEmits<{
  (e: "before-next", payload: { next: () => void | Promise<void>; cancel: boolean }): void
}>()

const router = useRouter()
const store = useStore()

const editingCharacter = computed(() => store.editingCharacter as ICharacter | undefined)
const directoryForCharCreation = computed(() => store.directoryForCharCreation as ICharacterDirectory | undefined)

async function next() {
  if (props.showOnly) return
  if (!editingCharacter.value || !props.canGoNext) return

  if (!props.isFinish) {
    const n = () => {
      EditorHistory.push(props.fallbackHistoryChar ? props.fallbackHistoryChar : editingCharacter.value!)

      if (props.preserveStateOnBack) {
        EditorHistory.markSkipNextRestore()
      }

      router.push({ name: props.nextStep })
    }

    const event = { next: n, cancel: false }
    emit("before-next", event)
    if (!event.cancel) n()
    return
  }

  const n = async () => {
    const char = editingCharacter.value
    if (!char) return

    if (directoryForCharCreation.value) {
      ;(char as any).directory = directoryForCharCreation.value.id
    }

    if (char.game !== GameLine.Mage && char.game !== GameLine.DarkAges) {
      ;(char as any).requiredPointSpreads = []
      ;(char as any).health = DataManager.getAttributeValue(char as any, AttributeKeys.Stamina) + 3
      ;(char as any).willpower =
        DataManager.getAttributeValue(char as any, AttributeKeys.Composure) +
        DataManager.getAttributeValue(char as any, AttributeKeys.Resolve)
    }

    const res = await CharacterStorage.addCharacter(char as any)
    if (!res) {
      FileCreator.create("unsaved-character", JSON.stringify(char))
      return
    }

    if (store.folderForCharCreation) {
      await CharacterStorage.addCharacterToFolder(store.folderForCharCreation, (char as any).id)
    }

    store.isLevelMode = false
    EditorHistory.clear()
    store.directoryForCharCreation = undefined
    store.folderForCharCreation = undefined
    await router.push({ name: "viewer", params: { characterId: (char as any).id } })
  }

  const event = { next: n, cancel: false }
  emit("before-next", event)
  if (!event.cancel) await n()
}

function back() {
  if (!props.isCancel) {
    if (props.preserveStateOnBack) {
      const skip = EditorHistory.shouldSkipRestore()
      if (!skip && EditorHistory.length > 0) {
        store.editingCharacter = EditorHistory.pop() as any
      }
    } else {
      if (EditorHistory.length > 0) {
        store.editingCharacter = EditorHistory.pop() as any
      }
    }

    router.back()
    return
  }

  store.directoryForCharCreation = undefined
  store.folderForCharCreation = undefined
  store.editingCharacter = undefined
  EditorHistory.clear()
  router.push({ name: "main" })
}
</script>

<template>
  <div class="editor-form">
    <div class="pane" :class="{ 'full-height': showOnly }">
      <slot></slot>
    </div>

    <div v-if="!showOnly" class="toolbar">
      <button class="btn" @click="back">
        {{ !isCancel ? "Zurück" : "Abbrechen" }}
      </button>

      <div class="fill"></div>

      <button class="btn btn-primary" @click="next" :disabled="!canGoNext">
        {{ !isFinish ? "Weiter" : "Abschließen" }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.editor-form {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  .pane {
    width: 100%;
    flex: 1 1 auto;
    min-height: 0;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    &.full-height {
      flex: 1 1 auto;
    }
  }
  .toolbar {
    position: sticky;
    bottom: 0;
    width: 100%;
    padding: 0.8rem 1rem max(env(safe-area-inset-bottom), 0.8rem);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.55));
    backdrop-filter: blur(0.6rem);
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    .fill {
      flex: 1 1 auto;
    }
    .btn {
      min-height: 44px;
      padding: 0.65rem 1rem;
      white-space: nowrap;
    }
  }
}
</style>
