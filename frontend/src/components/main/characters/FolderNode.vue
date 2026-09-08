<script setup lang="ts">
import { computed, inject } from "vue"
import type { ICharacter, IFolder } from "@/@types/models"
import Character from "@/components/main/characters/Character.vue"
import IconButton from "@/components/IconButton.vue"
import CharacterStorage from "@/libs/io/character-storage"

const props = defineProps<{
  folder: IFolder
  parentContainer: string
}>()

const beginFolderDrag = inject<(folder: IFolder, e: PointerEvent) => void>("begin-folder-drag")!
const createSubfolder = inject<(parentId: string) => void>("create-subfolder")!
const createCharacterInFolder = inject<(folderId: string) => void>("create-character-in-folder")!
const renameFolder = inject<(folder: IFolder) => void>("rename-folder")!
const deleteFolder = inject<(folder: IFolder) => void>("delete-folder")!
const updateCharacterList = inject<() => void>("update-character-list")!

type DropTarget =
  | { mode: "into"; folderId: string }
  | { mode: "order"; container: string; index: number }

const drag = inject<{ active: boolean; kind: "char" | "folder" | null; target: DropTarget | null }>("folder-drag")!

const subfolders = computed(() => CharacterStorage.subFolders(props.folder.id))
const characters = computed<ICharacter[]>(() => CharacterStorage.charactersInFolder(props.folder))
const isOpen = computed(() => props.folder.open !== false)
const isEmpty = computed(() => subfolders.value.length === 0 && characters.value.length === 0)

const isInto = computed(() => drag.target?.mode === "into" && drag.target.folderId === props.folder.id)

function folderLine(index: number): boolean {
  return drag.active && drag.kind === "folder" && drag.target?.mode === "order"
    && drag.target.container === props.folder.id && drag.target.index === index
}

function charLine(index: number): boolean {
  return drag.active && drag.kind === "char" && drag.target?.mode === "order"
    && drag.target.container === props.folder.id && drag.target.index === index
}

function onFolderDragDown(e: PointerEvent) {
  beginFolderDrag(props.folder, e)
}

function toggleOpen() {
  CharacterStorage.toggleFolderOpen(props.folder)
  updateCharacterList()
}
</script>

<template>
  <div class="folder-node" :data-folder-slot="parentContainer" :data-folder-id="folder.id">
    <div class="folder-header" :data-dropinto="folder.id" :class="{ 'into-active': isInto }">
      <div class="folder-drag-handle" @pointerdown="onFolderDragDown" title="Ordner verschieben">
        <i class="fa-solid fa-grip-vertical"></i>
      </div>

      <button class="folder-toggle" @click="toggleOpen">
        <i :class="isOpen ? 'fa-solid fa-folder-open' : 'fa-solid fa-folder'"></i>
      </button>

      <span class="folder-name" @click="toggleOpen">{{ folder.name }}</span>
      <span class="folder-count">{{ characters.length + subfolders.length }}</span>

      <div class="folder-actions">
        <IconButton icon="fa-user-plus" title="Charakter hier erstellen" @click="createCharacterInFolder(folder.id)" />
        <IconButton icon="fa-folder-plus" title="Unterordner erstellen" @click="createSubfolder(folder.id)" />
        <IconButton icon="fa-pen" title="Umbenennen" @click="renameFolder(folder)" />
        <IconButton v-if="isEmpty" icon="fa-trash" title="Ordner löschen" @click="deleteFolder(folder)" />
      </div>
    </div>

    <div v-if="isOpen" class="folder-body" :data-container="folder.id">
      <template v-for="(sf, i) in subfolders" :key="sf.id">
        <div v-if="folderLine(i)" class="drop-line"></div>
        <FolderNode :folder="sf" :parentContainer="folder.id" />
      </template>
      <div v-if="folderLine(subfolders.length)" class="drop-line"></div>

      <template v-for="(c, i) in characters" :key="c.id">
        <div v-if="charLine(i)" class="drop-line"></div>
        <div class="char-slot" :data-char-slot="folder.id" :data-char-id="c.id">
          <Character :character="c" />
        </div>
      </template>
      <div v-if="charLine(characters.length)" class="drop-line"></div>

      <div v-if="isEmpty" class="folder-empty">Leer - zieh Charaktere oder Ordner hierher</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.folder-node {
  display: flex;
  flex-direction: column;
  border-radius: 10px;
}

.folder-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.6rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  color: #fff;
  transition: border-color 120ms ease, background-color 120ms ease;

  &.into-active {
    border-color: var(--primary-color);
    background: color-mix(in srgb, var(--primary-color) 20%, transparent);
  }
}

.folder-drag-handle {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  cursor: grab;
  border-radius: 6px;
  touch-action: none;
  &:active { cursor: grabbing; }
  &:hover { background: rgba(255, 255, 255, 0.06); }
  i { opacity: 0.8; }
}

.folder-toggle {
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0.2rem;
}

.folder-name {
  font-weight: 800;
  text-transform: uppercase;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.folder-count {
  font-size: 0.85rem;
  color: #8a8a8a;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 999px;
  padding: 0.05rem 0.55rem;
}

.folder-actions {
  margin-left: auto;
  display: flex;
  gap: 0.35rem;
}

.folder-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.75rem 0 0.25rem 1.25rem;
  margin-left: 0.75rem;
  border-left: 2px dashed rgba(255, 255, 255, 0.08);
}

.char-slot {
  display: block;
}

.drop-line {
  height: 3px;
  border-radius: 3px;
  background: var(--primary-color);
  box-shadow: 0 0 8px var(--primary-color);
}

.folder-empty {
  font-size: 0.9rem;
  color: #7a7a7a;
  font-style: italic;
  padding: 0.25rem 0;
}

@media (max-width: 800px) {
  .folder-body {
    padding-left: 0.75rem;
    margin-left: 0.35rem;
  }
  .folder-actions {
    flex-wrap: wrap;
  }
}
</style>
