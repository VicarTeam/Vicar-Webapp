<template>
  <div class="playchat">
    <div class="history" ref="history">
      <div class="message" v-for="(m, i) in vicarPlay.getChatMessages()" :key="i" :class="{'host': m.sender.isHost, 'private': m.isPrivate}">
        <span v-if="isNormalMessage(m)">
          <span v-if="m.sender.isHost">(GM) </span>{{m.sender.name}} &dash; {{m.content}}
        </span>
        <span v-else-if="(m.type === MessageType.BroadcastCommand || m.type === MessageType.PrivateCommand) && m.content['resultType'] === 'hungercheck'">
          <span v-if="m.sender.isHost">(GM) </span>{{m.sender.name}} &dash; {{$t('play.chat.hungercheck' + (m.content['isDuel'] ? '.against' : ''), {status: m.content['status'], success: m.content['success'], diff: m.content['diff']})}}
          <span v-if="m.content['rolls'].length > 0 || m.content['hunger'].length > 0">(<span class="normal">{{m.content['rolls']}}</span><span class="hunger">{{m.content['hunger']}}</span>)</span>
        </span>
        <div v-else-if="m.type === MessageType.Status" class="status">
          <span class="border"></span>
          <small class="content">{{$t('play.status.' + m.content, {name: m.sender.name})}}</small>
          <span class="border"></span>
        </div>
        <div v-else-if="m.type === MessageType.SecretCommand" class="secret-command">
          <i><b>{{$t('play.chat.secret')}} | </b>{{m.content}}</i>
        </div>
        <div v-else-if="m.type === MessageType.PrivateAvatar || m.type === MessageType.BroadcastAvatar" class="avatar" @click="showAvatarZoomModal(m.content)" :class="{'host': m.sender.isHost, 'private': m.isPrivate}">
          <span><span v-if="m.sender.isHost">(GM) </span>{{m.sender.name}}:</span>
          <img :src="m.content"/>
        </div>
        <small v-else-if="m.type === MessageType.Raw">
          <i>{{m.content}}</i>
        </small>
      </div>
    </div>
    <div class="inputs">
      <div class="ta-wrapper">
        <textarea draggable="true" class="form-control" v-model="writingMessage" @keypress.enter="sendMessage"
                  @drop="onSendingImageDrop($event)" :disabled="sendingImage">
        </textarea>
        <div v-if="sendingImage" class="ta-image">
          <img :src="sendingImage"/>
          <div class="remove">
            <IconButton icon="fa-trash" @click="sendingImage = null"/>
          </div>
        </div>
      </div>
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

    <input hidden type="file" accept="image/png, image/gif, image/jpeg" ref="imageUploader" @change="onImageUploader($event)"/>
  </div>
</template>

<script lang="ts">
import {Component, Inject, Ref, Vue} from "vue-property-decorator";
import {vicarPlay} from "@/libs/vicarplay/vicar-play";
import {IHostedSession, IMessage, IPlayer, MessageType} from "@/libs/vicarplay/types";
import {CommandHandler, commandHandler} from "@/libs/vicarplay/commands";
import {State} from "vuex-class";
import {ICharacter} from "@/types/models";
import IconButton from "@/components/IconButton.vue";
import AvatarZoomModal from "@/components/main/play/modals/AvatarZoomModal.vue";
import EventBus from "@/libs/event-bus";

@Component({
  components: {IconButton}
})
export default class PlayChat extends Vue {

  vicarPlay = vicarPlay;
  MessageType = MessageType;

  @Ref("imageUploader")
  private imageUploader!: HTMLInputElement;

  @Ref("history")
  private historyDiv!: HTMLDivElement;

  @State("editingCharacter")
  private editingCharacter!: ICharacter|undefined;

  private writingMessage: string = "";
  private sendingImage: string|null = null;
  private imageUploadChange: ((img: string) => void)|null = null;

