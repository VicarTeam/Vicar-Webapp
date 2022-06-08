<template>
  <div class="form-group mb-0">
    <label class="required">{{$t('editor.step2.predator.actions.discipline_point')}}:</label>
    <div class="d-flex" style="gap: 1rem; justify-content: center; align-items: center">
      <select v-model="selected" class="form-control">
        <option v-for="(c, i) in data.choices" :key="i" :value="c.id">{{getDiscipline(c.id).name}}</option>
      </select>
      <TipButton v-if="selectedDiscipline" :content="selectedDiscipline.summary"/>
    </div>
  </div>
</template>

<script lang="ts">
import {Component} from "vue-property-decorator";
import PTActionBase from "@/components/editor/actions/PTActionBase";
import {IDiscipline, IRestriction} from "@/types/data";
import {ICharacter} from "@/types/models";
import DataManager from "@/libs/data-manager";
import TipButton from "@/components/editor/TipButton.vue";

export type DisciplinePointActionData = {
  choices: ({id: number; restriction?: IRestriction})[]
};

@Component({
  components: {TipButton}
})
export default class DisciplinePointAction extends PTActionBase<DisciplinePointActionData> {

  private selected: number = -1;

  applyOutput(char: ICharacter) {
    const discipline = this.selectedDiscipline;
    if (discipline) {
      char.disciplines.push({
        discipline,
        points: 1
      });
    }
  }

  isReady(): boolean {
    return this.selected !== -1 && this.selectedDiscipline != null;
  }

  private get selectedDiscipline(): IDiscipline|null {
    return this.getDiscipline(this.selected);
  }

  private getDiscipline(id: number): IDiscipline|null {
    return DataManager.getDiscipline(id);
  }
}
</script>

<style scoped lang="scss">

</style>
