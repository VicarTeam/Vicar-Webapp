<template>
  <div class="disciplines-view">
    <div class="disciplines">
      <div class="discipline card" v-for="d in editingCharacter.disciplines">
        <div class="top">
          <div class="d-flex align-items-center" style="gap: 0.5rem; flex-grow: 1">
            <LevelButton v-if="d.currentLevel - 1 < 5" @click="levelDiscipline(d)"/>
            <b>{{d.discipline.name}}</b>
            <TipButton :content="d.discipline.summary"/>
          </div>
          <Dots :amount="Math.min(d.currentLevel - 1, 5)" :max="5"/>
        </div>
        <div class="abilities">
          <div class="ability" v-for="a in d.abilities">
            <small class="name">{{a.name}} - <i><b>{{$t('editor.disciplines.level')}}</b>: {{a.level}}</i></small>
            <TipButton class="tip" :override="true" @click="abilityInfoModal.showModal(a, d.discipline)"/>
          </div>
        </div>
      </div>
    </div>

    <div class="card" v-if="isLevelMode">
      <button class="btn btn-primary" @click="newDisciplineModal.showModal()">{{$t('viewer.disciplines.level.addnew')}}</button>
    </div>

    <DisciplineAbilityInfoModal ref="abilityInfoModal"/>
    <ChooseDisciplineAbilityModal ref="chooseAbilityModal"/>
    <NewDisciplineModal ref="newDisciplineModal"/>
  </div>
</template>

<script lang="ts">
import {Component, Ref, Vue} from "vue-property-decorator";
import {State} from "vuex-class";
import {ICharacter, IDisciplineSelection} from "@/types/models";
import TipButton from "@/components/editor/TipButton.vue";
import Dots from "@/components/progress/Dots.vue";
import DisciplineAbilityInfoModal from "@/components/viewer/modals/DisciplineAbilityInfoModal.vue";
import ChooseDisciplineAbilityModal from "@/components/editor/modals/ChooseDisciplineAbilityModal.vue";
import LevelButton from "@/components/viewer/LevelButton.vue";
import {levelResolver} from "@/libs/resolvers/level-resolver";
import DataManager from "@/libs/data-manager";
import CharacterStorage from "@/libs/io/character-storage";
import NewDisciplineModal from "@/components/viewer/modals/leveling/NewDisciplineModal.vue";

@Component({
  components: {
    NewDisciplineModal,
    LevelButton, ChooseDisciplineAbilityModal, DisciplineAbilityInfoModal, Dots, TipButton}
})
export default class DisciplinesView extends Vue {

  @State("editingCharacter")
  private editingCharacter!: ICharacter;

  @State("isLevelMode")
  private isLevelMode!: boolean;

  @Ref("abilityInfoModal")
  private abilityInfoModal!: DisciplineAbilityInfoModal;

  @Ref("chooseAbilityModal")
  private chooseAbilityModal!: ChooseDisciplineAbilityModal;

  @Ref("newDisciplineModal")
  private newDisciplineModal!: NewDisciplineModal;

  private levelDiscipline(selection: IDisciplineSelection) {
    const costs = (DataManager.isClanDiscipline(this.editingCharacter.clan, selection.discipline)
        ? levelResolver.resolveClanDiscipline : levelResolver.resolveOtherDiscipline)(this.editingCharacter, selection);
    this.chooseAbilityModal.showModal(selection, ability => {
      selection.abilities.push({...ability, usedLevel: selection.currentLevel});
      selection.currentLevel++;
      this.editingCharacter.exp -= costs;
      CharacterStorage.saveCharacter(this.editingCharacter);
    }, costs);
  }
}
</script>

<style scoped lang="scss">
.disciplines-view {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  .disciplines {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    flex-wrap: wrap;
    align-content: flex-start;
    padding-left: 2rem;
    padding-right: 2rem;
    .discipline {
      margin: auto;
      width: 30rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      .top {
        display: flex;
        align-items: center;
        width: 100%;
        border-bottom: 1px solid rgba(255, 255, 255, 0.3);
      }
      .abilities {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
        .ability {
          display: flex;
          flex-direction: row;
          gap: 0.5rem;
          .name {
            flex-grow: 1;
          }
          .tip {
            flex-shrink: 0;
          }
        }
      }
    }
  }
}
</style>
