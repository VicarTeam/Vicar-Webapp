<template>
  <div class="form-group mb-0">
    <label class="required">{{$t('editor.predator.actions.spend_points_between', {x: pool})}}:</label>
    <div class="d-flex" style="gap: 1rem; align-items: center" v-for="(pack, i) in packs" :key="pack.id" :class="{'mt-10': i > 0}">
      <label style="width: 50%">{{pack.name}}: </label>
      <SpendSelect :max="data.points" :pool="pool" @change="val => onPointsChanged(pack.type, pack, val)"/>
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
  type: "backgrounds"|"merits";
  pack: ITraitPack;
  val: number;
}

interface ITypedTraitPack extends ITraitPack {
  type: "backgrounds"|"merits";
}

@Component({
  components: {SpendSelect}
})
export default class SpendFlawPointsBetweenAction extends PTActionBase<{points: number; choices: {type: "backgrounds"|"merits"; id: number}[]}> {

  private usages: SpendSelectData[] = [];

  applyOutput(char: ICharacter) {
    this.usages.forEach(u => {
      if (u.val > 0) {
        const upack = PTActionHandler.initializeTraitPack(char, u.pack, u.type);
        upack.flawBonusPoints += u.val;
      }
    });
  }

  isReady(): boolean {
    return this.pool <= 0;
  }

  private onPointsChanged(type: "backgrounds"|"merits", pack: ITraitPack, val: number) {
    const index = this.usages.findIndex(u => u.pack.id === pack.id && u.type === type);
    if (index === -1) {
      this.usages.push({
        type,
        pack,
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

  private get packs(): ITypedTraitPack[] {
    return this.data.choices.map(c => ({
      ...DataManager.getFlawOwner({
        type: c.type === "backgrounds" ? "background" : "merit",
        id: c.id,
        flawId: -1
      })!,
      type: c.type
    })).filter(b => b !== null);
  }
}
</script>

<style scoped lang="scss">

</style>
