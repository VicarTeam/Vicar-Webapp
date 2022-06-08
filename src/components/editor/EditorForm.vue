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
import {Mutation, State} from "vuex-class";
import {ICharacter} from "@/types/models";

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

  @Prop({required: true})
  private nextStep!: string;

  @State("editingCharacter")
  private editingCharacter!: ICharacter|undefined;

  @State("editorCharHistory")
  private editorCharHistory!: ICharacter[];

  @Mutation("setEditingCharacter")
  private setEditingCharacter!: (character?: ICharacter) => void;

  @Mutation("addCharToEditorHistory")
  private addCharToEditorHistory!: (character: ICharacter) => void;

  @Mutation("clearCharHistory")
  private clearCharHistory!: () => void;

  private next() {
    if (!this.editingCharacter || !this.canGoNext) {
      return;
    }
    if (!this.isFinish) {
      this.$emit("before-next");
      this.addCharToEditorHistory(this.fallbackHistoryChar ? this.fallbackHistoryChar : this.editingCharacter);
      this.$router.push({name: this.nextStep});
    } else {

    }
  }

  private back() {
    if (!this.isCancel) {
      this.setEditingCharacter(this.editorCharHistory.pop());
      this.$router.back();
    } else {
      this.setEditingCharacter();
      this.clearCharHistory();
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
