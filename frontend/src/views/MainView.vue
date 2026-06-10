<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import Tabs from "@/components/tabs/Tabs.vue"
import Tab from "@/components/tabs/Tab.vue"
import Settings from "@/components/main/Settings.vue"
import Characters from "@/components/main/characters/Characters.vue"
import Lexicon from "@/components/main/lexicon/Lexicon.vue"
import CharacterStorage from "@/libs/io/character-storage"
import { checkSession } from "@/libs/auth"

const route = useRoute()
const router = useRouter()

const selectedTab = ref(0)
const homebrewView = ref<any>(null)

/** Welcher Tab gehört zur aktuellen Route? Das Lexikon hat einen eigenen Link (/lexikon). */
function tabForRoute(): number {
  if (route.name === "lexikon" || route.query["specific"] === "lexicon") return 2
  if (route.query["specific"] === "settings") return 3
  return 0
}

onMounted(async () => {
  const result = await checkSession()
  if (result.status === "not_found") return

  await CharacterStorage.initialize()

  selectedTab.value = 1
  await nextTick()
  selectedTab.value = tabForRoute()

  // Homebrew-Altpfad (eigenes Tab) unverändert beibehalten.
  if (route.query["specific"] === "homebrew") {
    selectedTab.value = 1
    await nextTick()
    if (homebrewView.value) homebrewView.value.setTab(route.query["tab"])
  }
})

// Direktnavigation (z. B. Aufruf von /lexikon, Back-/Forward-Button, SPA-Link)
// auf den passenden Tab abbilden.
watch(
  () => [route.name, route.query] as const,
  async () => {
    if (route.query["specific"] === "homebrew") {
      selectedTab.value = 1
      await nextTick()
      if (homebrewView.value) homebrewView.value.setTab(route.query["tab"])
      return
    }
    selectedTab.value = tabForRoute()
  }
)

// Tab-Klick -> URL aktualisieren, damit das Lexikon einen echten, teilbaren Link hat
// (und Back-Button/Bookmark funktionieren). Nur Nutzer-Klicks lösen before-change aus.
function onTabChange(value: number) {
  let target
  if (value === 2) target = { name: "lexikon" }
  else if (value === 3) target = { name: "main", query: { specific: "settings" } }
  else target = { name: "main" }

  router.push(target).catch(() => void 0)
}
</script>

<template>
  <div class="main-view">
    <Tabs class="tabs" v-model="selectedTab" @before-change="onTabChange">
      <Tab :value="0" text="Charaktere" />
      <Tab :value="2" text="Lexikon" />
      <Tab :value="3" text="Einstellungen" />
    </Tabs>

    <div class="content">
      <Characters v-if="selectedTab === 0" />
      <Lexicon v-else-if="selectedTab === 2" />
      <Settings v-else-if="selectedTab === 3" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.main-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.tabs {
  flex-shrink: 0;
  position: relative;
}
.content {
  flex-grow: 1;
  width: 100%;
  height: calc(100vh - 4.2rem - 3px);
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
</style>
