<template>
  <interact v-if="vicarPlay.isRunning" class="playmenu card" resizable :resizeOption="resizeOptions" @resizemove="resizeMove"
            :style="{'width': currentWidth + 'px', 'height': currentHeight + 'px'}" :class="{'opaque': opaque}">
    <b class="title">{{vicarPlay.session.name}}</b>
    <div class="content">
      <component :is="tab"/>
    </div>
    <div class="footer">
      <MenuTab v-if="vicarPlay.session.isHost" icon="fa-users" tab="PlayPlayers" v-model="tab"/>
      <MenuTab icon="fa-message" tab="PlayChat" v-model="tab"/>

      <div class="iconbtn" style="pointer-events: auto; margin-top: 0.5rem; margin-left: auto" @click="opaque = !opaque">
        <i class="fa-solid" :class="!opaque ? 'fa-eye-slash' : 'fa-eye'"></i>
      </div>
    </div>
  </interact>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import {vicarPlay} from "@/libs/vicarplay/vicar-play";
import MenuTab from "@/components/main/play/menu/MenuTab.vue";
import PlayChat from "@/components/main/play/menu/components/PlayChat.vue";
import PlayPlayers from "@/components/main/play/menu/components/PlayPlayers.vue";
import IconButton from "@/components/IconButton.vue";

@Component({
  components: {IconButton, PlayPlayers, PlayChat, MenuTab}
})
export default class PlayMenu extends Vue {

  vicarPlay = vicarPlay;
  private currentWidth: number = 500;
  private currentHeight: number = 600;
  private tab: string = "";
  private opaque: boolean = false;

  mounted() {
    this.currentWidth = parseInt(localStorage.getItem("play:width") || "500");
    this.currentHeight = parseInt(localStorage.getItem("play:height") || "600");
    this.tab = localStorage.getItem("play:tab") || "PlayChat";
  }

  private get resizeOptions() {
    return {
      edges: { left: true, right: false, bottom: true, top: false }
    };
  }

  private resizeMove(event: any) {
    this.currentWidth = event.rect.width;
    this.currentHeight = event.rect.height;
    localStorage.setItem("play:width", this.currentWidth.toString());
    localStorage.setItem("play:height", this.currentHeight.toString());
  }
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
