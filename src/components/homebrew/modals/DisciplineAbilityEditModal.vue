<script lang="ts">
import {Vue, Component, Watch} from 'vue-property-decorator';
import {IDiscipline, IDisciplineAbility, IDisciplineCombo, IHomebrewDiscipline} from "@/types/data";
import Modal from "@/components/modal/Modal.vue";
import DataManager from "@/libs/data/data-manager";

type EditCallback = (ability: IDisciplineAbility, index: number) => void;
type CreateCallback = (ability: IDisciplineAbility) => void;

@Component({
  components: {Modal}
})
export default class DisciplineAbilityEditModal extends Vue {

  private visible: boolean = false;
  private create: boolean = false;
  private index: number = -1;
  private discipline: IHomebrewDiscipline = null!;
  private ability: IDisciplineAbility = null!;
  private cb: EditCallback|CreateCallback = null!;

  private withCombo: boolean = false;
  private combo: IDisciplineCombo|null = null;

  public showEdit(discipline: IHomebrewDiscipline, ability: IDisciplineAbility, index: number, cb: EditCallback) {
    this.create = false;
    this.ability = ability;
    this.index = index;
    this.cb = cb;
    this.discipline = discipline;
    this.withCombo = false;
    this.combo = null;
    this.visible = true;
  }

  public showCreate(discipline: IHomebrewDiscipline, cb: CreateCallback) {
    this.create = true;
    this.ability = {
      id: -1,
      name: "",
      summary: "",
      costs: "",
      system: "",
      alternatives: [],
      duration: ""
    };
    this.index = -1;
    this.cb = cb;
    this.withCombo = false;
    this.combo = null;
    this.discipline = discipline;
    this.visible = true;
  }

  private finish() {
    if (!this.canFinish) {
      return;
    }

    if (this.ability.diceSupplies && this.ability.diceSupplies.trim().length <= 0) {
      this.ability.diceSupplies = undefined;
    }

    if (this.withCombo && this.combo) {
      this.ability.combination = this.combo;
    } else {
      this.ability.combination = undefined;
    }

    if (this.create) {
      (this.cb as CreateCallback)(this.ability);
    } else {
      (this.cb as EditCallback)(this.ability, this.index);
    }

    this.visible = false;
  }

  private get possibleRequirements(): {id: number, text: string}[] {
    const res: {id: number, text: string}[] = [];

    for (const [lvl, abilities] of Object.entries(this.discipline.levels)) {
      for (const ability of abilities) {
        res.push({id: ability.id, text: this.$t('editor.disciplines.level') + " " + lvl + " - " + ability.name});
      }
    }

    return res.sort((a, b) => a.text.localeCompare(b.text));
  }

  private get comboDisciplines(): IDiscipline[] {
    return DataManager.normalDisciplinesAsArray().filter(d => d.id !== this.discipline.id);
  }

  private get canFinish() {
    return this.ability.name.length > 0 && this.ability.summary.length > 0 && this.ability.system.length > 0 && this.ability.costs.length > 0;
  }

  @Watch("withCombo")
  private onComboChanged() {
    if (this.withCombo) {
      this.combo = {
        id: -1,
        level: -1
      };
    } else {
      this.combo = null;
    }
  }
}
</script>

<template>
  <Modal :shown="visible" @close="visible = false">
    <div class="w-550 d-flex flex-column" style="gap: 0.8rem; font-size: 1rem">
      <div class="form-group mb-0">
        <label>{{$t('homebrew.editor.discipline.ability.name')}}:</label>
        <input type="text" class="form-control" v-model="ability.name"/>
      </div>

      <div class="form-group mb-0">
        <label>{{$t('editor.disciplines.requirement')}}:</label>
        <select class="form-control" v-model="ability.requirement">
          <option :value="undefined">{{$t('homebrew.editor.discipline.ability.norequirement')}}</option>
          <option v-for="req in possibleRequirements" :value="req.id">{{req.text}}</option>
        </select>
      </div>

      <div class="form-group mb-0 p-5" style="border: 1px solid var(--primary-color); border-radius: 1rem">
        <label>{{$t('homebrew.editor.discipline.ability.combo')}}:</label>
        <select class="form-control" v-model="withCombo">
          <option :value="true">{{$t('homebrew.editor.discipline.ability.combo.yes')}}</option>
          <option :value="false">{{$t('homebrew.editor.discipline.ability.combo.no')}}</option>
        </select>
        <template v-if="withCombo && combo">
          <div style="width: 100%; height: 1px; background-color: var(--primary-color); margin-top: 1rem; margin-bottom: 1rem"></div>
          <div style="display: flex; gap: 0.5rem">
            <div class="form-group mb-0" style="width: 50%">
              <label>{{$t('homebrew.editor.discipline.ability.combo.discipline')}}:</label>
              <select class="form-control" v-model="combo.id">
                <option v-for="d in comboDisciplines" :value="d.id">{{d.name}}</option>
              </select>
            </div>
            <div class="form-group mb-0" style="width: 50%">
              <label>{{$t('homebrew.editor.discipline.ability.combo.level')}}:</label>
              <select class="form-control" v-model="combo.level">
                <option v-for="i in 10" :value="i">{{i}}</option>
              </select>
            </div>
          </div>
        </template>
      </div>

      <div style="width: 100%; display: flex; gap: 1rem; justify-content: center">
        <div class="form-group mb-0" style="width: 33%">
          <label>{{$t('editor.disciplines.costs')}}:</label>
          <input type="text" class="form-control" v-model="ability.costs"/>
        </div>
        <div class="form-group mb-0" style="width: 33%">
          <label>{{$t('editor.disciplines.dices')}}:</label>
          <input type="text" class="form-control" v-model="ability.diceSupplies"/>
        </div>
        <div class="form-group mb-0" style="width: 33%">
          <label>{{$t('character.advanced.disciplines.minpotency')}}:</label>
          <select class="form-control" v-model="ability.minBloodPotency">
            <option :value="undefined">{{$t('homebrew.editor.discipline.ability.nominbloodpotency')}}</option>
            <option v-for="i in 10" :value="i">{{i}}</option>
          </select>
        </div>
      </div>
      <div style="width: 100%; display: flex; gap: 1rem; justify-content: center">
        <div class="form-group mb-0" style="width: 50%">
          <label>{{$t('homebrew.editor.discipline.ability.summary')}}:</label>
          <textarea class="form-control" v-model="ability.summary" style="resize: none"/>
        </div>
        <div class="form-group mb-0" style="width: 50%">
          <label>{{$t('editor.disciplines.system')}}:</label>
          <textarea class="form-control" v-model="ability.system" style="resize: none"/>
        </div>
      </div>
      <div class="form-group mb-0">
        <label>{{$t('editor.disciplines.duration')}}:</label>
        <input type="text" class="form-control" v-model="ability.duration"/>
      </div>
      <div style="width: 100%; display: flex; justify-content: center; align-items: center; margin-top: 1rem">
        <button class="btn btn-primary" @click="finish()" :disabled="!canFinish">{{$t('homebrew.editor.discipline.ability.finishbtn')}}</button>
      </div>
    </div>
  </Modal>
</template>