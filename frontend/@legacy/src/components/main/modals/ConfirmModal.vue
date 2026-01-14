<script lang="ts">
import {Vue, Component} from 'vue-property-decorator';
import Modal from "@/components/modal/Modal.vue";

@Component({
  components: {Modal}
})
export default class ConfirmModal extends Vue {

  private visible: boolean = false;
  private text: string = "";
  private cb: (success: boolean) => void = () => {};

  public showConfirm(text: string, cb: (success: boolean) => void) {
    this.text = text;
    this.cb = cb;
    this.visible = true;
  }

  private confirm() {
    this.cb(true);
    this.visible = false;
  }

  private cancel() {
    this.cb(false);
    this.visible = false;
  }
}
</script>

<template>
  <Modal :shown="visible" @close="cancel()">
    <div class="p-4 w-300 d-flex flex-column">
      <p>{{text}}</p>
      <div style="display: flex; justify-content: flex-end">
        <button class="btn btn-primary" @click="confirm()">{{$t('main.confirmmodal.button').toString()}}</button>
      </div>
    </div>
  </Modal>
</template>

<style scoped lang="scss">

</style>