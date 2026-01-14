<script lang="ts">
import {Vue, Component, Prop} from 'vue-property-decorator';
import {IClan} from "@/types/models";
import {getImageUrl} from "@/libs/assets";

@Component({})
export default class ClanSymbol extends Vue {

  @Prop({required: true})
  private clan!: IClan;

  private errored: boolean = false;

  private getClanSymbol() {
    if (this.errored) {
      return getImageUrl('clans', '15.png');
    }

    return getImageUrl('clans', `${this.clan.id}.png`);
  }
}
</script>

<template>
  <img v-bind="$attrs" class="clan-symbol" :src="getClanSymbol()" @error="errored = true"/>
</template>

<style scoped lang="scss">
.clan-symbol {
  width: 35%;
  height: auto;
  max-height: 15rem;
  margin: auto;
  object-fit: contain;
  float: left;
  -webkit-user-drag: none;
  filter: var(--image-to-primary-color-filter);
}
</style>