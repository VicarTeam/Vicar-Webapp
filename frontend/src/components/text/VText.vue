<template>
  <span class="vtext">
    <span class="first">{{firstLetter}}</span>
    <span>{{restOfText}}</span>
  </span>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";

@Component({
  components: {}
})
export default class VText extends Vue {
  
  @Prop({required: true})
  private text!: string;
  
  @Prop({default: 1})
  private size!: number;
  
  private get firstLetter(): string {
    if (this.text.length > 0) {
      return this.text.charAt(0);
    }
    return "";
  }
  
  private get restOfText(): string {
    if (this.text.length > 1) {
      return this.text.substring(1);
    }
    return "";
  }
  
  private get firstSize() {
    return (this.size + 0.2) + 'rem';
  }
  
  private get restSize() {
    return this.size + 'rem';
  }
}
</script>

<style scoped lang="scss">
.vtext {
  color: #fff;
  text-transform: uppercase;
  font-weight: bolder;
  font-size: v-bind(restSize);
  .first {
    font-weight: 900;
    color: var(--primary-color);
    font-size: v-bind(firstSize);
  }
}
</style>