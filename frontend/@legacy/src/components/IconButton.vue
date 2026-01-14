<template>
  <span class="icon-btn" :class="{disabled}" @click="$emit('click')" v-bind="$attrs">
    <i class="fa-solid" :class="icon"></i>
  </span>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";

@Component({
  components: {}
})
export default class IconButton extends Vue {

  @Prop({required: true})
  private icon!: string;

  @Prop({default: false})
  private disabled!: boolean;
}
</script>

<style scoped lang="scss">
.icon-btn {
  border: 3px solid var(--primary-color);
  color: var(--primary-color);
  border-radius: 50%;
  padding: 0.5rem;
  width: 3rem;
  height: 3rem;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  &:not(.disabled):hover {
    background-color: var(--primary-color-light);
    color: #fff;
  }
  &:not(.disabled):active {
    background-color: var(--primary-color);
    color: #fff;
  }
}
</style>
