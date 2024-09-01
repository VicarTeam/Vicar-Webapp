<template>
  <i class="fa-solid fa-circle-question" @click="click"></i>
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
}
</style>
