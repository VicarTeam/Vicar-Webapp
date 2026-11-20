<script setup lang="ts">
import { provide, ref, watchEffect, onMounted, onUnmounted } from "vue"
import { useStore } from "@/app/store.ts"
import TipModal from "@/components/editor/TipModal.vue"
import QuickLexiconOverlay from "@/components/main/lexicon/QuickLexiconOverlay.vue"
import VampireFx from "@/components/fx/VampireFx.vue"
import OnyxBanner from "@/components/onyx/OnyxBanner.vue"
import { DarkborneData } from "@/libs/data/darkborne-data"
import DataManager from "@/libs/data/data-manager"
import { checkSession } from "@/libs/auth"
import { onyxState } from "@/libs/onyx"
import { useRouter } from "vue-router"

const store = useStore()
const router = useRouter()

router.afterEach(async (to) => {
  if (to.path === "/login" || to.path === "/logged-in" || onyxState.loggedIn) {
    return
  }
  const session = await checkSession()
  if (session.status !== "not_found") {
    await DataManager.loadLogin(false).catch(() => false)
  }
})

const tipModal = ref<InstanceType<typeof TipModal>>()

watchEffect(() => {
  setTheme(store.currentGameLine)
})

function setTheme(theme: string) {
  const html = document.documentElement
  html.classList.remove("theme--v5", "theme--w5", "theme--m20", "theme--h5", "theme--vdz", "theme--db")
  html.classList.add(`theme--${theme}`)
}

function onKeyDown(e: KeyboardEvent) {
  const isMac = navigator.platform.toLowerCase().includes("mac")
  const openCombo = (isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === "k"

  if (openCombo) {
    e.preventDefault()
    store.toggleLexicon()
    return
  }

  if (e.key === "Escape" && store.lexiconOpen) {
    e.preventDefault()
    store.closeLexicon()
  }
}

onMounted(() => {
  window.addEventListener("keydown", onKeyDown)
  DarkborneData.load().catch(() => undefined)
})
onUnmounted(() => window.removeEventListener("keydown", onKeyDown))

provide("show-tip", (content: any, title?: any) => {
  tipModal.value?.showModal(title, content)
})
</script>

<template>
  <OnyxBanner />

  <div class="app-body">
    <RouterView />
  </div>

  <QuickLexiconOverlay />

  <VampireFx />

  <TipModal ref="tipModal" />
</template>

<style scoped lang="scss">
.app-body {
  position: relative;
  height: var(--app-height);
}
</style>
