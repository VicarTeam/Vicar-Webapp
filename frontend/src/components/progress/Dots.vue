<template>
  <div class="dots">
    <span v-for="i in dots" class="dot" :class="{'active': i <= amount, 'ml-10': isMargin(i)}"></span>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";

@Component({
  components: {}
})
export default class Dots extends Vue {

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
.dots {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
  user-select: none;
  .dot {
    border-radius: 50%;
    width: 0.7rem;
    height: 0.7rem;
    border: 1px solid var(--primary-color);
    &.active {
      background-color: var(--primary-color);
    }
  }
}
</style>
