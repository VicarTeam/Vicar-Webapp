<script setup lang="ts">
import { computed, inject } from "vue"
import type { ICharacter, ICharacterDirectory } from "@/@types/models"
import Character from "@/components/main/characters/Character.vue"
import IconButton from "@/components/IconButton.vue"
import CharacterStorage from "@/libs/io/character-storage"

const props = defineProps<{
  directory: ICharacterDirectory | null
  characters: ICharacter[]
  activeDrop?: boolean
}>()

const startCharCreation = inject<(dir?: ICharacterDirectory) => void>("create-character")!
const updateCharacterList = inject<() => void>("update-character-list")!

const dirId = computed(() => (props.directory ? props.directory.id : "__root__"))

function toggleOpen() {
  if (!props.directory) return
  props.directory.open = !props.directory.open
  if (props.directory.id === "@shared-chars") {
    localStorage.setItem("vicar::shared-chars-open", props.directory.open ? "1" : "0")
  }
  updateCharacterList()
}

function createCharacter() {
  if (!props.directory) return
  startCharCreation(props.directory)
}

function removeDirectory() {
  if (!props.directory) return
  CharacterStorage.loadedDirectories = CharacterStorage.loadedDirectories.filter((d) => d.id !== props.directory!.id)
  setTimeout(() => updateCharacterList(), 100)
}
</script>

<template>
  <div class="char-dir" :data-dropzone="dirId">
    <div class="head" v-if="directory">
      {{ directory.name }}

      <div class="actions left">
        <IconButton icon="fa-plus" @click="createCharacter" />
        <IconButton v-if="characters.length <= 0" icon="fa-minus" @click="removeDirectory" />
      </div>

      <div class="actions right">
        <IconButton :icon="directory.open ? 'fa-chevron-up' : 'fa-chevron-down'" @click="toggleOpen" />
      </div>
    </div>

    <div class="list" v-if="!directory || directory.open" :class="{ 'drop-active': activeDrop }">
      <Character v-for="c in characters" :key="c.id" :character="c" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.char-dir {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.head {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  padding: 0.6rem 0.5rem;
  color: #fff;
  font-weight: 800;
  text-transform: uppercase;
  border-bottom: 2px solid var(--primary-color);
}

.actions {
  position: absolute;
  top: 0;
  height: 100%;
  display: flex;
  gap: 0.5rem;
  align-items: center;

  &.left {
    left: 0;
  }
  &.right {
    right: 0;
  }
}

.list {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 1rem;
  padding: 1rem;
  border-radius: 10px;
  transition: background-color 120ms ease, outline-color 120ms ease;
  outline: 2px dashed rgba(255, 255, 255, 0.08);
  outline-offset: 4px;
}

.drop-active {
  background-color: rgba(255, 255, 255, 0.04);
  outline-color: rgba(255, 255, 255, 0.22);
}

@media (max-width: 800px) {
  .list {
    padding: 0.75rem;
  }
}
</style>
