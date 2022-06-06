<template>
  <div class="editor-view">
    <div class="pane">
      <router-view/>
    </div>

    <div class="toolbar">

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
export default class EditorView extends Vue {

  @Ref("tipModal")
  private tipModal!: TipModal;

  @Provide("show-tip")
  private showTip(content: any, title?: any) {
    this.tipModal.showModal(title, content);
  }
}
</script>

<style scoped lang="scss">
.editor-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .pane {
    width: 100%;
    flex-grow: 1;
  }
  .toolbar {
    width: 100%;
    flex-shrink: 0;
  }
}
</style>
