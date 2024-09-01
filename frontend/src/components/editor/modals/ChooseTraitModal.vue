<template>
  <Modal :shown="show" v-if="editingCharacter && data" @close="show = false">
    <div style="width: 60rem; display: flex; flex-direction: column; gap: 0.5rem">
      <div style="width: 100%; display: flex; gap: 1rem; align-items: center;">
        <b style="flex-grow: 1">{{$t('editor.traits.modal.title.' + (isFlaw ? 'flaw' : 'trait'))}}:</b>
        <select class="form-control categorized" v-model="selectedPack" @change="selectTrait(null)">

          <option class="category" disabled>{{$t('data.trait.merits')}}</option>
          <option v-for="m in merits" :value="m">{{m.name}}{{getTraitPackBonus(m, "merits", isFlaw) > 0 ? '(+' + getTraitPackBonus(m, "merits", isFlaw) + ')' : ''}}</option>

          <option class="category" disabled>{{$t('data.trait.backgrounds')}}</option>
          <option v-for="b in backgrounds" :value="b">{{b.name}}{{getTraitPackBonus(b, "backgrounds", isFlaw) > 0 ? '(+' + getTraitPackBonus(b, "backgrounds", isFlaw) + ')' : ''}}</option>

          <option disabled></option>
          <option style="font-style: italic; text-align: center" :value="_customPack">[GM] {{$t('editor.traits.modal.custom')}}</option>
        </select>
      </div>

      <div style="width: 100%; display: flex; gap: 2rem; flex-direction: column" v-if="selectedPack && selectedPack.id !== _customPack.id">
        <small>{{selectedPack.description}}</small>

        <div class="trait-pack-content">
          <div class="traits">
            <div class="trait" v-for="trait in traits" @click="selectTrait(trait)" :class="{'selected': trait === selectedTrait}">
              <b>{{trait.name}}</b> - <small><i><b>{{$t('editor.traits.modal.trait.level')}}</b>: {{trait.level}}</i></small>
            </div>
          </div>

          <div class="border"></div>

          <div class="info" :class="{'not-selected': !selectedTrait}">
            <small v-if="!selectedTrait">{{$t('editor.traits.modal.info.notselected')}}</small>
            <small v-else>{{selectedTrait.description}}</small>
          </div>
        </div>
      </div>
      <div style="width: 100%; display: flex; gap: 2rem; flex-direction: column" v-else-if="selectedPack && selectedPack.id === _customPack.id">
        <small>{{selectedPack.description}}</small>

        <div style="width: 100%; display: flex; flex-direction: column">
          <div class="form-group">
            <label>{{$t('editor.traits.modal.custom.type')}}:</label>
            <select class="form-control" v-model="customTraitType">
              <option value="merits">{{$t('editor.traits.modal.custom.type.merit')}}</option>
              <option value="backgrounds">{{$t('editor.traits.modal.custom.type.background')}}</option>
            </select>
          </div>
          <div class="form-group">
            <label>{{$t('editor.traits.modal.trait.level')}}:</label>
            <select class="form-control" v-model="customTraitLevel">
              <option v-for="i in 5" :value="i">{{i}}</option>
            </select>
          </div>
          <div class="form-group">
            <label>{{$t('character.inventory.add.custom.name')}}:</label>
            <input class="form-control" type="text" v-model="customTraitName"/>
          </div>
          <div class="form-group">
            <label>{{$t('character.inventory.add.custom.description')}}:</label>
            <textarea class="form-control" v-model="customTraitDescription" style="resize: horizontal"/>
          </div>
          <div class="form-group">
            <label>{{$t('editor.traits.modal.optionals.suffix')}}:</label>
            <input class="form-control" type="text" v-model="customTraitSpecialization"/>
          </div>
        </div>
      </div>

      <div class="optional-trait-options" v-if="selectedTrait">
        <div class="form-group" style="width: 50%">
          <label>{{$t('editor.traits.modal.optionals.level')}}:</label>
          <input class="form-control" type="number" v-model="customLevel" :min="minCustomLevel" :max="maxCustomLevel"/>
        </div>
        <div class="form-group" style="width: 50%">
          <label>{{$t('editor.traits.modal.optionals.suffix')}}:</label>
          <input class="form-control" type="text" v-model="specialization"/>
        </div>
      </div>

      <div style="margin-top: 1rem; text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center">
        <span v-if="selectedTrait && calculateCosts" class="mb-10">{{$t('viewer.modal.level.costs', {xp: calculateCosts(this.selectedTrait, this.customLevel)})}}</span>
        <button class="btn btn-primary" style="width: fit-content" :disabled="!isReady" @click="addSelectedTrait">{{$t('editor.choose')}}</button>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import Modal from "@/components/modal/Modal.vue";
import {State} from "vuex-class";
import {ICharacter, IUsingTraitPacks} from "@/types/models";
import {ITrait, ITraitPack, TraitSpecialRules} from "@/types/data";
import DataManager from "@/libs/data/data-manager";
import {restrictionResolver} from "@/libs/resolvers/restriction-resolver";
import PTActionHandler from "@/libs/ptaction-handler";
import CharacterStorage from "@/libs/io/character-storage";

