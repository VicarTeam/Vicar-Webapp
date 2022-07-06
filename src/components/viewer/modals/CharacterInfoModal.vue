<template>
  <Modal :shown="show" @close="show = false">
    <div class="character-info" v-if="character">
      <div class="form-group">
        <label><b>{{$t('main.characters.create.books')}}:</b></label>
        <BookSelection :disabled="true" :books="activatedBooks"/>
      </div>
      <div class="form-group d-flex flex-column mb-0">
        <label><b>{{$t('character.advanced.rules')}}:</b></label>
        <div class="custom-checkbox d-flex align-items-center">
          <input type="checkbox" id="disc" v-model="character.useAdavancedDisciplines" @change="save">
          <label for="disc">{{$t('character.advanced.disciplines')}}</label>
        </div>
        <div class="custom-checkbox d-flex align-items-center">
          <input type="checkbox" id="pow" v-model="character.allowLearningOfAllPowers" @change="save">
          <label for="pow">{{$t('character.advanced.powers')}}</label>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import Modal from "@/components/modal/Modal.vue";
import {ICharacter} from "@/types/models";
import BookSelection, {ActivatableBook} from "@/components/editor/BookSelection.vue";
import CharacterStorage from "@/libs/io/character-storage";

@Component({
  components: {BookSelection, Modal}
})
export default class CharacterInfoModal extends Vue {

  private show: boolean = false;
  private character: ICharacter = null!;

  public showModal(character: ICharacter) {
    this.character = character;
    this.character["useAdavancedDisciplines"] = this.character["useAdavancedDisciplines"] || false;
    this.character["allowLearningOfAllPowers"] = this.character["allowLearningOfAllPowers"] || false;
    this.show = true;
  }

  private save() {
    CharacterStorage.saveCharacter(this.character);
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
