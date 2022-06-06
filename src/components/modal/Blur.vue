<template>
  <div class="blur" :class="{'disabled': disabled}">
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
}
</script>

<style scoped lang="scss">
.blur {
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  z-index: 1000;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  .disabled {
    background-color: transparent;
  }
}
</style>
