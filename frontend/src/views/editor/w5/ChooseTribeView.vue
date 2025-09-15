<script lang="ts">
import {Component, Inject, Vue} from 'vue-property-decorator';
import EditorForm from "@/components/editor/EditorForm.vue";
import {State} from "vuex-class";
import {IWerewolfW5Sheet} from "@/types/w5";
import {tribes} from "@/.data/w5";
import ClanSymbol from "@/components/symbols/ClanSymbol.vue";
import TipButton from "@/components/editor/TipButton.vue";
import Bullet from "@/components/Bullet.vue";
import AuspiceSymbol from "@/components/symbols/AuspiceSymbol.vue";
import TribeSymbol from "@/components/symbols/TribeSymbol.vue";
import PatronSpiritSymbol from "@/components/symbols/PatronSpiritSymbol.vue";

@Component({
  components: {PatronSpiritSymbol, TribeSymbol, AuspiceSymbol: AuspiceSymbol, Bullet, TipButton, ClanSymbol, EditorForm}
})
export default class ChooseTribeView extends Vue {

  tribes = tribes;

  @State("editingCharacter")
  private editingCharacter!: IWerewolfW5Sheet|undefined;

  private get canGoNext() {
    return this.editingCharacter && this.editingCharacter.tribe;
  }

  @Inject("show-tip")
  private showTip!: (content: any, title?: any) => void;
}
</script>

<template>
  <EditorForm :can-go-next="canGoNext" next-step="editor-renown">
    <div class="d-flex justify-content-center" style="width: 100%; height: 100%; padding: 5rem" v-if="editingCharacter">
      <div class="choose-clan-wrapper">
        <div class="clan-selection">
          <label class="required">{{$t('character.tribe')}}: <TipButton :content="$t('character.tribe.description')"/></label>

          <div style="display: flex; gap: 2rem" v-if="editingCharacter.tribe">
            <div class="card clan-info" style="margin: 0; width: 55rem">
              <TribeSymbol :tribe="editingCharacter.tribe"/>
              <div class="text">
                <b>{{editingCharacter.tribe.name}}</b>
                <div class="desc">{{editingCharacter.tribe.description}}</div>

                <h6 style="font-weight: bolder; margin: 1rem 0 0;">{{$t('character.tribe.favor')}}: <TipButton :content="$t('character.tribe.favor.description')"/></h6>
                <div class="desc small">{{editingCharacter.tribe.favor}}</div>
              </div>
            </div>
            <div class="card clan-info" style="margin: 0; width: 55rem">
              <PatronSpiritSymbol :tribe="editingCharacter.tribe"/>
              <div class="text">
                <b>{{$t('character.patron')}}: {{editingCharacter.tribe.patron.name}} <TipButton :content="$t('character.patron.description')"/></b>
                <div class="desc">{{editingCharacter.tribe.patron.description}}</div>

                <h6 style="font-weight: bolder; margin: 1rem 0 0;">{{$t('character.renown')}}: <TipButton :content="$t('character.renown.description')"/></h6>
                <div class="desc">{{$t(`character.renown.${editingCharacter.tribe.renown}`)}}</div>

                <h6 style="font-weight: bolder; margin: 1rem 0 0;">{{$t('character.tribe.ban')}}: <TipButton :content="$t('character.tribe.ban.description')"/></h6>
                <div class="desc small">{{editingCharacter.tribe.ban}}</div>
              </div>
            </div>
          </div>

          <div class="clans">
            <div class="clan" v-for="tribe in tribes" :key="tribe.id" @click="editingCharacter.tribe = tribe">
              <TribeSymbol :tribe="tribe"/>
              <small>{{tribe.name}}</small>
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
          &.small {
            font-size: 0.9rem;
          }
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
          height: 6rem;
          -webkit-user-drag: none;
          filter: var(--image-to-primary-color-filter);
        }
      }
    }
  }
}
</style>