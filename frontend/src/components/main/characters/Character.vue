<template>
  <div class="character-entry">
    <Avatar :src="character.avatar" style="width: 5rem; height: 5rem"/>

    <div class="info">
      <span class="title">{{character.name}}</span>
      <span class="subtitle">
            {{$t('character.sex.' + character.sex)}}
            <bullet/>
            {{character.concept}}
            <bullet v-if="character.concept"/>
            <i> Clan:</i> {{character.clan.name}}
            <bullet/>
            {{character.clan.slogan}}
            <bullet/>
            <i> Generation:</i> {{character.generation}} ({{$t('character.generation.' + character.generationEra)}})
            <bullet v-if="character.chronicle"/>
            {{character.chronicle}}
            <bullet v-if="character.exp > 0"/>
            <span v-if="character.exp > 0"><i> EXP:</i> {{character.exp}}</span>
          </span>
    </div>

    <div class="actions">
      <IconButton icon="fa-trash" @click="beginCharDeletion(character)"/>
      <IconButton icon="fa-copy" @click="cloneCharacter(character)"/>
      <IconButton icon="fa-file-arrow-down" @click="exportCharacter(character)"/>

      <IconButton icon="fa-share-nodes" @click="editViewers(character)"/>
      <IconButton icon="fa-eye" @click="viewCharacter(character)"/>
    </div>

    <Modal :shown="enableSyncModalVisible" @close="enableSyncModalVisible = false">
      <div class="p-10 w-400 d-flex flex-column" style="gap: 1rem; font-size: 1rem">
        <b style="font-size: 1.2rem">{{$t('character.sync.enable.text')}}</b>
        <select class="form-control" v-model="enableSyncModalType">
          <option value="out">{{$t('character.sync.enable.type.out')}}</option>
          <option value="in">{{$t('character.sync.enable.type.in')}}</option>
        </select>

        <div class="form-group mb-0" v-if="enableSyncModalType === 'in'">
          <label>{{$t('character.sync.hash')}}:</label>
          <input class="form-control" v-model="enableSyncModalInHash"/>
        </div>

        <div style="width: 100%; display: flex; justify-content: center; align-items: center">
          <button class="btn btn-primary" :disabled="enableSyncModalType === 'in' && enableSyncModalInHash.length <= 0" @click="finishLinkCharacterWithSync">{{$t('character.sync.enable')}}</button>
        </div>
      </div>
    </Modal>

    <Modal :shown="infoSyncModalVisible" @close="infoSyncModalVisible = false">
      <div class="p-10 w-400 d-flex flex-column" style="gap: 1rem; font-size: 1rem">
        <b style="font-size: 1.2rem; text-align: center">{{$t('character.sync.info.text')}}</b>

        <div class="form-group mb-0" v-if="VicarSync.isCharacterSyncedOut(character)">
          <label>{{$t('character.sync.hash')}}:</label>
          <div style="display: flex; justify-content: center; align-items: center">
            <input class="form-control" :value="VicarSync.getCharacterSyncOutId(character)"/>
            <button class="btn btn-primary" @click="copySyncOutId">{{$t('character.sync.info.hashcopy')}}</button>
          </div>
        </div>

        <div style="width: 100%; display: flex; justify-content: center; align-items: center">
          <button class="btn btn-dark" @click="beginUnlinkCharacterWithSync">{{$t(infoSyncModalDisableConfirm ? 'character.sync.info.disable.confirm' : 'character.sync.info.disable')}}</button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script lang="ts">
import {Component, Inject, Prop, Vue} from "vue-property-decorator";
import Bullet from "@/components/Bullet.vue";
import Avatar from "@/components/Avatar.vue";
import IconButton from "@/components/IconButton.vue";
import {ICharacter} from "@/types/models";
import CharacterStorage from "@/libs/io/character-storage";
import FileCreator from "@/libs/io/file-creator";
import {Mutation} from "vuex-class";
import {VicarSync} from "@/libs/io/vicar-sync";
import Modal from "@/components/modal/Modal.vue";

@Component({
  components: {Modal, IconButton, Avatar, Bullet}
})
export default class Character extends Vue {

  @Prop({required: true})
  private character!: ICharacter;

