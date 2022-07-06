<template>
  <Modal :shown="show" @close="show = false">
    <div class="character-info" v-if="character">
      <div class="form-group">
        <label><b>{{$t('main.characters.create.books')}}:</b></label>
        <BookSelection :disabled="true" :books="activatedBooks"/>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import Modal from "@/components/modal/Modal.vue";
import {ICharacter} from "@/types/models";
import BookSelection, {ActivatableBook} from "@/components/editor/BookSelection.vue";

@Component({
  components: {BookSelection, Modal}
})
export default class CharacterInfoModal extends Vue {

  private show: boolean = false;
  private character: ICharacter = null!;

  public showModal(character: ICharacter) {
    this.character = character;
    this.show = true;
  }

  private get activatedBooks(): ActivatableBook[] {
    return BookSelection.defaultBooks().map(b => ({
      ...b,
      activated: this.character.books.includes(b.id)
    }));
  }
}
</script>

<style scoped lang="scss">
.character-info {
  display: flex;
  flex-direction: column;
}
</style>
