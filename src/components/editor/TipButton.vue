<template>
  <i class="fa-solid fa-circle-question" @click="showTip(content, title)"></i>
</template>

<script lang="ts">
import {Component, Inject, Prop, Vue} from "vue-property-decorator";

@Component({
  components: {}
})
export default class TipButton extends Vue {

  @Prop({required: true})
  private content!: any;

  @Prop({default: null})
  private title!: any;

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
