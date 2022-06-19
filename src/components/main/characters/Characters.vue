<template>
  <div class="d-flex flex-grow-1" style="padding: 3rem; gap: 3rem;">
    <div class="d-flex flex-column" style="width: 20rem; gap: 1rem">
      <input type="file" ref="importFiles" name="files[]" hidden @change="importCharacterFromFile($event)"/>
      <button class="btn btn-primary" style="height: 4rem" @click="createCharacterModal.showModal()">
        {{$t('main.characters.create')}}
      </button>
      <button class="btn btn-primary" style="height: 4rem" @click="importFiles.click()">
        {{$t('main.characters.import')}}
      </button>

      <VicarShare ref="vicarShare"/>
    </div>

    <div class="d-flex flex-column flex-grow-1" style="gap: 2rem">
      <Character v-for="c in getCharacters()" :character="c"/>
    </div>

    <CreateCharacterModal ref="createCharacterModal"/>
    <ConfirmCharDeletionModal ref="confirmCharDeletionModal" @deleted="onCharDeleted"/>
  </div>
</template>

<script lang="ts">
import {Component, Provide, Ref, Vue} from "vue-property-decorator";
import Modal from "@/components/modal/Modal.vue";
import CreateCharacterModal from "@/components/main/characters/modals/CreateCharacterModal.vue";
import Avatar from "@/components/Avatar.vue";
import {ICharacter} from "@/types/models";
import CharacterStorage from "@/libs/io/character-storage";
import ConfirmCharDeletionModal from "@/components/main/characters/modals/ConfirmCharDeletionModal.vue";
import FileCreator from "@/libs/io/file-creator";
import FileReaderUtils from "@/libs/io/file-reader";
import {Mutation} from "vuex-class";
import Bullet from "@/components/Bullet.vue";
import IconButton from "@/components/IconButton.vue";
import VicarShare from "@/components/main/characters/share/VicarShare.vue";
import Character from "@/components/main/characters/Character.vue";

@Component({
  components: {Character, VicarShare, IconButton, Bullet, ConfirmCharDeletionModal, Avatar, CreateCharacterModal, Modal}
})
export default class Characters extends Vue {

  @Ref("importFiles")
  private importFiles!: HTMLInputElement;

  @Ref("createCharacterModal")
  private createCharacterModal!: CreateCharacterModal;

  @Ref("confirmCharDeletionModal")
  private confirmCharDeletionModal!: ConfirmCharDeletionModal;

  @Ref("vicarShare")
  private vicarShare!: VicarShare;

  private async importCharacterFromFile(event: {target: {files: FileList}}) {
    try {
      const content = await FileReaderUtils.readFile(event.target.files);
      CharacterStorage.addCharacter(JSON.parse(content));
      this.$forceUpdate();
    } catch (e) {
      console.error(e);
    }
  }

  private onCharDeleted() {
    this.$forceUpdate();
  }

  private getCharacters(): ICharacter[] {
    return CharacterStorage.loadedCharacters;
  }

  @Provide("begin-char-deletion")
  private beginCharDeletion(char: ICharacter) {
    this.confirmCharDeletionModal.showModal(char);
  }

  @Provide("update-character-list")
  private updateCharacterList() {
    this.$forceUpdate();
  }

  @Provide("is-share-available")
  private isShareAvailable(): boolean {
    return this.vicarShare.isAvailable;
  }

  @Provide("share-character")
  private shareCharacter(char: ICharacter) {
    this.vicarShare.shareCharacter(char);
  }
}
</script>

<style scoped lang="scss">

</style>
