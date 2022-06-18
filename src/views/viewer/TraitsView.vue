<template>
  <div class="traits-view">
    <div class="trait card">
      <div class="title">
        <b>{{$t('editor.traits.merits')}}</b>
        <LevelButton icon="fa-plus" class="ml-10" @click="addNewTrait"/>
      </div>

      <div class="list">
        <div class="entry" v-for="t in getTransformedData(editingCharacter.merits, false)">
          <LevelButton v-if="getTraitLevel(t) < 5" @click="levelTraitModal.showModal(t, 'merits')"/>
          <div class="name">
            <small>
              <i style="color: #989898">{{$t('data.trait.merit')}}</i> - {{t.pack.name}}: {{t.name}}{{getTraitSuffix(t)}} - <i><b>{{$t('editor.traits.modal.trait.level')}}</b>: {{getTraitLevel(t)}}</i>
            </small>
          </div>
          <TipButton class="tip" :content="t.description"/>
        </div>

        <div class="entry" v-for="t in getTransformedData(editingCharacter.backgrounds, false)">
          <LevelButton v-if="getTraitLevel(t) < 5" @click="levelTraitModal.showModal(t, 'backgrounds')"/>
          <div class="name">
            <small>
              <i style="color: #989898">{{$t('data.trait.background')}}</i> - {{t.pack.name}}: {{t.name}}{{getTraitSuffix(t)}} - <i><b>{{$t('editor.traits.modal.trait.level')}}</b>: {{getTraitLevel(t)}}</i>
            </small>
          </div>
          <TipButton class="tip" :content="t.description"/>
        </div>
      </div>
    </div>

    <div class="trait card">
      <div class="title">
        <b>{{$t('editor.traits.flaws')}}</b>
      </div>

      <div class="list">
        <div class="entry" v-for="t in getTransformedData(editingCharacter.merits, true)">
          <div class="name">
            <small>
              <i style="color: #989898">{{$t('data.trait.merit')}}</i> - {{t.pack.name}}: {{t.name}}{{getTraitSuffix(t)}} - <i><b>{{$t('editor.traits.modal.trait.level')}}</b>: {{getTraitLevel(t)}}</i>
            </small>
          </div>
          <TipButton class="tip" :content="t.description"/>
        </div>

        <div class="entry" v-for="t in getTransformedData(editingCharacter.backgrounds, true)">
          <div class="name">
            <small>
              <i style="color: #989898">{{$t('data.trait.background')}}</i> - {{t.pack.name}}: {{t.name}}{{getTraitSuffix(t)}} - <i><b>{{$t('editor.traits.modal.trait.level')}}</b>: {{getTraitLevel(t)}}</i>
            </small>
          </div>
          <TipButton class="tip" :content="t.description"/>
        </div>
      </div>
    </div>

    <TraitModal ref="levelTraitModal"/>
    <ChooseTraitModal ref="chhoseTraitModal"/>
  </div>
</template>

<script lang="ts">
import {Component, Ref, Vue} from "vue-property-decorator";
import {ICharacter, ILockableTrait, IUsingTraitPacks} from "@/types/models";
import {State} from "vuex-class";
import {ITraitPack} from "@/types/data";
import TipButton from "@/components/editor/TipButton.vue";
import Bullet from "@/components/Bullet.vue";
import LevelButton from "@/components/viewer/LevelButton.vue";
import TraitModal from "@/components/viewer/modals/leveling/TraitModal.vue";
import ChooseTraitModal from "@/components/editor/modals/ChooseTraitModal.vue";

export interface ITransformedData extends ILockableTrait {
  pack: ITraitPack;
}

@Component({
  components: {ChooseTraitModal, TraitModal, LevelButton, Bullet, TipButton}
})
export default class TraitsView extends Vue {

  @State("editingCharacter")
  private editingCharacter!: ICharacter;

  @Ref("levelTraitModal")
  private levelTraitModal!: TraitModal;

  @Ref("chhoseTraitModal")
  private chooseTraitModal!: ChooseTraitModal;

  private addNewTrait() {
    this.chooseTraitModal.showModal(false, Infinity, (trait, level) => level * 3);
  }

  private getTransformedData(upacks: IUsingTraitPacks, isFlaw: boolean): ITransformedData[] {
    const arr: ITransformedData[] = [];
    for (const upack of upacks.packs) {
      for (const trait of upack[isFlaw ? 'flawTraits' : 'traits']) {
        arr.push({
          ...trait,
          pack: upack.pack
        });
      }
    }

    return arr;
  }

  private getTraitSuffix(trait: ITransformedData): string {
    if (trait.suffix) {
      return " (" + trait.suffix + ")";
    }
    return "";
  }

  private getTraitLevel(trait: ITransformedData) {
    return parseInt((trait.customLevel ?? trait.level).toString());
  }
}
</script>

<style scoped lang="scss">
.traits-view {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 7rem;
  .trait {
    display: flex;
    flex-direction: column;
    width: 40rem;
    gap: 0.5rem;
    .title {
      width: 100%;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    }
    .list {
      width: 100%;
      display: flex;
      flex-direction: column;
      .entry {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        gap: 0.5rem;
        .name {
          flex-grow: 1;
        }
        .tip {
          flex-shrink: 0;
        }
      }
    }
  }
}
</style>
