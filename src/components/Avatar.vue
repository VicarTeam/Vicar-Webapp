<template>
  <img :src="realSrc" class="avatar" v-bind="$attrs" @click="$emit('click', $event)" :class="{'not-draggable': !draggable}"/>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";

@Component({
  components: {}
})
export default class Avatar extends Vue {

  @Prop({required: true})
  private src!: string;

  @Prop({default: false})
  private draggable!: boolean;

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
  &.not-draggable {
    -webkit-user-drag: none;
  }
}
</style>
