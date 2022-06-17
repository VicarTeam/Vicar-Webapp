<template>
  <div class="profile-view">
    <input type="file" ref="avatarUploader" @change="onAvatarUpload" accept="image/png, image/gif, image/jpeg" hidden/>
    <div class="meta">
      <Avatar :src="editingCharacter.avatar" style="width: 12rem; height: 12rem; cursor: pointer; flex-shrink: 0"
              @click="avatarUploader.click()"/>
      <div class="info">
        <div class="name" v-if="!isEditName">
          {{ editingCharacter.name }}
          <IconButton style="width: 3rem; height: 3rem; margin-left: 1rem" icon="fa-pen"
                      @click="editName = editingCharacter.name; isEditName = true"/>
        </div>
        <div class="name" v-else style="gap: 1rem;">
          <input class="form-control" style="width: 20rem" type="text" v-model="editName"/>
          <IconButton icon="fa-check" @click="editingCharacter.name = editName; isEditName = false"/>
          <IconButton icon="fa-x" @click="isEditName = false"/>
        </div>
        <span class="side">
          {{ $t('character.sex.' + editingCharacter.sex) }}
          <bullet/>
          <i> Clan:</i> {{ editingCharacter.clan.name }}
          <bullet/>
          {{ editingCharacter.clan.slogan }}
        </span>
        <span class="side" style="margin-top: 0.2rem">
          <i>Generation:</i> {{
            editingCharacter.generation
          }} ({{ $t('character.generation.' + editingCharacter.generationEra) }})
          <bullet/>
          <i> {{ $t('data.predatortype') }}:</i> {{ editingCharacter.predatorType.name }}
        </span>
      </div>
      <div class="stats">
        <div class="row">
          <div class="stat" style="margin-right: 5rem">
            <b>{{ $t('character.sire') }}:</b>
            <small>{{ editingCharacter.sire }}</small>
          </div>
          <div class="stat">
            <b>{{ $t('character.health') }}:</b>
            <Squares :max="10" :amount="editingCharacter.health" :margin-at="6"
                     @click="v => editingCharacter.health = v === editingCharacter.health ? 0 : v"/>
          </div>
          <div class="stat">
            <b>{{ $t('character.willpower') }}:</b>
            <Squares :max="10" :amount="editingCharacter.willpower" :margin-at="6"
                     @click="v => editingCharacter.willpower = v === editingCharacter.willpower ? 0 : v"/>
          </div>
        </div>
        <div class="row">
          <div class="stat" style="margin-right: 5rem">
            <b>{{ $t('character.bloodpotency') }}:</b>
            <Squares :max="10" :amount="editingCharacter.bloodPotency" :margin-at="6"/>
          </div>
          <div class="stat">
            <b>{{ $t('character.humanity') }}:</b>
            <Squares :max="10" :amount="editingCharacter.humanity" :margin-at="6"
                     @click="v => editingCharacter.humanity = v === editingCharacter.humanity ? 0 : v"/>
          </div>
          <div class="stat">
            <b>{{ $t('character.hunger') }}:</b>
            <Squares :max="5" :amount="editingCharacter.hunger"
                     @click="v => editingCharacter.hunger = v === editingCharacter.hunger ? 0 : v"/>
          </div>
        </div>
      </div>
    </div>
    <Tabs/>

    <div class="simple">
      <div class="column">
        <div class="form-group">
          <label>{{ $t('character.chronicle') }}: <TipButton :content="$t('character.chronicle.tip')"/></label>
          <input class="form-control" type="text" v-model="editingCharacter.chronicle"/>
        </div>

        <div class="form-group">
          <label>{{$t('character.chronicleprinciples')}}: <TipButton :content="$t('character.chronicleprinciples.tip')"/></label>
          <textarea class="form-control" v-model="editingCharacter.chroniclePrinciples"/>
        </div>
      </div>
      <div class="column">
        <div class="form-group">
          <label>{{ $t('character.concept') }}: <TipButton :content="$t('character.concept.tip')"/></label>
          <input class="form-control" type="text" v-model="editingCharacter.concept"/>
        </div>

        <div class="form-group">
          <label>{{$t('character.anchorsandbeliefs')}}: <TipButton :content="$t('character.anchorsandbeliefs.tip')"/></label>
          <textarea class="form-control" v-model="editingCharacter.anchorsAndBeliefs"/>
        </div>
      </div>
      <div class="column">
        <div class="form-group">
          <label>{{ $t('character.ambition') }}: <TipButton :content="$t('character.ambition.tip')"/></label>
          <input class="form-control" type="text" v-model="editingCharacter.ambition"/>
        </div>

        <div class="form-group">
          <label>{{$t('character.backstory')}}:</label>
          <textarea class="form-control" v-model="editingCharacter.backstory"/>
        </div>
      </div>
      <div class="column">
        <div class="form-group">
          <label>{{ $t('character.desire') }}: <TipButton :content="$t('character.desire.tip')"/></label>
          <input class="form-control" type="text" v-model="editingCharacter.desire"/>
        </div>

        <div class="form-group">
          <label>{{$t('character.notes')}}:</label>
          <textarea class="form-control" v-model="editingCharacter.notes"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Inject, Ref, Vue} from "vue-property-decorator";
import Avatar from "@/components/Avatar.vue";
import {State} from "vuex-class";
import {ICharacter} from "@/types/models";
import Bullet from "@/components/Bullet.vue";
import IconButton from "@/components/IconButton.vue";
import Squares from "@/components/progress/Squares.vue";
import Tabs from "@/components/tabs/Tabs.vue";
import Tab from "@/components/tabs/Tab.vue";
import TipButton from "@/components/editor/TipButton.vue";

@Component({
  components: {TipButton, Tab, Tabs, Squares, IconButton, Bullet, Avatar}
})
export default class ProfileView extends Vue {

  @State("editingCharacter")
  private editingCharacter!: ICharacter;

  @Ref("avatarUploader")
  private avatarUploader!: HTMLInputElement;

  private isEditName = false;
  private editName = "";

  private onAvatarUpload(e: Event) {
    //@ts-ignore
    const file = (e.target as HTMLInputElement).files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent) => {
        this.editingCharacter.avatar = (e.target as FileReader).result as string;
        this.updateViewer();
        this.$forceUpdate();
      };
      reader.readAsDataURL(file);
    }
  }

  @Inject("update-viewer")
  private updateViewer!: () => void;
}
</script>

<style scoped lang="scss">
.profile-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .meta {
    padding: 2rem;
    display: flex;
    align-items: center;
    gap: 2rem;

    .info {
      flex-grow: 1;
      display: flex;
      flex-direction: column;

      .name {
        display: flex;
        align-items: center;
        font-size: 1.8rem;
        font-weight: bold;
      }

      .side {
        font-size: 1.5rem;
        font-weight: normal;
        color: #9f9f9f;
      }
    }

    .stats {
      flex-shrink: 0;
      display: flex;
      gap: 1rem;
      flex-direction: column;

      .row {
        display: flex;
        flex-direction: row;
        gap: 2rem;

        .stat {
          display: flex;
          flex-direction: column;
          width: 15rem;
        }
      }
    }
  }

  .simple {
    padding: 2rem;
    display: flex;
    gap: 3rem;
    flex-wrap: wrap;
    .column {
      width: calc((100% - 9rem) / 4);
      display: flex;
      flex-direction: column;
      textarea {
        resize: vertical;
        min-height: 20rem;
      }
    }
  }
}
</style>
