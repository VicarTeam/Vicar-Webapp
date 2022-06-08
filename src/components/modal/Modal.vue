<template>
  <Blur v-if="shown" :disabled="!withBlur">
    <div class="card" v-bind="$attrs">
      <i v-if="withClose" style="position: absolute; top: 1rem; right: 1rem; font-size: 2rem; cursor: pointer" class="fa-solid fa-xmark" @click="$emit('close')"></i>
      <div class="card-content">
        <slot></slot>
      </div>
    </div>
  </Blur>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import Blur from "@/components/modal/Blur.vue";
import VText from "@/components/text/VText.vue";

@Component({
  components: {VText, Blur}
})
export default class Modal extends Vue {

  @Prop({default: false})
  private shown!: boolean;

  @Prop({default: true})
  private withClose!: boolean;

  @Prop({default: true})
  private withBlur!: boolean;
}
</script>

<style scoped lang="scss">

</style>
