<template>
  <Modal :shown="show" @close="show = false">
    <div class="character-info" v-if="character">
      <div class="form-group">
        <label><b>{{$t('main.characters.create.books')}}:</b></label>
        <BookSelection :disabled="true" :books="activatedBooks"/>
      </div>
      <div class="form-group d-flex flex-column">
        <label><b>{{$t('character.advanced.usedexp')}}:</b></label>
        <i style="opacity: 0.7">{{character.usedExp || 0}} EXP</i>
      </div>
      <div class="form-group d-flex flex-column" :class="{'mb-0': !isNotUpToDate()}">
        <label><b>{{$t('character.advanced.rules')}}:</b></label>
        <div class="custom-checkbox d-flex align-items-center">
          <input type="checkbox" id="disc" v-model="character.useAdavancedDisciplines" @change="save">
          <label for="disc">{{$t('character.advanced.disciplines')}}</label>
        </div>
        <div class="custom-checkbox d-flex align-items-center">
          <input type="checkbox" id="pow" v-model="character.allowLearningOfAllPowers" @change="save">
          <label for="pow">{{$t('character.advanced.powers')}}</label>
        </div>
        <div class="custom-checkbox d-flex align-items-center">
          <input type="checkbox" id="cust" v-model="character.fullCustomization" @change="save">
          <label for="cust">{{$t('character.advanced.customization')}}</label>
        </div>
      </div>
      <div class="d-flex justify-content-center align-items-center" v-if="isNotUpToDate()">
        <button class="btn btn-primary" @click="migrateChar">{{$t('character.info.migrate')}}</button>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import Modal from "@/components/modal/Modal.vue";
import {CurrentCharacterVersion, ICharacter} from "@/types/models";
import BookSelection, {ActivatableBook} from "@/components/editor/BookSelection.vue";
import CharacterStorage from "@/libs/io/character-storage";
import {migrationResolver} from "@/libs/resolvers/migration-resolver";

@Component({
  components: {BookSelection, Modal}
})
export default class CharacterInfoModal extends Vue {

  private show: boolean = false;
  private character: ICharacter = null!;
  private activatedBooks: ActivatableBook[] = [];

  public showModal(character: ICharacter) {
    this.character = character;
    this.character["useAdavancedDisciplines"] = this.character["useAdavancedDisciplines"] || false;
    this.character["allowLearningOfAllPowers"] = this.character["allowLearningOfAllPowers"] || false;
    this.character["fullCustomization"] = this.character["fullCustomization"] || false;
    this.activatedBooks = [...BookSelection.defaultBooks()].map(book => {
      return {
        id: book.id,
        active: this.character.books.includes(book.id)
      };
    });
    this.show = true;
  }

  private save() {
    CharacterStorage.saveCharacter(this.character);
  }

  private migrateChar() {
    migrationResolver.migrate(this.character);
    this.$forceUpdate();
  }

  private isNotUpToDate(): boolean {
    return !this.character["version"] || this.character["version"] < CurrentCharacterVersion;
  }
}
</script>

<style scoped lang="scss">
.character-info {
  display: flex;
  flex-direction: column;
}
</style>
