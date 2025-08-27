<template>
  <div class="squares" :class="{bpblocked: blookedDueToRedPathBloodPotency}">
    <span v-for="i in dots" class="square" :class="{'active': i <= amount, 'ml-10': isMargin(i)}" @click="onClick(i)"></span>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import CharacterStorage from "@/libs/io/character-storage";
import {State} from "vuex-class";
import {ICharacter} from "@/types/models";

@Component({
  components: {}
})
export default class Squares extends Vue {

  @Prop({required: true})
  private amount!: number;

  @Prop({default: 0})
  private max!: number;

  @Prop({default: -1})
  private marginAt!: number;

  @Prop({default: ""})
  private targetType!: string;

  @State("editingCharacter")
  private editingCharacter!: ICharacter;

  private isMargin(i: number): boolean {
    return i === this.marginAt;
  }

  private get dots(): number[] {
    const dots: number[] = [];
    for (let i = 1; i <= Math.max(this.amount, this.max); i++) {
      dots.push(i);
    }
    return dots;
  }

  private get blookedDueToRedPathBloodPotency() {
    return this.targetType === 'bloodpotency' && this.editingCharacter?.cainsMarkLevel === -5;
  }

  private onClick(i: number) {
    if (this.blookedDueToRedPathBloodPotency) return;

    this.$emit('click', i);
    CharacterStorage.saveCharacter(this.editingCharacter);
  }
}
</script>

<style scoped lang="scss">
.squares {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  user-select: none;
  .square {
    width: 1rem;
    height: 1rem;
    cursor: pointer;
    border: 1px solid var(--primary-color);
    &.active {
      background-color: var(--primary-color);
    }
  }
  &.bpblocked {
    opacity: 0.3;
    cursor: not-allowed !important;
    .square {
      border-color: #fff093;
      cursor: not-allowed !important;
      &.active {
        background-color: #fff093;
        box-shadow: 0 0 10px #fff093;
      }
    }
  }
}
</style>
