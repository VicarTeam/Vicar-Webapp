<script lang="ts">
import {Vue, Component, Prop} from 'vue-property-decorator';
import {IDiscipline, IHomebrewClan} from "@/types/data";
import {VicarNet} from "@/libs/io/vicar-net";
import HomebrewEditor from "@/components/homebrew/HomebrewEditor.vue";
import {HomebrewManager} from "@/libs/data/homebrew-manager";
import DataManager from "@/libs/data/data-manager";
import IconButton from "@/components/IconButton.vue";

@Component({
  components: {IconButton, HomebrewEditor}
})
export default class ClanEditorView extends Vue {

  @Prop()
  private clanId!: number;

  private clan: IHomebrewClan|null = null;
  private disciplines: IDiscipline[] = [];
  private selectedDiscipline: number = -1;

  async mounted() {
    this.disciplines = DataManager.normalDisciplinesAsArray();
    this.clan = (await VicarNet.getClan(this.clanId))?.clan || null;
  }

  private async save(): Promise<boolean> {
    if (!this.canSave) {
      return false;
    }

    if (!this.clan) {
      return false;
    }

    const res = await VicarNet.updateClan(this.clan);
    if (res) {
      HomebrewManager.updateOwnClan(this.clan);
      return true;
    }

    return false;
  }

  private removeDiscipline(id: number) {
    if (!this.clan) {
      return;
    }

    const index = this.clan.disciplines.indexOf(id);
    if (index >= 0) {
      this.clan.disciplines.splice(index, 1);
    }
  }

  private addDiscipline() {
    if (!this.clan) {
      return;
    }

    if (this.selectedDiscipline >= 0) {
      this.clan.disciplines.push(this.selectedDiscipline);
      this.selectedDiscipline = -1;
    }
  }

  private getDisciplineName(id: number): string {
    const d = this.disciplines.find(d => d.id === id);
    return d ? d.name : "";
  }

  private get canSave() {
    return this.clan !== null && this.clan.name.length > 0 && this.clan.slogan.length > 0
      && this.clan.symbol && this.clan.symbol.length > 0
      && this.clan.description.length > 0 && this.clan.curse.length > 0
      && this.clan.disciplines.length > 0;
  }
}
</script>

<template>
  <HomebrewEditor :subject="clan" :not-found-message="$t('homebrew.editor.clan.notfound')"
                  :on-save="save" :can-save="canSave"
  >
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; overflow-y: auto; align-items: center" v-if="clan">
      <div class="w-lg-600 d-flex flex-column" style="gap: 0.8rem; font-size: 1rem; padding: 1rem">
        <div class="form-group mb-0">
          <label>{{$t('homebrew.create.name')}}:</label>
          <input type="text" class="form-control" v-model="clan.name"/>
        </div>
        <div style="width: 100%; display: flex; gap: 1rem; justify-content: center">
          <div class="form-group mb-0" style="width: 50%">
            <label>{{$t('homebrew.create.clan.slogan')}}:</label>
            <input type="text" class="form-control" v-model="clan.slogan"/>
          </div>
          <div class="form-group mb-0" style="width: 50%">
            <label>{{$t('homebrew.create.clan.symbol')}}:</label>
            <input type="text" class="form-control" v-model="clan.symbol"/>
          </div>
        </div>
        <div style="width: 100%; display: flex; gap: 1rem; justify-content: center">
          <div class="form-group mb-0" style="width: 50%">
            <label>{{$t('homebrew.create.description')}}:</label>
            <textarea class="form-control" v-model="clan.description" style="resize: vertical"/>
          </div>
          <div class="form-group mb-0" style="width: 50%">
            <label>{{$t('homebrew.create.clan.bane')}}:</label>
            <textarea class="form-control" v-model="clan.curse" style="resize: vertical"/>
          </div>
        </div>
        <div style="width: 100%; display: flex; flex-direction: column">
          <label>{{$t('homebrew.editor.clan.disciplines')}}:</label>
          <div class="p-10" style="border: 1px solid var(--primary-color); border-radius: 1rem">
            <div style="display: flex; gap: 0.5rem">
              <select class="form-control" v-model="selectedDiscipline">
                <option :value="-1" disabled>{{$t('homebrew.editor.clan.disciplines.select')}}</option>
                <option v-for="d in disciplines" :value="d.id">{{d.name}}</option>
              </select>
              <button class="btn btn-primary" @click="addDiscipline">{{$t('homebrew.editor.clan.disciplines.add')}}</button>
            </div>
            <template v-if="clan.disciplines.length > 0">
              <div style="width: 100%; height: 1px; background-color: var(--primary-color); margin-top: 0.5rem; margin-bottom: 0.5rem"></div>
              <div style="display: flex; flex-direction: column; gap: 0.2rem">
                <div v-for="d in clan.disciplines" style="display: flex; justify-content: space-between">
                  <span>{{getDisciplineName(d)}}</span>
                  <IconButton icon="fas fa-x" style="width: 2rem; height: 2rem; font-size: 1rem" @click="removeDiscipline(d)"/>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </HomebrewEditor>
</template>