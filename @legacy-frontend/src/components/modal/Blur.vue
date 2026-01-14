<template>
  <div class="blur" :class="{'disabled': disabled, 'hard': hard}">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";

@Component({
  components: {}
})
export default class Blur extends Vue {

  @Prop({default: false})
  private disabled!: boolean;

  @Prop({default: false})
  private hard!: boolean;
}
</script>

<style scoped lang="scss">
.blur {
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  z-index: 1000;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-x: hidden;
  overflow-y: auto;
  &.disabled {
    background-color: transparent;
  }
  &.hard {
    background-color: rgba(0, 0, 0, 0.7) !important;
    backdrop-filter: blur(0.5rem) !important;
  }
}
</style>
