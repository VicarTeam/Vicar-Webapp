<template>
  <div class="editor-form">
    <div class="pane">
      <slot></slot>
    </div>

    <div class="toolbar">
      <button class="btn" @click="back">{{ $t('editor.toolbar.' + (!isCancel ? 'back' : 'cancel')) }}</button>
      <div class="fill"></div>
      <button class="btn btn-primary" @click="next" :disabled="!canGoNext">{{ $t('editor.toolbar.' + (!isFinish ? 'next' : 'finish')) }}</button>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import {Action, Mutation, State} from "vuex-class";
import {AttributeKeys, ICharacter, ICharacterDirectory} from "@/types/models";
import CharacterStorage from "@/libs/io/character-storage";
import DataManager from "@/libs/data/data-manager";
import {EditorHistory} from "@/libs/editor-history";
import FileCreator from "@/libs/io/file-creator";

@Component({
  components: {}
})
export default class EditorForm extends Vue {

  @Prop({default: null})
  private fallbackHistoryChar!: ICharacter|null;

  @Prop({default: false})
  private isCancel!: boolean;

  @Prop({default: false})
  private isFinish!: boolean;

  @Prop({required: true})
  private canGoNext!: boolean;

  @Prop({default: ""})
  private nextStep!: string;

  @State("editingCharacter")
  private editingCharacter!: ICharacter|undefined;

  @State("editorCharHistory")
  private editorCharHistory!: ICharacter[];

  @State("directoryForCharCreation")
  private directoryForCharCreation!: ICharacterDirectory|undefined;

  @Mutation("setEditingCharacter")
  private setEditingCharacter!: (character?: ICharacter) => void;

  @Mutation("setLevelMode")
  private setLevelMode!: (mode: boolean) => void;

  @Mutation("setDirectoryForCharCreation")
  private setDirectoryForCharCreation!: (dir?: ICharacterDirectory) => void;

  private next() {
    if (!this.editingCharacter || !this.canGoNext) {
      return;
    }
    if (!this.isFinish) {
      const n = () => {
        EditorHistory.push(!!this.fallbackHistoryChar ? this.fallbackHistoryChar : this.editingCharacter!);
        this.$router.push({name: this.nextStep});
      };
      const event = {next: n, cancel: false};
      this.$emit("before-next", event);
      if (!event.cancel) {
        n();
      }
    } else {
      const n = async () => {
        if (!this.editingCharacter) {
          return;
        }

        if (this.directoryForCharCreation) {
          this.editingCharacter.directory = this.directoryForCharCreation.id;
        }

        this.editingCharacter.requiredPointSpreads = [];
        this.editingCharacter.health = DataManager.getAttributeValue(this.editingCharacter, AttributeKeys.Stamina) + 3;
        this.editingCharacter.willpower = DataManager.getAttributeValue(this.editingCharacter, AttributeKeys.Composure)
            + DataManager.getAttributeValue(this.editingCharacter, AttributeKeys.Resolve);
        const res = await CharacterStorage.addCharacter(this.editingCharacter);
        if (!res) {
          FileCreator.create("unsaved-character", JSON.stringify(this.editingCharacter));
          return;
        }

        this.setLevelMode(false);
        EditorHistory.clear();
        this.setDirectoryForCharCreation();
        await this.$router.push({name: 'viewer', params: {characterId: this.editingCharacter.id}});
      };
      const event = {next: n, cancel: false};
      this.$emit("before-next", event);
      if (!event.cancel) {
        n();
      }
    }
  }

  private back() {
    if (!this.isCancel) {
      this.setEditingCharacter(EditorHistory.pop());
      this.$router.back();
    } else {
      this.setDirectoryForCharCreation();
      this.setEditingCharacter();
      EditorHistory.clear();
      this.$router.push({name: 'main'});
    }
  }
}
</script>

<style scoped lang="scss">
.editor-form {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .pane {
    width: 100%;
    height: calc(100% - 5rem);
    max-height: calc(100% - 5rem);
    overflow-x: hidden;
    overflow-y: auto;
  }
  .toolbar {
    height: 5rem;
    width: 100%;
    padding: 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
    .fill {
      flex-grow: 1;
    }
  }
}
</style>
