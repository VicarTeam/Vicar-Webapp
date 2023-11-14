<template>
  <Modal :shown="show" @close="show = false">
    <div class="character-info" v-if="character">
      <div class="form-group">
        <label><b>{{$t('main.characters.create.books')}}:</b></label>
        <BookSelection :disabled="true" :books="activatedBooks"/>
      </div>
      <div class="form-group d-flex flex-column">
        <label><b>{{$t('character.advanced.usedexp')}}:</b></label>
        <i style="opacity: 0.7">{{character.usedExp || 0}} EXP</i>
      </div>
      <div class="form-group d-flex flex-column" :class="{'mb-0': !isNotUpToDate()}">
        <label><b>{{$t('character.advanced.rules')}}:</b></label>
        <div class="custom-checkbox d-flex align-items-center">
          <input type="checkbox" id="disc" v-model="character.useAdavancedDisciplines" @change="save">
          <label for="disc">{{$t('character.advanced.disciplines')}}</label>
        </div>
        <div class="custom-checkbox d-flex align-items-center">
          <input type="checkbox" id="pow" v-model="character.allowLearningOfAllPowers" @change="save">
          <label for="pow">{{$t('character.advanced.powers')}}</label>
        </div>
        <div class="custom-checkbox d-flex align-items-center">
          <input type="checkbox" id="cust" v-model="character.fullCustomization" @change="save">
          <label for="cust">{{$t('character.advanced.customization')}}</label>
        </div>
      </div>
      <div class="d-flex justify-content-center align-items-center" v-if="isNotUpToDate()" style="margin-top: 1rem">
        <button class="btn btn-primary" @click="migrateChar">{{$t('character.info.migrate')}}</button>
      </div>
      <div class="mb-0 form-group" style="margin-top: 1rem">
        <b>{{$t('character.vicartt.foundryid')}}:</b>
        <input type="text" class="form-control" v-model="vicarTTId">
      </div>
      <div class="d-flex justify-content-center align-items-center" style="margin-top: 1rem" v-if="isHomebrewActive">
        <button style="font-size: 1rem" :disabled="homebrewUpdating" class="btn btn-primary" @click="updateHomebrewContent">{{$t(`character.homebrew.update${(homebrewUpdated ? 'd' : '')}`)}}</button>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import Modal from "@/components/modal/Modal.vue";
import {CurrentCharacterVersion, ICharacter} from "@/types/models";
import BookSelection, {ActivatableBook} from "@/components/editor/BookSelection.vue";
import CharacterStorage from "@/libs/io/character-storage";
import {migrationResolver} from "@/libs/resolvers/migration-resolver";
import {HomebrewIdOffset, HomebrewManager} from "@/libs/data/homebrew-manager";
import DataManager from "@/libs/data/data-manager";
import {IHomebrewDiscipline} from "@/types/data";

@Component({
  components: {BookSelection, Modal}
})
export default class CharacterInfoModal extends Vue {

  private show: boolean = false;
  private character: ICharacter = null!;
  private activatedBooks: ActivatableBook[] = [];

  private homebrewUpdating: boolean = false;
  private homebrewUpdated: boolean = false;

  public showModal(character: ICharacter) {
    this.character = character;
    this.character["useAdavancedDisciplines"] = this.character["useAdavancedDisciplines"] || false;
    this.character["allowLearningOfAllPowers"] = this.character["allowLearningOfAllPowers"] || false;
    this.character["fullCustomization"] = this.character["fullCustomization"] || false;
    this.activatedBooks = [...BookSelection.defaultBooks()].map(book => {
      return {
        id: book.id,
        active: this.character.books.includes(book.id)
      };
    });
    this.show = true;
  }

  private save() {
    CharacterStorage.saveCharacter(this.character);
  }

  private migrateChar() {
    migrationResolver.migrate(this.character);
    this.$forceUpdate();
  }

  private isNotUpToDate(): boolean {
    return !this.character["version"] || this.character["version"] < CurrentCharacterVersion;
  }

  private async updateHomebrewContent() {
    if (this.homebrewUpdating) {
      return;
    }

    this.homebrewUpdated = false;
    this.homebrewUpdating = true;

    let success = false;

    try {
      if (this.character.clan.id >= HomebrewIdOffset) {
        const updatedClan = DataManager.findAvailableClan(this.character.books, this.character.clan.id);
        if (updatedClan) {
          this.character.clan = updatedClan;
        }
      }

      for (const d of this.character.disciplines) {
        if ((d.discipline as IHomebrewDiscipline)["creator"]) {
          const updatedDiscipline = DataManager.normalDisciplinesAsArray().find(discipline => discipline.id === (d.discipline.id < HomebrewIdOffset ? d.discipline.id + HomebrewIdOffset : d.discipline.id));
          if (updatedDiscipline) {
            d.discipline = updatedDiscipline;

            const abilities = DataManager.normalDisciplineAbilitiesAsArray(d.discipline).flat();
            for (let i = 0; i < d.abilities.length; i++) {
              const a = d.abilities[i];
              const newAbility = abilities.find(ability => ability.id === a.id);
              if (newAbility) {
                a.name = newAbility.name;
                a.summary = newAbility.summary;
                a.costs = newAbility.costs;
                a.system = newAbility.system;
                a.alternatives = newAbility.alternatives;
                a.duration = newAbility.duration;
                a.combination = newAbility.combination;
                a.diceSupplies = newAbility.diceSupplies;
                a.requirement = newAbility.requirement;
                a.minBloodPotency = newAbility.minBloodPotency;
              }
            }
          }
        }
      }

      this.save();
      this.$emit('updated');

      success = true;
    } catch (e) {
      console.error(e);
      success = false;
    } finally {
      this.homebrewUpdating = false;
    }

    if (success) {
      this.homebrewUpdated = true;
      setTimeout(() => this.homebrewUpdated = false, 5000);
    }
  }

  private get vicarTTId() {
    return this.character.connectedFoundryId || "";
  }

  private set vicarTTId(id: string) {
    this.character.connectedFoundryId = id.length > 0 ? id : undefined;
    this.save();
  }

  private get isHomebrewActive() {
    return this.activatedBooks.some(book => book.id >= HomebrewIdOffset && book.active);
  }
}
</script>

<style scoped lang="scss">
.character-info {
  display: flex;
  flex-direction: column;
}
</style>
