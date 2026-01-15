<script setup lang="ts">
import {ref} from "vue"
import Modal from "@/components/modal/Modal.vue"
import {del, get, post} from "@/libs/io/rest"
import type {ICharacter} from "@/@types/models"

interface Viewer {
  id: string
  username: string
}

const show = ref(false)
const char = ref<ICharacter | null>(null)
const viewers = ref<Viewer[]>([])
const addViewerUsername = ref("")

const getViewersOfCharacter = async (id: string): Promise<Viewer[]> => {
  const [status, res] = await get<Viewer[]>(`/characters/${id}/viewers`)
  if (status >= 400) return []
  return res
}

const removeViewer = async (viewerId: string) => {
  if (!char.value) return
  const [status] = await del(`/characters/${char.value.id}/viewers/${viewerId}`)
  if (status < 400) {
    viewers.value = viewers.value.filter(v => v.id !== viewerId)
  }
}

const addViewer = async () => {
  if (!char.value) return
  const username = addViewerUsername.value.trim().toLowerCase()
  if (!username) return

  const [status] = await post(`/characters/${char.value.id}/share`, { username })
  if (status < 400) {
    viewers.value.push({ id: username, username })
    addViewerUsername.value = ""
  } else if (status === 404) {
    alert("Benutzer nicht gefunden")
  }
}

const close = () => {
  show.value = false
  viewers.value = []
  addViewerUsername.value = ""
  char.value = null
}

const showModal = async (c: ICharacter) => {
  viewers.value = await getViewersOfCharacter(c.id)
  char.value = c
  show.value = true
}

defineExpose({ showModal })
</script>

<template>
  <Modal :shown="show" @close="close">
    <div v-if="char" class="cv-modal">
      <div class="cv-modal__title">
        <span class="cv-modal__headline">{{ char.name }} – Freigegeben für:</span>
      </div>

      <div class="cv-modal__list">
        <div v-for="viewer in viewers" :key="viewer.id" class="cv-modal__row">
          <span class="cv-modal__user">{{ viewer.username }}</span>
          <button class="btn btn-primary" @click="removeViewer(viewer.id)">
            Freigabe entfernen
          </button>
        </div>
      </div>

      <div class="cv-modal__divider"></div>

      <input class="form-control" type="text" v-model="addViewerUsername" inputmode="text" autocomplete="off" />
      <button class="btn btn-primary cv-modal__cta" @click="addViewer">
        Freigeben
      </button>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.cv-modal {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cv-modal__headline {
  font-family: var(--font-display, Cinzel), serif;
  letter-spacing: 0.04em;
}

.cv-modal__list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: min(40vh, 22rem);
  overflow: auto;
  padding-right: 0.25rem;
}

.cv-modal__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.cv-modal__user {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.cv-modal__divider {
  width: 100%;
  height: 1px;
  background: rgba(255, 255, 255, 0.12);
}

.cv-modal__cta {
  width: 100%;
}
</style>