  mounted() {
    CommandHandler.uploadImage = this.uploadImage;
  }

  updated() {
    this.$nextTick(() => {
      this.historyDiv.scrollTop = this.historyDiv.scrollHeight;
    });
  }

  private sendMessage() {
    const receiver = vicarPlay.getChatReceiver();
    if (this.sendingImage !== null) {
      vicarPlay.sendChatMessage({
        type: vicarPlay.chatSendTo === "@all" ? MessageType.BroadcastAvatar : MessageType.PrivateAvatar,
        content: this.sendingImage,
        sender: vicarPlay.me,
        isPrivate: receiver !== undefined
      }, receiver);
      this.sendingImage = null;
      return;
    }

    if (this.writingMessage.trim().length <= 0) {
      return;
    }

    const message: IMessage = {
      type: vicarPlay.chatSendTo === "@all" ? MessageType.BroadcastMessage : MessageType.PrivateMessage,
      content: this.writingMessage,
      sender: vicarPlay.me,
      isPrivate: receiver !== undefined
    };

    if (this.writingMessage.trim().startsWith("/")) {
        const result = commandHandler.handle(this.editingCharacter, this.writingMessage.trim().substring(1));
        if (!result) {
          this.writingMessage = "";
          return;
        }

        const [data, secret] = result;
        if (typeof data !== 'string' && data["resultType"] === 'help') {
          const msgs: IMessage[] = data["messages"];
          msgs.forEach(msg => {
            vicarPlay.getChatMessages().push(msg);
          });

          this.writingMessage = "";
          return;
        }

        message.content = data;

        if (secret) {
          message.type = MessageType.SecretCommand;
          vicarPlay.getChatMessages().push(message);
          return;
        }

        message.type = vicarPlay.chatSendTo === "@all" ? MessageType.BroadcastCommand : MessageType.PrivateCommand;
    }

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

  private isNormalMessage(m: IMessage): boolean {
    if (m.type === MessageType.PrivateCommand || m.type === MessageType.BroadcastCommand) {
      return typeof m.content === "string";
    }
    return m.type !== MessageType.PrivateAvatar && m.type !== MessageType.BroadcastAvatar && m.type !== MessageType.Status && m.type !== MessageType.Raw && m.type !== MessageType.SecretCommand;
  }

  private onSendingImageDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer) {
      if (event.dataTransfer.files.length > 0 && event.dataTransfer.files[0].type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent) => {
          if (e.target) {
            this.writingMessage = "";
            this.sendingImage = (e.target as FileReader).result as string;
          }
        };
        reader.readAsDataURL(event.dataTransfer.files[0]);
      }
    }
  }

  private onImageUploader(e: Event) {
    //@ts-ignore
    const file = (e.target as HTMLInputElement).files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent) => {
        if (this.imageUploadChange) {
          this.imageUploadChange((e.target as FileReader).result as string);
          this.imageUploadChange = null;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  private uploadImage(cb: (img: string) => void) {
    this.imageUploadChange = cb;
    this.imageUploader.click();
  }

  private showAvatarZoomModal(url: string) {
    EventBus.$emit("play:show-avatar-zoom-modal", url);
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
      user-select: text;
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
      .normal {
        color: white;
      }
      .hunger {
        color: red;
      }
    }
  }
  .inputs {
    width: 100%;
    flex-shrink: 0;
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
    .ta-wrapper {
      position: relative;
      flex-grow: 1;
      textarea {
        user-select: text;
        resize: none;
        &:focus {
          outline: none !important;
          border: none !important;
          -webkit-box-shadow: none;
          box-shadow: none;
        }
      }
      .ta-image {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        img {
          height: calc(100% - 1rem);
          -webkit-user-drag: none;
        }
        .remove {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          display: none;
          background-color: rgba(0, 0, 0, 0.5);
        }
        &:hover .remove {
          display: flex;
          justify-content: center;
          align-items: center;
        }
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
