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
            <span class="bullet">&#8226;</span>
            {{c.concept}}
            <span v-if="c.concept" class="bullet">&#8226;</span>
            <i> Clan:</i> {{c.clan.name}}
            <span class="bullet">&#8226;</span>
            {{c.clan.slogan}}
            <span class="bullet">&#8226;</span>
            <i> Generation:</i> {{c.generation}} ({{$t('character.generation.' + c.generationEra)}})
            <span v-if="c.chronicle" class="bullet">&#8226;</span>
            {{c.chronicle}}
            <span v-if="c.exp > 0" class="bullet">&#8226;</span>
            <span v-if="c.exp > 0"><i> EXP:</i> {{c.exp}}</span>
          </span>
        </div>

        <div class="actions">
          <span class="action" @click="confirmCharDeletionModal.showModal(c)"><i class="fa-solid fa-trash"></i></span>
          <span class="action" @click="cloneCharacter(c)"><i class="fa-solid fa-copy"></i></span>
          <span class="action" @click="exportCharacter(c)"><i class="fa-solid fa-file-arrow-down"></i></span>
          <span class="action"><i class="fa-solid fa-eye"></i></span>
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

@Component({
  components: {ConfirmCharDeletionModal, Avatar, CreateCharacterModal, Modal}
})
export default class Characters extends Vue {

  @Ref("importFiles")
  private importFiles!: HTMLInputElement;

  @Ref("createCharacterModal")
  private createCharacterModal!: CreateCharacterModal;

  @Ref("confirmCharDeletionModal")
  private confirmCharDeletionModal!: ConfirmCharDeletionModal;

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
      .bullet {
        color: var(--primary-color);
      }
    }
  }
  .actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    align-items: center;
    .action {
      border: 3px solid var(--primary-color);
      color: var(--primary-color);
      border-radius: 50%;
      padding: 0.5rem;
      width: 3rem;
      height: 3rem;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      &:hover {
        background-color: var(--primary-color-light);
        color: #fff;
      }
      &:active {
        background-color: var(--primary-color);
        color: #fff;
      }
    }
  }
}
</style>
