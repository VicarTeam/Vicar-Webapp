<template>
  <Modal :shown="shown" v-if="editingCharacter && discipline" @close="shown = false">
    <div style="width: 50rem; display: flex; flex-direction: column; gap: 2rem">
      <p style="margin: 0; font-weight: bold; font-size: 1.6rem">{{$t('editor.disciplines.bloodritual.title')}}</p>

      <select class="form-control" v-model="ritual">
        <option v-for="a in rituals" :value="a">{{a.name}} - {{$t('editor.disciplines.level')}}: {{a.level}}</option>
      </select>

      <div class="info" v-if="ritual">
        <small><i>{{ritual.description}}</i></small>
        <hr>
        <span><b>{{$t('editor.disciplines.bloodritual.ingredients')}}</b>: {{ritual.ingredients}}</span>
        <span><b>{{$t('editor.disciplines.bloodritual.execution')}}</b>: {{ritual.execution}}</span>
        <span><b>{{$t('editor.disciplines.bloodritual.system')}}</b>: {{ritual.system}}</span>
      </div>

      <div style="width: 100%; display: flex; justify-content: center; align-items: center; flex-direction: column">
        <span v-if="costs > 0" class="mb-10">{{$t('viewer.modal.level.costs', {xp: this.costs})}}</span>
        <button class="btn btn-primary" :disabled="!canSelectAbility" @click="addCurrentAbility">{{$t('editor.choose')}}</button>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import Modal from "@/components/modal/Modal.vue";
import {ICharacter, IDisciplineSelection} from "@/types/models";
import {State} from "vuex-class";
import DataManager from "@/libs/data/data-manager";
import {IBloodRitual} from "@/types/data";

@Component({
  components: {Modal}
})
export default class ChooseBloodRitualModal extends Vue {

  @State("editingCharacter")
  private editingCharacter!: ICharacter;

  private withCosts: boolean = false;
  private maxLevel: number = 0;

  private shown: boolean = false;
  private ritual: IBloodRitual|null = null;

  private discipline: IDisciplineSelection|null = null;
  private rituals: IBloodRitual[] = [];
  private callback: () => void = null!;

  public showModal(callback: () => void,discipline: IDisciplineSelection, maxLevel = Infinity, costs = false) {
    this.ritual = null;
    this.callback = callback;
    this.withCosts = costs;
    this.maxLevel = maxLevel;
    this.discipline = discipline;
    this.rituals = DataManager.selectedLanguage.bloodRituals.filter(x => x.level <= discipline.currentLevel - 1 && x.level <= maxLevel
        && this.editingCharacter.bloodRituals.find(y => y.id === x.id) === undefined);
    this.shown = true;
  }

  private addCurrentAbility() {
    if (this.canSelectAbility && this.discipline) {
      this.editingCharacter.bloodRituals.push({...this.ritual!});

      if (this.withCosts) {
        this.editingCharacter.usedExp = (this.editingCharacter.usedExp || 0) + this.costs;
        this.editingCharacter.exp -= this.costs;
      }

      this.callback();
      this.shown = false;
    }
  }

  private get canSelectAbility(): boolean {
    return !!this.ritual && (this.costs === -1 || this.costs <= this.editingCharacter!.exp) && this.ritual.level <= this.maxLevel;
  }

  private get costs(): number {
    if (!this.withCosts || !this.ritual) {
      return -1;
    }
    return this.ritual.level * 3;
  }
}
</script>

<style scoped lang="scss">
.info {
  max-height: 50rem;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  gap: 1rem;
}
.not-selectable {
  font-style: italic;
  color: rgba(255, 255, 255, 0.6) !important;
}
</style>
