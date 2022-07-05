<template>
  <div class="last-session">
    <div class="text">
      <b>{{session.name}}</b><i v-if="session.date" style="margin-left: 0.5rem">{{$t('play.history.date', {date: getFormattedDate()})}}</i>
    </div>
    <IconButton v-if="!VicarPlayClient.isInSession() && getUsername()" icon="fa-arrows-rotate" @click="reopenSession"/>
  </div>
</template>

<script lang="ts">
import {Component, Inject, Prop, Vue} from "vue-property-decorator";
import {ILastPlaySession} from "@/libs/vicarplay/types";
import IconButton from "@/components/IconButton.vue";
import VicarPlayClient from "@/libs/vicarplay/vicar-play";

@Component({
  components: {IconButton}
})
export default class LastSession extends Vue {

  private VicarPlayClient = VicarPlayClient;

  @Prop({required: true})
  private session!: ILastPlaySession;

  private reopenSession() {
    const username = this.getUsername();
    const tsName = this.getTsName();
    const discordName = this.getDiscordName();

    VicarPlayClient.voiceIntegrationData = this.session.voiceData;
    VicarPlayClient.socket.emit("session:init", "create", {
      username, tsName, discordName
    }, this.session.name);
  }

  private getFormattedDate() {
    if (!this.session.date) {
      return "";
    }

    const date = new Date(this.session.date);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${day}.${month}.${year} ${hours}:${minutes}`;
  }

  @Inject("play:get-username")
  private getUsername!: () => string;

  @Inject("play:get-dcname")
  private getDiscordName!: () => string;

  @Inject("play:get-tsname")
  private getTsName!: () => string;
}
</script>

<style scoped lang="scss">
.last-session {
  width: 100%;
  border: 1px solid var(--primary-color);
  border-radius: 5px;
  padding: 1rem 1rem 1rem 1.5rem;
  display: flex;
  user-select: none;
  .text {
    flex-grow: 1;
    display: flex;
    align-items: center;
    font-size: 1.8rem;
  }
}
</style>
