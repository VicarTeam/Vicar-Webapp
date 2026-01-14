<template>
  <i class="fa-solid" :class="{danger: danger, 'fa-circle-question': !danger, 'fa-triangle-exclamation': danger}" @click="click"></i>
</template>

<script lang="ts">
import {Component, Inject, Prop, Vue} from "vue-property-decorator";

@Component({
  components: {}
})
export default class TipButton extends Vue {

  @Prop({default: ""})
  private content!: any;

  @Prop({default: null})
  private title!: any;

  @Prop({default: false})
  private override!: boolean;

  @Prop({default: false})
  private danger!: boolean;

  private click() {
    if (this.override) {
      this.$emit("click");
    } else {
      this.showTip(this.content, this.title);
    }
  }

  @Inject("show-tip")
  private showTip!: (content: any, title?: any) => void;
}
</script>

<style scoped lang="scss">
.fa-solid {
  cursor: pointer;
  &:hover {
    color: var(--primary-color);
  }
  &.danger {
    color: var(--primary-color-light);
    &:hover {
      color: var(--primary-color);
    }
  }
}
</style>
