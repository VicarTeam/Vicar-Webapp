<template>
  <Modal :shown="show" @close="show = false">
    <div class="w-400 d-flex justify-content-center align-items-center flex-column" style="gap: 1rem" v-if="char">
      <span>{{$t('character.deletion', {char: char.name})}}</span>
      <button class="btn btn-primary" @click="deleteChar">{{$t('character.deletion.confirm')}}</button>
    </div>
  </Modal>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import Modal from "@/components/modal/Modal.vue";
import {ICharacter} from "@/types/models";
import CharacterStorage from "@/libs/io/character-storage";

@Component({
  components: {Modal}
})
export default class ConfirmCharDeletionModal extends Vue {

  private show: boolean = false;
  private char: ICharacter = null!;

  public showModal(char: ICharacter) {
    this.char = char;
    this.show = true;
  }

  private async deleteChar() {
    await CharacterStorage.removeCharacter(this.char);
    this.show = false;
    this.$emit("deleted");
  }
}
</script>

<style scoped lang="scss">

</style>
