<template>
  <EditorForm :can-go-next="canGoNext" next-step="editor-disciplines" :fallback-history-char="characterCache" @before-next="applyCharacterData">
    <div class="d-flex justify-content-center" style="width: 100%; height: 100%; padding: 5rem" v-if="editingCharacter">
      <div class="choose-skills-wrapper">
        <div class="form-group mb-5" style="text-align: center">
          <label class="required"><b>{{$t('editor.step4.skills.spread')}}:</b></label>
          <select class="form-control" v-model="editingCharacter.skillspread" :disabled="characterCache">
            <option v-for="t in DefinedSpreadTypes" :key="t.id" :value="t">{{$t('data.skillspread.' + t.id)}}</option>
          </select>
        </div>
        <ul v-if="editingCharacter.skillspread">
          <li v-for="(s, i) in editingCharacter.skillspread.spreads" :key="i">{{$t('editor.step4.skills.spread.info', {amount: getAvailableAmount(s.points), points: s.points})}}</li>
        </ul>
        <hr>
        <button class="btn btn-primary" v-if="editingCharacter.skillspread && !characterCache" @click="selectType">Auswählen</button>

        <div class="categories" v-if="characterCache && editingCharacter.skillspread">
          <div class="card" v-for="cat in editingCharacter.categories" :key="cat.name">
            <div style="width: 100%; text-align: center"><b>{{$t('data.category.' + cat.name)}}</b></div>
            <div class="skill mt-10" v-for="skill in cat.skills" :key="skill.key">
              <small>{{$t('data.skill.' + skill.key)}}:</small>
              <select class="form-control" v-model="skill.value" style="width: 7rem">
                <option :value="0">0</option>
                <option v-for="i in getAvailablePoints()" :key="i" :value="i" :disabled="!isPointAvailable(i)">{{i}}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="specialization card" v-if="characterCache && editingCharacter.skillspread">
          <b class="mb-10">{{$t('editor.step4.skills.specialization')}}:</b>
          <div class="defined mb-20">
            <div class="control" v-for="d in definedSpecializations" :key="d.key" style="width: 45%">
              <input v-model="d.name" type="text" class="form-control" disabled/>
              <input v-model="d.value" type="text" class="form-control"/>
            </div>
          </div>
          <b class="mb-10">{{$t('editor.step4.skills.specialization.free')}}:</b>
          <div class="control">
            <select class="form-control" v-model="freeSpecializationKey">
              <option v-for="key in sortedSkillKeys" :key="key" :value="key">{{$t('data.skill.' + key)}}</option>
            </select>
            <input v-model="freeSpecializationName" type="text" class="form-control"/>
          </div>
        </div>
      </div>
    </div>
  </EditorForm>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import EditorForm from "@/components/editor/EditorForm.vue";
import {State} from "vuex-class";
import {ICharacter, SkillKeys} from "@/types/models";
import {DefinedSpreadTypes} from "@/types/data";

@Component({
  components: {EditorForm}
})
export default class ChooseSkillsView extends Vue {

  DefinedSpreadTypes = DefinedSpreadTypes;

  @State("editingCharacter")
  private editingCharacter!: ICharacter|undefined;

  private characterCache: ICharacter|null = null;
  private definedSpecializations: {key: SkillKeys, value: string, name: any}[] = [];
  private freeSpecializationKey: SkillKeys | null = null;
  private freeSpecializationName: string = "";

  private selectType() {
    this.definedSpecializations = [
      {key: SkillKeys.Academics, name: this.$t('data.skill.aca'), value: ""},
      {key: SkillKeys.Craft, name: this.$t('data.skill.cra'), value: ""},
      {key: SkillKeys.Performance, name: this.$t('data.skill.per'), value: ""},
      {key: SkillKeys.Science, name: this.$t('data.skill.sci'), value: ""}
    ];
    this.freeSpecializationKey = null;
    this.freeSpecializationName = "";
    this.characterCache = {...this.editingCharacter!};
  }

  private getAvailablePoints(): number[] {
    return this.editingCharacter!.skillspread.spreads.map(s => s.points).sort((a, b) => a - b);
  }

  private isPointAvailable(val: number) {
    const amount = this.getAvailableAmount(val);
    return amount > 0;
  }

  private getAvailableAmount(val: number) {
    return (this.editingCharacter!.skillspread.spreads.find(s => s.points === val)?.amount ?? -1) - this.getUsedAmount(val);
  }

  private getUsedAmount(val: number) {
    let amount = 0;
    this.editingCharacter!.categories.forEach(cat => {
      cat.skills.forEach(skill => {
        if (skill.value === val) {
          amount++;
        }
      });
    });
    return amount;
  }

  private applyCharacterData() {
    this.editingCharacter!.categories.forEach(cat => {
      cat.skills.forEach(skill => {
        if (this.freeSpecializationKey === skill.key) {
          skill.specialization.push(this.freeSpecializationName);
        }

        const defined = this.definedSpecializations.find(d => d.key === skill.key);
        if (defined) {
          skill.specialization.push(defined.value);
        }
      });
    });
  }

  private get sortedSkillKeys(): SkillKeys[] {
    // @ts-ignore
    return Object.keys(SkillKeys).map(k => SkillKeys[k]).sort((a, b) => {
      return this.$t('data.skill.' + a) < this.$t('data.skill.' + b) ? -1 : 1;
    });
  }

  private get canGoNext(): boolean {
    if (!this.editingCharacter || !this.editingCharacter.skillspread) {
      return false;
    }

    const hasNoSkillPointsLeft = this.getAvailablePoints().map(p => this.getAvailableAmount(p)).every(a => a === 0);
    return hasNoSkillPointsLeft && this.definedSpecializations.every(d => d.value.length > 0) && this.freeSpecializationName.length > 0 && this.freeSpecializationKey !== null;
  }
}
</script>

<style scoped lang="scss">
.choose-skills-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  ul > li {
    margin: 0;
  }
  .categories {
    gap: 2rem;
    display: flex;
    flex-direction: row;
    width: 60%;
    justify-content: center;
    align-items: center;
    .card {
      width: 50rem;
      display: flex;
      flex-direction: column;
      .skill {
        display: flex;
        flex-direction: row;
        align-items: center;
        small {
          flex-grow: 1;
        }
        .control {
          flex-shrink: 0;
        }
      }
    }
  }
  .specialization {
    width: calc(60% - 6rem);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .defined {
      display: flex;
      flex-wrap: wrap;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 2rem;
    }
    .control {
      display: flex;
      gap: 1rem;
    }
  }
}
</style>
