<template>
  <div class="page-wrapper">
    <div class="content-wrapper" ref="contentWrapper">
      <router-view/>
    </div>

    <TipModal ref="tipModal"/>

    <PlayMenu v-if="VicarPlayClient.isMenuOpen" style="position: absolute; right: 0.5rem; top: 5rem; z-index: 11; margin-right: 0; margin-top: 0"/>

    <AvatarZoomModal ref="avatarZoomModal"/>
    <SyncCharacterHostModal ref="syncCharacterHostModal"/>
    <SyncCharacterPlayerModal ref="syncCharacterPlayerModal"/>
  </div>
</template>

<script lang="ts">
import {Component, Provide, Ref, Vue} from "vue-property-decorator";
import TipModal from "@/components/editor/TipModal.vue";
import PlayMenu from "@/components/main/play/menu/PlayMenu.vue";
import EventBus from "@/libs/event-bus";
import {ICharacter} from "@/types/models";
import SyncCharacterPlayerModal from "@/components/main/play/modals/sync/SyncCharacterPlayerModal.vue";
import SyncCharacterHostModal from "@/components/main/play/modals/sync/SyncCharacterHostModal.vue";
import AvatarZoomModal from "@/components/main/play/modals/AvatarZoomModal.vue";
import {IPlayer} from "@/libs/vicarplay/types";
import VicarPlayClient from "@/libs/vicarplay/vicar-play";

@Component({
  components: {AvatarZoomModal, SyncCharacterHostModal, SyncCharacterPlayerModal, TipModal, PlayMenu}
})
export default class App extends Vue {

  private VicarPlayClient = VicarPlayClient;

  @Ref("contentWrapper")
  private contentWrapper!: HTMLDivElement;

  @Ref("syncCharacterPlayerModal")
  private syncCharacterPlayerModal!: SyncCharacterPlayerModal;

  @Ref("syncCharacterHostModal")
  private syncCharacterHostModal!: SyncCharacterHostModal;

  @Ref("avatarZoomModal")
  private avatarZoomModal!: AvatarZoomModal;

  @Ref("tipModal")
  private tipModal!: TipModal;

  mounted() {
    EventBus.$on("show-synccharplayermodal", this.onSyncCharacterPlayerModalShow);
    EventBus.$on("play:show-avatar-zoom-modal", this.showAvatarZoomModal);
    EventBus.$on("play:show-sync-character-host-modal", this.showSyncCharacterHostModal);
  }

  private showAvatarZoomModal(avatarUrl: string) {
    this.avatarZoomModal.showModal(avatarUrl);
  }

  private showSyncCharacterHostModal(player: IPlayer) {
    this.syncCharacterHostModal.showModal(player);
  }

  private onSyncCharacterPlayerModalShow(callback: (char: ICharacter) => void) {
    this.syncCharacterPlayerModal.showModal(callback);
  }

  @Provide("show-tip")
  private showTip(content: any, title?: any) {
    this.tipModal.showModal(title, content);
  }

  @Provide("get-content-wrapper")
  private getContentWrapper() {
    return this.contentWrapper;
  }
}
</script>
