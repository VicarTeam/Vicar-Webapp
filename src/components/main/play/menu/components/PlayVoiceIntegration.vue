<template>
  <div class="playvoiceintegration">
    <span>Teyst</span>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";

enum VoiceType {
  Discord = "dc", TeamSpeak = "ts"
}

export interface IVoiceIntegrationData {
  software: VoiceType;

}



@Component({
  components: {}
})
export default class PlayVoiceIntegration extends Vue {

  private VoiceType = VoiceType;
}
</script>

<style scoped lang="scss">
.playvoiceintegration {
  width: 100%;
  display: flex;
  flex-direction: column;
}
</style>
