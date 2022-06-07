<template>
  <EditorForm :can-go-next="canGoNext" next-step="editor-attributes" :fallback-history-char="characterCache">
    <div class="d-flex justify-content-center" style="width: 100%; height: 100%; padding: 5rem" v-if="editingCharacter">
      <div class="choose-predator-type-wrapper">
        <div class="form-group" style="text-align: center">
          <label class="required">{{$t('editor.step2.predator')}}: <TipButton :title="$t('editor.step2.predator.tip.title')" :content="$t('editor.step2.predator.tip.content')"/></label>
          <select class="form-control" style="width: 30rem" v-model="editingCharacter.predatorType">
            <option v-for="p in predatorTypes" :key="p.id" :value="p">{{p.name}}</option>
          </select>
        </div>
        <b v-if="editingCharacter.predatorType">{{$t('editor.step2.predator.changes')}}</b>
        <ul v-if="editingCharacter.predatorType">
          <li v-for="(a, i) in editingCharacter.predatorType.actions" :key="i">{{a.description}}</li>
        </ul>
        <hr>
        <button class="btn btn-primary" v-if="editingCharacter.predatorType && !characterCache" @click="selectType">Auswählen</button>
      </div>
    </div>
  </EditorForm>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import {State} from "vuex-class";
import {ICharacter} from "@/types/models";
import EditorForm from "@/components/editor/EditorForm.vue";
import DataManager from "@/libs/data-manager";
import {IPredatorType} from "@/types/data";
import TipButton from "@/components/editor/TipButton.vue";

@Component({
  components: {TipButton, EditorForm}
})
export default class ChoosePredatorTypeView extends Vue {

  @State("editingCharacter")
  private editingCharacter!: ICharacter|undefined;

  private characterCache: ICharacter|null = null;

  private selectType() {
    this.characterCache = {...this.editingCharacter!};

  }

  private get canGoNext(): boolean {
    return !!this.characterCache && !!this.characterCache.predatorType;
  }

  private get predatorTypes(): IPredatorType[] {
    let books = DataManager.selectedLanguage.books;
    if (this.editingCharacter) {
      books = books.filter(b => this.editingCharacter!.books.includes(b.id));
    }

    return DataManager.filterRestrictions(this.editingCharacter, books.map(book => book.predatorTypes).flat())
        .sort((a, b) => a.name.localeCompare(b.name));
  }
}
</script>

<style scoped lang="scss">
.choose-predator-type-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  ul > li {
    margin: 0;
  }
}
</style>
