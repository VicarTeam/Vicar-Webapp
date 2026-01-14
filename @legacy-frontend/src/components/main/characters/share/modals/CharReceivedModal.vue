<template>
  <Modal v-if="char" :shown="show" @close="show = false; char = null">
    <div style="display: flex; flex-direction: column; width: 40rem">
      <span>{{$t('share.received', {char: char.name})}}</span>
      <div style="width: 100%; display: flex; justify-content: center; align-items: center; margin-top: 1rem">
        <button class="btn btn-primary" @click="confirm">{{$t('share.received.yes')}}</button>
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
export default class CharReceivedModal extends Vue {

  private show: boolean = false;
  private char: ICharacter|null = null;
  private callback: () => void = null!;

  public showModal(char: ICharacter, callback: () => void) {
    this.char = char;
    this.callback = callback;
    this.show = true;
  }

  private confirm() {
    this.callback();
    this.char = null;
    this.callback = null!;
    this.show = false;
  }
}
</script>

<style scoped lang="scss">

</style>
