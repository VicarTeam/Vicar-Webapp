<template>
  <Modal :shown="show" @close="show = false" :with-close="false">
    <div style="display: flex; flex-direction: column; width: 40rem">
      <span>{{$t('play.sync.select.player')}}:</span>
      <select class="form-control" v-model="character">
        <option v-for="c in characters" :value="c" :key="c.id">{{c.name}}</option>
      </select>
      <div style="width: 100%; display: flex; justify-content: center; align-items: center; margin-top: 1rem">
        <button class="btn btn-primary" @click="finishCharSync">{{$t('play.sync.select.host.btn')}}</button>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import Modal from "@/components/modal/Modal.vue";
import {ICharacter} from "@/types/models";
import CharacterStorage from "@/libs/io/character-storage";
import {vicarPlay} from "@/libs/vicarplay/vicar-play-old";

@Component({
  components: {Modal}
})
export default class SyncCharacterPlayerModal extends Vue {

  private show: boolean = false;
  private character: ICharacter = null!;
  private characters: ICharacter[] = [];
  private callback: (char: ICharacter) => void = null!;

  public showModal(callback: (char: ICharacter) => void) {
    this.characters = [...CharacterStorage.loadedCharacters].sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
    this.character = this.characters[0];
    this.callback = callback;
    this.show = true;
  }

  private finishCharSync() {
    if (!this.character || !this.callback || !vicarPlay.isRunning || vicarPlay.me.isHost) {
      return;
    }

    vicarPlay.syncingChar = this.character;
    this.callback(this.character);
    this.show = false;
  }
}
</script>

<style scoped lang="scss">

</style>
