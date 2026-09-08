<script setup lang="ts">
import { ref } from "vue"
import Modal from "@/components/modal/Modal.vue"
import CharacterStorage from "@/libs/io/character-storage"
import type { IFolder } from "@/@types/models"

const emit = defineEmits<{
  (e: "created"): void
  (e: "changed"): void
}>()

const show = ref(false)
const name = ref("")
const mode = ref<"create" | "rename">("create")
const parentId = ref("")
const editing = ref<IFolder | null>(null)

const showModal = (parent: string = "") => {
  mode.value = "create"
  parentId.value = parent
  editing.value = null
  name.value = ""
  show.value = true
}

const showRenameModal = (folder: IFolder) => {
  mode.value = "rename"
  editing.value = folder
  name.value = folder.name
  show.value = true
}

const submit = async () => {
  const value = name.value.trim()
  if (!value) return

  if (mode.value === "rename" && editing.value) {
    await CharacterStorage.renameFolder(editing.value, value)
    emit("changed")
  } else {
    await CharacterStorage.createFolder(value, parentId.value)
    emit("created")
  }
  show.value = false
}

defineExpose({ showModal, showRenameModal })
</script>

<template>
  <Modal :shown="show" @close="show = false">
    <div class="cdm">
      <span class="cdm__label">{{ mode === "rename" ? "Ordner umbenennen:" : parentId ? "Name des Unterordners:" : "Name des Ordners:" }}</span>
      <input class="form-control" type="text" v-model="name" inputmode="text" autocomplete="off" @keyup.enter="submit" />
      <button class="btn btn-primary cdm__cta" @click="submit">{{ mode === "rename" ? "Umbenennen" : "Abschließen" }}</button>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.cdm {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: stretch;
}
.cdm__cta {
  width: 100%;
}
</style>
