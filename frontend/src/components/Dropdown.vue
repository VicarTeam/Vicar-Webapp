<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'

defineOptions({ inheritAttrs: false })

export interface IOption {
  name: string
  value: any
  isCategory?: boolean
}

const props = defineProps<{
  options: IOption[]
  placeholder?: string
  autofocus?: boolean
}>()

const modelValue = defineModel<any>({ required: true })

const dropdownInput = ref<HTMLInputElement | null>(null)
const inputValue = ref('')
const showOptions = ref(false)

const filteredOptions = computed(() => {
  const q = inputValue.value.toLowerCase()
  return props.options.filter((x) => x.isCategory || x.name.toLowerCase().startsWith(q))
})

function closeOptions() {
  showOptions.value = false
}

function setModelValue(option: IOption) {
  if (option.isCategory) return
  modelValue.value = option.value
  inputValue.value = option.name
  showOptions.value = false
}

let closeTimer: number | undefined
function debounceClose() {
  window.clearTimeout(closeTimer)
  closeTimer = window.setTimeout(() => {
    showOptions.value = false
  }, 200)
}

watch(
  () => modelValue.value,
  (v) => {
    inputValue.value = props.options.find((o) => o.value === v)?.name || ''
  },
  { immediate: true }
)

onMounted(async () => {
  inputValue.value = props.options.find((o) => o.value === modelValue.value)?.name || ''
  showOptions.value = false

  if (props.autofocus) {
    await nextTick()
    dropdownInput.value?.focus()
  }
})

function onFocusIn() {
  showOptions.value = true
}
</script>

<template>
  <div class="vdropdown dropdown" v-bind="$attrs">
    <input
      ref="dropdownInput"
      type="text"
      class="form-control"
      v-model="inputValue"
      :placeholder="placeholder"
      @focusin="onFocusIn"
      @focusout="debounceClose"
      @keydown.esc="closeOptions"
    />

    <div class="dropdown-menu" :class="{ show: showOptions }" v-if="showOptions">
      <a
        v-for="(i, j) in filteredOptions"
        :key="j"
        href="#"
        class="dropdown-item"
        :class="{ 'is-category': !!i.isCategory }"
        @click.prevent="setModelValue(i)"
      >
        <b v-if="i.isCategory">{{ i.name }}</b>
        <span v-else>{{ i.name }}</span>
      </a>

      <div v-if="filteredOptions.length === 0" class="dropdown-item text-muted">
        {{ "$t:character.modal.pool-calcuator.search_not_found$" }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.vdropdown {
  position: relative;
  user-select: text;
  width: 100%;

  input {
    user-select: all;
  }

  .dropdown-menu {
    width: 100%;
    max-height: min(15rem, 55dvh);
    overflow-y: auto;
    overflow-x: hidden;
  }

  .dropdown-item {
    user-select: none;
  }

  .dropdown-item.is-category {
    pointer-events: none;
    cursor: not-allowed;
    opacity: 0.8;
  }
}
</style>
