<template>
  <Modal :shown="show" @close="show = false">
    <div style="max-width: 40rem" v-if="ritual && discipline" class="ability-info">
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
  </Modal>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import {IBloodRitual, IDiscipline, IDisciplineAbility, IOblivionCeremony} from "@/types/data";
import {ICharacter, IDisciplineSelection, ILeveledDisciplineAbility} from "@/types/models";
import DataManager from "@/libs/data/data-manager";
import Modal from "@/components/modal/Modal.vue";
import {State} from "vuex-class";

@Component({
  components: {Modal}
})
export default class BloodRitualInfoModal extends Vue {

  @State("editingCharacter")
  private editingCharacter!: ICharacter;

  private show: boolean = false;
  private ritual: IOblivionCeremony|null = null;
  private discipline: IDisciplineSelection|undefined = undefined;

  public showModal(ritual: IOblivionCeremony) {
    this.ritual = ritual;
    this.discipline = this.editingCharacter.disciplines.find(x => x.discipline.id === 11);
    this.show = true;
  }

  private getNeededAbility(): ILeveledDisciplineAbility|undefined {
    if (!this.ritual) return undefined;
    if (!this.ritual.requires) return undefined;
    return this.discipline?.abilities?.find(x => x.id === this.ritual!.id);
  }
}
</script>

<style scoped lang="scss">
.ability-info {
  max-height: 50rem;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  gap: 1rem;
}
</style>
