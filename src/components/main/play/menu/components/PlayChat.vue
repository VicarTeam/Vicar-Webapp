<template>
  <div class="playchat">
    <div class="history">
      <div class="message" v-for="(m, i) in vicarPlay.getChatMessages()" :key="i" :class="{'host': m.sender.isHost, 'private': m.isPrivate}">
        <span v-if="m.type !== MessageType.PrivateAvatar && m.type !== MessageType.BroadcastAvatar && m.type !== MessageType.Status">
          <span v-if="m.sender.isHost">(GM) </span>{{m.sender.name}} &dash; {{m.content}}
        </span>
        <div v-else-if="m.type === MessageType.Status" class="status">
          <span class="border"></span>
          <small class="content">{{$t('play.status.' + m.content, {name: m.sender.name})}}</small>
          <span class="border"></span>
        </div>
        <div v-else class="avatar" @click="avatarZoomModal.showModal(m.content)" :class="{'host': m.sender.isHost, 'private': m.isPrivate}">
          <span><span v-if="m.sender.isHost">(GM) </span>{{m.sender.name}}:</span>
          <img :src="m.content"/>
        </div>
      </div>
    </div>
    <div class="inputs">
      <textarea class="form-control" v-model="writingMessage" @keypress.enter="sendMessage"></textarea>
      <div class="actions">
        <div class="row" style="flex-shrink: 0">
          <select class="form-control" v-model="vicarPlay.chatSendTo">
            <option value="@all">{{$t('play.chat.sendmode.all')}}</option>
            <option v-if="!vicarPlay.session.isHost" :value="vicarPlay.session.host.id">{{$t('play.chat.sendmode.host')}}</option>
            <option v-for="p in getPlayers()" :key="p.id" :value="p.id">{{$t('play.chat.sendmode.private', {player: p.name})}}</option>
          </select>
        </div>
        <div class="row" style="flex-grow: 1">
          <button class="btn btn-primary" style="height: calc(100% - 0.5rem); margin-top: 0.5rem; width: 100%" @click="sendMessage">
            {{$t('play.chat.send')}}
          </button>
        </div>
      </div>
    </div>

    <AvatarZoomModal ref="avatarZoomModal"/>
  </div>
</template>

<script lang="ts">
import {Component, Ref, Vue} from "vue-property-decorator";
import {vicarPlay} from "@/libs/vicarplay/vicar-play";
import {IHostedSession, IMessage, IPlayer, MessageType} from "@/libs/vicarplay/types";
import AvatarZoomModal from "@/components/main/play/modals/AvatarZoomModal.vue";

@Component({
  components: {AvatarZoomModal}
})
export default class PlayChat extends Vue {

  vicarPlay = vicarPlay;
  MessageType = MessageType;

  @Ref("avatarZoomModal")
  private avatarZoomModal!: AvatarZoomModal;

  private writingMessage: string = "";

  private sendMessage() {
    if (this.writingMessage.trim().length <= 0) {
      return;
    }

    const receiver = vicarPlay.getChatReceiver();
    const message: IMessage = {
      type: vicarPlay.chatSendTo === "@all" ? MessageType.BroadcastMessage : MessageType.PrivateMessage,
      content: this.writingMessage,
      sender: vicarPlay.me,
      isPrivate: receiver !== undefined
    };

    vicarPlay.sendChatMessage(message, receiver);
    this.writingMessage = "";
  }

  private getPlayers(): IPlayer[] {
    if (!vicarPlay.session.isHost) {
      return [];
    }
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
}
</script>

<style scoped lang="scss">
.playchat {
  width: 100%;
  display: flex;
  flex-direction: column;
  .history {
    width: 100%;
    border-radius: 5px;
    background-color: #1F2225;
    flex-grow: 1;
    margin-bottom: 0.5rem;
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
    overflow-y: auto;
    gap: 0.5rem;
    .message {
      &.host {
        font-style: italic;
      }
      &.private {
        color: var(--primary-color-light);
        font-weight: 650;
      }
      .avatar {
        padding: 0.5rem;
        border-radius: 8px;
        background-color: #181B1F;
        width: 50%;
        cursor: pointer;
        img {
          width: 100%;
          -webkit-user-drag: none;
        }
      }
      .status {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: row;
        gap: 1rem;
        .border {
          margin-left: 1rem;
          margin-right: 1rem;
          flex-grow: 1;
          height: 1px;
          background-color: rgba(255, 255, 255, 0.1);
        }
        .content {
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          display: flex;
          font-style: italic;
          color: rgba(255, 255, 255, 0.5);
          margin: 0;
        }
      }
    }
  }
  .inputs {
    width: 100%;
    flex-shrink: 0;
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
    textarea {
      flex-grow: 1;
      resize: none;
      &:focus {
        outline: none !important;
        border: none !important;
        -webkit-box-shadow: none;
        box-shadow: none;
      }
    }
    .actions {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      .row {
        width: 100%;
      }
    }
  }
}
</style>
