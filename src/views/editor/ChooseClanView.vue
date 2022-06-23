<template>
  <EditorForm :can-go-next="canGoNext" next-step="editor-predator-type" :is-cancel="true" @before-next="applyClanActions">
    <div class="d-flex justify-content-center" style="width: 100%; height: 100%; padding: 5rem" v-if="editingCharacter">
      <div class="choose-clan-wrapper">
        <div class="form-group" style="text-align: center">
          <label class="required">{{$t('editor.sire')}}: <TipButton :title="$t('editor.sire.tip.title')" :content="$t('editor.sire.tip.content')"/></label>
          <input class="form-control" type="text" style="width: 30rem" :placeholder="$t('editor.sire')" v-model="editingCharacter.sire"/>
        </div>
        <hr>
        <div class="clan-selection">
          <label class="required">{{$t('editor.clan')}}: <TipButton :title="$t('editor.clan.tip.title')" :content="$t('editor.clan.tip.content')"/></label>

          <div class="card clan-info" style="margin: 0; width: 55rem" v-if="editingCharacter.clan">
            <img :src="getClanSymbol(editingCharacter.clan)"/>
            <div class="text">
              <b>{{editingCharacter.clan.name}}</b>
              <small>"<i>{{editingCharacter.clan.slogan}}</i>" <bullet/> <i>{{$t('editor.clan.curse')}}: </i><TipButton :content="editingCharacter.clan.curse"/></small>
              <div class="desc">{{editingCharacter.clan.description}}</div>

              <h6 style="font-weight: bolder; margin: 1rem 0 0;">{{$t('editor.clan.disciplines')}}:</h6>
              <div class="disciplines" v-if="editingCharacter.clan.disciplines.length < 11">
                <div class="discipline" v-for="d in editingCharacter.clan.disciplines" :key="d.id">
                  {{d.name}} <TipButton :content="d.summary"/>
                </div>
              </div>
              <div class="disciplines" v-else>
                <div class="discipline">
                  {{$t('data.disciplines.all')}}
                </div>
              </div>
            </div>
          </div>

          <div class="clans">
            <div class="clan" v-for="clan in clans" :key="clan.id" @click="editingCharacter.clan = clan">
              <img :src="getClanSymbol(clan)"/>
              <small>{{clan.name}}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </EditorForm>
</template>

<script lang="ts">
import {Component, Inject, Vue} from "vue-property-decorator";
import TipButton from "@/components/editor/TipButton.vue";
import {ICharacter, IClan} from "@/types/models";
import DataManager from "@/libs/data-manager";
import {Mutation, State} from "vuex-class";
import EditorForm from "@/components/editor/EditorForm.vue";
import Bullet from "@/components/Bullet.vue";
import PTActionHandler from "@/libs/ptaction-handler";

@Component({
  components: {Bullet, EditorForm, TipButton}
})
export default class EditorClanView extends Vue {

  @State("editingCharacter")
  private editingCharacter!: ICharacter|undefined;

  private applyClanActions() {
    if (!this.editingCharacter || !this.editingCharacter.clan) {
      return;
    }

    for (const action of this.editingCharacter.clan.actions) {
      PTActionHandler.handle(this.editingCharacter, action);
    }
  }

  private getClanSymbol(clan: IClan) {
    const images = require.context('@/assets/img/clans', false, /\.png$/)
    return images(`./${clan.id}.png`);
  }

  private get canGoNext() {
    return this.editingCharacter && this.editingCharacter.clan && this.editingCharacter.sire.trim().length > 0;
  }

  private get clans(): IClan[] {
    let books = DataManager.selectedLanguage.books;
    if (this.editingCharacter) {
      books = books.filter(b => this.editingCharacter!.books.includes(b.id));
    }

    return books.map(book => book.clans).flat().sort((a, b) => a.name.localeCompare(b.name));
  }

  @Inject("show-tip")
  private showTip!: (content: any, title?: any) => void;
}
</script>

<style scoped lang="scss">
.choose-clan-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;

  .clan-selection {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .clan-info {
      padding: 1rem;
      gap: 1rem;
      display: flex;

      img {
        width: 35%;
        height: auto;
        max-height: 15rem;
        margin: auto;
        object-fit: contain;
        float: left;
        -webkit-user-drag: none;
        filter: var(--image-to-primary-color-filter);
      }

      .text {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex-grow: 1;
        small {
          color: #b2b2b2;
        }
        .desc {
          font-size: 1.1rem;
          max-height: 15rem;
          overflow-x: hidden;
          overflow-y: auto;
        }
        .disciplines {
          width: 100%;
          display: flex;
          flex-direction: row;
          gap: 1rem;
          margin-top: 1rem;
          justify-content: center;
          align-items: center;
          .discipline {
            font-size: 1.1rem;
            width: calc(33% - 0.4rem);
            text-align: center;
          }
        }
      }
    }

    .clans {
      margin-top: 3rem;
      width: 50%;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: 2rem;

      .clan {
        width: 20%;
        height: 7rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        user-select: none;
        img {
          height: 6rem;
          -webkit-user-drag: none;
          filter: var(--image-to-primary-color-filter);
        }
      }
    }
  }
}
</style>
