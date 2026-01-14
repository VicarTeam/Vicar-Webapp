<template>
  <TOCItem class="toc-menu" :title="title" :paragraph="paragraph" :icon="open ? 'fa-chevron-up' : 'fa-chevron-down'" @iconclick="open = !open">
    <div class="items" v-if="open">
      <slot></slot>
    </div>
  </TOCItem>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import TOCItem from "@/components/main/lexicon/toc/TOCItem.vue";

@Component({
  components: {TOCItem}
})
export default class TOCMenu extends Vue {

  @Prop({required: true})
  private title!: string;

  @Prop({required: true})
  private paragraph!: string;

  private open: boolean = false;
}
</script>

<style scoped lang="scss">
.toc-menu {
  .items {
    width: 100%;
    display: flex;
    flex-direction: column;
    font-weight: normal !important;
  }
}
</style>
