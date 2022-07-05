<template>
  <Modal :shown="show" @close="show = false">
    <div style="display: flex; flex-direction: column; width: 40rem">
      <span>{{$t('play.sync.select.host')}}:</span>
      <select class="form-control" v-model="character">
        <option value="@new">{{$t('play.sync.select.host.new')}}</option>
        <option v-for="c in characters" :value="c.char.id" :key="c.char.id">{{c.text}}</option>
      </select>
      <div style="width: 100%; display: flex; justify-content: center; align-items: center; margin-top: 1rem">
        <button class="btn btn-primary" @click="requestCharSync">{{$t('play.sync.select.host.btn')}}</button>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import Modal from "@/components/modal/Modal.vue";
import CharacterStorage from "@/libs/io/character-storage";
import {IClientIdenity} from "@/libs/vicarplay/types";
import {ICharacter} from "@/types/models";
import VicarPlayClient from "@/libs/vicarplay/vicar-play";

interface ICharacterOption {
  text: string;
  char: ICharacter;
}

@Component({
  components: {Modal}
})
export default class SyncCharacterHostModal extends Vue {

  private show: boolean = false;
  private player: IClientIdenity | null = null;
  private character: string = "@new";
  private characters: ICharacterOption[] = [];

  public showModal(player: IClientIdenity) {
    this.characters = CharacterStorage.getSortedCharacters().flatMap(s => {
      return s.characters.sort((a, b) => a.name.localeCompare(b.name)).map(c => {
        return {
          text: s.directory ? s.directory.name + " - " + c.name : c.name,
          char: c
        };
      });
    }).sort((a, b) => {
      return a.text.localeCompare(b.text);
    });
    this.player = player;
    this.character = "@new";
    this.show = true;
  }

  private requestCharSync() {
    if (!this.player) {
      return;
    }

    if (!VicarPlayClient.isInSession() || !VicarPlayClient.amIHost()) {
      return;
    }

    this.player.isSyncLoading = true;
    VicarPlayClient.socket.emit("sync-char:request", this.player.socketId, this.character);
    this.show = false;
  }
}
</script>

<style scoped lang="scss">

</style>
