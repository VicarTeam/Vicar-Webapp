﻿<template>
  <div class="d-flex flex-column">
    <Tabs class="flex-shrink-0" style="position: relative" v-model="selectedTab">
      <Tab :value="0" :text="$t('main.tabs.characters').toString()"/>
      <Tab :value="2" :text="$t('main.tabs.lexicon').toString()"/>
<!--      <Tab :value="1" :text="$t('main.tabs.homebrew').toString()"/>-->
      <Tab :value="3" :text="$t('main.tabs.settings').toString()"/>
    </Tabs>
    <div class="flex-grow-1" style="width: 100%; height: calc(100vh - 4.2rem - 3px); overflow-x: hidden; overflow-y: auto">
      <Characters v-if="selectedTab === 0"/>
      <Lexicon v-else-if="selectedTab === 2"/>
      <HomebrewView v-else-if="selectedTab === 1" ref="homebrewView"/>
      <Settings v-else-if="selectedTab === 3"/>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import Tabs from "@/components/tabs/Tabs.vue";
import Tab from "@/components/tabs/Tab.vue";
import Settings from "@/components/main/Settings.vue";
import Spinner from "@/components/spinners/Spinner.vue";
import Characters from "@/components/main/characters/Characters.vue";
import Lexicon from "@/components/main/lexicon/Lexicon.vue";
import HomebrewView from "@/views/HomebrewView.vue";
import CharacterStorage from "@/libs/io/character-storage";
import {nextTick} from "vue";

@Component({
  components: {HomebrewView, Lexicon, Characters, Spinner, Settings, Tab, Tabs}
})
export default class MainView extends Vue {

  private selectedTab = 0;

  async mounted() {
    if (!localStorage.getItem('vicar:session')) {
      return;
    }

    await CharacterStorage.initialize();
    this.$forceUpdate();
    this.selectedTab = 1;
    nextTick(() => {
      this.selectedTab = 0;
    });

    if (this.$route.query['specific']) {
      switch (this.$route.query['specific']) {
        case 'homebrew':
          this.selectedTab = 1;
          this.$nextTick(() => {
            if (this.$refs.homebrewView) {
              // @ts-ignore
              this.$refs.homebrewView.setTab(this.$route.query['tab']);
            }
          });
          break;
        case 'lexicon':
          this.selectedTab = 2;
          break;
        case 'settings':
          this.selectedTab = 3;
          break;
      }
    }
  }
}
</script>

<style scoped lang="scss">

</style>
