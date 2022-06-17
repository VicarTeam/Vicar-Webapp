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
    </div>

    <div class="d-flex flex-column flex-grow-1" style="gap: 2rem">
      <div class="character-entry" v-for="c in getCharacters()">
        <Avatar :src="c.avatar" style="width: 5rem; height: 5rem"/>

        <div class="info">
          <span class="title">{{c.name}}</span>
          <span class="subtitle">
            {{$t('character.sex.' + c.sex)}}
            <bullet/>
            {{c.concept}}
            <bullet v-if="c.concept"/>
            <i> Clan:</i> {{c.clan.name}}
            <bullet/>
            {{c.clan.slogan}}
            <bullet/>
            <i> Generation:</i> {{c.generation}} ({{$t('character.generation.' + c.generationEra)}})
            <bullet v-if="c.chronicle"/>
            {{c.chronicle}}
            <bullet v-if="c.exp > 0"/>
            <span v-if="c.exp > 0"><i> EXP:</i> {{c.exp}}</span>
          </span>
        </div>

        <div class="actions">
          <IconButton icon="fa-trash" @click="confirmCharDeletionModal.showModal(c)"/>
          <IconButton icon="fa-copy" @click="cloneCharacter(c)"/>
          <IconButton icon="fa-file-arrow-down" @click="exportCharacter(c)"/>
          <IconButton icon="fa-eye" @click="viewCharacter(c)"/>
        </div>
      </div>
    </div>

    <CreateCharacterModal ref="createCharacterModal"/>
    <ConfirmCharDeletionModal ref="confirmCharDeletionModal" @deleted="onCharDeleted"/>
  </div>
</template>

<script lang="ts">
import {Component, Ref, Vue} from "vue-property-decorator";
import Modal from "@/components/modal/Modal.vue";
import CreateCharacterModal from "@/components/main/characters/CreateCharacterModal.vue";
import Avatar from "@/components/Avatar.vue";
import {ICharacter} from "@/types/models";
import CharacterStorage from "@/libs/io/character-storage";
import ConfirmCharDeletionModal from "@/components/main/characters/ConfirmCharDeletionModal.vue";
import FileCreator from "@/libs/io/file-creator";
import FileReaderUtils from "@/libs/io/file-reader";
import {Mutation} from "vuex-class";
import Bullet from "@/components/Bullet.vue";
import IconButton from "@/components/IconButton.vue";

@Component({
  components: {IconButton, Bullet, ConfirmCharDeletionModal, Avatar, CreateCharacterModal, Modal}
})
export default class Characters extends Vue {

  @Ref("importFiles")
  private importFiles!: HTMLInputElement;

  @Ref("createCharacterModal")
  private createCharacterModal!: CreateCharacterModal;

  @Ref("confirmCharDeletionModal")
  private confirmCharDeletionModal!: ConfirmCharDeletionModal;

  @Mutation("setEditingCharacter")
  private setEditingCharacter!: (character: ICharacter) => void;

  @Mutation("setLevelMode")
  private setLevelMode!: (mode: boolean) => void;

  private async importCharacterFromFile(event: {target: {files: FileList}}) {
    try {
      const content = await FileReaderUtils.readFile(event.target.files);
      CharacterStorage.addCharacter(JSON.parse(content));
      this.$forceUpdate();
    } catch (e) {
      console.error(e);
    }
  }

  private cloneCharacter(character: ICharacter) {
    const newChar = {...character};
    newChar.name += " - Kopie";
    CharacterStorage.addCharacter(newChar);
    this.$forceUpdate();
  }

  private onCharDeleted() {
    this.$forceUpdate();
  }

  private exportCharacter(char: ICharacter) {
    FileCreator.create(char.name + ".json", JSON.stringify(char));
  }

  private viewCharacter(character: ICharacter) {
    this.setLevelMode(false);
    this.setEditingCharacter(character);
    this.$router.push({name: 'viewer'});
  }

  private getCharacters(): ICharacter[] {
    return CharacterStorage.loadedCharacters;
  }
}
</script>

<style scoped lang="scss">
.character-entry {
  user-select: none;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--primary-color);
  display: flex;
  flex-direction: row;
  gap: 1rem;
  .info {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    .title {
      text-transform: uppercase;
      font-size: 1.5rem;
      font-weight: bolder;
      color: #fff;
    }
    .subtitle {
      font-size: 1.1rem;
      color: #939393;
    }
  }
  .actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    align-items: center;
  }
}
</style>