  @Mutation("setEditingCharacter")
  private setEditingCharacter!: (character: ICharacter) => void;

  @Mutation("setLevelMode")
  private setLevelMode!: (mode: boolean) => void;

  private VicarSync = VicarSync;

  private enableSyncModalVisible = false;
  private enableSyncModalType: "in" | "out" = "out";
  private enableSyncModalInHash = "";

  private infoSyncModalVisible = false;
  private infoSyncModalDisableConfirm: number | null = null;

  private shiftKeyDown = false;

  mounted() {
    window.addEventListener("keydown", this.onKeydown);
    window.addEventListener("keyup", this.onKeyup);
  }

  destroyed() {
    window.removeEventListener("keydown", this.onKeydown);
    window.removeEventListener("keyup", this.onKeyup);
  }

  private onKeydown(e: KeyboardEvent) {
    if (e.key === "Control") {
      this.shiftKeyDown = true;
    }
  }

  private onKeyup(e: KeyboardEvent) {
    if (e.key === "Control") {
      this.shiftKeyDown = false;
    }
  }

  private cloneCharacter(character: ICharacter) {
    const newChar = {...character};
    newChar.name += " - " + this.$t('character.copy').toString();
    CharacterStorage.addCharacter(newChar);
    this.updateCharacterList();
  }

  private exportCharacter(char: ICharacter) {
    FileCreator.create(char.name + ".json", JSON.stringify(char));
  }

  private viewCharacter(character: ICharacter) {
    if (this.shiftKeyDown) {
      window.open(this.$router.resolve({name: 'viewer', params: {characterId: character.id}}).href, '_blank')?.focus();
      return;
    }

    this.setLevelMode(false);
    this.$router.push({name: 'viewer', params: {characterId: character.id}});
  }

  private linkCharacterWithSync() {
    this.enableSyncModalVisible = true;
  }

  private async finishLinkCharacterWithSync() {
    if (this.enableSyncModalType === "out") {
      const hash = await VicarSync.enableCharacterOutSync(this.character);
      if (hash) {
        await navigator.clipboard.writeText(hash);
      }
    } else {
      await VicarSync.syncCharacterIn(this.character, this.enableSyncModalInHash);
    }
    this.$forceUpdate();
    this.enableSyncModalVisible = false;
    this.enableSyncModalInHash = "";
    this.enableSyncModalType = "out";
  }

  private async beginUnlinkCharacterWithSync() {
    if (this.infoSyncModalDisableConfirm === null) {
      this.infoSyncModalDisableConfirm = setTimeout(() => {
        this.infoSyncModalDisableConfirm = null;
      }, 3000);
    } else {
      await this.unlinkCharacterWithSync();

      this.infoSyncModalVisible = false;

      clearTimeout(this.infoSyncModalDisableConfirm);
      this.infoSyncModalDisableConfirm = null;
    }
  }

  private async unlinkCharacterWithSync() {
    if (VicarSync.isCharacterSyncedOut(this.character)) {
      await VicarSync.disableCharacterOutSync(this.character);
    } else if (VicarSync.isCharacterSyncedIn(this.character)) {
      await VicarSync.unsyncCharacterIn(this.character);
    }

    this.$forceUpdate();
  }

  private async copySyncOutId() {
    await navigator.clipboard.writeText(VicarSync.getCharacterSyncOutId(this.character));
  }

  @Inject("edit-viewers")
  private editViewers!: (character: ICharacter) => void;

  @Inject("begin-char-deletion")
  private beginCharDeletion!: (character: ICharacter) => void;

  @Inject("update-character-list")
  private updateCharacterList!: () => void;

  @Inject("is-share-available")
  private isShareAvailable!: () => boolean;
}
</script>

<style scoped lang="scss">
.character-entry {
  background-color: #25282C;
  user-select: none;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--primary-color);
  display: flex;
  flex-direction: row;
  gap: 1rem;
  .info {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    .title {
      text-transform: uppercase;
      font-size: 1.5rem;
      font-weight: bolder;
      color: #fff;
    }
    .subtitle {
      font-size: 1.1rem;
      color: #939393;
    }
  }
  .actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    align-items: center;
  }
}
</style>
