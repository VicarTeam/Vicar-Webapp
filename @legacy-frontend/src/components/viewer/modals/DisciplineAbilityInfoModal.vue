<template>
  <Modal :shown="show" @close="show = false">
    <div style="max-width: 40rem" v-if="ability" class="ability-info">
      <small><i>{{ability.summary}}</i></small>
      <hr>
      <small v-if="ability.requirement"><b>{{$t('editor.disciplines.requirement')}}</b>: {{getRequirement()}}</small>
      <small v-if="ability.combination"><b>{{$t('editor.disciplines.combo')}}</b>: {{getCombo()}}</small>
      <hr v-if="ability.combination || ability.requirement">
      <span><b>{{$t('editor.disciplines.costs')}}</b>: {{ability.costs}}</span>
      <span v-if="ability.diceSupplies"><b>{{$t('editor.disciplines.dices')}}</b>: {{ability.diceSupplies}}</span>
      <span><b>{{$t('editor.disciplines.system')}}</b>: <span v-html="ability.system"/></span>
      <small v-if="ability.alternatives && ability.alternatives.length > 0"><b>{{$t('editor.disciplines.alternatives')}}</b>: {{ability.alternatives.join(", ")}}</small>
      <span><b>{{$t('editor.disciplines.duration')}}</b>: {{ability.duration}}</span>
    </div>
  </Modal>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import {IDiscipline, IDisciplineAbility} from "@/types/data";
import {ILeveledDisciplineAbility} from "@/types/models";
import DataManager from "@/libs/data/data-manager";
import Modal from "@/components/modal/Modal.vue";

@Component({
  components: {Modal}
})
export default class DisciplineAbilityInfoModal extends Vue {

  private show: boolean = false;
  private ability: IDisciplineAbility|null = null;
  private abilities: ILeveledDisciplineAbility[] = [];

  public showModal(ability: IDisciplineAbility, discipline: IDiscipline) {
    this.ability = ability;
    this.abilities = DataManager.normalToLeveledAbilities(discipline);
    this.show = true;
  }

  private getCombo(): string {
    if (!this.ability!.combination) {
      return "";
    }

    return (DataManager.getDiscipline(this.ability!.combination.id)?.name ?? "") + " " + this.ability!.combination.level;
  }

  private getRequirement(): string {
    if (!this.ability!.requirement) {
      return "";
    }
    return this.abilities.find(a => a.id === this.ability!.requirement)?.name ?? "";
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
