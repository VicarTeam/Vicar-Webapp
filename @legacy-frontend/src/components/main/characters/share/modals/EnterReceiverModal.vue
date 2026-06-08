<template>
  <Modal v-if="char" :shown="show" @close="show = false; char = null">
    <div style="display: flex; flex-direction: column; width: 40rem">
      <span>{{$t('share.send.input', {char: char.name})}}</span>
      <input type="text" v-model="receiverId" class="form-control" style="width: 100%"/>
      <div style="width: 100%; display: flex; justify-content: center; align-items: center; margin-top: 1rem">
        <button class="btn btn-primary" :disabled="!receiverId" @click="send">{{$t('share.send')}}</button>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import Modal from "@/components/modal/Modal.vue";
import {ICharacter} from "@/types/models";

@Component({
  components: {Modal}
})
export default class EnterReceiverModal extends Vue {

  private show: boolean = false;
  private char: ICharacter|null = null;
  private receiverId: string = "";
  private callback: (id: string) => void = null!;

  public showModal(char: ICharacter, callback: (id: string) => void) {
    this.char = char;
    this.receiverId = "";
    this.callback = callback;
    this.show = true;
  }

  private send() {
    this.callback(this.receiverId);
    this.receiverId = "";
    this.char = null;
    this.callback = null!;
    this.show = false;
  }
}
</script>

<style scoped lang="scss">

</style>
