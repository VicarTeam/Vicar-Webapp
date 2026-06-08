<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';
import {ICharacter} from "@/types/models";
import Modal from "@/components/modal/Modal.vue";
import Dropdown, {IOption} from "@/components/Dropdown.vue";
import TipButton from "@/components/editor/TipButton.vue";

interface IDrinkOption {
  id: number;
  name: any;
  name_hint?: any;
  max: number;
  time: (v: number) => any;
}

interface IDrinkOptionOut extends IDrinkOption {
  time: any;
  needed: number;
}

@Component({
  components: {TipButton, Dropdown, Modal}
})
export default class HuntCalculatorModal extends Vue {

  private show: boolean = false;
  private character: ICharacter = null!;
  private reduceTo: number = 0;
  private showDetails: boolean = false;

  public showModal(character: ICharacter) {
    this.character = character;
    this.reduceTo = 0;

    if (this.character.cache) {
      this.reduceTo = this.character.cache['huntCalculatorReduceTo'] || 0;
    }

    if (this.reduceTo > this.character.hunger) {
      this.reduceTo = this.character.hunger;
    }

    this.show = true;
  }

  private get reduceToOptions(): IOption[] {
    const options: IOption[] = [];
    for (let i = 0; i < this.character.hunger; i++) {
      options.push({value: i, name: this.$t('character.modals.hunt-calculator.reduce_to', {val: i}) as any});
    }
    return options;
  }

  private handleClose() {
    this.show = false;

    this.character.cache = this.character.cache || {};

    if (this.reduceTo > 0) {
      this.character.cache['huntCalculatorReduceTo'] = this.reduceTo;
    } else {
      delete this.character.cache['huntCalculatorReduceTo'];
    }
  }

  private getAllDrinkOptions(): IDrinkOption[] {
    return [
      {
        id: 0,
        max: 1,
        name: this.$t('character.modals.hunt-calculator.drink_opt.container'),
        time: () => this.$t('character.modals.hunt-calculator.drink_dur.round'),
      },
      {
        id: 1,
        max: 1,
        name: this.$t('character.modals.hunt-calculator.drink_opt.small_animal'),
        time: () => this.$t('character.modals.hunt-calculator.drink_dur.scene'),
      },
      {
        id: 2,
        max: 1,
        name: this.$t('character.modals.hunt-calculator.drink_opt.medium_animal'),
        time: () => this.$t('character.modals.hunt-calculator.drink_dur.round'),
      },
      {
        id: 3,
        max: 1,
        name: this.$t('character.modals.hunt-calculator.drink_opt.large_animal'),
        time: () => this.$t('character.modals.hunt-calculator.drink_dur.scene'),
      },
      {
        id: 4,
        max: 2,
        name: this.$t('character.modals.hunt-calculator.drink_opt.human'),
        name_hint: this.$t('character.modals.hunt-calculator.drink_opt.human.simple'),
        time: v => v === 1 ? this.$t('character.modals.hunt-calculator.drink_dur.rounds', {val: 3}) : this.$t('character.modals.hunt-calculator.drink_dur.scene'),
      },
      {
        id: 5,
        max: 4,
        name: this.$t('character.modals.hunt-calculator.drink_opt.human'),
        name_hint: this.$t('character.modals.hunt-calculator.drink_opt.human.danger'),
        time: v => this.$t('character.modals.hunt-calculator.drink_dur.rounds', {val: v}),
      },
      {
        id: 6,
        max: 5,
        name: this.$t('character.modals.hunt-calculator.drink_opt.human'),
        name_hint: this.$t('character.modals.hunt-calculator.drink_opt.human.fatal'),
        time: () => this.$t('character.modals.hunt-calculator.drink_dur.rounds', {val: 5}),
      }
    ];
  }

  private get drinkOptions(): IDrinkOptionOut[] {
    if (!this.character) {
      return [];
    }

    const to = this.reduceTo;
    const v = this.character.hunger - to;
    const bloodPotency = this.character.bloodPotency;

    const options: IDrinkOptionOut[] = [];
    for (const opt of this.getAllDrinkOptions()) {
      if (opt.id <= 3) {
        if (bloodPotency === 2) {
          opt.max = opt.max / 2; // animals and containers are halved at BP 2
        } else if (bloodPotency > 2) {
          continue; // animals and containers are not available at BP 3+
        }
      }

      if (opt.id > 3) {
        if (bloodPotency >= 4 && bloodPotency <= 5) {
          opt.max = opt.max - 1; // humans have 1 less at BP 4 and 5
        }

        if (bloodPotency >= 6 && bloodPotency <= 9) {
          opt.max = opt.max - 2; // humans have 2 less at BP 6 and 9
        }

        if (bloodPotency >= 10) {
          opt.max = opt.max - 3; // humans have 3 less at BP 10
        }

        if (to < 2) {
          if (bloodPotency >= 5 && bloodPotency <= 7) {
            if (opt.id !== 6) {
              continue; // humans must be fatal drained at BP 5 and 7, if dranking under 2
            }
          }
        }

        if (to < 3) {
          if (bloodPotency >= 8 && bloodPotency <= 10) {
            if (opt.id !== 6) {
              continue; // humans must be fatal drained at BP 8 and 10, if dranking under 3
            }
          }
        }
      }

      if (opt.max <= 0) {
        continue;
      }

      options.push({
        ...opt,
        time: opt.time(v),
        needed: Math.ceil(v / opt.max),
      });
    }

    return options;
  }

