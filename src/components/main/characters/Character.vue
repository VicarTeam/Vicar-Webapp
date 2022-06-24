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
      <IconButton v-if="vicarPlay.isRunning && vicarPlay.me.isHost" icon="fa-file-image" @click="sendAvatar"/>
      <IconButton icon="fa-trash" @click="beginCharDeletion(character)"/>
      <IconButton icon="fa-copy" @click="cloneCharacter(character)"/>
      <IconButton icon="fa-file-arrow-down" @click="exportCharacter(character)"/>
      <IconButton v-if="isShareAvailable()" icon="fa-share-nodes" @click="shareCharacter(character)"/>
      <IconButton icon="fa-eye" @click="viewCharacter(character)"/>
    </div>
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
import {vicarPlay} from "@/libs/vicarplay/vicar-play";
import {IMessage, MessageType} from "@/libs/vicarplay/types";

@Component({
  components: {IconButton, Avatar, Bullet}
})
export default class Character extends Vue {

  @Prop({required: true})
  private character!: ICharacter;

  @Mutation("setEditingCharacter")
  private setEditingCharacter!: (character: ICharacter) => void;

  @Mutation("setLevelMode")
  private setLevelMode!: (mode: boolean) => void;

  vicarPlay = vicarPlay;

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
    this.setLevelMode(false);
    this.setEditingCharacter(character);
    this.$router.push({name: 'viewer'});
  }

  private sendAvatar() {
    if (!vicarPlay.isRunning || !vicarPlay.me.isHost) {
      return;
    }

    const receiver = vicarPlay.getChatReceiver();
    const message: IMessage = {
      type: vicarPlay.chatSendTo === "@all" ? MessageType.BroadcastAvatar : MessageType.PrivateAvatar,
      content: this.character.avatar,
      sender: vicarPlay.me,
      isPrivate: receiver !== undefined
    };

    vicarPlay.sendChatMessage(message, receiver);
  }

  @Inject("begin-char-deletion")
  private beginCharDeletion!: (character: ICharacter) => void;

  @Inject("update-character-list")
  private updateCharacterList!: () => void;

  @Inject("is-share-available")
  private isShareAvailable!: () => boolean;

  @Inject("share-character")
  private shareCharacter!: (character: ICharacter) => void;
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
