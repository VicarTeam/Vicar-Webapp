<script setup lang="ts">
import { inject, ref } from "vue"
import TipButton from "@/components/editor/TipButton.vue"
import Peer from "peerjs"
import Blur from "@/components/modal/Blur.vue"
import WrappedSpinner from "@/components/spinners/WrappedSpinner.vue"
import type { ICharacter } from "@/@types/models"
import EnterReceiverModal from "@/components/main/characters/share/modals/EnterReceiverModal.vue"
import CharReceivedModal from "@/components/main/characters/share/modals/CharReceivedModal.vue"
import CharacterStorage from "@/libs/io/character-storage"
import { VicarNet } from "@/libs/io/vicar-net"

const enterReceiverModal = ref<InstanceType<typeof EnterReceiverModal> | null>(null)
const charReceivedModal = ref<InstanceType<typeof CharReceivedModal> | null>(null)

const peer = ref<Peer | null>(null)
const peerId = ref<string | null>(null)
const initialising = ref(false)
const copyText = ref<string | null>(null)

const updateCharacterList = inject<() => void>("update-character-list")!

function open() {
  if (isAvailable.value) return

  initialising.value = true
  peer.value = new Peer()

  peer.value.on("open", async (id: string) => {
    peerId.value = id
    if (VicarNet.isLoggedIn) {
      await VicarNet.bindVicarShareIdToAlias(id)
    }
    initialising.value = false
  })

  peer.value.on("connection", (conn) => {
    conn.on("data", (data) => {
      const char = data as ICharacter
      charReceivedModal.value?.showModal(char, () => {
        CharacterStorage.addCharacter(char)
        updateCharacterList()
      })
    })
  })
}

function close() {
  if (!isAvailable.value) return
  peer.value?.destroy()
  peer.value = null
  peerId.value = null
  if (VicarNet.isLoggedIn) VicarNet.unbindVicarShareIdFromAlias()
}

function copy() {
  if (!peerId.value || !isAvailable.value) return
  navigator.clipboard.writeText(peerId.value).then(() => {
    copyText.value = "Kopiert"
    setTimeout(() => (copyText.value = null), 1000)
  })
}

async function shareCharacter(char: ICharacter) {
  if (!isAvailable.value) return
  enterReceiverModal.value?.showModal(char, async (id) => {
    const resolvedId = await VicarNet.resolveVicarShareId(id)
    const conn = peer.value!.connect(resolvedId)
    conn.on("open", () => conn.send(char))
  })
}

const isAvailable = ref(false)
Object.defineProperty(isAvailable, "value", {
  get() {
    return !!peer.value && (peer.value as any).open && !(peer.value as any).destroyed
  },
})

defineExpose({ shareCharacter, isAvailable })
</script>

<template>
  <div class="vicar-share">
    <div class="title">
      <span class="accent">VicarShare</span>
      <TipButton content="VicarShare ist ein optionaler Service, welcher es dir erlaubt, über eine Peer-to-Peer Verbindung, Charaktere an deine Freunde respektive den Spielleiter zu senden." />
    </div>

    <div class="content" v-if="!isAvailable">
      <button class="btn btn-primary big" @click="open">Öffnen</button>
    </div>

    <div class="content" v-else>
      <small>VicarShare ist bereit.</small>
      <button class="btn btn-primary big" @click="copy">{{ copyText ? copyText : 'Deine ID kopieren' }}</button>
      <button class="btn btn-primary big" @click="close">Schließen</button>
    </div>

    <EnterReceiverModal ref="enterReceiverModal" />
    <CharReceivedModal ref="charReceivedModal" />

    <Blur v-if="initialising">
      <WrappedSpinner>
        <i>Initialisiere VicarShare...</i>
      </WrappedSpinner>
    </Blur>
  </div>
</template>

<style scoped lang="scss">
.vicar-share {
  margin-top: 2rem;
  width: 100%;
  border-radius: 7px;
  border: 1px solid var(--primary-color);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.title {
  width: 100%;
  padding: 0.5rem 0.75rem;
  text-align: center;
  font-size: 1.2rem;
  font-weight: 800;
  border-bottom: 1px solid var(--primary-color);
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}
.accent {
  color: var(--primary-color);
}
.content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
}
.big {
  width: 100%;
  min-height: 44px;
  height: 4rem;
}
</style>
