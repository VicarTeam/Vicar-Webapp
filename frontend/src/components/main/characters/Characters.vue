<script setup lang="ts">
import { computed, onMounted, onUnmounted, provide, reactive, ref } from "vue"
import { useRouter } from "vue-router"
import CreateCharacterModal from "@/components/main/characters/modals/CreateCharacterModal.vue"
import CreateDirectoryModal from "@/components/main/characters/modals/CreateDirectoryModal.vue"
import ClanFinderModal from "@/components/main/characters/modals/ClanFinderModal.vue"
import ConfirmCharDeletionModal from "@/components/main/characters/modals/ConfirmCharDeletionModal.vue"
import CharacterViewersModal from "@/components/main/characters/modals/CharacterViewersModal.vue"
import CharacterDirectory from "@/components/main/characters/CharacterDirectory.vue"
import FolderNode from "@/components/main/characters/FolderNode.vue"
import CharacterStorage from "@/libs/io/character-storage"
import FileReaderUtils from "@/libs/io/file-reader"
import EventBus from "@/libs/event-bus"
import type { ICharacter, ICharacterDirectory, IFolder } from "@/@types/models"

const router = useRouter()

const refreshForce = ref(1)

const importFiles = ref<HTMLInputElement | null>(null)
const createCharacterModal = ref<InstanceType<typeof CreateCharacterModal> | null>(null)
const confirmCharDeletionModal = ref<InstanceType<typeof ConfirmCharDeletionModal> | null>(null)
const createDirectoryModal = ref<InstanceType<typeof CreateDirectoryModal> | null>(null)
const clanFinderModal = ref<InstanceType<typeof ClanFinderModal> | null>(null)
const characterViewersModal = ref<InstanceType<typeof CharacterViewersModal> | null>(null)

type DropTarget =
  | { mode: "into"; folderId: string }
  | { mode: "order"; container: string; index: number }

const drag = reactive<{
  active: boolean
  kind: "char" | "folder" | null
  char: ICharacter | null
  folder: IFolder | null
  x: number
  y: number
  offsetX: number
  offsetY: number
  pointerId: number | null
  target: DropTarget | null
}>({
  active: false,
  kind: null,
  char: null,
  folder: null,
  x: 0,
  y: 0,
  offsetX: 0,
  offsetY: 0,
  pointerId: null,
  target: null,
})

provide("folder-drag", drag)

const rootFolders = computed<IFolder[]>(() => CharacterStorage.rootFolders())
const unfolderedGroups = computed(() => CharacterStorage.getUnfolderedGroups())

const ghostLabel = computed(() => {
  if (drag.kind === "char") return drag.char?.name ?? ""
  if (drag.kind === "folder") return drag.folder?.name ?? ""
  return ""
})

function rootFolderLine(index: number): boolean {
  return drag.active && drag.kind === "folder" && drag.target?.mode === "order"
    && drag.target.container === "__root__" && drag.target.index === index
}

function orderIndexIn(container: string, slotAttr: string, y: number, excludeId: string | null, idAttr: string): number {
  const nodes = Array.from(document.querySelectorAll(`[${slotAttr}="${container}"]`)) as HTMLElement[]
  let index = 0
  for (const node of nodes) {
    if (excludeId && node.getAttribute(idAttr) === excludeId) continue
    const rect = node.getBoundingClientRect()
    if (y > rect.top + rect.height / 2) index++
    else break
  }
  return index
}

