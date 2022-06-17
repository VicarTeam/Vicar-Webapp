<template>
  <div class="disciplines-view">
    <div class="discipline card" v-for="d in editingCharacter.disciplines">
      <div class="top">
        <div class="d-flex align-items-center" style="gap: 0.5rem; flex-grow: 1">
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
    <DisciplineAbilityInfoModal ref="abilityInfoModal"/>
  </div>
</template>

<script lang="ts">
import {Component, Ref, Vue} from "vue-property-decorator";
import {State} from "vuex-class";
import {ICharacter} from "@/types/models";
import TipButton from "@/components/editor/TipButton.vue";
import Dots from "@/components/progress/Dots.vue";
import DisciplineAbilityInfoModal from "@/components/viewer/modals/DisciplineAbilityInfoModal.vue";

@Component({
  components: {DisciplineAbilityInfoModal, Dots, TipButton}
})
export default class DisciplinesView extends Vue {

  @State("editingCharacter")
  private editingCharacter!: ICharacter;

  @Ref("abilityInfoModal")
  private abilityInfoModal!: DisciplineAbilityInfoModal;
}
</script>

<style scoped lang="scss">
.disciplines-view {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
  .discipline {
    width: 25rem;
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
</style>
