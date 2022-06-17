<template>
  <Modal :shown="show" @close="show = false">
    <div style="display: flex; flex-direction: column; gap: 1rem; width: 30rem">
      <b>{{$t('viewer.disciplines.level.addnew')}}:</b>
      <select v-model="discipline" class="form-control" @change="chooseAbility">
        <option v-for="d in disciplines" :value="d">{{d.name}}</option>
      </select>
      <div style="width: 100%; text-align: center" v-if="discipline"><span v-if="ability">{{ability.name}} <bullet/>{{' '}}</span>{{$t('viewer.modal.level.costs', {xp: neededExp})}}</div>
      <div style="width: 100%; display: flex; justify-content: center; align-items: center">
        <button class="btn btn-primary" :disabled="neededExp > editingCharacter.exp || !discipline || !ability" @click="level">{{$t('viewer.modal.level.btn')}}</button>
      </div>
    </div>

    <ChooseDisciplineAbilityModal ref="chooseAbilityModal"/>
  </Modal>
</template>

<script lang="ts">
import {Component, Ref, Vue} from "vue-property-decorator";
import Modal from "@/components/modal/Modal.vue";
import {State} from "vuex-class";
import {IAttributeData, ICharacter, ILeveledDisciplineAbility} from "@/types/models";
import {levelResolver} from "@/libs/resolvers/level-resolver";
import Bullet from "@/components/Bullet.vue";
import CharacterStorage from "@/libs/io/character-storage";
import {IDiscipline} from "@/types/data";
import DataManager from "@/libs/data-manager";
import ChooseDisciplineAbilityModal from "@/components/editor/modals/ChooseDisciplineAbilityModal.vue";

@Component({
  components: {ChooseDisciplineAbilityModal, Bullet, Modal}
})
export default class NewDisciplineModal extends Vue {

  @State("editingCharacter")
  private editingCharacter!: ICharacter;

  @Ref("chooseAbilityModal")
  private chooseAbilityModal!: ChooseDisciplineAbilityModal;

  private show: boolean = false;
  private discipline: IDiscipline|null = null;
  private ability: ILeveledDisciplineAbility|null = null;

  public showModal() {
    this.discipline = null;
    this.ability = null;
    this.show = true;
  }

  private chooseAbility() {
    if (!this.discipline) {
      return;
    }

    this.chooseAbilityModal.showModal({
      abilities: [],
      currentLevel: 1,
      discipline: this.discipline,
      points: 1
    }, ability => {
      this.ability = ability;
    });
  }

  private level() {
    if (this.editingCharacter.exp < this.neededExp || !this.discipline || !this.ability) {
      return;
    }

    this.editingCharacter.exp -= this.neededExp;
    this.editingCharacter.disciplines.push({
      discipline: this.discipline,
      currentLevel: 2,
      points: 0,
      abilities: [this.ability]
    });
    CharacterStorage.saveCharacter(this.editingCharacter);
    this.show = false;
  }

  private get disciplines(): IDiscipline[] {
    const disciplines: IDiscipline[] = [];
    for (const book of DataManager.selectedLanguage.books) {
      for (const clan of book.clans) {
        for (const discipline of clan.disciplines) {
          if (this.editingCharacter.disciplines.find(y => y.discipline.id === discipline.id) === undefined
              && disciplines.find(y => y.id === discipline.id) === undefined) {
            disciplines.push(discipline);
          }
        }
      }
    }

    return disciplines.sort((a, b) => a.name.localeCompare(b.name));
  }

  private get neededExp(): number {
    if (!this.discipline) {
      return Infinity;
    }

    return (DataManager.isClanDiscipline(this.editingCharacter.clan, this.discipline)
        ? levelResolver.resolveClanDiscipline : levelResolver.resolveOtherDiscipline)(this.editingCharacter, {
      discipline: this.discipline,
      points: 0,
      currentLevel: 1,
      abilities: []
    });
  }
}
</script>

<style scoped lang="scss">

</style>
