<template>
  <div class="playplayers">
    <div class="sessionid">
      <div class="id"><b>{{$t('play.players.id')}}:</b> {{VicarPlayClient.session.id}}</div>
      <div class="copy iconbtn" @click="copyId">
        <i class="fa-solid" :class="copyIcon"></i>
      </div>
    </div>
    <div class="player">
      <span class="text you">
        <b>{{VicarPlayClient.session.host.username}}</b>
        <small v-if="VicarPlayClient.amIHost()"> ({{$t('play.players.you')}})</small>
      </span>
      <div v-if="VicarPlayClient.amIHost() && VicarPlayClient.isVoiceIntegrationActive" class="kick iconbtn" @click="movePlayer(VicarPlayClient.me)">
        <i class="fa-solid" :class="{'fa-user-group': VicarPlayClient.me.isInVoiceMain, 'fa-user': !VicarPlayClient.me.isInVoiceMain}"></i>
      </div>
    </div>
    <div class="player" v-for="p in players">
      <span class="text">
        {{p.username}}
        <small v-if="VicarPlayClient.me.socketId === p.socketId"> ({{$t('play.players.you')}})</small>
        <small v-if="isPlayerSyncing(p)"> - <i>{{$t('play.sync.syncing')}}</i></small>
      </span>
      <div class="kick iconbtn" v-if="!isPlayerSyncing(p) && VicarPlayClient.amIHost()" @click="startPlayerCharSync(p)" :class="{'loading': p.isSyncLoading}">
        <i class="fa-solid fa-rotate"></i>
      </div>
      <div v-if="VicarPlayClient.amIHost()" class="kick iconbtn" @click="VicarPlayClient.kickPlayer(p)">
        <i class="fa-solid fa-right-from-bracket"></i>
      </div>
      <div v-if="VicarPlayClient.amIHost() && VicarPlayClient.isVoiceIntegrationActive" class="kick iconbtn" @click="movePlayer(p)">
        <i class="fa-solid" :class="{'fa-user-group': p.isInVoiceMain, 'fa-user': !p.isInVoiceMain}"></i>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import {IClientIdenity} from "@/libs/vicarplay/types";
import EventBus from "@/libs/event-bus";
import VicarPlayClient from "@/libs/vicarplay/vicar-play";

@Component({
  components: {}
})
export default class PlayPlayers extends Vue {

  private VicarPlayClient = VicarPlayClient;
  private copyIcon: string = "fa-paste";

  private get players(): IClientIdenity[] {
    if (!VicarPlayClient.session) {
      return [];
    }

    return [...VicarPlayClient.session.players].sort((a, b) => {
      if (a.username < b.username) {
        return -1;
      }
      if (a.username > b.username) {
        return 1;
      }
      return 0;
    });
  }

  private copyId() {
    navigator.clipboard.writeText(VicarPlayClient.session!.id);
    this.copyIcon = "fa-check";
    setTimeout(() => {
      this.copyIcon = "fa-paste";
    }, 1500);
  }

  private async movePlayer(player: IClientIdenity) {
    if (VicarPlayClient.isVoiceIntegrationActive) {
      VicarPlayClient.socket.emit("voice:move-player", player.socketId, player.isInVoiceMain);
    }
  }

  private startPlayerCharSync(player: IClientIdenity) {
    if (player.isSyncLoading) {
      return;
    }

    this.showSyncCharacterHostModal(player);
  }

  private showSyncCharacterHostModal(player: IClientIdenity) {
    EventBus.$emit("play:show-sync-character-host-modal", player);
  }

  private isPlayerSyncing(player: IClientIdenity) {
    return !!player.syncingCharId;
  }
}
</script>

<style scoped lang="scss">
.playplayers {
  width: 100%;
  min-height: 100%;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  .sessionid {
    width: 100%;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    flex-direction: row;
    border-bottom: 1px solid rgba(255, 255, 255, 0.4);
    .id {
      flex-grow: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      flex-wrap: nowrap;
      white-space: nowrap;
    }
    .copy {
      flex-shrink: 0;
    }
  }
  .player {
    width: 100%;
    display: flex;
    padding: 0.5rem;
    .text {
      flex-grow: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      flex-wrap: nowrap;
      white-space: nowrap;
      &.you {
        font-style: italic;
      }
    }
    .kick {
      flex-shrink: 0;
    }
  }
}
</style>
