<template>
  <div class="playvoiceintegration">
    <span style="width: 100%; text-align: center"><b>{{$t('play.voice.title')}}</b></span>

    <select class="form-control" v-model="VicarPlayClient.voiceIntegrationData.type">
      <option :value="VoiceType.Discord">{{$t('play.voice.dc')}}</option>
      <option :value="VoiceType.TeamSpeak">{{$t('play.voice.ts')}}</option>
    </select>

    <div style="display: flex; gap: 1rem">
      <input class="form-control" type="text" :placeholder="$t('play.voice.mainchannel')" v-model="VicarPlayClient.voiceIntegrationData.mainChannel"/>
      <input class="form-control" type="text" :placeholder="$t('play.voice.privatechannel')" v-model="VicarPlayClient.voiceIntegrationData.privateChannel"/>
    </div>

    <hr style="width: 100%">

    <div v-if="VicarPlayClient.voiceIntegrationData.type === VoiceType.Discord" style="width: 100%">
      <div style="display: flex; gap: 1rem">
        <input class="form-control" type="text" :placeholder="$t('play.voice.dc.token')" v-model="VicarPlayClient.voiceIntegrationData.dcToken"/>
        <input class="form-control" type="text" :placeholder="$t('play.voice.dc.guild')" v-model="VicarPlayClient.voiceIntegrationData.dcGuild"/>
      </div>
    </div>

    <div v-else-if="VicarPlayClient.voiceIntegrationData.type === VoiceType.TeamSpeak" style="width: 100%; display: flex; flex-direction: column; gap: 1rem">
      <div style="display: flex; gap: 1rem">
        <input class="form-control" type="text" :placeholder="$t('play.voice.ts.host')" v-model="VicarPlayClient.voiceIntegrationData.tsHost"/>
        <div style="display: flex; gap: 1rem">
          <input class="form-control" type="number" :placeholder="$t('play.voice.ts.port')" v-model="VicarPlayClient.voiceIntegrationData.tsPort"/>
          <input class="form-control" type="number" :placeholder="$t('play.voice.ts.queryport')" v-model="VicarPlayClient.voiceIntegrationData.tsQueryPort"/>
        </div>
      </div>
      <div style="display: flex; gap: 1rem">
        <input class="form-control" type="text" :placeholder="$t('play.voice.ts.username')" v-model="VicarPlayClient.voiceIntegrationData.tsUsername"/>
        <input class="form-control" type="password" :placeholder="$t('play.voice.ts.password')" v-model="VicarPlayClient.voiceIntegrationData.tsPassword"/>
      </div>
    </div>

    <hr style="width: 100%">

    <div style="width: 100%; display: flex; justify-content: center; align-items: center">
      <button v-if="!VicarPlayClient.isVoiceIntegrationActive" class="btn btn-primary" @click="startVoiceIntegration">{{$t('play.voice.start')}}</button>
      <button v-else class="btn btn-primary" @click="stopVoiceIntegration">{{$t('play.voice.stop')}}</button>
    </div>
  </div>
</template>

<script lang="ts">
import {VoiceType} from "@/libs/vicarplay/voice-integration";
import {Component, Vue} from "vue-property-decorator";
import VicarPlayClient from "@/libs/vicarplay/vicar-play";

@Component({
  components: {}
})
export default class PlayVoiceIntegration extends Vue {

  private VicarPlayClient = VicarPlayClient;
  private VoiceType = VoiceType;

  private async startVoiceIntegration() {
    VicarPlayClient.socket.emit("voice:start", VicarPlayClient.voiceIntegrationData);
  }

  private async stopVoiceIntegration() {
    VicarPlayClient.socket.emit("voice:stop");
  }
}
</script>

<style scoped lang="scss">
.playvoiceintegration {
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 0.1rem 1rem;
  gap: 1rem;
}
</style>
