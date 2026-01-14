<template>
  <Modal :shown="show" @close="show = false">
    <div style="display: flex; flex-direction: column; gap: 1rem; width: 20rem" v-if="data">
      <b>{{$t('viewer.modals.level.trait')}}:</b>
      <div style="width: 100%; text-align: center">{{getTraitLevel()}} &#8594; {{getTraitLevel() + 1}} <bullet/> {{$t('viewer.modals.level.costs', {xp: neededExp})}}</div>
      <div style="width: 100%; display: flex; justify-content: center; align-items: center">
        <button class="btn btn-primary" :disabled="neededExp > editingCharacter.exp" @click="level">{{$t('viewer.modals.level.btn')}}</button>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import Modal from "@/components/modal/Modal.vue";
import {State} from "vuex-class";
import {ICharacter} from "@/types/models";
import Bullet from "@/components/Bullet.vue";
import CharacterStorage from "@/libs/io/character-storage";
import {ITransformedData} from "@/views/viewer/TraitsView.vue";
import {ITrait} from "@/types/data";
import {LevelChangeType} from "@/types/gameline";

@Component({
  components: {Bullet, Modal}
})
export default class TraitModal extends Vue {

  @State("editingCharacter")
  private editingCharacter!: ICharacter;

  private show: boolean = false;
  private upTrait: ITrait|undefined = undefined;
  private data: ITransformedData = null!;
  private type: "backgrounds" | "merits" = null!;

  public showModal(data: ITransformedData, type: "backgrounds" | "merits") {
    this.data = data;
    this.type = type;

    const newLevel = this.getTraitLevel() + 1;
    const name = data.name.replace("1", "").replace("2", "").replace("3", "").replace("4", "").replace("5", "").trim() + " " + newLevel;
    this.upTrait = this.data.pack.advantages.find(t => t.name === name);

    this.show = true;
  }

  private level() {
    if (this.editingCharacter.exp < this.neededExp) {
      return;
    }

    const trait = this.findRealTrait();
    if (!trait) {
      return;
    }

    CharacterStorage.trackLevelChange(this.editingCharacter, LevelChangeType.Trait, this.neededExp, `${trait.name}: ${this.getTraitLevel()} → ${this.getTraitLevel() + 1}`);
    if (this.upTrait) {
      trait.name = this.upTrait.name;
      trait.level = this.upTrait.level;
      trait.customLevel = this.upTrait.level;
      trait.description = this.upTrait.description;
    } else {
      if (trait.customLevel) {
        trait.customLevel++;
      } else {
        trait.customLevel = parseInt(trait.level.toString()) + 1;
      }
    }
    CharacterStorage.saveCharacter(this.editingCharacter);
    this.show = false;
  }

  private getTraitLevel() {
    return parseInt((this.data.customLevel ?? this.data.level).toString());
  }

  private findRealTrait() {
    const upack = this.editingCharacter[this.type].packs.find(p => p.pack.id === this.data.pack.id);
    if (upack) {
      return upack.traits.find(t => t.id === this.data.id);
    }
    return null;
  }

  private get neededExp(): number {
    return 3;
  }
}
</script>

<style scoped lang="scss">

</style>
