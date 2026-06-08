<template>
  <select class="form-control" style="margin-left: auto; text-align: center; width: 8rem" v-model="selectedVal" @change="$emit('change', selectedVal)">
    <option :value="0">0</option>
    <option v-for="v in arr" :value="v" :disabled="v > pool">{{v}}</option>
  </select>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";

@Component({
  components: {}
})
export default class SpendSelect extends Vue {

  @Prop({required: true})
  private max!: number;

  @Prop({required: true})
  private pool!: number;

  private selectedVal: number = 0;

  private get arr(): number[] {
    const arr = [];
    for (let i = 1; i <= this.max; i++) {
      arr.push(i);
    }
    return arr;
  }
}
</script>

<style scoped lang="scss">

</style>
