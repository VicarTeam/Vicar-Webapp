<template>
  <div id="viewer-wrapper" class="d-flex flex-column" v-if="editingCharacter">
    <div class="d-flex top-bar">
      <div class="actions">
        <IconButton icon="fa-angles-left" @click="backToMain"/>
        <IconButton icon="fa-info" @click="characterInfoModal.showModal(editingCharacter)"/>
        <IconButton icon="fa-dice" v-if="editingCharacter.connectedFoundryId" @click="diceRollModal.showModal(editingCharacter)"/>
        <Avatar :src="editingCharacter.avatar" style="width: 3rem; height: 3rem;"/>

        <MarkOfCain ref="markOfCain" @flash="onCainsMarkFlash()"/>
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
          <IconButton v-if="!editingCharacter.justViewing" icon="fa-pen" style="width: 2rem; height: 2rem" @click="addExpModal.showModal()"/>
        </small>
        <button v-if="!editingCharacter.justViewing" class="btn btn-primary ml-10" @click="switchLevelMode">{{$t('viewer.mode.' + (isLevelMode ? 'disable' : 'enable'))}}</button>
        <button v-if="!editingCharacter.justViewing" class="btn btn-primary ml-10" @click="saveCurrentCharacter">{{saveText || this.$t('viewer.save').toString()}}</button>
      </div>
    </div>
    <div style="width: 100%; height: calc(100vh - 4.2rem - 3px); overflow-x: hidden; overflow-y: auto">
      <router-view/>
    </div>

    <AddExpModal ref="addExpModal"/>
    <CharacterInfoModal ref="characterInfoModal" @updated="$forceUpdate()" @cain-mark-granted="onCainsMarkGranted()"/>
    <DicePoolCalculatorModal ref="dicePoolCalculatorModal"/>
    <DiceRollModal ref="diceRollModal"/>
    <HuntCalculatorModal ref="huntCalculatorModal"/>
    <SearchHighlightModal ref="searchHighlightModal"/>

    <div v-if="dicePoolLeft || dicePoolRight" class="simple-dice-calc card">
      <h4 class="card-title">{{$t('character.dice-pool')}}:</h4>
      <i class="fa-solid fa-xmark" @click="dicePoolLeft = null; dicePoolRight = null; lastDicePoolSide = 'right'" style="position: absolute; top: 0.75rem; right: 0.75rem; cursor: pointer; font-size: 1.5rem"></i>
      <div style="display: flex; gap: 1rem; justify-content: center; align-items: center; width: 30rem">
        <b style="flex: 1; text-align: center">{{getDicePoolName(dicePoolLeft)}}</b>
        +
        <b style="flex: 1; text-align: center">{{getDicePoolName(dicePoolRight)}}</b>
      </div>
      <div style="margin-top: 0.5rem; padding-top: 0.75rem; border-top: 1px solid rgba(255, 255, 255, 20%); width: 100%; display: flex; justify-content: center">
        <div class="custom-checkbox d-flex align-items-center" style="pointer-events: all">
          <input type="checkbox" id="dicehuman" v-model="dicePoolHuman">
          <label for="dicehuman">{{$t('character.dice-pool.human')}}</label>
        </div>
      </div>

      <div v-if="dicePoolLeft && dicePoolRight" style="margin-top: 0.5rem; padding-top: 0.75rem; border-top: 1px solid rgba(255, 255, 255, 20%); width: 100%">
        <div style="width: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center" v-if="dicePoolResult">
          <span v-if="dicePoolResult.hunger > 0">
            <b><u>{{dicePoolResult.total}}</u> </b>
            {{$t('character.modal.pool-calcuator.result.text.hunger.1')}}
            <b style="color: var(--primary-color)">{{dicePoolResult.hunger}}</b>
            {{$t('character.modal.pool-calcuator.result.text.hunger.2')}}
            <b>{{dicePoolResult.simple}}</b>
            {{$t('character.modal.pool-calcuator.result.text.hunger.3')}}
          </span>
          <span v-else-if="dicePoolResult.total === -1">{{$t('character.dice-pool.impossible')}}</span>
          <span v-else><b>{{dicePoolResult.total}} </b>{{$t('character.modal.pool-calcuator.result.text.no-hunger')}}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Provide, Ref, Vue} from "vue-property-decorator";
