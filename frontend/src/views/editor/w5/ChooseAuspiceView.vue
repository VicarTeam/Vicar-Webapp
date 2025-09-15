<script lang="ts">
import {Component, Inject, Vue} from 'vue-property-decorator';
import EditorForm from "@/components/editor/EditorForm.vue";
import {State} from "vuex-class";
import {IWerewolfW5Sheet} from "@/types/w5";
import {auspices} from "@/.data/w5";
import TipButton from "@/components/editor/TipButton.vue";
import Bullet from "@/components/Bullet.vue";
import AuspiceSymbol from "@/components/symbols/AuspiceSymbol.vue";
import {hardSetTheme} from "@/libs/theme";
import {GameLine} from "@/types/gameline";

@Component({
  components: {AuspiceSymbol, Bullet, TipButton, EditorForm}
})
export default class ChooseAuspicesView extends Vue {

  auspices = auspices;

  @State("editingCharacter")
  private editingCharacter!: IWerewolfW5Sheet|undefined;

  mounted() {
    hardSetTheme(GameLine.Werewolf);
  }

  private get canGoNext() {
    return this.editingCharacter && this.editingCharacter.auspice;
  }

  @Inject("show-tip")
  private showTip!: (content: any, title?: any) => void;
}
</script>

<template>
  <EditorForm :can-go-next="canGoNext" next-step="editor-tribe" :is-cancel="true">
    <div class="d-flex justify-content-center" style="width: 100%; height: 100%; padding: 5rem" v-if="editingCharacter">
      <div class="choose-clan-wrapper">
        <div class="clan-selection">
          <label class="required">{{$t('character.auspice')}}: <TipButton :title="$t('character.auspice.tip.title')" :content="$t('character.auspice.tip.content')"/></label>

          <div class="card clan-info" style="margin: 0; width: 55rem" v-if="editingCharacter.auspice">
            <AuspiceSymbol :auspice="editingCharacter.auspice"/>
            <div class="text">
              <b>{{editingCharacter.auspice.name}}</b>
              <div class="desc">{{editingCharacter.auspice.description}}</div>
            </div>
          </div>

          <div class="clans">
            <div class="clan" v-for="auspice in auspices" :key="auspice.id" @click="editingCharacter.auspice = auspice">
              <AuspiceSymbol :auspice="auspice"/>
              <small>{{auspice.name}}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </EditorForm>
</template>

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
        width: 25%;
        height: 7rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        user-select: none;
        img {
          height: 30rem;
          -webkit-user-drag: none;
          filter: var(--image-to-primary-color-filter);
        }
      }
    }
  }
}
</style>