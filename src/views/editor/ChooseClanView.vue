<template>
  <div class="d-flex justify-content-center" style="width: 100%; height: 100%; padding: 5rem">
    <div class="choose-clan-wrapper">
      <div class="form-group" style="text-align: center">
        <label class="required">{{$t('editor.step1.sire')}}: <TipButton :title="$t('editor.step1.sire.tip.title')" :content="$t('editor.step1.sire.tip.content')"/></label>
        <input class="form-control" type="text" style="width: 30rem" :placeholder="$t('editor.step1.sire')"/>
      </div>
      <hr>
      <div class="clan-selection">
        <label class="required">{{$t('editor.step1.clan')}}: <TipButton :title="$t('editor.step1.clan.tip.title')" :content="$t('editor.step1.clan.tip.content')"/></label>

        <div class="card clan-info" style="margin: 0; width: 55rem" v-if="selectedClan">
          <img :src="getClanSymbol(selectedClan)"/>
          <div class="text">
            <b>{{selectedClan.name}}</b>
            <small>"<i>{{selectedClan.slogan}}</i>"</small>
            <div class="desc">{{selectedClan.description}}</div>

            <h6 style="font-weight: bolder; margin: 1rem 0 0;">{{$t('editor.step1.clan.disciplines')}}:</h6>
            <div class="disciplines">
              <div class="discipline" v-for="d in selectedClan.disciplines" :key="d.id">
                {{d.name}} <TipButton :content="d.summary"/>
              </div>
            </div>
          </div>
        </div>

        <div class="clans">
          <div class="clan" v-for="clan in clans" :key="clan.id" @click="selectedClan = clan">
            <img :src="getClanSymbol(clan)"/>
            <small>{{clan.name}}</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Inject, Vue} from "vue-property-decorator";
import TipButton from "@/components/editor/TipButton.vue";
import {IClan} from "@/types/models";
import DataManager from "@/libs/data-manager";

@Component({
  components: {TipButton}
})
export default class EditorClanView extends Vue {

  private selectedClan: IClan | null = null;

  private getClanSymbol(clan: IClan) {
    const images = require.context('@/assets/img/clans', false, /\.png$/)
    return images(`./${clan.id}.png`);
  }

  private get clans(): IClan[] {
    return DataManager.selectedLanguage.books.map(book => book.clans).flat().sort((a, b) => a.name.localeCompare(b.name));
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
