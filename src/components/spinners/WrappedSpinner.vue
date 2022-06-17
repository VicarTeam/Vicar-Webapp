<template>
  <div class="loading-wrapper" v-bind="$attrs">
    <div class="loader">
      <Spinner/>
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import Spinner from "@/components/spinners/Spinner.vue";

@Component({
  components: {Spinner}
})
export default class WrappedSpinner extends Vue {
}
</script>

<style scoped lang="scss">
.loading-wrapper {
  user-select: none;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  .loader {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    i {
      font-size: 1.7rem;
      flex-shrink: 0;
      margin-top: 10px;
    }
  }
}
</style>
