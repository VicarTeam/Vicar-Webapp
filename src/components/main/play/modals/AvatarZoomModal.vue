<template>
  <Modal :shown="show" @close="show = false">
    <div style="display: flex; flex-direction: column; width: 40rem">
      <img :src="image" style="width: 40rem; -webkit-user-drag: none"/>
    </div>
  </Modal>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import Modal from "@/components/modal/Modal.vue";

@Component({
  components: {Modal}
})
export default class AvatarZoomModal extends Vue {

  private show: boolean = false;
  private image: string = "";

  public showModal(image: string) {
    this.image = image;
    this.show = true;
  }
}
</script>

<style scoped lang="scss">

</style>
