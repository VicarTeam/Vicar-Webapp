<template>
  <Container class="d-flex flex-grow-1" style="padding: 3rem; gap: 3rem;" :key="refreshForce">
    <div class="d-flex flex-column" style="width: 20rem; gap: 1rem">
      <input type="file" ref="importFiles" name="files[]" hidden @change="importCharacterFromFile($event)"/>
      <button class="btn btn-primary" style="height: 4rem" @click="createCharacterModal.showModal()">
        {{$t('main.characters.create')}}
      </button>
      <button class="btn btn-primary" style="height: 4rem" @click="createDirectoryModal.showModal()">
        {{$t('main.characters.createdir')}}
      </button>
      <button class="btn btn-primary" style="height: 4rem" @click="importFiles.click()">
        {{$t('main.characters.import')}}
      </button>

      <VicarShare ref="vicarShare"/>
    </div>

    <div class="d-flex flex-column flex-grow-1" style="gap: 3rem">
      <CharacterDirectory v-for="(d, i) in getSortedCharacters()" :directory="d.directory" :characters="d.characters" :key="i"/>
    </div>

    <CreateCharacterModal ref="createCharacterModal"/>
    <CreateDirectoryModal ref="createDirectoryModal" @created="updateCharacterList"/>
    <ConfirmCharDeletionModal ref="confirmCharDeletionModal" @deleted="updateCharacterList"/>
  </Container>
</template>

<script lang="ts">
import {Component, Provide, Ref, Vue} from "vue-property-decorator";
import Modal from "@/components/modal/Modal.vue";
import CreateCharacterModal from "@/components/main/characters/modals/CreateCharacterModal.vue";
import Avatar from "@/components/Avatar.vue";
import {ICharacter, ICharacterDirectory} from "@/types/models";
import CharacterStorage from "@/libs/io/character-storage";
import ConfirmCharDeletionModal from "@/components/main/characters/modals/ConfirmCharDeletionModal.vue";
import FileCreator from "@/libs/io/file-creator";
import FileReaderUtils from "@/libs/io/file-reader";
import {Mutation} from "vuex-class";
import Bullet from "@/components/Bullet.vue";
import IconButton from "@/components/IconButton.vue";
import VicarShare from "@/components/main/characters/share/VicarShare.vue";
import Character from "@/components/main/characters/Character.vue";
import CharacterDirectory from "@/components/main/characters/CharacterDirectory.vue";
import CreateDirectoryModal from "@/components/main/characters/modals/CreateDirectoryModal.vue";
import {Container} from "vue-dndrop";
import EventBus from "@/libs/event-bus";

@Component({
  components: {
    CreateDirectoryModal,
    CharacterDirectory, Container,
    Character, VicarShare, IconButton, Bullet, ConfirmCharDeletionModal, Avatar, CreateCharacterModal, Modal}
})
export default class Characters extends Vue {

  private refreshForce = 1;

  @Ref("importFiles")
  private importFiles!: HTMLInputElement;

  @Ref("createCharacterModal")
  private createCharacterModal!: CreateCharacterModal;

  @Ref("confirmCharDeletionModal")
  private confirmCharDeletionModal!: ConfirmCharDeletionModal;

  @Ref("createDirectoryModal")
  private createDirectoryModal!: CreateDirectoryModal;

  @Ref("vicarShare")
  private vicarShare!: VicarShare;

  mounted() {
    EventBus.$on("update-character-list", this.updateCharacterList);
  }

  destroyed() {
    EventBus.$off("update-character-list", this.updateCharacterList);
  }

  private async importCharacterFromFile(event: {target: {files: FileList}}) {
    try {
      const content = await FileReaderUtils.readFile(event.target.files);
      await CharacterStorage.addCharacter(JSON.parse(content));
      this.$forceUpdate();
    } catch (e) {
      console.error(e);
    }
  }

  private getSortedCharacters() {
    return CharacterStorage.getSortedCharacters();
  }

  @Provide("begin-char-deletion")
  private beginCharDeletion(char: ICharacter) {
    this.confirmCharDeletionModal.showModal(char);
  }

  @Provide("update-character-list")
  private updateCharacterList() {
    this.refreshForce++;
    if (this.refreshForce > 10) {
      this.refreshForce = 1;
    }
  }

  @Provide("is-share-available")
  private isShareAvailable(): boolean {
    return this.vicarShare.isAvailable;
  }

  @Provide("share-character")
  private shareCharacter(char: ICharacter) {
    this.vicarShare.shareCharacter(char);
  }

  @Provide("create-character")
  private createCharacter(dir?: ICharacterDirectory) {
    this.createCharacterModal.showModal(dir);
  }
}
</script>

<style scoped lang="scss">

</style>
