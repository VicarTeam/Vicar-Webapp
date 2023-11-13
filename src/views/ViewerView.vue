<template>
  <div class="d-flex flex-column" v-if="editingCharacter">
    <div class="d-flex top-bar">
      <div class="actions">
        <IconButton icon="fa-angles-left" @click="backToMain"/>
        <IconButton icon="fa-info" @click="characterInfoModal.showModal(editingCharacter)"/>
        <IconButton icon="fa-dice" v-if="editingCharacter.connectedFoundryId" @click="diceRollModal.showModal(editingCharacter)"/>
        <Avatar :src="editingCharacter.avatar" style="width: 3rem; height: 3rem;"/>
      </div>
      <Tabs class="center" @before-change="switchTab" v-model="selectedTab">
        <Tab value="viewer-profile" :text="$t('viewer.tab.profile').toString()" ref="tabProfile"/>
        <Tab value="viewer-inventory" :text="$t('viewer.tab.inventory').toString()" ref="tabInventory"/>
        <Tab value="viewer-attributes" :text="$t('viewer.tab.attributes').toString()" ref="tabAttributes"/>
        <Tab value="viewer-skills" :text="$t('viewer.tab.skills').toString()" ref="tabSkills"/>
        <Tab value="viewer-disciplines" :text="$t('viewer.tab.disciplines').toString()" ref="tabDisciplines"/>
        <Tab v-if="canAccessRituals" value="viewer-bloodrituals" :text="$t('viewer.tab.rituals').toString()" ref="tabBloodRituals"/>
        <Tab value="viewer-traits" :text="$t('viewer.tab.traits').toString()" ref="tabTraits"/>
<!--        <Tab value="viewer-pdf" :text="$t('viewer.tab.pdf').toString()"/>-->
      </Tabs>
      <div class="actions">
        <small style="color: #afafaf; display: flex; gap: 0.5rem; justify-content: center; align-items: center">EXP: <b>{{editingCharacter.exp}}</b>
          <IconButton icon="fa-pen" style="width: 2rem; height: 2rem" @click="addExpModal.showModal()"/>
        </small>
        <button class="btn btn-primary ml-10" @click="switchLevelMode">{{$t('viewer.mode.' + (isLevelMode ? 'disable' : 'enable'))}}</button>
        <button class="btn btn-primary ml-10" @click="saveCurrentCharacter">{{saveText || this.$t('viewer.save').toString()}}</button>
      </div>
    </div>
    <div style="width: 100%; height: calc(100vh - 4.2rem - 3px); overflow-x: hidden; overflow-y: auto">
      <router-view/>
    </div>

    <AddExpModal ref="addExpModal"/>
    <CharacterInfoModal ref="characterInfoModal" @updated="$forceUpdate()"/>
    <DicePoolCalculatorModal ref="dicePoolCalculatorModal"/>
    <DiceRollModal ref="diceRollModal"/>
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
import DicePoolCalculatorModal from "@/components/main/characters/modals/DicePoolCalculatorModal.vue";
import EventBus from "@/libs/event-bus";
import {VicarSync} from "@/libs/io/vicar-sync";
import DiceRollModal from "@/components/viewer/modals/DiceRollModal.vue";

const TabHotkeys = [
  {
    tab: "tabProfile",
    keys: ["ALT+P", "Escape", "ALT+1"]
  },
  {
    tab: "tabInventory",
    keys: ["ALT+I", "ALT+2"]
  },
  {
    tab: "tabAttributes",
    keys: ["ALT+A", "ALT+3"]
  },
  {
    tab: "tabSkills",
    keys: ["ALT+F", "ALT+4"]
  },
  {
    tab: "tabDisciplines",
    keys: ["ALT+D", "ALT+5"]
  },
  {
    tab: "tabBloodRituals",
    keys: ["ALT+R"],
    condition: (character: ICharacter) => character.bloodRituals.length > 0 || (character.clan.id === 4 || character.clan.id === 5)
  },
  {
    tab: "tabTraits",
    keys: ["ALT+V", "ALT+6"]
  }
];

@Component({
  components: {DiceRollModal, DicePoolCalculatorModal, CharacterInfoModal, AddExpModal, Tab, Avatar, IconButton, Tabs}
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

  @Ref("dicePoolCalculatorModal")
  private dicePoolCalculatorModal!: DicePoolCalculatorModal;

  @Ref("diceRollModal")
  private diceRollModal!: DiceRollModal;

  @Mutation("setEditingCharacter")
  private setEditingCharacter!: (character?: ICharacter) => void;

  @Mutation("setLevelMode")
  private setLevelMode!: (isLevelMode: boolean) => void;

  private selectedTab: string = "viewer-profile";
  private saveText: string = "";

  mounted() {
    this.$router.push({name: 'viewer-profile'});
    EventBus.$on("character-updated", this.onCharUpdated);
    window.addEventListener('keydown', this.onKeyDown);
  }

  destroyed() {
    EventBus.$off("character-updated", this.onCharUpdated);
    window.removeEventListener('keydown', this.onKeyDown);
  }

  private onCharUpdated(charId: string) {
    if (this.editingCharacter && this.editingCharacter.id === charId) {
      this.$forceUpdate();
    }
  }

  private onKeyDown(event: KeyboardEvent) {
    if (event.altKey) {
      const tab = TabHotkeys.find(tab => tab.keys.includes("ALT+" + event.key.toUpperCase()));
      if (tab) {
        const character = this.editingCharacter;
        if (character && (!tab.condition || tab.condition(character))) {
          const el = this.$refs[tab.tab];
          if (el) {
            (el as any).$el.click();
          }
        }
      }
    }

    if (event.key === "Escape") {
      const el = this.$refs["tabProfile"];
      if (el) {
        (el as any).$el.click();
      }
    }

    if (event.ctrlKey && event.key === " " && this.editingCharacter) {
      this.dicePoolCalculatorModal.showModal(this.editingCharacter, this.selectedTab === "viewer-disciplines");
    }
  }

  private switchTab(name: string) {
    if (this.$route.name !== name) {
      this.$router.push({name});
    }
  }

  private switchLevelMode() {
    if (!this.editingCharacter) {
      return;
    }

    const newLevelMode = !this.isLevelMode;
    this.setLevelMode(newLevelMode);

    if (newLevelMode) {
      VicarSync.beginCharacterLevelSync(this.editingCharacter);
    } else {
      VicarSync.endCharacterLevelSync(this.editingCharacter);
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

  private get canAccessRituals(): boolean {
    if (!this.editingCharacter) {
      return false;
    }
    return this.editingCharacter.bloodRituals.length > 0 || this.editingCharacter.clan.id === 4 || this.editingCharacter.clan.id === 5 || this.editingCharacter.fullCustomization;
  }

  private backToMain() {
    VicarSync.endCharacterLevelSync(this.editingCharacter!);
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
