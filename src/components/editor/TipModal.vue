<template>
  <Modal :shown="show" @close="show = false">
    <div style="max-width: 40rem">
      <p v-if="title" class="tip-title">{{title}}</p>
      <small>{{content}}</small>
    </div>
  </Modal>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import Modal from "@/components/modal/Modal.vue";

@Component({
  components: {Modal}
})
export default class TipModal extends Vue {

  private show: boolean = false;

  private title: any = null;
  private content: any = "";

  public showModal(title: any, content: any) {
    this.title = title;
    this.content = content;
    this.show = true;
  }
}
</script>

<style scoped lang="scss">
.tip-title {
  font-weight: bold;
  font-size: 1.6rem;
  margin: 0;
}
</style>
