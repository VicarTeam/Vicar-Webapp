<template>
  <Modal :shown="show" @close="show = false">
    <div style="display: flex; flex-direction: column; width: 40rem">
      <span>{{$t('play.connect.input')}}:</span>
      <input type="text" v-model="sessionId" class="form-control" style="width: 100%"/>
      <div style="width: 100%; display: flex; justify-content: center; align-items: center; margin-top: 1rem">
        <button class="btn btn-primary" :disabled="!sessionId" @click="connect">{{$t('play.connect.btn')}}</button>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts">
import {Component, Inject, Vue} from "vue-property-decorator";
import Modal from "@/components/modal/Modal.vue";
import VicarPlayClient from "@/libs/vicarplay/vicar-play";

@Component({
  components: {Modal}
})
export default class ConnectSessionModal extends Vue {

  private show: boolean = false;
  private sessionId: string = "";
  private username: string = "";
  private tsName: string = "";
  private discordName: string = "";

  public showModal(username: string, tsName: string, dcName: string) {
    this.sessionId = "";
    this.username = username;
    this.tsName = tsName;
    this.discordName = dcName;
    this.show = true;
  }

  private async connect() {
    if (this.sessionId.trim().length <= 0) {
      return;
    }

    try {
      this.toggleLoader(true, this.$t('play.connect.loading').toString());

      VicarPlayClient.socket.emit("session:init", "connect", {
        username: this.username,
        tsName: this.tsName,
        discordName: this.discordName
      }, this.sessionId);
      this.show = false;
    } catch (e) {
      console.error(e);
    } finally {
      this.toggleLoader(false);
    }
  }

  @Inject("play:toggle-loader")
  private toggleLoader!: (visible: boolean, text?: string) => void;
}
</script>

<style scoped lang="scss">

</style>
