<template>
  <interact class="playmenu card" resizable :resizeOption="resizeOptions" @resizemove="resizeMove"
            :style="{'width': currentWidth + 'px', 'height': currentHeight + 'px'}">
    <div class="resize-handle">
      <i class="fa-solid fa-up-right-and-down-left-from-center"></i>
    </div>
  </interact>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";

@Component({
  components: {}
})
export default class PlayMenu extends Vue {

  private currentWidth: number = 200;
  private currentHeight: number = 250;

  mounted() {
    this.currentWidth = parseInt(localStorage.getItem("play:width") || "200");
    this.currentHeight = parseInt(localStorage.getItem("play:height") || "250");
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
  padding: 0;
  position: relative;
  min-height: 250px;
  min-width: 200px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  margin: 0;
  .resize-handle {
    margin: 0;
    position: absolute;
    left: 5px;
    bottom: 5px;
    width: 10px;
    height: 10px;
    cursor: sw-resize;
    color: #3b3b3b;
    font-size: 10px;
  }
}
</style>