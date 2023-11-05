<script lang="ts">
import {Vue, Component, Prop, Watch} from 'vue-property-decorator';

export interface IOption {
  name: string;
  value: any;
  isCategory?: boolean;
}

@Component({})
export default class Dropdown extends Vue {
  @Prop({required: true})
  private options!: IOption[];

  @Prop({default: ''})
  private placeholder!: string;

  @Prop({required: true})
  private value!: any;

  private inputValue: string = '';
  private showOptions: boolean = false;

  public closeOptions() {
    this.showOptions = false;
  }

  mounted() {
    this.inputValue = (this.options.find((option) => option.value === this.value)?.name || '');
    this.showOptions = false;
  }

  private setModelValue(option: IOption) {
    if (option.isCategory) {
      return;
    }

    this.$emit('input', option.value);
    this.inputValue = option.name;
    this.showOptions = false;
  }

  private get filteredOptions() {
    return this.options.filter(x => x.isCategory || x.name.toLowerCase().startsWith(this.inputValue.toLowerCase()));
  }

  @Watch('inputValue')
  private onInputValueChange() {
    this.$forceUpdate();
  }
}
</script>

<template>
  <div class="vdropdown" v-bind="$attrs">
    <input type="text" class="form-control" v-model="inputValue" :placeholder="placeholder" style="width: 100%" @focusin="showOptions = true">
    <div class="dropdown-menu" v-if="showOptions">
      <a v-for="(i, j) in filteredOptions" :key="j" href="#" class="dropdown-item" :style="i.isCategory ? {'pointer-events': 'none', cursor: 'not-allowed'} : {}" @click="setModelValue(i)">
        <b v-if="i.isCategory">{{i.name}}</b>
        <span v-else>{{i.name}}</span>
      </a>
      <div v-if="filteredOptions.length === 0" class="dropdown-item text-muted">
        {{ $t('character.modal.pool-calcuator.search_not_found') }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.vdropdown {
  position: relative;
  user-select: text;
  input {
    user-select: all;
  }
  .dropdown-menu {
    position: absolute;
    z-index: 10000;
    visibility: unset;
    max-height: 15rem;
    width: 100%;
    overflow-y: auto;
    font-size: 1rem;
    pointer-events: all;
    .dropdown-item {
      user-select: none;
      cursor: pointer;
    }
  }
}
</style>