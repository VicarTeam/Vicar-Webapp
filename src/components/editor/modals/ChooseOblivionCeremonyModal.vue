<template>
  <Modal :shown="shown" v-if="editingCharacter && discipline" @close="shown = false">
    <div style="width: 50rem; display: flex; flex-direction: column; gap: 2rem">
      <p style="margin: 0; font-weight: bold; font-size: 1.6rem">{{$t('editor.disciplines.oblivionceremonies.title')}}</p>

      <select class="form-control" v-model="ritual">
        <option v-for="a in rituals" :value="a">{{a.name}} - {{$t('editor.disciplines.level')}}: {{a.level}}</option>
      </select>

      <div class="info" v-if="ritual">
        <small><i>{{ritual.summary}}</i></small>
        <hr>
        <span v-if="getNeededAbility(ritual)"><b>{{$t('editor.disciplines.oblivionceremonies.required_power')}}</b>: {{getNeededAbility(ritual).name}}</span>
        <span v-if="ritual.cult"><b>{{$t('editor.desciplines.oblivionceremonies.cult')}}</b>: {{ritual.cult}}</span>
        <span><b>{{$t('editor.disciplines.costs')}}</b>: {{ritual.cost}}</span>
        <span><b>{{$t('editor.desciplines.oblivionceremonies.roll')}}</b>: {{ritual.roll}}</span>
        <span><b>{{$t('editor.disciplines.bloodritual.ingredients')}}</b>: {{ritual.ingredients}}</span>
        <span><b>{{$t('editor.disciplines.bloodritual.execution')}}</b>: {{ritual.execution}}</span>
        <span><b>{{$t('editor.disciplines.bloodritual.system')}}</b>: {{ritual.system}}</span>
        <span v-if="ritual.duration"><b>{{$t('editor.desciplines.oblivionceremonies.duration')}}</b>: {{ritual.duration}}</span>
      </div>

      <div style="width: 100%; display: flex; justify-content: center; align-items: center; flex-direction: column">
        <button class="btn btn-primary" :disabled="!canSelectAbility" @click="addCurrentAbility">{{$t('editor.choose')}}</button>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import Modal from "@/components/modal/Modal.vue";
import {ICharacter, IDisciplineSelection, ILeveledDisciplineAbility} from "@/types/models";
import {State} from "vuex-class";
import DataManager from "@/libs/data/data-manager";
import {IBloodRitual, IOblivionCeremony} from "@/types/data";

@Component({
  components: {Modal}
})
export default class ChooseBloodRitualModal extends Vue {

  @State("editingCharacter")
  private editingCharacter!: ICharacter;

  private maxLevel: number = 0;

  private shown: boolean = false;
  private ritual: IOblivionCeremony|null = null;

  private discipline: IDisciplineSelection|null = null;
  private rituals: IOblivionCeremony[] = [];
  private callback: () => void = null!;

  public showModal(callback: () => void,discipline: IDisciplineSelection, maxLevel = Infinity) {
    this.ritual = null;
    this.callback = callback;
    this.maxLevel = maxLevel;
    this.discipline = discipline;
    this.editingCharacter.oblivionCeremonies = this.editingCharacter.oblivionCeremonies || [];
    this.rituals = DataManager.selectedLanguage.oblivionCeremonies.filter(x => x.level <= discipline.currentLevel - 1 && x.level <= maxLevel
        && !this.editingCharacter.oblivionCeremonies.find(y => y.id === x.id) && this.hasNeededAbility(x)).sort((a, b) => {
        if (a.level < b.level) return -1;
        if (a.level > b.level) return 1;
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
    });
    this.shown = true;
  }

  private addCurrentAbility() {
    if (this.canSelectAbility && this.discipline) {
      this.editingCharacter.oblivionCeremonies.push({...this.ritual!});

      this.callback();
      this.shown = false;
    }
  }

  private get canSelectAbility(): boolean {
    return !!this.ritual && this.ritual.level <= this.maxLevel && this.hasNeededAbility(this.ritual);
  }

  private hasNeededAbility(ceremony: IOblivionCeremony): boolean {
    if (!ceremony.requires) return true;
    return !this.discipline?.abilities?.find(x => x.id === ceremony.id);
  }

  private getNeededAbility(ceremony: IOblivionCeremony): ILeveledDisciplineAbility|undefined {
    if (!ceremony.requires) return undefined;
    return this.discipline?.abilities?.find(x => x.id === ceremony.id);
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
