<template>
  <i class="fa-solid" :class="icon" v-bind="$attrs" @click="$emit('click')" v-if="isLevelMode"></i>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import {State} from "vuex-class";
import {ICharacter, LevelType} from "@/types/models";
import {levelResolver} from "@/libs/resolvers/level-resolver";

@Component({
  components: {}
})
export default class LevelButton extends Vue {

  @Prop({default: 'fa-angles-up'})
  private icon!: string;

  @State("isLevelMode")
  private isLevelMode!: boolean;

  @State("editingCharacter")
  private editingCharacter!: ICharacter;
}
</script>

<style scoped lang="scss">
.fa-solid {
  cursor: pointer;
  &:hover {
    color: var(--primary-color);
  }
}
</style>
