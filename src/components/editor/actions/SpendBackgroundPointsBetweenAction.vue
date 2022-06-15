<template>
  <div class="form-group mb-0">
    <label class="required">{{$t('editor.predator.actions.spend_points_between', {x: pool})}}:</label>
    <div class="d-flex" style="gap: 1rem; align-items: center" v-for="(background, i) in backgrounds" :key="background.id" :class="{'mt-10': i > 0}">
      <label style="width: 50%">{{background.name}}: </label>
      <SpendSelect :max="data.points" :pool="pool" @change="val => onPointsChanged(background, val)"/>
    </div>
  </div>
</template>

<script lang="ts">
import {Component} from "vue-property-decorator";
import PTActionBase from "@/components/editor/actions/PTActionBase";
import {ITraitPack} from "@/types/data";
import DataManager from "@/libs/data-manager";
import SpendSelect from "@/components/editor/actions/SpendSelect.vue";
import {ICharacter} from "@/types/models";
import PTActionHandler from "@/libs/ptaction-handler";

type SpendSelectData = {
  background: ITraitPack;
  val: number;
}

@Component({
  components: {SpendSelect}
})
export default class SpendBackgroundPointsBetweenAction extends PTActionBase<{points: number; choices: number[]}> {

  private usages: SpendSelectData[] = [];

  applyOutput(char: ICharacter) {
    this.usages.forEach(u => {
      if (u.val > 0) {
        const existingSpread = char.requiredPointSpreads.find(spread => spread.packId === u.background.id && spread.type === "backgrounds");
        if (existingSpread) {
          existingSpread.points += u.val;
        } else {
          char.requiredPointSpreads.push({
            isFlaw: false,
            packId: u.background.id,
            type: "backgrounds",
            points: u.val
          });
        }
      }
    });
  }

  isReady(): boolean {
    return this.pool <= 0;
  }

  private onPointsChanged(background: ITraitPack, val: number) {
    const index = this.usages.findIndex(u => u.background.id === background.id);
    if (index === -1) {
      this.usages.push({
        background,
        val
      });
    } else {
      this.usages[index].val = val;
    }
  }

  private get pool(): number {
    return this.data.points - this.usedPoints;
  }

  private get usedPoints() {
    return this.usages.map(u => u.val).reduce((a, b) => a + b, 0);
  }

  private get backgrounds(): ITraitPack[] {
    return this.data.choices.map(id => DataManager.getBackground(id)!).filter(b => b !== null);
  }
}
</script>

<style scoped lang="scss">

</style>
