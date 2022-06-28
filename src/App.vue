<template>
  <div class="page-wrapper">
    <div class="content-wrapper" ref="contentWrapper">
      <router-view/>
    </div>

    <TipModal ref="tipModal"/>
    <PlayMenu v-if="vicarPlay.isMenuOpen()" style="position: absolute; right: 0.5rem; top: 5rem; z-index: 11; margin-right: 0; margin-top: 0"/>
  </div>
</template>

<script lang="ts">
import {Component, Provide, Ref, Vue} from "vue-property-decorator";
import TipModal from "@/components/editor/TipModal.vue";
import PlayMenu from "@/components/main/play/menu/PlayMenu.vue";
import {vicarPlay} from "@/libs/vicarplay/vicar-play";

@Component({
  components: {TipModal, PlayMenu}
})
export default class App extends Vue {

  private vicarPlay = vicarPlay;

  @Ref("contentWrapper")
  private contentWrapper!: HTMLDivElement;

  @Ref("tipModal")
  private tipModal!: TipModal;

  @Provide("show-tip")
  private showTip(content: any, title?: any) {
    this.tipModal.showModal(title, content);
  }

  @Provide("get-content-wrapper")
  private getContentWrapper() {
    return this.contentWrapper;
  }
}
</script>
