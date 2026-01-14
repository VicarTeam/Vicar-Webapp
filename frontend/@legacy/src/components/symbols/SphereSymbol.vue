<script lang="ts">
import {Vue, Component, Prop} from 'vue-property-decorator';
import {M20Sphere} from "@/types/m20";
import {getImageUrl} from "@/libs/assets";

@Component({})
export default class SphereSymbol extends Vue {

  @Prop({required: true})
  private sphere!: M20Sphere;

  private errored: boolean = false;

  private getSource() {
    if (this.errored) {
      return '/img/ankh.png';
    }

    return getImageUrl('spheres', this.sphere + '.webp');
  }
}
</script>

<template>
  <img v-bind="$attrs" class="subject-symbol" :class="{errored}" :src="getSource()" @error="errored = true"/>
</template>

<style scoped lang="scss">
.subject-symbol {
  width: 35%;
  height: auto;
  max-height: 15rem;
  margin: auto;
  object-fit: contain;
  float: left;
  -webkit-user-drag: none;
  filter: var(--image-to-primary-color-filter);
  &.errored {
    display: none;
  }
}
</style>