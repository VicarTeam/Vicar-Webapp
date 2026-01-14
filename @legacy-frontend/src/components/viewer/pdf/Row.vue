<template>
  <div class="pdf-row">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";

@Component({
  components: {}
})
export default class Row extends Vue {
}
</script>

<style scoped lang="scss">
.pdf-row {
  display: flex;
  flex-direction: row;
}
</style>
