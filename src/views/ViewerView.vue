<template>
  <div class="d-flex flex-column" v-if="editingCharacter">
    <div class="d-flex top-bar">
      <div class="actions">
        <IconButton icon="fa-angles-left" @click="backToMain"/>
        <Avatar :src="editingCharacter.avatar" style="width: 3rem; height: 3rem;"/>
      </div>
      <Tabs class="center" v-model="selectedTopTab">
        <Tab :value="0" :text="$t('viewer.tab.profile').toString()"/>
        <Tab :value="1" :text="$t('viewer.tab.attributes').toString()"/>
        <Tab :value="2" :text="$t('viewer.tab.skills').toString()"/>
        <Tab :value="3" :text="$t('viewer.tab.disciplines').toString()"/>
        <Tab :value="4" :text="$t('viewer.tab.traits').toString()"/>
        <Tab :value="5" :text="$t('viewer.tab.pdf').toString()"/>
      </Tabs>
      <div class="actions">
        <small style="color: #afafaf">EXP: <b>{{editingCharacter.exp}}</b></small>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import {Mutation, State} from "vuex-class";
import {ICharacter} from "@/types/models";
import Tabs from "@/components/tabs/Tabs.vue";
import IconButton from "@/components/IconButton.vue";
import Avatar from "@/components/Avatar.vue";
import Tab from "@/components/tabs/Tab.vue";

@Component({
  components: {Tab, Avatar, IconButton, Tabs}
})
export default class ViewerView extends Vue {

  @State("editingCharacter")
  private editingCharacter!: ICharacter|undefined;

  @Mutation("setEditingCharacter")
  private setEditingCharacter!: (character?: ICharacter) => void;

  private selectedTopTab = 0;

  private backToMain() {
    this.setEditingCharacter(undefined);
    this.$router.push({name: 'main'});
  }
}
</script>

<style scoped lang="scss">
.top-bar {
  flex-direction: row !important;
  flex-shrink: 0;
  .actions {
    gap: 0.5rem;
    display: flex;
    padding: 0.5rem 1rem;
    flex-shrink: 0;
    flex-direction: row !important;
    border-bottom: 1px solid var(--primary-color);
    justify-content: center;
    align-items: center;
  }
  .center {
    flex-grow: 1;
  }
}
</style>
