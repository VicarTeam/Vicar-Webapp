<template>
  <div class="d-flex flex-grow-1" style="padding: 3rem; gap: 3rem;">
    <div class="d-flex flex-column" style="width: 20rem; gap: 1rem">
      <input :disabled="VicarPlayClient.isInSession()" class="form-control" type="text" :placeholder="$t('play.username')" v-model="username" @input="saveUsername"/>
      <input :disabled="VicarPlayClient.isInSession()" class="form-control" type="text" :placeholder="$t('play.ts.name')" v-model="tsName" @input="saveTsName"/>
      <input :disabled="VicarPlayClient.isInSession()" class="form-control" type="text" :placeholder="$t('play.dc.name')" v-model="discordName" @input="saveDiscordName"/>
      <button v-if="!VicarPlayClient.isInSession()" class="btn btn-primary" :disabled="!username" style="height: 4rem" @click="createSessionModal.showModal(username, tsName, discordName)">
        {{$t('play.create')}}
      </button>
      <button v-if="!VicarPlayClient.isInSession()" class="btn btn-primary" :disabled="!username" style="height: 4rem" @click="connectSessionModal.showModal(username, tsName, discordName)">
        {{$t('play.connect')}}
      </button>
      <button v-if="VicarPlayClient.isInSession()" style="height: 4rem" class="btn btn-primary" @click="closeSession">
        {{$t('play.' + (VicarPlayClient.amIHost() ? 'close' : 'disconnect'))}}
      </button>
    </div>

    <div class="d-flex flex-column flex-grow-1" style="gap: 1rem">
      <b>{{$t('play.history')}}:</b>
      <LastSession v-for="(s, i) in lastSessions" :session="s" :key="i"/>
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
import LastSession from "@/components/main/play/LastSession.vue";
import AvatarZoomModal from "@/components/main/play/modals/AvatarZoomModal.vue";
import SyncCharacterHostModal from "@/components/main/play/modals/sync/SyncCharacterHostModal.vue";
import VicarPlayClient from "@/libs/vicarplay/vicar-play";
import {Socket} from "vue-socket.io-extended";

@Component({
  components: {
    SyncCharacterHostModal,
    AvatarZoomModal, LastSession, ConnectSessionModal, WrappedSpinner, Blur, CreateSessionModal}
})
export default class VicarPlay extends Vue {

  @Ref("createSessionModal")
  private createSessionModal!: CreateSessionModal;

  @Ref("connectSessionModal")
  private connectSessionModal!: ConnectSessionModal;

  private VicarPlayClient = VicarPlayClient;

  private username: string = "";
  private tsName: string = "";
  private discordName: string = "";

  private loading: boolean = false;
  private loadingText: string = "";

  mounted() {
    this.username = localStorage.getItem("play:username") || "";
    this.tsName = localStorage.getItem("play:tsName") || "";
    this.discordName = localStorage.getItem("play:discordName") || "";
  }

  private get lastSessions() {
    return [...VicarPlayClient.sessionHistory].sort((a, b) => {
      if (!a.date || !b.date) {
        return -1;
      }

      return b.date - a.date;
    });
  }

  private saveUsername() {
    localStorage.setItem("play:username", this.username);
  }

  private saveTsName() {
    localStorage.setItem("play:tsName", this.tsName);
  }

  private saveDiscordName() {
    localStorage.setItem("play:discordName", this.discordName);
  }

  private async closeSession() {
    this.toggleLoader(true, this.$t("play.closing").toString());

    try {
      VicarPlayClient.closeSession();
    } catch (e) {
      console.error(e);
      this.toggleLoader(false);
    }
  }

  @Socket("session:closed")
  private onSessionClosed() {
    VicarPlayClient.session = null;
    this.toggleLoader(false);
  }

  @Provide("play:toggle-loader")
  private toggleLoader(visible: boolean, text: string = "") {
    this.loadingText = text;
    this.loading = visible;
  }

  @Provide("play:get-username")
  private getUsername() {
    return this.username;
  }

  @Provide("play:get-dcname")
  private getDcName() {
    return this.discordName;
  }

  @Provide("play:get-tsname")
  private getTsName() {
    return this.tsName;
  }
}
</script>

<style scoped lang="scss">

</style>