function updateTarget(x: number, y: number) {
  const el = document.elementFromPoint(x, y) as HTMLElement | null
  if (!el) {
    drag.target = null
    return
  }

  const header = el.closest("[data-dropinto]") as HTMLElement | null
  if (header) {
    const folderId = header.getAttribute("data-dropinto")!
    const invalidNest = drag.kind === "folder" && drag.folder
      && (folderId === drag.folder.id || CharacterStorage.isFolderDescendant(folderId, drag.folder.id))
    if (!invalidNest) {
      const rect = header.getBoundingClientRect()
      const rel = (y - rect.top) / Math.max(1, rect.height)
      // For folders, the header edges reorder among siblings; the middle nests.
      if (drag.kind === "folder" && (rel < 0.32 || rel > 0.68)) {
        const node = header.closest("[data-folder-id]") as HTMLElement | null
        const parent = node?.getAttribute("data-folder-slot") ?? "__root__"
        if (!(parent === drag.folder!.id || CharacterStorage.isFolderDescendant(parent, drag.folder!.id))) {
          drag.target = { mode: "order", container: parent, index: orderIndexIn(parent, "data-folder-slot", y, drag.folder!.id, "data-folder-id") }
          return
        }
      }
      drag.target = { mode: "into", folderId }
      return
    }
  }

  const cont = el.closest("[data-container]") as HTMLElement | null
  if (!cont) {
    drag.target = null
    return
  }
  const container = cont.getAttribute("data-container")!

  if (drag.kind === "char") {
    drag.target = { mode: "order", container, index: orderIndexIn(container, "data-char-slot", y, drag.char?.id ?? null, "data-char-id") }
    return
  }

  if (drag.folder && (container === drag.folder.id || CharacterStorage.isFolderDescendant(container, drag.folder.id))) {
    drag.target = null
    return
  }
  drag.target = { mode: "order", container, index: orderIndexIn(container, "data-folder-slot", y, drag.folder?.id ?? null, "data-folder-id") }
}

function onPointerMove(e: PointerEvent) {
  if (!drag.active) return
  if (drag.pointerId !== null && e.pointerId !== drag.pointerId) return
  drag.x = e.clientX - drag.offsetX
  drag.y = e.clientY - drag.offsetY
  updateTarget(e.clientX, e.clientY)
}

async function commitDrop() {
  const target = drag.target
  if (!target) return

  if (drag.kind === "char" && drag.char) {
    const charId = drag.char.id
    if (target.mode === "into") {
      await CharacterStorage.addCharacterToFolder(target.folderId, charId)
    } else if (target.container === "__root__") {
      await CharacterStorage.removeCharacterFromFolders(charId)
    } else {
      await CharacterStorage.addCharacterToFolder(target.container, charId, target.index)
    }
  } else if (drag.kind === "folder" && drag.folder) {
    if (target.mode === "into") {
      const index = CharacterStorage.subFolders(target.folderId).length
      await CharacterStorage.moveFolder(drag.folder, target.folderId, index)
    } else {
      const parent = target.container === "__root__" ? "" : target.container
      await CharacterStorage.moveFolder(drag.folder, parent, target.index)
    }
  }

  updateCharacterList()
}

async function endDrag(commit: boolean) {
  if (!drag.active) return
  drag.active = false
  drag.pointerId = null
  if (commit) {
    await commitDrop()
  }
  drag.kind = null
  drag.char = null
  drag.folder = null
  drag.target = null
}

function onPointerUp(e: PointerEvent) {
  if (!drag.active) return
  if (drag.pointerId !== null && e.pointerId !== drag.pointerId) return
  endDrag(true)
}

function onPointerCancel(e: PointerEvent) {
  if (!drag.active) return
  if (drag.pointerId !== null && e.pointerId !== drag.pointerId) return
  endDrag(false)
}

function startDrag(e: PointerEvent) {
  drag.active = true
  drag.pointerId = e.pointerId
  const rect = (e.currentTarget as HTMLElement)?.getBoundingClientRect()
  drag.offsetX = rect ? e.clientX - rect.left : 16
  drag.offsetY = rect ? e.clientY - rect.top : 16
  drag.x = e.clientX - drag.offsetX
  drag.y = e.clientY - drag.offsetY
  drag.target = null
  ;(e.currentTarget as HTMLElement)?.setPointerCapture?.(e.pointerId)
  e.preventDefault()
}

