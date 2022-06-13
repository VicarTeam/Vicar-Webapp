<template>
  <EditorForm :can-go-next="canGoNext" next-step="editor-traits" :fallback-history-char="characterCache">
    <div class="d-flex justify-content-center" style="width: 100%; height: 100%; padding: 5rem" v-if="editingCharacter">
      <div class="choose-disciplines-wrapper">
        <div class="form-group mb-5 d-flex justify-content-center align-items-center flex-column" style="text-align: center">
          <label class="required"><b>{{$t('editor.step4.disciplines.spread')}}:</b></label>
          <div class="d-flex w-500 justify-content-center align-items-center" style="gap: 2rem">
            <div class="d-flex flex-column" style="width: 45%">
              <label>{{$t('editor.step4.disciplines.spread.2')}}</label>
              <select class="form-control" :disabled="characterCache" v-model="disciplineFor2">
                <option :value="null">{{$t('editor.step4.disciplines.selection.none')}}</option>
                <option v-for="d in editingCharacter.clan.disciplines" :key="d.id" :value="d" :disabled="!isDisciplineAvailable(d)">{{d.name}}</option>
              </select>
            </div>
            <div class="d-flex flex-column" style="width: 45%">
              <label>{{$t('editor.step4.disciplines.spread.1')}}</label>
              <select class="form-control" :disabled="characterCache" v-model="disciplineFor1">
                <option :value="null">{{$t('editor.step4.disciplines.selection.none')}}</option>
                <option v-for="d in editingCharacter.clan.disciplines" :key="d.id" :value="d" :disabled="!isDisciplineAvailable(d)">{{d.name}}</option>
              </select>
            </div>
          </div>
        </div>
        <hr>
        <button class="btn btn-primary" v-if="editingCharacter.skillspread && !characterCache" @click="selectType" :disabled="!disciplineFor2 || !disciplineFor1">{{$t('editor.choose')}}</button>

        <div class="disciplines" v-if="characterCache">
          <div class="card discipline" v-for="d in sortedDisciplines">
            <div style="border-bottom: 1px solid rgba(255, 255, 255, 0.3); margin-bottom: 1rem">{{d.discipline.name}} <b>{{d.points}}</b> - <small>verwendet <b>{{d.abilities.length}}</b></small></div>

            <div class="ability" v-for="(a, i) in [...d.abilities].sort((a, b) => a.usedLevel - b.usedLevel)">
              <div class="meta">{{a.level}} - {{a.name}}</div><div class="actions"><TipButton :content="a.summary"/><XButton v-if="!existsHigherAbility(d, a)" class="ml-5" @click="removeAbility(d, a, i)"/></div>
            </div>

            <div class="ability-add" @click="addAbility(d)" v-if="d.points > d.abilities.length">
              <i class="fa-solid fa-plus"></i>
            </div>
          </div>
        </div>
      </div>

      <ChooseDisciplineAbilityModal ref="chooseAbilityModal"/>
    </div>
  </EditorForm>
</template>

<script lang="ts">
import {Component, Ref, Vue} from "vue-property-decorator";
import EditorForm from "@/components/editor/EditorForm.vue";
import {State} from "vuex-class";
import {ICharacter, IDisciplineSelection, ILeveledDisciplineAbility} from "@/types/models";
import {IDiscipline} from "@/types/data";
import ChooseDisciplineAbilityModal from "@/components/editor/modals/ChooseDisciplineAbilityModal.vue";
import TipButton from "@/components/editor/TipButton.vue";
import XButton from "@/components/editor/XButton.vue";

@Component({
  components: {XButton, TipButton, ChooseDisciplineAbilityModal, EditorForm}
})
export default class ChooseDisciplinesView extends Vue {

  @State("editingCharacter")
  private editingCharacter!: ICharacter|undefined;

  @Ref("chooseAbilityModal")
  private chooseAbilityModal!: ChooseDisciplineAbilityModal;

  private disciplineFor2: IDiscipline|null = null;
  private disciplineFor1: IDiscipline|null = null;
  private characterCache: ICharacter|null = null;

  private selectType() {
    if (!this.disciplineFor2 || !this.disciplineFor1) {
      return;
    }

    this.characterCache = {...this.editingCharacter!};
    this.addDiscipline(this.disciplineFor2, 2);
    this.addDiscipline(this.disciplineFor1, 1);
  }

  private addDiscipline(discipline: IDiscipline, points: number) {
    let existingDiscipline = this.editingCharacter!.disciplines.find(d => d.discipline.id === discipline.id);
    if (existingDiscipline) {
      existingDiscipline.points += points;
    } else {
      this.editingCharacter!.disciplines.push({
        discipline,
        points,
        currentLevel: 1,
        abilities: []
      });
    }
  }

  private addAbility(selection: IDisciplineSelection) {
    this.chooseAbilityModal.showModal(selection, (ability: ILeveledDisciplineAbility) => {
      selection.abilities.push({...ability, usedLevel: selection.currentLevel});
      selection.currentLevel++;
    });
  }

  private existsHigherAbility(selection: IDisciplineSelection, ability: ILeveledDisciplineAbility) {
    return selection.abilities.find(a => a.usedLevel > ability.usedLevel);
  }

  private removeAbility(selection: IDisciplineSelection, ability: ILeveledDisciplineAbility, index: number) {
    if (this.existsHigherAbility(selection, ability)) {
      return;
    }
    selection.abilities.splice(index, 1);
    selection.currentLevel--;
  }

  private isDisciplineAvailable(disc: IDiscipline): boolean {
    return this.disciplineFor1 !== disc && this.disciplineFor2 !== disc;
  }

  private get sortedDisciplines(): IDisciplineSelection[] {
    return this.editingCharacter!.disciplines.sort((a, b) => b.points - a.points);
  }

  private get canGoNext(): boolean {
    return !!this.editingCharacter && this.editingCharacter.disciplines.every(d => d.points === d.abilities.length);
  }
}
</script>

<style scoped lang="scss">
.choose-disciplines-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  .disciplines {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    flex-wrap: wrap;
    margin-top: 3rem;
    width: 100rem;
    .discipline {
      margin: 0;
      width: calc(32% - 1rem);
      display: flex;
      flex-direction: column;
      .ability {
        width: 100%;
        display: flex;
        .meta {
          flex-grow: 1;
        }
        .actions {
          flex-shrink: 0;
        }
      }
      .ability-add {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
        cursor: pointer;
        user-select: none;
        &:hover {
          color: var(--primary-color-light);
        }
        &:active {
          color: var(--primary-color);
        }
      }
    }
  }
}
</style>
