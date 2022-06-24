<template>
  <div class="d-flex flex-grow-1" style="padding: 3rem; gap: 3rem;">
    <div class="d-flex flex-column" style="width: 20rem; gap: 1rem">
      <input :disabled="vicarPlay.isRunning" class="form-control" type="text" :placeholder="$t('play.username')" v-model="username" @input="saveUsername"/>
      <button v-if="!vicarPlay.isRunning" class="btn btn-primary" :disabled="!username" style="height: 4rem" @click="createSessionModal.showModal(username)">
        {{$t('play.create')}}
      </button>
      <button v-if="!vicarPlay.isRunning" class="btn btn-primary" :disabled="!username" style="height: 4rem" @click="connectSessionModal.showModal(username)">
        {{$t('play.connect')}}
      </button>
      <button v-if="vicarPlay.isRunning" style="height: 4rem" class="btn btn-primary" @click="closeSession">
        {{$t('play.' + (vicarPlay.session.isHost ? 'close' : 'disconnect'))}}
      </button>
    </div>

    <div class="d-flex flex-column flex-grow-1" style="gap: 3rem">
    </div>

    <CreateSessionModal ref="createSessionModal"/>
    <ConnectSessionModal ref="connectSessionModal"/>

    <Blur v-if="loading">
      <WrappedSpinner>
        <i v-if="loadingText">{{loadingText}}</i>
      </WrappedSpinner>
    </Blur>
  </div>
</template>

<script lang="ts">
import {Component, Provide, Ref, Vue} from "vue-property-decorator";
import CreateSessionModal from "@/components/main/play/modals/CreateSessionModal.vue";
import Blur from "@/components/modal/Blur.vue";
import WrappedSpinner from "@/components/spinners/WrappedSpinner.vue";
import ConnectSessionModal from "@/components/main/play/modals/ConnectSessionModal.vue";
import {vicarPlay} from "@/libs/vicarplay/vicar-play";

@Component({
  components: {ConnectSessionModal, WrappedSpinner, Blur, CreateSessionModal}
})
export default class VicarPlay extends Vue {

  @Ref("createSessionModal")
  private createSessionModal!: CreateSessionModal;

  @Ref("connectSessionModal")
  private connectSessionModal!: ConnectSessionModal;

  vicarPlay = vicarPlay;

  private username: string = "";
  private loading: boolean = false;
  private loadingText: string = "";

  mounted() {
    this.username = localStorage.getItem("play:username") || "";
  }

  private saveUsername() {
    localStorage.setItem("play:username", this.username);
  }

  private async closeSession() {
    this.toggleLoader(true, this.$t("play.closing").toString());

    try {
      await vicarPlay.close();
    } catch (e) {
      console.error(e);
    } finally {
      this.toggleLoader(false);
    }
  }

  @Provide("play:toggle-loader")
  private toggleLoader(visible: boolean, text: string = "") {
    this.loadingText = text;
    this.loading = visible;
  }
}
</script>

<style scoped lang="scss">

</style>