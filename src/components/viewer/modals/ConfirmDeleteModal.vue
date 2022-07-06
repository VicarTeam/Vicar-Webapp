<template>
  <Modal :shown="show" @close="show = false">
    <div class="w-400 d-flex justify-content-center align-items-center flex-column" style="gap: 1rem" v-if="confirm && element">
      <span>{{$t('character.advanced.customization.delete', {element})}}</span>
      <button class="btn btn-primary" @click="confirmDelete">{{$t('character.advanced.customization.delete.confirm')}}</button>
    </div>
  </Modal>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import Modal from "@/components/modal/Modal.vue";

@Component({
  components: {Modal}
})
export default class ConfirmDeleteModal extends Vue {

  private show = false;
  private element: any;
  private confirm: () => void = null!;

  public showModal(element: any, confirm: () => void) {
    this.element = element;
    this.confirm = confirm;
    this.show = true;
  }

  private confirmDelete() {
    if (this.confirm) {
      this.confirm();
      this.element = null;
      this.show = false;
    }
  }
}
</script>

<style scoped lang="scss">

</style>
