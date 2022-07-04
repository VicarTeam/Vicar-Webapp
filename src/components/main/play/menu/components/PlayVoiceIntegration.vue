<template>
  <div class="playvoiceintegration">
    <span style="width: 100%; text-align: center"><b>{{$t('play.voice.title')}}</b></span>

    <select class="form-control" v-model="vicarPlay.voiceIntegrationData.type">
      <option :value="VoiceType.Discord">{{$t('play.voice.dc')}}</option>
      <option :value="VoiceType.TeamSpeak">{{$t('play.voice.ts')}}</option>
    </select>

    <div style="display: flex; gap: 1rem">
      <input class="form-control" type="text" :placeholder="$t('play.voice.url')" v-model="vicarPlay.voiceIntegrationData.url"/>
    </div>

    <div style="display: flex; gap: 1rem">
      <input class="form-control" type="text" :placeholder="$t('play.voice.mainchannel')" v-model="vicarPlay.voiceIntegrationData.mainChannel"/>
      <input class="form-control" type="text" :placeholder="$t('play.voice.privatechannel')" v-model="vicarPlay.voiceIntegrationData.privateChannel"/>
    </div>

    <hr style="width: 100%">

    <div v-if="vicarPlay.voiceIntegrationData.type === VoiceType.Discord" style="width: 100%">
      <div style="display: flex; gap: 1rem">
        <input class="form-control" type="text" :placeholder="$t('play.voice.dc.token')" v-model="vicarPlay.voiceIntegrationData.dcToken"/>
        <input class="form-control" type="text" :placeholder="$t('play.voice.dc.guild')" v-model="vicarPlay.voiceIntegrationData.dcGuild"/>
      </div>
    </div>

    <div v-else-if="vicarPlay.voiceIntegrationData.type === VoiceType.TeamSpeak" style="width: 100%; display: flex; flex-direction: column; gap: 1rem">
      <div style="display: flex; gap: 1rem">
        <input class="form-control" type="text" :placeholder="$t('play.voice.ts.host')" v-model="vicarPlay.voiceIntegrationData.tsHost"/>
        <div style="display: flex; gap: 1rem">
          <input class="form-control" type="number" :placeholder="$t('play.voice.ts.port')" v-model="vicarPlay.voiceIntegrationData.tsPort"/>
          <input class="form-control" type="number" :placeholder="$t('play.voice.ts.queryport')" v-model="vicarPlay.voiceIntegrationData.tsQueryPort"/>
        </div>
      </div>
      <div style="display: flex; gap: 1rem">
        <input class="form-control" type="text" :placeholder="$t('play.voice.ts.username')" v-model="vicarPlay.voiceIntegrationData.tsUsername"/>
        <input class="form-control" type="password" :placeholder="$t('play.voice.ts.password')" v-model="vicarPlay.voiceIntegrationData.tsPassword"/>
      </div>
    </div>

    <hr style="width: 100%">

    <div style="width: 100%; display: flex; justify-content: center; align-items: center">
      <button v-if="!vicarPlay.voiceIntegration" class="btn btn-primary" @click="startVoiceIntegration">{{$t('play.voice.start')}}</button>
      <button v-else class="btn btn-primary" @click="stopVoiceIntegration">{{$t('play.voice.stop')}}</button>
    </div>
  </div>
</template>

<script lang="ts">
import {VoiceIntegration, VoiceType} from "@/libs/vicarplay/voice-integration";
import {Component, Vue} from "vue-property-decorator";
import {vicarPlay} from "@/libs/vicarplay/vicar-play-old";

@Component({
  components: {}
})
export default class PlayVoiceIntegration extends Vue {

  private vicarPlay = vicarPlay;
  private VoiceType = VoiceType;

  private async startVoiceIntegration() {
    try {
      const integration = new VoiceIntegration(this.vicarPlay.voiceIntegrationData);
      await integration.start();
      vicarPlay.voiceIntegration = integration;
    } catch (e) {
      console.error(e);
    }
  }

  private async stopVoiceIntegration() {
    try {
      if (vicarPlay.voiceIntegration) {
        await vicarPlay.voiceIntegration.stop();
        vicarPlay.voiceIntegration = null;
      }
    } catch (e) {
      console.error(e);
    }
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
