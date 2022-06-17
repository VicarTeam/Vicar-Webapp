<template>
  <div class="squares">
    <span v-for="i in dots" class="square" :class="{'active': i <= amount, 'ml-10': isMargin(i)}" @click="$emit('click', i)"></span>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";

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
}
</style>