function beginDrag(char: ICharacter, e: PointerEvent) {
  if (e.button !== undefined && e.button !== 0) return
  if (char.justViewing) return
  drag.kind = "char"
  drag.char = char
  drag.folder = null
  startDrag(e)
  updateTarget(e.clientX, e.clientY)
}

function beginFolderDrag(folder: IFolder, e: PointerEvent) {
  if (e.button !== undefined && e.button !== 0) return
  drag.kind = "folder"
  drag.folder = folder
  drag.char = null
  startDrag(e)
  updateTarget(e.clientX, e.clientY)
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

async function removeFolder(folder: IFolder) {
  await CharacterStorage.deleteFolder(folder)
  updateCharacterList()
}

provide("edit-viewers", (char: ICharacter) => characterViewersModal.value?.showModal(char))
provide("begin-char-deletion", (char: ICharacter) => confirmCharDeletionModal.value?.showModal(char))
provide("update-character-list", updateCharacterList)
provide("is-share-available", () => false)
provide("share-character", (_char: ICharacter) => {})
provide("create-character", (dir?: ICharacterDirectory) => createCharacterModal.value?.showModal(dir))
provide("create-character-in-folder", (folderId: string) => createCharacterModal.value?.showModalInFolder(folderId))
provide("create-subfolder", (parentId: string) => createDirectoryModal.value?.showModal(parentId))
provide("rename-folder", (folder: IFolder) => createDirectoryModal.value?.showRenameModal(folder))
provide("delete-folder", removeFolder)
provide("begin-drag", beginDrag)
provide("begin-folder-drag", beginFolderDrag)

function updateCharacterList() {
  refreshForce.value++
  if (refreshForce.value > 100000) refreshForce.value = 1
}
</script>

<template>
  <div class="characters">
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
      <button class="btn btn-primary big" @click="clanFinderModal?.showModal()">
        KLAN-FINDER
      </button>
      <button class="btn btn-primary big" @click="router.push('/skilltrees')">
        SKILL-BÄUME
      </button>
    </div>

    <div class="lists" data-container="__root__" :key="refreshForce">
      <template v-for="(f, i) in rootFolders" :key="f.id">
        <div v-if="rootFolderLine(i)" class="drop-line"></div>
        <FolderNode :folder="f" parentContainer="__root__" />
      </template>
      <div v-if="rootFolderLine(rootFolders.length)" class="drop-line"></div>

      <CharacterDirectory
        v-for="(d, i) in unfolderedGroups"
        :key="'group-' + i"
        :directory="d.directory"
        :characters="d.characters"
      />
    </div>

    <CreateCharacterModal ref="createCharacterModal" />
    <CreateDirectoryModal ref="createDirectoryModal" @created="updateCharacterList" @changed="updateCharacterList" />
    <ClanFinderModal ref="clanFinderModal" />
    <ConfirmCharDeletionModal ref="confirmCharDeletionModal" @deleted="updateCharacterList" />
    <CharacterViewersModal ref="characterViewersModal" />

    <teleport to="body">
      <div v-if="drag.active" class="drag-ghost" :style="{ left: drag.x + 'px', top: drag.y + 'px' }">
        <div class="ghost-card">
          <i v-if="drag.kind === 'folder'" class="fa-solid fa-folder"></i>
          <div class="ghost-title">{{ ghostLabel }}</div>
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
  gap: 1.25rem;
  min-width: 0;
}

.drop-line {
  height: 3px;
  border-radius: 3px;
  background: var(--primary-color);
  box-shadow: 0 0 8px var(--primary-color);
}

.drag-ghost {
  position: fixed;
  z-index: 99999;
  pointer-events: none;
  transform: translate3d(0, 0, 0);
}

.ghost-card {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: min(18rem, calc(100vw - 3rem));
  background: rgba(37, 40, 44, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 10px;
  padding: 0.75rem 0.9rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  color: #fff;
}
.ghost-title {
  font-weight: 800;
  text-transform: uppercase;
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
