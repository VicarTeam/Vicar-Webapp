<template>
  <div style="height: 14rem; overflow-x: hidden; overflow-y: auto; width: 100%">
    <div class="custom-checkbox" v-if="!disabled">
      <input type="checkbox" id="book-0" v-model="useAllBooks" @change="toggleAllBooks">
      <label for="book-0">{{$t('main.characters.create.allbooks')}}</label>
    </div>
    <div class="custom-checkbox" v-for="book in books" :key="book.id" style="margin-top: 0.2rem">
      <input :disabled="book.id === 1 || disabled" type="checkbox" :id="'book-' + book.id" v-model="book.active">
      <label :for="'book-' + book.id">{{$t('data.books.' + book.id)}}</label>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from "vue-property-decorator";

export type ActivatableBook = {
  id: number;
  active: boolean;
}

@Component({
  components: {}
})
export default class BookSelection extends Vue {

  @Prop({default: false})
  private disabled!: boolean;

  @Prop({default: () => BookSelection.defaultBooks()})
  private books!: ActivatableBook[];

  private useAllBooks: boolean = false;

  public get activeBooks() {
    return this.books.filter(book => book.active).map(book => book.id);
  }

  private toggleAllBooks() {
    this.books.forEach(book => book.active = this.useAllBooks);
    this.books.find(book => book.id === 1)!.active = true;
  }

  public static defaultBooks(): ActivatableBook[] {
    return [
      {id: 1, active: true},
      {id: 2, active: false},
      {id: 3, active: false},
      {id: 4, active: false},
      {id: 5, active: false},
      {id: 6, active: false},
      {id: 7, active: false},
      {id: 3021, active: false}
    ];
  }
}
</script>

<style scoped lang="scss">

</style>
