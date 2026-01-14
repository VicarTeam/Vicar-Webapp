<template>
  <i class="fa-solid fa-xmark" @click="$emit('click')"></i>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";

@Component({
  components: {}
})
export default class TipButton extends Vue {
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
