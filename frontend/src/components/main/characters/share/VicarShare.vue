<template>
  <div class="vicar-share">
    <div class="title">
      <span style="color: var(--primary-color)">{{$t('share.title')}}</span> <TipButton :content="$t('share.description')"/>
    </div>
    <div class="content" v-if="!isAvailable">
      <button class="btn btn-primary" style="height: 4rem; width: 100%" @click="open">
        {{$t('share.open')}}
      </button>
    </div>
    <div class="content" v-else>
      <small><i>{{$t('share.opened')}}</i></small>
      <button class="btn btn-primary" style="height: 4rem; width: 100%" @click="copy">
        {{copyText ? copyText : $t('share.copy')}}
      </button>
      <button class="btn btn-primary" style="height: 4rem; width: 100%" @click="close">
        {{$t('share.close')}}
      </button>
    </div>

    <EnterReceiverModal ref="enterReceiverModal"/>
    <CharReceivedModal ref="charReceivedModal"/>

    <Blur v-if="initialising">
      <WrappedSpinner>
        <i>{{$t('share.opening')}}</i>
      </WrappedSpinner>
    </Blur>
  </div>
</template>

<script lang="ts">
import {Component, Inject, Ref, Vue} from "vue-property-decorator";
import TipButton from "@/components/editor/TipButton.vue";
import Peer from "peerjs";
import Blur from "@/components/modal/Blur.vue";
import WrappedSpinner from "@/components/spinners/WrappedSpinner.vue";
import {ICharacter} from "@/types/models";
import EnterReceiverModal from "@/components/main/characters/share/modals/EnterReceiverModal.vue";
import CharReceivedModal from "@/components/main/characters/share/modals/CharReceivedModal.vue";
import CharacterStorage from "@/libs/io/character-storage";
import {VicarNet} from "@/libs/io/vicar-net";

@Component({
  components: {CharReceivedModal, EnterReceiverModal, WrappedSpinner, Blur, TipButton}
})
export default class VicarShare extends Vue {

  @Ref("enterReceiverModal")
  private enterReceiverModal!: EnterReceiverModal;

  @Ref("charReceivedModal")
  private charReceivedModal!: CharReceivedModal;

  private peer: Peer|null = null;
  private peerId: string|null = null;
  private initialising: boolean = false;
  private copyText: string|null = null;

  private open() {
    if (this.isAvailable) {
      return;
    }

    this.initialising = true;
    this.peer = new Peer();
    this.peer.on("open", async (id: string) => {
      this.peerId = id;

      if (VicarNet.isLoggedIn) {
        await VicarNet.bindVicarShareIdToAlias(id);
      }

      this.initialising = false;
    });
    this.peer.on("connection", conn => {
      conn.on("data", data => {
        const char: ICharacter = <ICharacter>data;
        this.charReceivedModal.showModal(char, () => {
          CharacterStorage.addCharacter(char);
          this.updateCharacterList();
        });
      });
    });
  }

  private close() {
    if (!this.isAvailable) {
      return;
    }

    this.peer!.destroy();
    this.peer = null;
    this.peerId = null;

    if (VicarNet.isLoggedIn) {
      VicarNet.unbindVicarShareIdFromAlias();
    }
  }

  private copy() {
    if (this.peerId && this.isAvailable) {
      navigator.clipboard.writeText(this.peerId).then(() => {
        this.copyText = this.$t('share.copied').toString();
        setTimeout(() => {
          this.copyText = null;
        }, 1000);
      });
    }
  }

  public shareCharacter(char: ICharacter) {
    if (this.isAvailable) {
      this.enterReceiverModal.showModal(char, async id => {
        const resolvedId = await VicarNet.resolveVicarShareId(id);

        const conn = this.peer!.connect(resolvedId);
        conn.on("open", () => {
          conn.send(char);
        });
      });
    }
  }

  public get isAvailable(): boolean {
    return !!this.peer && this.peer.open && !this.peer.destroyed;
  }

  @Inject("update-character-list")
  private updateCharacterList!: () => void;
}
</script>

<style scoped lang="scss">
.vicar-share {
  margin-top: 2rem;
  width: 100%;
  border-radius: 7px;
  border: 1px solid var(--primary-color);
  display: flex;
  flex-direction: column;
  .title {
    width: 100%;
    padding: 0.5rem;
    text-align: center;
    font-size: 1.3rem;
    font-weight: bolder;
    border-bottom: 1px solid var(--primary-color);
  }
  .content {
    margin: 0;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1rem;
  }
}
</style>
