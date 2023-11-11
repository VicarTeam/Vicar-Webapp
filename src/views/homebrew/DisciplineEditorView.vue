<script lang="ts">
import {Vue, Component, Prop, Inject, Ref} from 'vue-property-decorator';
import {IDisciplineAbility, IHomebrewDiscipline} from "@/types/data";
import {VicarNet} from "@/libs/io/vicar-net";
import HomebrewEditor from "@/components/homebrew/HomebrewEditor.vue";
import {HomebrewManager} from "@/libs/data/homebrew-manager";
import IconButton from "@/components/IconButton.vue";
import DisciplineAbilityEditModal from "@/components/homebrew/modals/DisciplineAbilityEditModal.vue";

@Component({
  components: {DisciplineAbilityEditModal, IconButton, HomebrewEditor}
})
export default class DisciplineEditorView extends Vue {

  @Prop()
  private disciplineId!: number;

  @Ref("abilityEditModal")
  private abilityEditModal!: DisciplineAbilityEditModal;

  @Inject("confirm")
  private confirm!: (msg: string) => Promise<boolean>;

  private discipline: IHomebrewDiscipline|null = null;
  private isInfoEditOpen: boolean = false;

  async mounted() {
    this.discipline = await VicarNet.getDiscipline(this.disciplineId);
  }

  private async save(): Promise<boolean> {
    if (!this.canSave) {
      return false;
    }

    if (!this.discipline) {
      return false;
    }

    const res = await VicarNet.updateDiscipline(this.discipline);
    if (res) {
      HomebrewManager.updateOwnDiscipline(this.discipline);
      return true;
    }

    return false;
  }

  private addLevel() {
    if (!this.discipline) {
      return;
    }

    if (this.currentLevel >= 10) {
      return;
    }

    if (!this.discipline.levels) {
      this.discipline.levels = {};
    }

    this.discipline.levels[this.currentLevel + 1] = [];
    this.$forceUpdate();
  }

  private async deleteLevel(k: number) {
    if (await this.confirm(this.$t('homebrew.editor.discipline.levels.delete.confirm', {lvl: k}).toString())) {
      if (!this.discipline) {
        return;
      }

      delete this.discipline.levels[k];
      this.$forceUpdate();
    }
  }

  private createNewAbility(levels: IDisciplineAbility[]) {
    if (!this.discipline) {
      return;
    }

    this.abilityEditModal.showCreate(this.discipline, ability => {
      ability.id = this.lastAbilityID + 1;
      levels.push(ability);
      this.$forceUpdate();
    });
  }

  private editAbility(levels: IDisciplineAbility[], ability: IDisciplineAbility, index: number) {
    if (!this.discipline) {
      return;
    }

    this.abilityEditModal.showEdit(this.discipline, ability, index, (ability, index) => {
      levels[index] = ability;
      this.$forceUpdate();
    });
  }

  private async deleteAbility(levels: IDisciplineAbility[], index: number) {
    if (!await this.confirm(this.$t('homebrew.editor.discipline.ability.delete.confirm', {name: levels[index].name}).toString())) {
      return;
    }

    levels.splice(index, 1);
    this.$forceUpdate();
  }

  private get lastAbilityID() {
    if (!this.discipline) {
      return 0;
    }

    let max = 0;
    for (const level of Object.values(this.discipline.levels)) {
      for (const ability of level) {
        if (ability.id > max) {
          max = ability.id;
        }
      }
    }

    return max;
  }

  private get currentLevel() {
    if (!this.discipline) {
      return 0;
    }
    return Object.keys(this.discipline.levels).length;
  }

  private get canSave() {
    return this.discipline && this.discipline.name.length > 0 && this.discipline.summary && this.discipline.summary.length > 0;
  }

  private get specialIcon() {
    return this.isInfoEditOpen ? "fas fa-times" : "fas fa-edit";
  }
}
</script>

<template>
  <HomebrewEditor :subject="discipline" :not-found-message="$t('homebrew.editor.discipline.notfound')"
                  :on-save="save" :can-save="canSave" :is-special-enabled="true" :special-icon="specialIcon"
                  @special="isInfoEditOpen = !isInfoEditOpen"
  >
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; overflow-y: auto" v-if="discipline">
      <div v-if="isInfoEditOpen" class="discipline-info-edit">
        <div class="form-group mb-0" style="width: 30%">
          <label>{{$t('homebrew.create.name')}}:</label>
          <input type="text" class="form-control" v-model="discipline.name"/>
        </div>
        <div class="form-group mb-0" style="width: 30%; margin-top: 0.5rem">
          <label>{{$t('homebrew.create.description')}}:</label>
          <textarea class="form-control" v-model="discipline.summary"/>
        </div>
      </div>

      <div style="width: 100%; display: flex; justify-content: center; align-items: center">
        <div class="discipline-levels">
          <h5>{{$t('homebrew.editor.discipline.levels')}}</h5>

          <div v-for="(l, k) in discipline.levels" class="discipline-level">
            <div style="width: 100%; border-bottom: 1px solid var(--primary-color); display: flex; align-items: flex-end; justify-content: space-between; padding-bottom: 0.5rem">
              <b style="font-size: 1.3rem">{{$t('homebrew.editor.discipline.levels.title', {lvl: k})}}</b>
              <div style="display: flex; gap: 0.5rem">
                <button class="btn btn-primary" style="font-size: 0.9rem" @click="createNewAbility(l)">{{$t('homebrew.editor.discipline.levels.addability')}}</button>
                <button class="btn btn-primary" style="font-size: 0.9rem" @click="deleteLevel(k)">{{$t('homebrew.editor.discipline.levels.delete')}}</button>
              </div>
            </div>
            <div style="width: 100%; display: flex; flex-direction: column; gap: 0.5rem">
              <div v-for="(a, i) in l" style="display: flex; padding: 0.5rem; align-items: center; justify-content: space-between">
                <span>{{a.name}}</span>
                <div style="display: flex; gap: 0.5rem">
                  <IconButton icon="fas fa-pen" style="width: 2rem; height: 2rem; font-size: 1rem" @click="editAbility(l, a, i)"/>
                  <IconButton icon="fas fa-x" style="width: 2rem; height: 2rem; font-size: 1rem" @click="deleteAbility(l, i)"/>
                </div>
              </div>
            </div>
          </div>

          <div v-if="currentLevel < 10" class="discipline-level" style="justify-content: center; align-items: center">
            <button class="btn btn-primary" @click="addLevel">{{$t('homebrew.editor.discipline.levels.add', {lvl: currentLevel + 1})}}</button>
          </div>
        </div>
      </div>
    </div>

    <DisciplineAbilityEditModal ref="abilityEditModal"/>
  </HomebrewEditor>
</template>

<style scoped lang="scss">
.discipline-info-edit {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border-bottom: 1px solid var(--primary-color);
  justify-content: center;
  align-items: center;
  padding: 1rem;
  font-size: 1.2rem;
}

.discipline-levels {
  width: 50%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-size: 1rem;
  h5 {
    text-align: center;
    font-weight: bold;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
  .discipline-level {
    border-radius: 1rem;
    border: 1px solid var(--primary-color);
    padding: 1rem;
    width: 100%;
    display: flex;
    flex-direction: column;
  }
}
</style>