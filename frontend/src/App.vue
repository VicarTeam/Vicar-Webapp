<script setup lang="ts">
import {provide, ref, watchEffect} from "vue";
import {useStore} from "@/app/store.ts";
import TipModal from "@/components/editor/TipModal.vue";
import {GameLine} from "@/@types/gameline.ts";

const store = useStore()

const tipModal = ref<InstanceType<typeof TipModal>>()

watchEffect(() => {
  const gameline = store.currentGameLine;

  setTheme(gameline);
})

function setTheme(theme: string) {
  const html = document.documentElement;
  html.classList.remove("theme--vampire", "theme--werewolf", "theme--mage", "theme--hunter");
  html.classList.add(`theme--${theme}`);
}

provide("show-tip", (content: any, title?: any) => {
  tipModal.value?.showModal(title, content);
});
</script>

<template>
  <RouterView />

  <TipModal ref="tipModal"/>
</template>

<style scoped lang="scss">

</style>
