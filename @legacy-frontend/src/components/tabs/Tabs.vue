<template>
  <div v-bind="$attrs" class="d-flex flex-row justify-content-center" style="border-bottom: 1px solid var(--primary-color); gap: 1rem">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Provide, Vue} from "vue-property-decorator";

@Component({
  components: {}
})
export default class Tabs extends Vue {

  @Prop()
  private value!: any;

  @Provide("tabs:setSelectedValue")
  private setSelectedValue(value: any) {
    this.$emit("before-change", value);
    this.$emit("input", value);
  }

  @Provide("tabs:getSelectedValue")
  private getSelectedValue(): any {
    return this.value;
  }
}
</script>

<style scoped lang="scss">

</style>
