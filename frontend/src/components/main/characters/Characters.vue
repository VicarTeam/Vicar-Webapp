<script setup lang="ts">
import { computed, onMounted, onUnmounted, provide, ref } from "vue"
import { useRouter } from "vue-router"
import CreateCharacterModal from "@/components/main/characters/modals/CreateCharacterModal.vue"
import CreateDirectoryModal from "@/components/main/characters/modals/CreateDirectoryModal.vue"
import ConfirmCharDeletionModal from "@/components/main/characters/modals/ConfirmCharDeletionModal.vue"
import CharacterViewersModal from "@/components/main/characters/modals/CharacterViewersModal.vue"
import CharacterDirectory from "@/components/main/characters/CharacterDirectory.vue"
import CharacterStorage from "@/libs/io/character-storage"
import FileReaderUtils from "@/libs/io/file-reader"
import EventBus from "@/libs/event-bus"
import type { ICharacter, ICharacterDirectory } from "@/@types/models"

const router = useRouter()

const refreshForce = ref(1)

const importFiles = ref<HTMLInputElement | null>(null)
const createCharacterModal = ref<InstanceType<typeof CreateCharacterModal> | null>(null)
const confirmCharDeletionModal = ref<InstanceType<typeof ConfirmCharDeletionModal> | null>(null)
const createDirectoryModal = ref<InstanceType<typeof CreateDirectoryModal> | null>(null)
const characterViewersModal = ref<InstanceType<typeof CharacterViewersModal> | null>(null)

const dragging = ref(false)
const draggedChar = ref<ICharacter | null>(null)
const dragX = ref(0)
const dragY = ref(0)
const pointerId = ref<number | null>(null)
const dropTarget = ref<string | null>(null) // "__root__" oder directoryId
const dragOffsetX = ref(0)
const dragOffsetY = ref(0)

const dropActiveMap = computed<Record<string, boolean>>(() => {
  const m: Record<string, boolean> = {}
  if (dropTarget.value) m[dropTarget.value] = true
  return m
})

function findDropZoneAt(x: number, y: number): string | null {
  const el = document.elementFromPoint(x, y) as HTMLElement | null
  if (!el) return null
  const zone = el.closest("[data-dropzone]") as HTMLElement | null
  return zone?.getAttribute("data-dropzone") ?? null
}

function onPointerMove(e: PointerEvent) {
  if (!dragging.value) return
  if (pointerId.value !== null && e.pointerId !== pointerId.value) return

  dragX.value = e.clientX - dragOffsetX.value
  dragY.value = e.clientY - dragOffsetY.value

  dropTarget.value = findDropZoneAt(e.clientX, e.clientY)
}

async function endDrag(commit: boolean) {
  if (!dragging.value) return

  const char = draggedChar.value
  const target = dropTarget.value

  dragging.value = false
  pointerId.value = null

  if (commit && char) {
    const oldDir = (char as any).directory as string | undefined

    if (target === "__root__") {
      delete (char as any).directory
    } else if (target) {
      ;(char as any).directory = target
    }

    await CharacterStorage.saveDirectory(char, (char as any).directory)

    if (oldDir) {
      const count = CharacterStorage.loadedCharacters.filter((c: any) => c.directory === oldDir).length
      if (count === 0) {
        CharacterStorage.loadedDirectories = CharacterStorage.loadedDirectories.filter((d: any) => d.id !== oldDir)
      }
    }

    updateCharacterList()
  }

  draggedChar.value = null
  dropTarget.value = null
}

function onPointerUp(e: PointerEvent) {
  if (!dragging.value) return
  if (pointerId.value !== null && e.pointerId !== pointerId.value) return
  endDrag(true)
}

function onPointerCancel(e: PointerEvent) {
  if (!dragging.value) return
  if (pointerId.value !== null && e.pointerId !== pointerId.value) return
  endDrag(false)
}

function beginDrag(char: ICharacter, e: PointerEvent) {
  if (e.button !== undefined && e.button !== 0) return

  draggedChar.value = char
  dragging.value = true
  pointerId.value = e.pointerId

  const rect = (e.currentTarget as HTMLElement)?.getBoundingClientRect()
  dragOffsetX.value = rect ? e.clientX - rect.left : 22
  dragOffsetY.value = rect ? e.clientY - rect.top : 22

  dragX.value = e.clientX - dragOffsetX.value
  dragY.value = e.clientY - dragOffsetY.value

  dropTarget.value = findDropZoneAt(e.clientX, e.clientY)

  ;(e.currentTarget as HTMLElement)?.setPointerCapture?.(e.pointerId)
  e.preventDefault()
}

