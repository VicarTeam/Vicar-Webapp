<template>
  <div class="squares" v-if="editingCharacter">
    <span v-for="i in dots" class="square" :class="getClasses(i)" @click="onClick(i)">
      <span class="for-cross"></span>
    </span>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import {State} from "vuex-class";
import {DamageType, DefaultDamageArray, ICharacter} from "@/types/models";
import CharacterStorage from "@/libs/io/character-storage";

@Component({
  components: {}
})
export default class Damage extends Vue {

  @Prop({required: true})
  private propKey!: "health"|"willpower";

  @State("editingCharacter")
  private editingCharacter!: ICharacter;

  private getClasses(nr: number): any {
    const classes: {[key: string]: boolean} = {};
    classes["ml-10"] = nr === 6;
    classes["disabled"] = this.isDisabled(nr);
    classes[this.getTypes()[nr - 1]] = true;
    return classes;
  }

  private isDisabled(nr: number) {
    return nr > this.editingCharacter[this.propKey];
  }

  private getTypes(): DamageType[] {
    if (!this.editingCharacter[this.typesKey]) {
      this.editingCharacter[this.typesKey] = DefaultDamageArray();
      CharacterStorage.saveCharacter(this.editingCharacter);
    }

    return this.editingCharacter[this.typesKey]!;
  }

  private get dots(): number[] {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  }

  private get typesKey(): "healthDamage"|"willpowerDamage" {
    return this.propKey === "health" ? "healthDamage" : "willpowerDamage";
  }

  private onClick(nr: number) {
    const types = this.getTypes();
    types[nr - 1] = this.getNext(types[nr - 1]);
    this.$forceUpdate();

    CharacterStorage.saveCharacter(this.editingCharacter);
  }

  private getNext(type: DamageType): DamageType {
    if (type === DamageType.None) {
      return DamageType.Superficial;
    } else if (type === DamageType.Superficial) {
      return DamageType.Heavy;
    } else if (type === DamageType.Heavy) {
      return DamageType.Full;
    }
    return DamageType.None;
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
    position: relative;
    width: 1rem;
    height: 1rem;
    cursor: pointer;
    border: 1px solid var(--primary-color);
    &.disabled {
      opacity: 0.5;
    }
    &.full {
      background-color: var(--primary-color);
    }
    &.superficial {
      background: linear-gradient(to bottom left, transparent calc(50% - 2px), var(--primary-color) calc(50% - 1px), var(--primary-color) calc(50% + 1px), transparent calc(50% + 2px)) no-repeat 0px 0px / 100px 100px;
      transform: rotate(90deg);
    }
    &.heavy {
      background: linear-gradient(to bottom left, transparent calc(50% - 2px), var(--primary-color) calc(50% - 1px), var(--primary-color) calc(50% + 1px), transparent calc(50% + 2px)) no-repeat 0px 0px / 100px 100px;
      transform: rotate(90deg);
      .for-cross {
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        transform: rotate(-90deg);
        background: linear-gradient(to bottom left, transparent calc(50% - 2px), var(--primary-color) calc(50% - 1px), var(--primary-color) calc(50% + 1px), transparent calc(50% + 2px)) no-repeat 0px 0px / 100px 100px;
      }
    }
    .for-cross {
      display: none;
    }
  }
}
</style>
