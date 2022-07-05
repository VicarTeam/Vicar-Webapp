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
import VicarPlayClient from "@/libs/vicarplay/vicar-play";

@Component({
  components: {Modal}
})
export default class SyncCharacterPlayerModal extends Vue {

  private show: boolean = false;
  private character: ICharacter = null!;
  private characters: ICharacter[] = [];
  private savingChar: string = null!;

  public showModal(savingChar: string) {
    this.characters = [...CharacterStorage.loadedCharacters].sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
    this.character = this.characters[0];
    this.savingChar = savingChar;
    this.show = true;
  }

  private finishCharSync() {
    if (!this.character || !this.savingChar || !VicarPlayClient.isInSession() || VicarPlayClient.amIHost()) {
      return;
    }

    VicarPlayClient.syncingChar = this.character;
    VicarPlayClient.socket.emit("sync-char:response", this.savingChar, this.character);
    this.show = false;
  }
}
</script>

<style scoped lang="scss">

</style>
