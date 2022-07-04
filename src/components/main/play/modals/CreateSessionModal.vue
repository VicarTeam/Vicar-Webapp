<template>
  <Modal :shown="show" @close="show = false">
    <div style="display: flex; flex-direction: column; width: 40rem">
      <span>{{$t('play.create.input')}}:</span>
      <input type="text" v-model="name" class="form-control" style="width: 100%"/>
      <div style="width: 100%; display: flex; justify-content: center; align-items: center; margin-top: 1rem">
        <button class="btn btn-primary" :disabled="!name" @click="create">{{$t('play.create.btn')}}</button>
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
export default class CreateSessionModal extends Vue {

  private show: boolean = false;
  private name: string = "";
  private username: string = "";
  private tsName: string = "";
  private discordName: string = "";

  public showModal(username: string, tsName: string, dcName: string) {
    this.name = "";
    this.username = username;
    this.tsName = tsName;
    this.discordName = dcName;
    this.show = true;
  }

  private async create() {
    if (this.name.trim().length <= 0) {
      return;
    }

    try {
      this.toggleLoader(true, this.$t('play.create.loading').toString());

      VicarPlayClient.socket.emit("session:init", "create", {
        username: this.username,
        tsName: this.tsName,
        discordName: this.discordName
      }, this.name);
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
