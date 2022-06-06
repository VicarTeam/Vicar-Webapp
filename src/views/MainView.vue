<template>
  <div class="d-flex flex-column">
    <Tabs class="flex-shrink-0" v-model="selectedTab">
      <Tab :value="0" :text="$t('main.tabs.characters').toString()"/>
<!--      <Tab :value="1" :text="$t('main.tabs.lexicon').toString()"/>-->
      <Tab :value="2" :text="$t('main.tabs.settings').toString()"/>
    </Tabs>
    <div class="flex-grow-1" style="width: 100%; height: calc(100vh - 5rem)">
      <Characters v-if="selectedTab === 0"/>
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

@Component({
  components: {Characters, Spinner, Settings, Tab, Tabs}
})
export default class MainView extends Vue {

  private selectedTab = 0;
}
</script>

<style scoped lang="scss">

</style>
