<script lang="ts">
import {Vue, Component, Prop} from 'vue-property-decorator';
import {IM20Tradition} from "@/types/m20";
import {getImageUrl} from "@/libs/assets";

@Component({})
export default class TraditionSymbol extends Vue {

  @Prop({required: true})
  private tradition!: IM20Tradition;

  private errored: boolean = false;

  private getSource() {
    if (this.errored) {
      return '/img/ankh.png';
    }

    return getImageUrl('traditions', this.tradition.id + '.webp');
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