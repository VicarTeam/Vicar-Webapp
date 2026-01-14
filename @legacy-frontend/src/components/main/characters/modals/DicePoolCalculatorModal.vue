<script lang="ts">
import {Vue, Component} from 'vue-property-decorator';
import {AttributeKeys, getHumanInteractionMalus, ICharacter} from "@/types/models";
import Modal from "@/components/modal/Modal.vue";
import Dropdown, {IOption} from "@/components/Dropdown.vue";
import DataManager from "@/libs/data/data-manager";
import {VicarTT} from "@/libs/io/vicar-tt";

@Component({
  components: {Dropdown, Modal}
})
export default class DicePoolCalculatorModal extends Vue {

  private show: boolean = false;
  private character: ICharacter = null!;
  private isDiscipline: boolean = false;

  private bonus: string = "";
  private selectedAttribute: AttributeKeys|null = null;
  private selectedSkill: number|null = null;
  private difficulty: string = "";
  private human: boolean = false;

  public showModal(character: ICharacter, isDiscipline: boolean = false) {
    this.character = character;
    this.isDiscipline = isDiscipline;
    this.selectedAttribute = null;
    this.selectedSkill = null;
    this.human = false;
    this.bonus = "";

    if (this.character.cache) {
      this.selectedAttribute = this.character.cache['dicePoolCalculatorAttribute'] || null;
      this.selectedSkill = this.character.cache['dicePoolCalculatorSkill'] || null;
      this.bonus = this.character.cache['dicePoolCalculatorBonus'] || "";
    }

    this.show = true;
  }

  private sendDiceRoll() {
    const pool = this.pool;
    if (!pool) {
      return;
    }

    const attr = this.attrOptions.find(x => x.value === this.selectedAttribute);
    const skill = this.skillOptions.find(x => x.value === this.selectedSkill);
    const attrName = (attr ? attr.name : "").replace(/\(\d+\)/g, "").trim();
    const skillName = (skill ? skill.name : "").replace(/\(\d+\)/g, "").trim();

    let difficulty: number|undefined = undefined;
    if (this.difficulty.trim().length > 0 && !isNaN(parseInt(this.difficulty))) {
      difficulty = parseInt(this.difficulty);
    }

    VicarTT.rollNamedDiceFor(this.character, `${attrName} + ${skillName}`, pool.simple, pool.hunger, difficulty);

    this.show = false;
  }

  private getAttrVal(attr: AttributeKeys): number {
    for (const i of this.character.categories) {
      for (const j of i.attributes) {
        if (j.key === attr) {
          return j.value;
        }
      }
    }

    return 0;
  }

  private get pool(): {total: number, simple: number, hunger: number}|null {
    if (this.selectedAttribute === null || this.selectedSkill === null) {
      return null;
    }

    const attr = this.getAttrVal(this.selectedAttribute);
    const skill = this.selectedSkill;
    let bonus = this.isDiscipline ? DataManager.selectedLanguage.bloodPotencyTable.find(x => x.value === this.character.bloodPotency)!.disciplineBonus : 0;

    if (this.bonus.trim().length > 0 && !isNaN(parseInt(this.bonus))) {
      bonus += parseInt(this.bonus);
    }

    let total = attr + skill + bonus;
    if (this.human) {
      const malus = getHumanInteractionMalus(this.character);
      if (malus === Number.MIN_SAFE_INTEGER) {
        return {total: -1, simple: 0, hunger: 0};
      }

      total -= malus;
      if (total <= 0) {
        total = 1;
      }
    }

    const hunger = Math.min(this.character.hunger, total);
    const simple = total - hunger;

    return {total, simple, hunger};
  }

  private get attrOptions(): IOption[] {
    const opt = (key: AttributeKeys) => {
      return {
        name: this.$t(`data.attribute.${key}`).toString() + ` (${this.getAttrVal(key)})`,
        value: key
      };
    }

    return [
      opt(AttributeKeys.Strength),
      opt(AttributeKeys.Dexterity),
      opt(AttributeKeys.Stamina),
      opt(AttributeKeys.Charisma),
      opt(AttributeKeys.Manipulation),
      opt(AttributeKeys.Composure),
      opt(AttributeKeys.Intelligence),
      opt(AttributeKeys.Wits),
      opt(AttributeKeys.Resolve),
    ].sort((a, b) => a.name.localeCompare(b.name));
  }

