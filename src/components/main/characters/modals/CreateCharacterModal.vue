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
        <div style="height: 14rem; overflow-x: hidden; overflow-y: auto; width: 100%">
          <div class="custom-checkbox">
            <input type="checkbox" id="book-0" v-model="useAllBooks" @change="toggleAllBooks">
            <label for="book-0">Alle Bücher verwenden</label>
          </div>
          <div class="custom-checkbox" v-for="book in books" :key="book.id" style="margin-top: 0.2rem">
            <input :disabled="book.id === 1" type="checkbox" :id="'book-' + book.id" v-model="book.active">
            <label :for="'book-' + book.id">{{$t('data.books.' + book.id)}}</label>
          </div>
        </div>
      </div>
      <div style="text-align: center">
        <button class="btn btn-primary" @click="startCreateCharacter">{{$t('main.characters.create.start')}}</button>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import Modal from "@/components/modal/Modal.vue";
import {DefaultCharacter, Generation, ICharacter, ICharacterDirectory, Sex} from "@/types/models";
import {Mutation} from "vuex-class";

@Component({
  components: {Modal}
})
export default class CreateCharacterModal extends Vue {

  private Sex = Sex;
  private Generation = Generation;

  @Mutation("setEditingCharacter")
  private setEditingCharacter!: (character?: ICharacter) => void;

  @Mutation("addCharToEditorHistory")
  private addCharToEditorHistory!: (character: ICharacter) => void;

  @Mutation("setDirectoryForCharCreation")
  private setDirectoryForCharCreation!: (dir?: ICharacterDirectory) => void;

  private show = false;
  private name: string = "";
  private sex: Sex = Sex.Divers;
  private useAllBooks: boolean = false;
  private generation: number = 13;
  private generationEra: Generation = Generation.Children;
  private dir: ICharacterDirectory|undefined = undefined;

  private books: ({id: number; active: boolean})[] = [
    {id: 1, active: true},
    {id: 2, active: false},
    {id: 3, active: false},
    {id: 4, active: false},
    {id: 5, active: false},
    {id: 6, active: false}
  ]

  public showModal(dir?: ICharacterDirectory) {
    this.dir = dir;
    this.show = true;
  }

  private toggleAllBooks() {
    this.books.forEach(book => book.active = this.useAllBooks);
    this.books.find(book => book.id === 1)!.active = true;
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
    char.books = this.books.filter(book => book.active).map(book => book.id);

    this.setDirectoryForCharCreation(this.dir);

    this.applyEra(char);
    this.addCharToEditorHistory(char);
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
