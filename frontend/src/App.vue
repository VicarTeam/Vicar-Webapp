<script setup lang="ts">
import { provide, ref, watchEffect, onMounted, onUnmounted } from "vue"
import { useStore } from "@/app/store.ts"
import TipModal from "@/components/editor/TipModal.vue"
import QuickLexiconOverlay from "@/components/main/lexicon/QuickLexiconOverlay.vue"
import VampireFx from "@/components/fx/VampireFx.vue"
import { DarkborneData } from "@/libs/data/darkborne-data"

const store = useStore()

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
  <RouterView />

  <QuickLexiconOverlay />

  <VampireFx />

  <TipModal ref="tipModal" />
</template>

<style scoped lang="scss"></style>
