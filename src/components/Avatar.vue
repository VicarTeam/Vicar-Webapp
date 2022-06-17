<template>
  <img :src="realSrc" class="avatar" v-bind="$attrs"/>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";

@Component({
  components: {}
})
export default class Avatar extends Vue {

  @Prop({required: true})
  private src!: string;

  private get realSrc(): string {
    if (!this.src || this.src.trim().length === 0) {
      return require("@/assets/img/placeholder.jpg");
    }

    return this.src;
  }
}
</script>

<style scoped lang="scss">
.avatar {
  border-radius: 50%;
  -webkit-user-drag: none;
}
</style>