export type ChooseTraitData = {
  merits: ITraitPack[];
  backgrounds: ITraitPack[];
}

export type CostsCalculationCallback = (trait: ITrait, level: number) => number;

const StatusId: number = 11;

@Component({
  components: {Modal}
})
export default class ChooseTraitModal extends Vue {

  @State("editingCharacter")
  private editingCharacter!: ICharacter|undefined;

  private selectedPack: ITraitPack|null = null;
  private selectedTrait: ITrait|null = null;

  private customLevel: number = 0;
  private maxCustomLevel: number = 0;
  private specialization: string = "";

  private show: boolean = false;
  private isFlaw: boolean = false;
  private pointsLeft: number = 0;
  private data: ChooseTraitData = null!;

  private calculateCosts: CostsCalculationCallback|null = null;

  private _customPack: ITraitPack = null!;
  private customTraitType: "merits"|"backgrounds" = "merits";
  private customTraitLevel: number = 1;
  private customTraitName: string = "";
  private customTraitDescription: string = "";
  private customTraitSpecialization: string = "";

  mounted() {
    this.data = {
      backgrounds: DataManager.selectedLanguage.books.flatMap(book => {
        if (book && book.backgrounds) {
          return book.backgrounds;
        }
        return [];
      }),
      merits: DataManager.selectedLanguage.books.flatMap(book => {
        if (book && book.merits) {
          return book.merits;
        }
        return [];
      })
    };

    this._customPack = {
      id: -42,
      type: "merits",
      name: this.$t("editor.traits.modal.custom").toString(),
      description: this.$t("editor.traits.modal.custom.desc").toString(),
      isCombinable: false,
      specialRules: TraitSpecialRules.None,
      advantages: [],
      disadvantages: []
    };
  }

  public showModal(isFlaw: boolean, pointsLeft: number, callback: CostsCalculationCallback|null = null) {
    this.selectedTrait = null;
    this.selectedPack = null;
    this.isFlaw = isFlaw;
    this.pointsLeft = pointsLeft;
    this.calculateCosts = callback;
    this.customLevel = 0;
    this.specialization = "";
    this.customTraitLevel = 1;
    this.customTraitName = "";
    this.customTraitDescription = "";
    this.customTraitSpecialization = "";
    this.customTraitType = "merits";
    this.show = true;
  }

  private addSelectedTrait() {
    if (!this.isReady || !this.selectedPack || !this.editingCharacter) {
      return;
    }

    const isCustom = this.selectedPack.id === this._customPack.id;

    if (!isCustom) {
      const upack = PTActionHandler.initializeTraitPack(this.editingCharacter, this.selectedPack, this.selectedPack.type);
      (this.isFlaw ? upack.flawTraits : upack.traits).push({
        ...this.selectedTrait!,
        customLevel: this.customLevel,
        suffix: this.specialization,
        isLocked: false,
        isManual: true
      });

      if (this.calculateCosts) {
        const costs = this.calculateCosts(this.selectedTrait!, this.customLevel);
        this.editingCharacter.usedExp = (this.editingCharacter.usedExp || 0) + costs;
        this.editingCharacter.exp -= costs;
        CharacterStorage.saveCharacter(this.editingCharacter);
      }
    } else {
      const upack = PTActionHandler.initializeTraitPack(this.editingCharacter, this._customPack, this.customTraitType);
      (this.isFlaw ? upack.flawTraits : upack.traits).push({
        id: 42 * Date.now(),
        name: this.customTraitName,
        description: this.customTraitDescription,
        level: this.customTraitLevel as any,
        customLevel: this.customTraitLevel,
        suffix: this.customTraitSpecialization,
        isLocked: false,
        isManual: true,
        isRepeatable: false,
        actions: []
      });
    }

    this.show = false;
  }

  private getTraitPackBonus(pack: ITraitPack, type: "backgrounds"|"merits", isFlaw: boolean) {
    return this.getTraitPackBonusSpread(pack, type, isFlaw)?.points ?? 0;
  }

  private getTraitPackBonusSpread(pack: ITraitPack, type: "backgrounds"|"merits", isFlaw: boolean) {
    return this.editingCharacter!.requiredPointSpreads.find(s => s.type === type && s.isFlaw === isFlaw && s.packId === pack.id);
  }

  private selectTrait(trait: ITrait) {
    this.selectedTrait = trait;
    this.specialization = "";
    if (trait) {
      this.customLevel = trait.level;
      this.maxCustomLevel = this.getMaxCustomLevel();
    }
  }

  private filterTraitPacks(packs: ITraitPack[]): ITraitPack[] {
    return DataManager.filterRestrictions(this.editingCharacter, packs).filter(pack => {
      return this.filterTraits(pack!, [...pack![this.isFlaw ? "disadvantages" : "advantages"]]).length > 0;
    });
  }

