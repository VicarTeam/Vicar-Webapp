<template>
  <div class="playmenu-tab iconbtn" :class="{'active': this.value === this.tab}" @click="onClick">
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
}
</style>
