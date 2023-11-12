<template>
  <div class="squares" v-if="editingCharacter">
    <span v-for="i in dots" class="square" :class="{'filled': isFilled(i), 'through': isStain(i), 'ml-10': i === 6}" @click="onClick(i, $event)"></span>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import {State} from "vuex-class";
import {ICharacter} from "@/types/models";
import CharacterStorage from "@/libs/io/character-storage";

@Component({
  components: {}
})
export default class Humanity extends Vue {

  @State("editingCharacter")
  private editingCharacter!: ICharacter;

  private isFilled(nr: number) {
    return nr <= this.editingCharacter.humanity;
  }

  private isStain(nr: number) {
    return nr > this.editingCharacter.humanity && 10 - this.getStains() < nr;
  }

  private getStains() {
    return this.editingCharacter.stains || 0;
  }

  private get dots(): number[] {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  }

  private onClick(nr: number, e: MouseEvent) {
    if (e.shiftKey) {
      const stain = 10 - (nr - 1);
      this.editingCharacter.stains = stain === this.editingCharacter.stains ? 0 : stain;
      this.$forceUpdate();
    } else {
      this.editingCharacter.humanity = nr === this.editingCharacter.humanity ? 0 : nr;
    }

    CharacterStorage.saveCharacter(this.editingCharacter, true);
  }
}
</script>

<style scoped lang="scss">
.squares {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  user-select: none;
  .square {
    width: 1rem;
    height: 1rem;
    cursor: pointer;
    border: 1px solid var(--primary-color);
    &.filled {
      background-color: var(--primary-color);
    }
    &.through {
      background: linear-gradient(to bottom left, transparent calc(50% - 2px), var(--primary-color) calc(50% - 1px), var(--primary-color) calc(50% + 1px), transparent calc(50% + 2px)) no-repeat 0px 0px / 100px 100px;
      transform: rotate(90deg);
    }
  }
}
</style>
