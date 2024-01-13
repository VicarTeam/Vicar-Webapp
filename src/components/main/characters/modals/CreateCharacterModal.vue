<template>
  <Modal :shown="show" @close="show = false">
    <div class="w-300">
      <div class="form-group">
        <b><i class="fa-solid fa-circle-question"></i> {{$t('main.characters.create.tip.title')}}</b><br/>
        <small>{{$t('main.characters.create.tip.subtitle')}}</small><br/>
        <ul style="font-size: 1.2rem">
          <li style="margin-bottom: 0 !important;" v-for="i in [1, 2, 3, 4, 5]">{{$t(`main.characters.create.tip.question${i}`)}}</li>
        </ul>
        <hr>
      </div>
      <div class="form-group">
        <label class="required">{{$t('main.characters.create.name')}}:</label>
        <input type="text" class="form-control" :placeholder="$t('main.characters.create.name')" required="required" v-model="name">
      </div>
      <div class="form-group">
        <label class="required">{{$t('main.characters.create.generation')}}:</label>
        <div class="d-flex" style="gap: 1rem">
          <select v-model="generationEra" @change="onEraChange" class="form-control">
            <option :value="Generation.Children">{{$t('character.generation.' + Generation.Children)}}</option>
            <option :value="Generation.Newborn">{{$t('character.generation.' + Generation.Newborn)}}</option>
            <option :value="Generation.Ancillae">{{$t('character.generation.' + Generation.Ancillae)}}</option>
            <option :value="Generation.Older">{{$t('character.generation.' + Generation.Older)}}</option>
            <option :value="Generation.Elder">{{$t('character.generation.' + Generation.Elder)}}</option>
          </select>
          <input type="number" :min="eraMin" :max="eraMax" class="form-control" :placeholder="$t('main.characters.create.generation')" required="required" v-model="generation">
        </div>
      </div>
      <div class="form-group">
        <label class="required">{{$t('main.characters.create.sex')}}:</label>
        <div class="sex-select">
          <div :class="{'active': sex === Sex.Male}" @click="sex = Sex.Male" style="border-right: 1px solid var(--primary-color);">{{$t('character.sex.m')}}</div>
          <div :class="{'active': sex === Sex.Divers}" @click="sex = Sex.Divers" style="border-left: 1px solid var(--primary-color); border-right: 1px solid var(--primary-color)">{{$t('character.sex.d')}}</div>
          <div :class="{'active': sex === Sex.Female}" @click="sex = Sex.Female" style="border-left: 1px solid var(--primary-color);">{{$t('character.sex.f')}}</div>
        </div>
      </div>
      <div class="form-group">
        <label>{{$t('main.characters.create.books')}}:</label>
        <BookSelection ref="bookSelection"/>
      </div>
      <div style="text-align: center">
        <button class="btn btn-primary" @click="startCreateCharacter">{{$t('main.characters.create.start')}}</button>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts">
import {Component, Ref, Vue} from "vue-property-decorator";
import Modal from "@/components/modal/Modal.vue";
import {DefaultCharacter, Generation, ICharacter, ICharacterDirectory, Sex} from "@/types/models";
import {Mutation} from "vuex-class";
import {EditorHistory} from "@/libs/editor-history";
import BookSelection from "@/components/editor/BookSelection.vue";

@Component({
  components: {BookSelection, Modal}
})
export default class CreateCharacterModal extends Vue {

  private Sex = Sex;
  private Generation = Generation;

  @Ref("bookSelection")
  private bookSelection!: BookSelection;

  @Mutation("setEditingCharacter")
  private setEditingCharacter!: (character?: ICharacter) => void;

  @Mutation("setDirectoryForCharCreation")
  private setDirectoryForCharCreation!: (dir?: ICharacterDirectory) => void;

  private show = false;
  private name: string = "";
  private sex: Sex = Sex.Divers;
  private generation: number = 13;
  private generationEra: Generation = Generation.Children;
  private dir: ICharacterDirectory|undefined = undefined;

  public showModal(dir?: ICharacterDirectory) {
    this.dir = dir;
    this.show = true;
  }

  private startCreateCharacter() {
    if (this.name.trim().length <= 0) {
      return;
    }

    const char = DefaultCharacter();
    char.name = this.name;
    char.sex = this.sex;
    char.generation = this.generation;
    char.generationEra = this.generationEra;
    char.books = this.bookSelection.activeBooks;

    this.setDirectoryForCharCreation(this.dir);

    this.applyEra(char);
    EditorHistory.push(char);
    this.setEditingCharacter(char);
    this.$router.push({name: 'editor-clan'});

    this.show = false;
  }

  private applyEra(char: ICharacter) {
    switch (char.generationEra) {
      case Generation.Children:
        if (char.generation >= 14) {
          char.bloodPotency = 0;
        } else {
          char.bloodPotency = 1;
        }
        break;
      case Generation.Newborn:
        char.bloodPotency = 1;
        char.exp = 15;
        break;
      case Generation.Ancillae:
        char.bloodPotency = 2;
        char.exp = 35;
        char.humanity--;
        break;
      case Generation.Older:
        char.exp = 1000;
        break;
      case Generation.Elder:
        char.exp = 666666;
        char.bloodPotency = 10;
        char.isElder = true;

        for (const cat of char.categories) {
          for (const attr of cat.attributes) {
            attr.value = 5;
          }

          for (const skill of cat.skills) {
            skill.value = 5;
          }
        }
    }
  }

  private onEraChange() {
    switch (this.generationEra) {
      case Generation.Children:
        this.generation = 13;
        break;
      case Generation.Newborn:
        this.generation = 12;
        break;
      case Generation.Ancillae:
        this.generation = 11;
        break;
      case Generation.Older:
        this.generation = 9;
        break;
      case Generation.Elder:
        this.generation = 5;
        break;
    }
  }

  private get eraMin(): number {
    switch (this.generationEra) {
      case Generation.Children:
        return 12;
      case Generation.Newborn:
        return 12;
      case Generation.Ancillae:
        return 10;
      case Generation.Older:
        return 0;
      case Generation.Elder:
        return 0;
    }
  }

  private get eraMax(): number {
    switch (this.generationEra) {
      case Generation.Children:
        return 16;
      case Generation.Newborn:
        return 13;
      case Generation.Ancillae:
        return 11;
      case Generation.Older:
        return Infinity;
      case Generation.Elder:
        return 10;
    }
  }
}
</script>

<style scoped lang="scss">
.sex-select {
  display: flex;
  border: 2px solid var(--primary-color);
  div {
    cursor: pointer;
    user-select: none;
    text-align: center;
    flex-grow: 1;
    padding: 0.5rem;
    &.active {
      background-color: var(--primary-color);
    }
  }
}
</style>
