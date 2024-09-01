<template>
  <div class="pdf-col" :class="{'grow': grow, 'shrink': shrink, 'center-vertically': centerVertically, 'center-horizontally': centerHorizontally}">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";

@Component({
  components: {}
})
export default class Col extends Vue {

  @Prop({default: false})
  private grow!: boolean;

  @Prop({default: false})
  private shrink!: boolean;

  @Prop({default: false})
  private centerVertically!: boolean;

  @Prop({default: false})
  private centerHorizontally!: boolean;
}
</script>

<style scoped lang="scss">
.pdf-col {
  display: flex;
  flex-direction: column;
  &.grow {
    flex-grow: 1;
  }
  &.shrink {
    flex-shrink: 0;
  }
  &.center-vertically {
    align-items: center;
  }
  &.center-horizontally {
    justify-content: center;
  }
}
</style>
