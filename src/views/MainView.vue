<template>
  <div class="d-flex flex-column">
    <Tabs class="flex-shrink-0" style="position: relative" v-model="selectedTab">
      <Tab :value="0" :text="$t('main.tabs.characters').toString()"/>
      <Tab :value="1" :text="$t('main.tabs.vicarplay').toString()"/>
      <Tab :value="2" :text="$t('main.tabs.settings').toString()"/>

      <div style="position: absolute; right: 0.5rem; transform: translateY(-50%); top: 50%; z-index: 10" v-if="vicarPlay.isRunning">
        <button class="btn btn-primary" style="max-width: 20rem; height: 4rem" @click="vicarPlay.toggleMenu()">
          {{$t('play.opensession')}}
        </button>
      </div>
    </Tabs>
    <div class="flex-grow-1" style="width: 100%; height: calc(100vh - 4.2rem - 3px); overflow-x: hidden; overflow-y: auto">
      <Characters v-if="selectedTab === 0"/>
      <VicarPlay v-if="selectedTab === 1"/>
      <Settings v-else-if="selectedTab === 2"/>
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
import VicarPlay from "@/components/main/play/VicarPlay.vue";
import { vicarPlay } from "@/libs/vicarplay/vicar-play";

@Component({
  components: {VicarPlay, Characters, Spinner, Settings, Tab, Tabs}
})
export default class MainView extends Vue {

  private selectedTab = 0;

  vicarPlay = vicarPlay;

}
</script>

<style scoped lang="scss">

</style>