onMounted(() => {
  EventBus.$on("update-character-list", updateCharacterList)
  window.addEventListener("pointermove", onPointerMove, { passive: false })
  window.addEventListener("pointerup", onPointerUp)
  window.addEventListener("pointercancel", onPointerCancel)
})
onUnmounted(() => {
  EventBus.$off("update-character-list", updateCharacterList)
  window.removeEventListener("pointermove", onPointerMove as any)
  window.removeEventListener("pointerup", onPointerUp as any)
  window.removeEventListener("pointercancel", onPointerCancel as any)
})

async function importCharacterFromFile(event: Event) {
  try {
    const input = event.target as HTMLInputElement
    if (!input.files) return
    const content = await FileReaderUtils.readFile(input.files as any)
    const char: ICharacter = JSON.parse(content)
    delete (char as any).directory
    delete (char as any).justViewing
    await CharacterStorage.addCharacter(char)
    updateCharacterList()
    input.value = ""
  } catch (e) {
    console.error(e)
  }
}

function getSortedCharacters() {
  return CharacterStorage.getSortedCharacters()
}

provide("edit-viewers", (char: ICharacter) => characterViewersModal.value?.showModal(char))
provide("begin-char-deletion", (char: ICharacter) => confirmCharDeletionModal.value?.showModal(char))
provide("update-character-list", updateCharacterList)
provide("is-share-available", () => false)
provide("share-character", (_char: ICharacter) => {})
provide("create-character", (dir?: ICharacterDirectory) => createCharacterModal.value?.showModal(dir))

provide("begin-drag", beginDrag)

function updateCharacterList() {
  refreshForce.value++
  if (refreshForce.value > 10) refreshForce.value = 1
}
</script>

<template>
  <div class="characters" :key="refreshForce">
    <div class="sidebar">
      <input type="file" ref="importFiles" name="files[]" hidden @change="importCharacterFromFile" />

      <button class="btn btn-primary big" @click="createCharacterModal?.showModal()">
        NEUER CHARAKTER
      </button>
      <button class="btn btn-primary big" @click="createDirectoryModal?.showModal()">
        NEUER ORDNER
      </button>
      <button class="btn btn-primary big" @click="importFiles?.click()">
        IMPORTIEREN
      </button>
      <button class="btn btn-primary big" @click="router.push('/skilltrees')">
        SKILL-BÄUME
      </button>
    </div>

    <div class="lists">
      <CharacterDirectory
        v-for="(d, i) in getSortedCharacters()"
        :key="i"
        :directory="d.directory"
        :characters="d.characters"
        :activeDrop="dropActiveMap[d.directory ? d.directory.id : '__root__']"
      />
    </div>

    <CreateCharacterModal ref="createCharacterModal" />
    <CreateDirectoryModal ref="createDirectoryModal" @created="updateCharacterList" />
    <ConfirmCharDeletionModal ref="confirmCharDeletionModal" @deleted="updateCharacterList" />
    <CharacterViewersModal ref="characterViewersModal" />

    <teleport to="body">
      <div v-if="dragging && draggedChar" class="drag-ghost" :style="{ left: dragX + 'px', top: dragY + 'px' }">
        <div class="ghost-card">
          <div class="ghost-title">{{ draggedChar.name }}</div>
          <div class="ghost-sub">{{ (draggedChar as any).concept }}</div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<style scoped lang="scss">
.characters {
  width: 100%;
  min-height: 0;
  display: grid;
  grid-template-columns: 20rem 1fr;
  gap: 2rem;
  padding: 2rem;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.big {
  height: 4rem;
  min-height: 44px;
  width: 100%;
}

.lists {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  min-width: 0;
}

.drag-ghost {
  position: fixed;
  z-index: 99999;
  pointer-events: none;
  transform: translate3d(0, 0, 0);
}

.ghost-card {
  width: min(18rem, calc(100vw - 3rem));
  background: rgba(37, 40, 44, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 10px;
  padding: 0.75rem 0.9rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
}
.ghost-title {
  font-weight: 800;
  color: #fff;
  text-transform: uppercase;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ghost-sub {
  margin-top: 0.25rem;
  color: #a0a0a0;
  font-size: 0.95rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 1000px) {
  .characters {
    grid-template-columns: 1fr;
    padding: 1rem;
    gap: 1rem;
  }
  .sidebar {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
}
</style>
