<template>
  <div class="page-wrapper">
    <div class="content-wrapper">
      <router-view/>
    </div>

    <TipModal ref="tipModal"/>
  </div>
</template>

<script lang="ts">
import {Component, Provide, Ref, Vue} from "vue-property-decorator";
import TipModal from "@/components/editor/TipModal.vue";

@Component({
  components: {TipModal}
})
export default class App extends Vue {

  @Ref("tipModal")
  private tipModal!: TipModal;

  @Provide("show-tip")
  private showTip(content: any, title?: any) {
    this.tipModal.showModal(title, content);
  }
}
</script>
