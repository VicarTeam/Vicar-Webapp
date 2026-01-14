<template>
  <div class="bordered-box" v-bind="$attrs">
    <slot></slot>
    <div class="border"></div>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";

@Component({
  components: {}
})
export default class SpinningBorder extends Vue {
}
</script>

<style scoped lang="scss">
.bordered-box {
  position: relative;
  overflow: hidden;
  width: fit-content;
  .border {
    position: absolute;
    bottom: 0;
    height: 3px;
    background-color: var(--primary-color);
    animation: 5s move infinite;
  }
}

@keyframes move {
  0% {
    left: 0;
    width: 0;
  }
  25% {
    left: 0;
    width: 100%;
  }
  45% {
    left: 100%;
    width: 0;
  }
  50% {
    right: 0;
    width: 0;
  }
  75% {
    right: 0;
    width: 100%;
  }
  95% {
    right: 0;
    width: 0;
  }
  100% {
    left: 0;
    width: 0;
  }
}
</style>