import {Mutation, State} from "vuex-class";
import {getHumanInteractionMalus, ICharacter} from "@/types/models";
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
import HuntCalculatorModal from "@/components/main/characters/modals/HuntCalculatorModal.vue";
import SearchHighlightModal from "@/components/main/characters/modals/SearchHighlightModal.vue";
import MarkOfCain from "@/components/viewer/MarkOfCain.vue";
import router from "@/router";

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
  components: {
    MarkOfCain,
    SearchHighlightModal,
    HuntCalculatorModal,
    DiceRollModal, DicePoolCalculatorModal, CharacterInfoModal, AddExpModal, Tab, Avatar, IconButton, Tabs}
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

  @Ref("huntCalculatorModal")
  private huntCalculatorModal!: HuntCalculatorModal;

  @Ref("searchHighlightModal")
  private searchHighlightModal!: SearchHighlightModal;

  @Ref("markOfCain")
  private markOfCain!: MarkOfCain;

  @Mutation("setEditingCharacter")
  private setEditingCharacter!: (character?: ICharacter) => void;

  @Mutation("setLevelMode")
  private setLevelMode!: (isLevelMode: boolean) => void;

  private selectedTab: string = "viewer-profile";
  private saveText: string = "";
  private lastShift: number|null = null;
  private altDown: boolean = false;

  private dicePoolLeft: {name: string, value: number}|null = null;
  private dicePoolRight: {name: string, value: number}|null = null;
  private dicePoolHuman: boolean = false;
  private lastDicePoolSide: 'left'|'right' = 'right';

  mounted() {
    if (this.$router.currentRoute.name === 'viewer') {
      this.$router.push({name: 'viewer-profile'}).catch(() => {});
    }
    EventBus.$on("character-updated", this.onCharUpdated);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    
    if (this.editingCharacter) {
      document.title = this.editingCharacter.name + " - Vicar";
    } else {
      document.title = "Vicar";
    }
  }

  destroyed() {
    EventBus.$off("character-updated", this.onCharUpdated);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    document.title = "Vicar";
  }

  private onCharUpdated(charId: string) {
    if (this.editingCharacter && this.editingCharacter.id === charId) {
      this.$forceUpdate();
    }
  }

  private onKeyDown(event: KeyboardEvent) {
    if (event.key === "Alt") {
      this.altDown = true;
    }

    if (event.altKey) {
      const tab = TabHotkeys.find(tab => tab.keys.includes("ALT+" + event.key.toUpperCase()));
      if (tab) {
        const character = this.editingCharacter;
        if (character && (!tab.condition || tab.condition(character))) {
          const el = this.$refs[tab.tab];
          if (el) {
            event.preventDefault();
            (el as any).$el.click();
          }
        }
      }
    }

    if (event.key === "Escape") {
      const el = this.$refs["tabProfile"];
      if (el) {
        event.preventDefault();
        (el as any).$el.click();
      }
    }

    if (event.ctrlKey && event.key === " " && this.editingCharacter) {
      event.preventDefault();
      this.dicePoolCalculatorModal.showModal(this.editingCharacter, this.selectedTab === "viewer-disciplines");
    }

    if (event.altKey && (event.key === "j" || event.key === "h") && this.editingCharacter) {
      event.preventDefault();
      this.huntCalculatorModal.showModal(this.editingCharacter);
    }

    if (event.key === "Shift" && this.editingCharacter) {
      if (this.lastShift === null) {
        this.lastShift = Date.now();
      } else {
        const diff = Date.now() - this.lastShift;
        if (diff < 500) {
          this.lastShift = null;

          this.searchHighlightModal.showModal(this.editingCharacter);
        } else {
          this.lastShift = Date.now();
        }
      }
    }

    return false;
  }

  private onKeyUp(event: KeyboardEvent) {
    if (event.key === "Alt") {
      this.altDown = false;
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
    return this.editingCharacter.bloodRituals.length > 0 || this.editingCharacter.clan.id === 4 || this.editingCharacter.clan.id === 5 || this.editingCharacter.fullCustomization || (this.editingCharacter.oblivionCeremonies?.length ?? 0) > 0;
  }

  private backToMain() {
    VicarSync.endCharacterLevelSync(this.editingCharacter!);
    this.saveCurrentCharacter();
    this.setEditingCharacter(undefined);
    this.$router.push({name: 'main'});
  }

  private async onCainsMarkGranted() {
    if (!this.editingCharacter) {
      return;
    }

    await (this.markOfCain as any).runSequence();

    this.$forceUpdate();
  }

  private async onCainsMarkFlash() {
    if (!this.editingCharacter) {
      return;
    }

    this.editingCharacter.hasCainsMark = true;
    this.editingCharacter.cainsMarkLevel = 0;

    EventBus.$emit("moc-granted");

    this.saveCurrentCharacter();
  }

  private getDicePoolName(dicePool: {name: string, value: number}|null): string {
    if (!dicePool) {
      return this.$t('character.dice-pool.unset').toString();
    }
    return dicePool.name + " (" + dicePool.value + ")";
  }

  private get dicePoolResult(): {total: number, simple: number, hunger: number}|null {
    if (this.dicePoolLeft === null || this.dicePoolRight === null || !this.editingCharacter) {
      return null;
    }

    let total = this.dicePoolLeft.value + this.dicePoolRight.value;
    if (this.dicePoolHuman) {
      const malus = getHumanInteractionMalus(this.editingCharacter);
      if (malus === Number.MIN_SAFE_INTEGER) {
        return {total: -1, simple: 0, hunger: 0};
      }

      total -= malus;
      if (total <= 0) {
        total = 1;
      }
    }

    const hunger = Math.min(this.editingCharacter.hunger, total);
    const simple = total - hunger;

    return {total, simple, hunger};
  }

  @Provide("update-viewer")
  private updaterViewer() {
    this.$forceUpdate();
  }

  @Provide("set-dice-pool")
  private setDicePool(type: 'attr'|'skill'|'disc', name: string, value: number, isHuman: boolean = false) {
    if (!this.altDown) {
      return;
    }

    if (type === 'disc' || type === 'skill') {
      this.dicePoolRight = {name, value};
      this.lastDicePoolSide = 'right';
    } else {
      if (this.lastDicePoolSide === 'right') {
        this.dicePoolLeft = {name, value};
        this.lastDicePoolSide = 'left';
      } else {
        this.dicePoolRight = {name, value};
        this.lastDicePoolSide = 'right';
      }
    }

    this.dicePoolHuman = isHuman;
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
.simple-dice-calc {
  position: absolute;
  left: 50%;
  bottom: 1rem;
  transform: translateX(-50%);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  z-index: 10;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  opacity: 0.8;
  pointer-events: none;
  font-size: 1.1rem;
  h4 {
    margin: 0;
    font-size: 1.4rem;
    text-align: center;
  }
  .fa-xmark {
    pointer-events: all;
    &:hover {
      color: var(--primary-color) !important;
    }
  }
}
</style>
