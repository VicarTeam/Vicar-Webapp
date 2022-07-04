<template>
  <interact v-if="VicarPlayClient.isInSession()" class="playmenu card"
            resizable :resizeOption="resizeOptions" @resizemove="resizeMove"
            :draggable="!locked" :dragOption="dragOptions" @dragmove="dragMove"
            :style="{'width': currentWidth + 'px', 'height': currentHeight + 'px', transform: `translate(${currentX}px, ${currentY}px)`}" :class="{'opaque': opaque}">
    <b class="title">{{VicarPlayClient.session.name}}</b>
    <div class="content">
      <component :is="tab"/>
    </div>
    <div class="footer">
      <MenuTab icon="fa-users" tab="PlayPlayers" v-model="tab"/>
      <MenuTab v-if="VicarPlayClient.amIHost() && (VicarPlayClient.me.tsName || VicarPlayClient.me.discordName)" icon="fa-microphone" tab="PlayVoiceIntegration" v-model="tab"/>
      <MenuTab icon="fa-message" tab="PlayChat" v-model="tab"/>

      <div class="iconbtn" style="pointer-events: auto; margin-top: 0.5rem; margin-left: auto" @click="locked = !locked">
        <i class="fa-solid" :class="!locked ? 'fa-lock' : 'fa-lock-open'"></i>
      </div>
      <div class="iconbtn" style="pointer-events: auto; margin-top: 0.5rem" @click="opaque = !opaque">
        <i class="fa-solid" :class="!opaque ? 'fa-eye-slash' : 'fa-eye'"></i>
      </div>
    </div>
  </interact>
</template>

<script lang="ts">
import {Component, Inject, Vue} from "vue-property-decorator";
import MenuTab from "@/components/main/play/menu/MenuTab.vue";
import PlayChat from "@/components/main/play/menu/components/PlayChat.vue";
import PlayPlayers from "@/components/main/play/menu/components/PlayPlayers.vue";
import IconButton from "@/components/IconButton.vue";
import interact from "interactjs";
import PlayVoiceIntegration from "@/components/main/play/menu/components/PlayVoiceIntegration.vue";
import VicarPlayClient from "@/libs/vicarplay/vicar-play";

@Component({
  components: {PlayVoiceIntegration, IconButton, PlayPlayers, PlayChat, MenuTab}
})
export default class PlayMenu extends Vue {

  private VicarPlayClient = VicarPlayClient;
  private currentWidth: number = 500;
  private currentHeight: number = 600;
  private currentX: number = 0;
  private currentY: number = 0;
  private tab: string = "";
  private opaque: boolean = false;
  private locked: boolean = true;

  mounted() {
    this.currentWidth = parseInt(localStorage.getItem("play:width") || "500");
    this.currentHeight = parseInt(localStorage.getItem("play:height") || "600");
    this.currentX = parseInt(localStorage.getItem("play:x") || "0");
    this.currentY = parseInt(localStorage.getItem("play:y") || "0");
    this.tab = localStorage.getItem("play:tab") || "PlayChat";
  }

  private get resizeOptions() {
    return {
      edges: { left: true, right: true, bottom: true, top: true }
    };
  }

  private get dragOptions() {
    return {
      modifiers: [
          interact.modifiers.restrictRect({
            restriction: this.getContentWrapper(),
            endOnly: true
          })
      ]
    };
  }

  private dragMove(event: any) {
    this.currentX += event.dx;
    this.currentY += event.dy;
    localStorage.setItem("play:x", this.currentX.toString());
    localStorage.setItem("play:y", this.currentY.toString());
  }

  private resizeMove(event: any) {
    this.currentWidth = event.rect.width;
    this.currentHeight = event.rect.height;
    this.currentX += event.deltaRect.left;
    this.currentY += event.deltaRect.top;

    localStorage.setItem("play:width", this.currentWidth.toString());
    localStorage.setItem("play:height", this.currentHeight.toString());
    localStorage.setItem("play:x", this.currentX.toString());
    localStorage.setItem("play:y", this.currentY.toString());
  }

  @Inject("get-content-wrapper")
  private getContentWrapper!: () => HTMLDivElement;
}
</script>

<style scoped lang="scss">
.playmenu {
  padding: 1rem;
  position: relative;
  min-height: 250px;
  min-width: 200px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  margin: 0;
  display: flex;
  flex-direction: column;
  &.opaque {
    opacity: 0.2;
    pointer-events: none;
  }
  .title {
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 1.8rem;
    font-weight: bold;
    text-align: center;
    flex-shrink: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  }
  .content {
    display: flex;
    flex-grow: 1;
    margin: 1rem 0;
    overflow-x: hidden;
    overflow-y: auto;
  }
  .footer {
    position: relative;
    display: flex;
    flex-shrink: 0;
    border-top: 1px solid rgba(255, 255, 255, 0.3);
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
}
</style>
