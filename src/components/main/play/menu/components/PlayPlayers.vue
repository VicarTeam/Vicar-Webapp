<template>
  <div class="playplayers">
    <div class="sessionid">
      <div class="id"><b>{{$t('play.players.id')}}:</b> {{vicarPlay.session.host.id}}</div>
      <div class="copy iconbtn" @click="copyId">
        <i class="fa-solid" :class="copyIcon"></i>
      </div>
    </div>
    <div class="player">
      <span class="text you"><b>{{vicarPlay.session.host.name}}</b></span>
    </div>
    <div class="player" v-for="p in players">
      <span class="text">{{p.name}}</span>
      <div class="kick iconbtn" @click="vicarPlay.kickPlayer(p)">
        <i class="fa-solid fa-right-from-bracket"></i>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import {vicarPlay} from "@/libs/vicarplay/vicar-play";
import {IHostedSession, IPlayer} from "@/libs/vicarplay/types";

@Component({
  components: {}
})
export default class PlayPlayers extends Vue {

  vicarPlay = vicarPlay;
  private copyIcon: string = "fa-paste";

  private get players(): IPlayer[] {
    return [...(<IHostedSession>this.vicarPlay.session).players].sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    });
  }

  private copyId() {
    navigator.clipboard.writeText(vicarPlay.session.host.id);
    this.copyIcon = "fa-check";
    setTimeout(() => {
      this.copyIcon = "fa-paste";
    }, 1500);
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