  private get skillOptions(): IOption[] {
    const opts: IOption[] = [];

    for (const c of this.character.categories) {
      opts.push({
        name: this.$t('data.category.' + c.name).toString(),
        value: '',
        isCategory: true
      });

      const skillOpts: IOption[] = [];
      for (const i of c.skills) {
        skillOpts.push({
          name: this.$t('data.skill.' + i.key).toString() + ` (${i.value})`,
          value: i.value
        });
      }
      opts.push(...skillOpts.sort((a, b) => a.name.localeCompare(b.name)));
    }

    if (this.character.disciplines.length > 0) {
      opts.push({
        name: this.$t('editor.clan.disciplines').toString(),
        value: '',
        isCategory: true
      });

      const discOpts: IOption[] = [];
      for (const i of this.character.disciplines) {
        discOpts.push({
          name: i.discipline.name + ` (${i.currentLevel})`,
          value: i.currentLevel
        });
      }

      opts.push(...discOpts.sort((a, b) => a.name.localeCompare(b.name)));
    }

    const opt = (key: AttributeKeys) => {
      return {
        name: this.$t(`data.attribute.${key}`).toString() + ` (${this.getAttrVal(key)})`,
        value: this.getAttrVal(key)
      };
    }

    opts.push({
      name: this.$t('viewer.tab.attributes').toString(),
      value: '',
      isCategory: true
    });

    opts.push(opt(AttributeKeys.Strength));
    opts.push(opt(AttributeKeys.Dexterity));
    opts.push(opt(AttributeKeys.Stamina));
    opts.push(opt(AttributeKeys.Charisma));
    opts.push(opt(AttributeKeys.Manipulation));
    opts.push(opt(AttributeKeys.Composure));
    opts.push(opt(AttributeKeys.Intelligence));
    opts.push(opt(AttributeKeys.Wits));
    opts.push(opt(AttributeKeys.Resolve));

    return opts;
  }

  private handleClose() {
    this.show = false;
    this.character.cache = this.character.cache || {};

    if (this.selectedAttribute) {
      this.character.cache['dicePoolCalculatorAttribute'] = this.selectedAttribute;
    } else {
      delete this.character.cache['dicePoolCalculatorAttribute'];
    }

    if (this.selectedSkill) {
      this.character.cache['dicePoolCalculatorSkill'] = this.selectedSkill;
    } else {
      delete this.character.cache['dicePoolCalculatorSkill'];
    }

    if (this.bonus) {
      this.character.cache['dicePoolCalculatorBonus'] = this.bonus;
    } else {
      delete this.character.cache['dicePoolCalculatorBonus'];
    }
  }
}
</script>

<template>
  <Modal :shown="show" @close="handleClose" v-if="character">
    <div class="w-400 d-flex justify-content-center align-items-center flex-column" style="gap: 0.5rem">
      <b>{{$t('character.modals.pool-calcuator', {name: this.character.name})}}:</b>
      <div style="display: flex; flex-direction: row; gap: 1rem; justify-content: center; align-items: center">
        <Dropdown :options="attrOptions" v-model="selectedAttribute" :placeholder="$t('character.modals.pool-calcuator.attribute')" ref="attrDropdown"/>
        <Dropdown :options="skillOptions" v-model="selectedSkill" :placeholder="$t('character.modals.pool-calcuator.skill')"/>
      </div>
      <div style="width: 100%; height: 1px; background-color: var(--primary-color); margin-top: 1rem"></div>
      <div style="display: flex; margin-top: 1rem; gap: 1rem; flex-direction: column">
        <input class="form-control" type="text" v-model="bonus" :placeholder="$t('character.modals.pool-calcuator.bonus')" style="width: 100%"/>

        <div class="custom-checkbox" style="width: 100%">
          <input type="checkbox" id="is-disc" v-model="isDiscipline">
          <label for="is-disc">{{$t('character.modals.pool-calcuator.discipline')}}</label>
        </div>

        <div class="custom-checkbox d-flex align-items-center" style="pointer-events: all">
          <input type="checkbox" id="dicehuman" v-model="human">
          <label for="dicehuman">{{$t('character.dice-pool.human')}}</label>
        </div>
      </div>
      <div style="width: 100%; height: 1px; background-color: var(--primary-color); margin-top: 1rem"></div>
      <div style="width: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center" v-if="pool">
        <span v-if="pool.hunger > 0">
          <b><u>{{pool.total}}</u> </b>
          {{$t('character.modals.pool-calcuator.result.text.hunger.1')}}
          <b style="color: var(--primary-color)">{{pool.hunger}}</b>
          {{$t('character.modals.pool-calcuator.result.text.hunger.2')}}
          <b>{{pool.simple}}</b>
          {{$t('character.modals.pool-calcuator.result.text.hunger.3')}}
        </span>
        <span v-else-if="pool.total === -1">{{$t('character.dice-pool.impossible')}}</span>
        <span v-else><b>{{pool.total}} </b>{{$t('character.modals.pool-calcuator.result.text.no-hunger')}}</span>

        <template v-if="character.connectedFoundryId">
          <div style="width: 100%; height: 1px; background-color: var(--primary-color); margin-top: 1rem"></div>
          <div style="display: flex; flex-direction: row; justify-content: center; align-items: center; margin-top: 1rem">
            <input class="form-control" type="text" v-model="difficulty" :placeholder="$t('character.vicartt.difficulty')"/>
            <button class="btn btn-primary" @click="sendDiceRoll">{{$t('character.vicartt.roll')}}</button>
          </div>
        </template>
      </div>
    </div>
  </Modal>
</template>

<style scoped lang="scss">

</style>