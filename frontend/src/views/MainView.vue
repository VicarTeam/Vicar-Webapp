<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from "vue"
import { useRoute } from "vue-router"
import Tabs from "@/components/tabs/Tabs.vue"
import Tab from "@/components/tabs/Tab.vue"
import Settings from "@/components/main/Settings.vue"
import Characters from "@/components/main/characters/Characters.vue"
import Lexicon from "@/components/main/lexicon/Lexicon.vue"
import CharacterStorage from "@/libs/io/character-storage"
import { checkSession } from "@/libs/auth"

const route = useRoute()

const selectedTab = ref(0)
const homebrewView = ref<any>(null)

onMounted(async () => {
  const result = await checkSession()
  if (result.status === "not_found") return

  await CharacterStorage.initialize()

  selectedTab.value = 1
  await nextTick()
  selectedTab.value = 0

  const specific = route.query["specific"]
  if (!specific) return

  switch (specific) {
    case "homebrew":
      selectedTab.value = 1
      await nextTick()
      if (homebrewView.value) {
        homebrewView.value.setTab(route.query["tab"])
      }
      break
    case "lexicon":
      selectedTab.value = 2
      break
    case "settings":
      selectedTab.value = 3
      break
  }
})

watch(
  () => route.query,
  async (q) => {
    const specific = q["specific"]
    if (!specific) return
    if (specific === "lexicon") selectedTab.value = 2
    if (specific === "settings") selectedTab.value = 3
    if (specific === "homebrew") {
      selectedTab.value = 1
      await nextTick()
      if (homebrewView.value) homebrewView.value.setTab(q["tab"])
    }
  }
)
</script>

<template>
  <div class="main-view">
    <Tabs class="tabs" v-model="selectedTab">
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
