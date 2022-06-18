<template>
  <Modal :shown="show" @close="show = false">
    <div class="w-400 d-flex justify-content-center align-items-center flex-column" style="gap: 1rem" v-if="trait && char">
      <span>{{$t('viewer.modal.trait.delete', {trait: trait.name})}}</span>
      <button class="btn btn-primary" @click="deleteTrait">{{$t('character.deletion.confirm')}}</button>
    </div>
  </Modal>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import {ITransformedData} from "@/views/viewer/TraitsView.vue";
import {ICharacter} from "@/types/models";
import CharacterStorage from "@/libs/io/character-storage";
import Modal from "@/components/modal/Modal.vue";
import {State} from "vuex-class";

@Component({
  components: {Modal}
})
export default class RemoveTraitModal extends Vue {

  @State("editingCharacter")
  private char!: ICharacter;

  private show: boolean = false;
  private trait: ITransformedData = null!;
  private type: "backgrounds"|"merits" = "backgrounds";
  private isFlaw: boolean = false;

  public showModal(trait: ITransformedData, type: "backgrounds"|"merits", isFlaw: boolean) {
    this.type = type;
    this.trait = trait;
    this.isFlaw = isFlaw;
    this.show = true;
  }

  private deleteTrait() {
    const upack = this.char[this.type].packs.find(pack => pack.pack.id === this.trait.pack.id);
    if (!upack) {
      return;
    }

    const idx = (this.isFlaw ? upack.flawTraits : upack.traits).findIndex(x => !x.isLocked && x.id === this.trait.id);
    if (idx === -1) {
      return;
    }

    (this.isFlaw ? upack.flawTraits : upack.traits).splice(idx, 1);
    CharacterStorage.saveCharacter(this.char);
    this.show = false;
  }
}
</script>

<style scoped lang="scss">

</style>
