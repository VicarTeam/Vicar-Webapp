<script setup lang="ts">
import { inject } from "vue"
import type { ICharacter, ICharacterDirectory } from "@/@types/models"
import Character from "@/components/main/characters/Character.vue"
import IconButton from "@/components/IconButton.vue"

const props = defineProps<{
  directory: ICharacterDirectory | null
  characters: ICharacter[]
}>()

const updateCharacterList = inject<() => void>("update-character-list")!

const isShared = props.directory?.id === "@shared-chars"

function toggleOpen() {
  if (!props.directory) return
  props.directory.open = !props.directory.open
  if (props.directory.id === "@shared-chars") {
    localStorage.setItem("vicar::shared-chars-open", props.directory.open ? "1" : "0")
  }
  updateCharacterList()
}
</script>

<template>
  <div class="char-dir">
    <div class="head" v-if="directory">
      <span class="head__name">
        <i v-if="!isShared" class="fa-solid fa-box-archive legacy-icon" title="Alter Ordner"></i>
        {{ directory.name }}
      </span>

      <div class="actions right">
        <IconButton :icon="directory.open ? 'fa-chevron-up' : 'fa-chevron-down'" @click="toggleOpen" />
      </div>
    </div>

    <div class="list" v-if="!directory || directory.open">
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

.head__name {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.legacy-icon {
  color: #8a8a8a;
  font-size: 0.85em;
}

.actions {
  position: absolute;
  top: 0;
  height: 100%;
  display: flex;
  gap: 0.5rem;
  align-items: center;

  &.right {
    right: 0;
  }
}

.list {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 1rem;
}
</style>
