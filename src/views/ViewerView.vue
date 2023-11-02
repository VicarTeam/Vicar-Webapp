<template>
  <div class="d-flex flex-column" v-if="editingCharacter">
    <div class="d-flex top-bar">
      <div class="actions">
        <IconButton icon="fa-angles-left" @click="backToMain"/>
        <IconButton icon="fa-info" @click="characterInfoModal.showModal(editingCharacter)"/>
        <Avatar :src="editingCharacter.avatar" style="width: 3rem; height: 3rem;"/>
      </div>
      <Tabs class="center" @before-change="switchTab" v-model="selectedTab">
        <Tab value="viewer-profile" :text="$t('viewer.tab.profile').toString()"/>
        <Tab value="viewer-attributes" :text="$t('viewer.tab.attributes').toString()"/>
        <Tab value="viewer-skills" :text="$t('viewer.tab.skills').toString()"/>
        <Tab value="viewer-disciplines" :text="$t('viewer.tab.disciplines').toString()"/>
        <Tab v-if="editingCharacter.bloodRituals && editingCharacter.bloodRituals.length > 0" value="viewer-bloodrituals" :text="$t('viewer.tab.bloodrituals').toString()"/>
        <Tab value="viewer-traits" :text="$t('viewer.tab.traits').toString()"/>
        <Tab value="viewer-pdf" :text="$t('viewer.tab.pdf').toString()"/>
      </Tabs>
      <div class="actions">
        <small style="color: #afafaf; display: flex; gap: 0.5rem; justify-content: center; align-items: center">EXP: <b>{{editingCharacter.exp}}</b>
          <IconButton icon="fa-pen" style="width: 2rem; height: 2rem" @click="addExpModal.showModal()"/>
        </small>
        <button class="btn btn-primary ml-10" @click="setLevelMode(!isLevelMode)">{{$t('viewer.mode.' + (isLevelMode ? 'disable' : 'enable'))}}</button>
        <button class="btn btn-primary ml-10" @click="saveCurrentCharacter">{{!saveText || saveText.trim().length <= 0 ? this.$t('viewer.save').toString() : saveText}}</button>
      </div>
    </div>
    <div style="width: 100%; height: calc(100vh - 4.2rem - 3px); overflow-x: hidden; overflow-y: auto">
      <router-view/>
    </div>

    <AddExpModal ref="addExpModal"/>
    <CharacterInfoModal ref="characterInfoModal"/>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Provide, Ref, Vue} from "vue-property-decorator";
import {Mutation, State} from "vuex-class";
import {ICharacter} from "@/types/models";
import Tabs from "@/components/tabs/Tabs.vue";
import IconButton from "@/components/IconButton.vue";
import Avatar from "@/components/Avatar.vue";
import Tab from "@/components/tabs/Tab.vue";
import CharacterStorage from "@/libs/io/character-storage";
import AddExpModal from "@/components/viewer/modals/AddExpModal.vue";
import CharacterInfoModal from "@/components/viewer/modals/CharacterInfoModal.vue";

@Component({
  components: {CharacterInfoModal, AddExpModal, Tab, Avatar, IconButton, Tabs}
})
export default class ViewerView extends Vue {

  @State("editingCharacter")
  private editingCharacter!: ICharacter|undefined;

  @State("isLevelMode")
  private isLevelMode!: boolean;

  @Ref("addExpModal")
  private addExpModal!: AddExpModal;

  @Ref("characterInfoModal")
  private characterInfoModal!: CharacterInfoModal;

  @Mutation("setEditingCharacter")
  private setEditingCharacter!: (character?: ICharacter) => void;

  @Mutation("setLevelMode")
  private setLevelMode!: (isLevelMode: boolean) => void;

  private selectedTab: string = "viewer-profile";
  private saveText: string = this.$t("viewer.save").toString();

  mounted() {
    this.$router.push({name: 'viewer-profile'});
  }

  private switchTab(name: string) {
    if (this.$route.name !== name) {
      this.$router.push({name});
    }
  }

  private saveCurrentCharacter() {
    if (this.editingCharacter) {
      CharacterStorage.saveCharacter(this.editingCharacter);
      this.saveText = this.$t('viewer.saved').toString();
      setTimeout(() => {
        this.saveText = this.$t('viewer.save').toString();
      }, 1000);
    }
  }

  private backToMain() {
    this.saveCurrentCharacter();
    this.setEditingCharacter(undefined);
    this.$router.push({name: 'main'});
  }

  @Provide("update-viewer")
  private updaterViewer() {
    this.$forceUpdate();
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