  private filterTraits(pack: ITraitPack, traits: ITrait[]): ITrait[] {
    if (!this.isFlaw && pack.id === StatusId && this.editingCharacter!.clan.id === 15 && !this.calculateCosts) {
      return []; // Caitiffs aren't allowed to use positive status background when creating char
    }

    const pointsRequirement = traits.filter(t => t.level <= this.pointsLeft);
    const usedFiltered = pointsRequirement.filter(t => !this.doesTraitExist(this.editingCharacter!, pack, t.id, this.isFlaw));
    const fullfilsRestrictions = usedFiltered.filter(t => {
      if (t.restriction) {
        return restrictionResolver.resolve(this.editingCharacter!, t.restriction);
      }
      return true;
    });
    const fullfilsRequirements = fullfilsRestrictions.filter(t => {
      if (t.requirement) {
        if (t.requirement.type === "or") {
          return t.requirement.values.some(r => this.doesTraitExist(this.editingCharacter!, pack, r, this.isFlaw));
        }
      }
      return true;
    });
    return fullfilsRequirements;
  }

  private doesTraitExist(char: ICharacter, selectedPack: ITraitPack, traitId: number, isFlaw: boolean): boolean {
    const exists = (using: IUsingTraitPacks) => {
      const pack = using.packs.find(p => p.pack.id === selectedPack.id);
      if (pack) {
        const traits = isFlaw ? pack.flawTraits : pack.traits;
        if (traits.find(t => t.id === traitId)) {
          return true;
        }
      }
      return false;
    };

    if (selectedPack.type === "merits") {
      return exists(char.merits);
    }

    if (selectedPack.type === "backgrounds") {
      return exists(char.backgrounds);
    }

    return false;
  }

  private getMaxCustomLevel(): number {
    if (!this.selectedTrait) {
      return 0;
    }

    let currentMax = Infinity;

    for (let i = this.selectedTrait.level; i <= 5; i++) {
      if (i > this.pointsLeft) {
        break;
      }
      currentMax = i;
    }

    const change = (val: number) => {
      if (val < currentMax) {
        currentMax = val;
      }
    };
    if (this.selectedTrait.restrictRepeats) {
      if (this.selectedTrait.restrictRepeats.size) {
        if (this.doesTraitExist(this.editingCharacter!, this.selectedPack!, this.selectedTrait.restrictRepeats.size, this.isFlaw)) {
          change(this.selectedTrait.restrictRepeats.amount);
        }
      } else {
        change(this.selectedTrait.restrictRepeats.amount);
      }
    }

    return currentMax;
  }

  private get minCustomLevel(): number {
    return this.selectedTrait!.level;
  }

  private get traits(): ITrait[] {
    return this.filterTraits(this.selectedPack!, [...this.selectedPack![this.isFlaw ? "disadvantages" : "advantages"]]).sort((a, b) => a.name.localeCompare(b.name));
  }

  private get merits(): ITraitPack[] {
    return this.filterTraitPacks([...this.data.merits]).sort((a, b) => a.name.localeCompare(b.name));
  }

  private get backgrounds(): ITraitPack[] {
    return this.filterTraitPacks([...this.data.backgrounds])
      .filter(x => {
        if (!this.isFlaw && this.editingCharacter && this.editingCharacter.clan.id === 15 && x.id === 11) {
          return false; // Caitiffs aren't allowed to use positive status background when creating char
        }
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  private get isReady(): boolean {
    return this.isReadyForNormalUse || this.isReadyForCustom;
  }

  private get isReadyForNormalUse(): boolean {
    return !!this.selectedPack && !!this.selectedTrait
      && (!this.calculateCosts || this.calculateCosts(this.selectedTrait, this.customLevel) <= this.editingCharacter!.exp);
  }

  private get isReadyForCustom(): boolean {
    return !!this.selectedPack && this.selectedPack.id === this._customPack.id
      && this.customTraitName.length > 0 && this.customTraitDescription.length > 0
      && this.customTraitLevel >= 1 && this.customTraitLevel <= 5;
  }
}
</script>

<style scoped lang="scss">
$border: 1px solid var(--primary-color) !important;

.trait-pack-content {
  padding-bottom: 1rem;
  display: flex;
  gap: 1rem;
  flex-direction: row;
  $height: 20rem;
  & > div {
    height: $height;
    display: flex;
    flex-direction: column;
    &:not(.border) {
      overflow-x: hidden;
      overflow-y: auto;
    }
    &.traits {
      flex-grow: 1;
      gap: 0.4rem;
      .trait {
        user-select: none;
        cursor: pointer;
        padding: 0.2rem 0.7rem;
        border-radius: 5px;
        font-size: 1.2rem;
        &.selected {
          background-color: rgba(255, 255, 255, 0.2);
        }
        &:not(.selected):hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
      }
    }
    &.border {
      width: 1px;
      border-left: $border;
    }
    &.info {
      width: 40%;
      &.not-selected {
        justify-content: center;
        align-items: center;
        font-style: italic;
        color: rgba(255, 255, 255, 0.4);
        user-select: none;
      }
    }
  }
}

.optional-trait-options {
  width: 100%;
  border: $border;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  .form-group {
    margin: 0;
  }
}

.form-control.categorized {
  width: fit-content;
  .category {
    text-align: center;
    font-weight: bold;
    color: #fff;
  }
}
</style>
