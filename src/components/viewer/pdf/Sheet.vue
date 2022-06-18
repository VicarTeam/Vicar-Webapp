<template>
  <div class="pdf-sheet" size="A4">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";

@Component({
  components: {}
})
export default class Sheet extends Vue {
}
</script>

<style scoped lang="scss">
.pdf-sheet {
  user-select: none;
  -webkit-user-drag: none;
  background: white;
  display: flex;
  flex-direction: column;
  color: black;
  padding: 1cm;
  img {
    -webkit-user-drag: none;
  }
  &[size="A4"] {
    width: 21cm;
    height: 29.6cm;
  }
}

@media print {
  .pdf-sheet {
    border: initial;
    border-radius: initial;
    width: initial;
    min-height: initial;
    box-shadow: initial;
    background: initial;
    page-break-after: always;
  }
}
</style>
