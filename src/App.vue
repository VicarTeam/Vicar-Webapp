<template>
  <div class="page-wrapper">
    <div class="content-wrapper">
      <router-view/>
    </div>

    <TipModal ref="tipModal"/>
    <ConfirmModal ref="confirmModal"/>
  </div>
</template>

<script lang="ts">
import {Component, Provide, Ref, Vue} from "vue-property-decorator";
import TipModal from "@/components/editor/TipModal.vue";
import ConfirmModal from "@/components/main/modals/ConfirmModal.vue";

@Component({
  components: {ConfirmModal, TipModal}
})
export default class App extends Vue {

  @Ref("tipModal")
  private tipModal!: TipModal;

  @Ref("confirmModal")
  private confirmModal!: ConfirmModal;

  @Provide("show-tip")
  private showTip(content: any, title?: any) {
    this.tipModal.showModal(title, content);
  }

  @Provide("confirm")
  private confirm(text: string): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.confirmModal.showConfirm(text, success => {
        resolve(success);
      });
    });
  }
}
</script>
