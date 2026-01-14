<template>
  <EditorForm :can-go-next="canGoNext" :is-finish="isElder" next-step="editor-traits" :fallback-history-char="characterCache" @before-next="applyPredatorType">
    <div class="d-flex justify-content-center" style="width: 100%; height: 100%; padding: 5rem" v-if="editingCharacter">
      <div class="choose-predator-type-wrapper">
        <div class="form-group" style="text-align: center">
          <label class="required">{{$t('editor.predator')}}: <TipButton :title="$t('editor.predator.tip.title')" :content="$t('editor.predator.tip.content')"/></label>
          <select class="form-control" style="width: 30rem" v-model="editingCharacter.predatorType" :disabled="characterCache">
            <option v-for="p in predatorTypes" :key="p.id" :value="p">{{p.name}}</option>
          </select>
        </div>
        <i v-if="editingCharacter.predatorType" style="width: 60%; margin-bottom: 1rem">{{editingCharacter.predatorType.description}}</i>
        <b v-if="editingCharacter.predatorType">{{$t('editor.predator.changes')}}</b>
        <ul v-if="editingCharacter.predatorType">
          <li v-for="(a, i) in editingCharacter.predatorType.actions" :key="i">{{a.description}}</li>
        </ul>
        <hr>
        <button class="btn btn-primary" v-if="editingCharacter.predatorType && !characterCache" @click="selectType">{{$t('editor.choose')}}</button>

        <div v-if="characterCache">
          <div v-for="(a, i) in interactableActions" class="card w-400 m-20" :key="i">
            <component :is="`${getActionTypeComponent(a.type)}Action`" :data="a.data"/>
          </div>
        </div>
      </div>
    </div>
  </EditorForm>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import {State} from "vuex-class";
import {ICharacter} from "@/types/models";
import EditorForm from "@/components/editor/EditorForm.vue";
import DataManager from "@/libs/data/data-manager";
import {IPredatorType, PTActionType} from "@/types/data";
import TipButton from "@/components/editor/TipButton.vue";
import AdditionalSpecializationAction from "@/components/editor/actions/AdditionalSpecializationAction.vue";
import PTActionBase from "@/components/editor/actions/PTActionBase";
import EventBus from "@/libs/event-bus";
import {ptActionResolver} from "@/libs/resolvers/ptactions-resolver";
import DisciplinePointAction from "@/components/editor/actions/DisciplinePointAction.vue";
import PTActionHandler from "@/libs/ptaction-handler";
import AddFlawAction from "@/components/editor/actions/AddFlawAction.vue";
import SpendBackgroundPointsBetweenAction from "@/components/editor/actions/SpendBackgroundPointsBetweenAction.vue";
import SpendFlawPointsBetweenAction from "@/components/editor/actions/SpendFlawPointsBetweenAction.vue";

@Component({
  components: {
    SpendFlawPointsBetweenAction, SpendBackgroundPointsBetweenAction,
    AddFlawAction, DisciplinePointAction, AdditionalSpecializationAction, TipButton, EditorForm}
})
export default class ChoosePredatorTypeView extends Vue {

  PTActionType = PTActionType;

  @State("editingCharacter")
  private editingCharacter!: ICharacter|undefined;

  private characterCache: ICharacter|null = null;
  private ptActions: PTActionBase<any>[] = [];

  mounted() {
    EventBus.$on("insert-ptaction", this.insertPTAction);
  }

  destroyed() {
    EventBus.$off("insert-ptaction", this.insertPTAction);
  }

  private applyPredatorType() {
    const interactableActions = this.interactableActions;
    const actions = this.editingCharacter!.predatorType.actions.filter(a => !interactableActions.find(ia => ia.type === a.type));

    this.ptActions.forEach(a => {
      a.applyOutput(this.editingCharacter!);
    });

    actions.forEach(a => {
      PTActionHandler.handle(this.editingCharacter!, a);
    });
  }

  private selectType() {
    this.ptActions = [];
    this.characterCache = JSON.parse(JSON.stringify(this.editingCharacter!));
  }

  private areActionsReady() {
    if (this.ptActions.length <= 0) {
      return false;
    }
    return this.ptActions.every(a => a.isReady());
  }

  private getActionTypeComponent(actionType: PTActionType) {
    for (let member in PTActionType) {
      // @ts-ignore
      if (PTActionType[member] === actionType) {
        return member;
      }
    }
    return "";
  }

  private get canGoNext(): boolean {
    return !!this.characterCache && !!this.characterCache.predatorType && this.areActionsReady();
  }

  private get interactableActions() {
    return ptActionResolver.resolve(this.editingCharacter!.predatorType.actions, this.editingCharacter!);
  }

  private get predatorTypes(): IPredatorType[] {
    let books = DataManager.selectedLanguage.books;
    if (this.editingCharacter) {
      books = books.filter(b => this.editingCharacter!.books.includes(b.id));
    }

    return DataManager.filterRestrictions(this.editingCharacter, books.map(book => book.predatorTypes).flat())
        .sort((a, b) => a.name.localeCompare(b.name));
  }

  private insertPTAction(action: PTActionBase<any>) {
    this.ptActions.push(action);
  }

  private get isElder(): boolean {
    return this.editingCharacter?.isElder ?? false;
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
