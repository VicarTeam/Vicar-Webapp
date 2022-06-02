<template>
  <span class="tabs-tab" :class="{'active': getSelectedValue() === value}" @click="setSelectedValue(value)">
    <VText :size="1.3" :text="text"/>
  </span>
</template>

<script lang="ts">
import {Component, Inject, Prop, Vue} from "vue-property-decorator";
import VText from "@/components/text/VText.vue";

@Component({
  components: {VText}
})
export default class Tab extends Vue {
  
  @Prop({required: true})
  private value!: number;
  
  @Prop({required: true})
  private text!: string;
  
  @Inject("tabs:getSelectedValue")
  private getSelectedValue!: () => number;
  
  @Inject("tabs:setSelectedValue")
  private setSelectedValue!: (value: number) => void;
}
</script>

<style scoped lang="scss">
.tabs-tab {
  padding: 0.5rem;
  margin: 0.5rem;
  text-transform: uppercase;
  cursor: pointer;
  user-select: none;
  &.active {
    font-weight: bold;
    border-bottom: 3px solid var(--primary-color-light);
  }
}
</style>