  private get drinkDetails(): string[] {
    if (!this.character) {
      return [];
    }

    const to = this.reduceTo;
    const bloodPotency = this.character.bloodPotency;

    const details: string[] = [];
    const add = (str: string) => {
      if (!details.includes(str)) {
        details.push(str);
      }
    };
    for (const opt of this.getAllDrinkOptions()) {
      if (opt.id <= 3) {
        if (bloodPotency === 2) {
          opt.max = opt.max / 2; // animals and containers are halved at BP 2
          add("2");
        } else if (bloodPotency > 2) {
          add("1");
          continue; // animals and containers are not available at BP 3+
        }
      }

      if (opt.id > 3) {
        if (bloodPotency >= 4 && bloodPotency <= 5) {
          opt.max = opt.max - 1; // humans have 1 less at BP 4 and 5
          add("3");
        }

        if (bloodPotency >= 6 && bloodPotency <= 9) {
          opt.max = opt.max - 2; // humans have 2 less at BP 6 and 9
          add("4");
        }

        if (bloodPotency >= 10) {
          opt.max = opt.max - 3; // humans have 3 less at BP 10
          add("5");
        }

        if (to < 2) {
          if (bloodPotency >= 5 && bloodPotency <= 7) {
            if (opt.id !== 6) {
              add("6");
              continue; // humans must be fatal drained at BP 5 and 7, if dranking under 2
            }
          }
        }

        if (to < 3) {
          if (bloodPotency >= 8 && bloodPotency <= 10) {
            if (opt.id !== 6) {
              add("7"); // humans must be fatal drained at BP 8 and 10, if dranking under 3
            }
          }
        }
      }
    }

    return details;
  }
}
</script>

<template>
  <Modal :shown="show" @close="handleClose" v-if="character">
    <div class="w-600 d-flex justify-content-center align-items-center flex-column" style="gap: 0.5rem">
      <b>{{$t('character.modals.hunt-calculator', {name: character.name})}}:</b>

      <div style="display: flex; flex-direction: column; gap: 1rem; justify-content: flex-start; align-items: center">
        <span>{{$t('character.modals.hunt-calculator.current')}}: <b>{{character.hunger}}</b></span>
        <select v-if="character.hunger > 0" v-model.number="reduceTo" class="form-control">
          <option v-for="option in reduceToOptions" :key="option.value" :value="option.value">
            {{option.name}}
          </option>
        </select>
      </div>

      <div style="width: 100%; height: 1px; background-color: var(--primary-color); margin-top: 1rem"></div>
      <span>
        {{$t('character.modals.hunt-calculator.restriction')}}:
        <b>{{character.bloodPotency < 3 ? $t('character.modals.hunt-calculator.restriction.none') : $t('character.modals.hunt-calculator.restriction.living')}}</b>
        <TipButton v-if="character.bloodPotency >= 3" :content="$t('character.modals.hunt-calculator.restriction.hint')" style="margin-left: 0.5rem"/>
      </span>
      <div style="width: 100%; height: 1px; background-color: var(--primary-color); margin-top: 1rem"></div>

      <div v-if="character.hunger > 0" style="display: flex; flex-direction: column; gap: 1rem">
        <table class="table">
          <thead>
          <tr>
            <th>{{$t('character.modals.hunt-calculator.table.source')}}</th>
            <th>{{$t('character.modals.hunt-calculator.table.duration')}}</th>
            <th>{{$t('character.modals.hunt-calculator.table.amount')}}</th>
            <th>{{$t('character.modals.hunt-calculator.table.needed')}}</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(o, i) in drinkOptions" :key="i">
            <td>
              {{o.name}}
              <span v-if="o.name_hint">({{o.name_hint}})</span>
            </td>
            <td>
              {{o.time}}
            </td>
            <td>
              {{o.max}}
            </td>
            <td>{{o.needed}}</td>
          </tr>
          </tbody>
        </table>
      </div>

      <div style="width: 100%; height: 1px; background-color: var(--primary-color); margin-top: 1rem"></div>
      <button class="btn" style="margin-top: 1rem" @click="showDetails = !showDetails">
        <i class="fas fa-chevron-down" :class="showDetails ? 'fa-rotate-180' : ''"/>
        {{$t('character.modals.hunt-calculator.details')}}
      </button>

      <ul v-if="showDetails">
        <li v-for="detail in drinkDetails" :key="detail">
          {{$t('character.modals.hunt-calculator.details.' + detail)}}
        </li>
      </ul>
    </div>
  </Modal>
</template>

<style scoped lang="scss">

</style>