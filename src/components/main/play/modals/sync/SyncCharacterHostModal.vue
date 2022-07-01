<template>
  <Modal :shown="show" @close="show = false">
    <div style="display: flex; flex-direction: column; width: 40rem">
      <span>{{$t('play.sync.select.host')}}:</span>
      <select class="form-control" v-model="character">
        <option value="@new">{{$t('play.sync.select.host.new')}}</option>
        <option v-for="c in characters" :value="c.char" :key="c.char.id">{{c.text}}</option>
      </select>
      <div style="width: 100%; display: flex; justify-content: center; align-items: center; margin-top: 1rem">
        <button class="btn btn-primary" @click="requestCharSync">{{$t('play.sync.select.host.btn')}}</button>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts">
import {Component, Inject, Vue} from "vue-property-decorator";
import Modal from "@/components/modal/Modal.vue";
import CharacterStorage from "@/libs/io/character-storage";
import {IHostedSession, IPlayer} from "@/libs/vicarplay/types";
import {vicarPlay} from "@/libs/vicarplay/vicar-play";
import {ICharacter} from "@/types/models";
import EventBus from "@/libs/event-bus";

interface ICharacterOption {
  text: string;
  char: ICharacter;
}

@Component({
  components: {Modal}
})
export default class SyncCharacterHostModal extends Vue {

  private show: boolean = false;
  private player: IPlayer | null = null;
  private character: "@new"|ICharacter = "@new";
  private characters: ICharacterOption[] = [];

  public showModal(player: IPlayer) {
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

    if (!vicarPlay.isRunning || !vicarPlay.me.isHost) {
      return;
    }

    this.player.isSyncLoading = true;
    vicarPlay.sendPlayer(this.player, "request:sync-char", (syncChar: ICharacter) => {
      if (this.character === "@new") {
        CharacterStorage.addCharacter(syncChar);
        (<IHostedSession>vicarPlay.session).syncChars[this.player!.id] = syncChar.id;
      } else {
        Object.entries(syncChar).forEach(([key, value]) => {
          if (key === "id") {
            return;
          }
          // @ts-ignore
          this.character[key] = value;
        });
        (<IHostedSession>vicarPlay.session).syncChars[this.player!.id] = this.character.id;
      }
      this.player!.isSyncLoading = false;
      EventBus.$emit("update-character-list");
    });
    this.show = false;
  }
}
</script>

<style scoped lang="scss">

</style>
