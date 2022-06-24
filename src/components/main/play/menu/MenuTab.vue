<template>
  <div class="playmenu-tab" :class="{'active': this.value === this.tab}" @click="onClick">
    <i class="fa-solid" :class="icon"></i>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";

@Component({
  components: {}
})
export default class MenuTab extends Vue {

  @Prop()
  private value!: string;

  @Prop({required: true})
  private icon!: string;

  @Prop({required: true})
  private tab!: string;

  private onClick() {
    if (this.value === this.tab) {
      return;
    }

    this.$emit('input', this.tab);
  }
}
</script>

<style scoped lang="scss">
.playmenu-tab {
  margin-top: 0.5rem;
  border-radius: 3px;
  padding: 0.5rem;
  display: flex;
  font-size: 1.2rem;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  &:hover {
    background-color: rgba(255, 255, 255, 0.15);
  }
  &:active {
    background-color: rgba(255, 255, 255, 0.1);
  }
  &.active {
    background-color: rgba(255, 255, 255, 0.2);
  }
}
</style>
