<template>
  <div class="form-group mb-0">
    <label class="required">{{$t('editor.predator.actions.add_flaw')}}:</label>
    <select v-model="selected" class="form-control">
      <option v-for="(c, i) in data.choices" :key="i" :value="c.id">{{getFlaw(c).name}}</option>
    </select>
  </div>
</template>

<script lang="ts">
import {Component} from "vue-property-decorator";
import PTActionBase from "@/components/editor/actions/PTActionBase";
import {IFlawChoice, ITrait} from "@/types/data";
import DataManager from "@/libs/data/data-manager";
import {ICharacter} from "@/types/models";
import PTActionHandler from "@/libs/ptaction-handler";

@Component({
  components: {}
})
export default class AddFlawAction extends PTActionBase<{choices: IFlawChoice[]}> {

  private selected: IFlawChoice|null = null;

  applyOutput(char: ICharacter) {
    if (this.selected) {
      PTActionHandler.addFlaw(char, this.selected);
    }
  }

  isReady(): boolean {
    return !!this.selected;
  }

  private getFlaw(choice: IFlawChoice): ITrait|undefined {
    return DataManager.getFlawOwner(choice)?.disadvantages?.find(d => d.id === choice.flawId);
  }
}
</script>

<style scoped lang="scss">

</style>
