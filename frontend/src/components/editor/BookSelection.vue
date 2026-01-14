<script setup lang="ts">

import {defaultBooks, getBookName} from "@/@types/data.ts";
import {onMounted} from "vue";

export type ActivatableBook = {
  id: number
  active: boolean
}

const props = withDefaults(
  defineProps<{
    disabled?: boolean
    books?: ActivatableBook[]
  }>(),
  {
    disabled: false,
  }
)

const useAllBooks = defineModel<boolean>("useAllBooks", { default: false })

const booksModel = defineModel<ActivatableBook[]>("books")

onMounted(() => {
  if (!booksModel.value) {
    booksModel.value = props.books ?? defaultBooks()
  }

  useAllBooks.value = booksModel.value.every((b) => b.active || b.id === 1)
})

function activeBooks() {
  if (!booksModel.value) {
    return []
  }

  return booksModel.value.filter((b) => b.active).map((b) => b.id)
}

function toggleAllBooks() {
  if (!booksModel.value) {
    booksModel.value = props.books ?? defaultBooks()
  }

  for (const b of booksModel.value) b.active = useAllBooks.value
  const core = booksModel.value.find((b) => b.id === 1)
  if (core) core.active = true
}

defineExpose({ activeBooks, toggleAllBooks })
</script>

<template>
  <div class="book-selection">
    <div class="custom-checkbox" v-if="!disabled">
      <input type="checkbox" id="book-0" v-model="useAllBooks" @change="toggleAllBooks" />
      <label for="book-0">Alle Bücher verwenden</label>
    </div>

    <div class="custom-checkbox" v-for="book in booksModel" :key="book.id">
      <input
        :disabled="book.id === 1 || disabled"
        type="checkbox"
        :id="'book-' + book.id"
        v-model="book.active"
      />
      <label :for="'book-' + book.id">{{ getBookName(book.id) }}</label>
    </div>
  </div>
</template>

<style scoped lang="scss">
.book-selection {
  width: 100%;
  max-height: 14rem;
  overflow: auto;
  padding-right: 0.25rem;
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
</style>
