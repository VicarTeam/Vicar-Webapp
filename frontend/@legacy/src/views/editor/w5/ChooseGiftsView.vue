<script lang="ts">
import {Component, Ref, Vue} from 'vue-property-decorator';
import EditorForm from "@/components/editor/EditorForm.vue";
import {State} from "vuex-class";
import {IW5Gift, IW5Rite, IWerewolfW5Sheet, W5GiftCategory} from "@/types/w5";
import {getAvailableGiftsForCharacter, rites} from "@/.data/w5";
import TipButton from "@/components/editor/TipButton.vue";
import RiteInfoModal from "@/components/viewer/modals/w5/RiteInfoModal.vue";
import GiftInfoModal from "@/components/viewer/modals/w5/GiftInfoModal.vue";

@Component({
  components: {GiftInfoModal, RiteInfoModal, TipButton, EditorForm}
})
export default class ChooseGiftsView extends Vue {

  @State("editingCharacter")
  private editingCharacter!: IWerewolfW5Sheet|undefined;

  @Ref("riteInfoModal")
  private riteInfoModal!: RiteInfoModal;

  @Ref("giftInfoModal")
  private giftInfoModal!: GiftInfoModal;

  private gifts: IW5Gift[] = [];

  private nativeGift: number = 0;
  private auspiceGift: number = 0;
  private tribeGift: number = 0;
  private rite: number = 0;

  mounted() {
    this.gifts = getAvailableGiftsForCharacter(this.editingCharacter!);
  }

  private isGiftSelected(gift: IW5Gift) {
    return this.nativeGift === gift.id || this.auspiceGift === gift.id || this.tribeGift === gift.id;
  }

  private openGiftInfo(gift: IW5Gift) {
    this.giftInfoModal.showModal(gift);
  }

  private openRiteInfo(rite: IW5Rite) {
    this.riteInfoModal.showModal(rite);
  }

  private onBeforeNext(e: any) {
    const native = this.nativeGift as any as IW5Gift;
    const auspice = this.auspiceGift as any as IW5Gift;
    const tribe = this.tribeGift as any as IW5Gift;
    const rite = this.rite as any as IW5Rite;
    if (this.editingCharacter) {
      if (native) {
        this.editingCharacter.selectedGifts.push(native);
      }
      if (auspice) {
        this.editingCharacter.selectedGifts.push(auspice);
      }
      if (tribe) {
        this.editingCharacter.selectedGifts.push(tribe);
      }
      if (rite) {
        this.editingCharacter.selectedRites.push(rite);
      }
    }
  }

  private get selectableNativeGifts(): IW5Gift[] {
    if (!this.editingCharacter) {
      return [];
    }
    return this.gifts.filter(g => g.category === W5GiftCategory.Native && !this.isGiftSelected(g) && this.charactersRenown >= g.totalRenown).sort((a, b) => {
      if (a.totalRenown === b.totalRenown) {
        return a.name.localeCompare(b.name);
      } else {
        return a.totalRenown - b.totalRenown;
      }
    });
  }

  private get selectableAuspiceGifts(): IW5Gift[] {
    if (!this.editingCharacter) {
      return [];
    }
    return this.gifts.filter(g => g.category === W5GiftCategory.Auspice && !this.isGiftSelected(g) && this.charactersRenown >= g.totalRenown).sort((a, b) => {
      if (a.totalRenown === b.totalRenown) {
        return a.name.localeCompare(b.name);
      } else {
        return a.totalRenown - b.totalRenown;
      }
    });
  }

  private get selectableTribeGifts(): IW5Gift[] {
    if (!this.editingCharacter) {
      return [];
    }
    return this.gifts.filter(g => g.category === W5GiftCategory.Tribal && !this.isGiftSelected(g) && this.charactersRenown >= g.totalRenown).sort((a, b) => {
      if (a.totalRenown === b.totalRenown) {
        return a.name.localeCompare(b.name);
      } else {
        return a.totalRenown - b.totalRenown;
      }
    });
  }

  private get selectableRites(): IW5Rite[] {
    if (!this.editingCharacter) {
      return [];
    }
    return rites.filter(r => r.id !== this.rite);
  }

  private get charactersRenown(): number {
    if (!this.editingCharacter) {
      return 0;
    }
    let renown = 0;
    for (const r of this.editingCharacter.renown) {
      renown += r.value;
    }
    return renown;
  }

  private get canGoNext() {
    return this.nativeGift !== undefined && this.auspiceGift !== undefined && this.tribeGift !== undefined && this.rite !== undefined;
  }
}
</script>

<template>
  <EditorForm :can-go-next="canGoNext" :is-finish="true" @before-next="onBeforeNext">
    <div class="d-flex justify-content-center" style="width: 100%; height: 100%; padding: 5rem" v-if="editingCharacter">
      <div class="choose-gift-wrapper">
        <label class="required">{{$t('character.gifts')}} <TipButton :content="$t('character.gifts.description')"/> & {{$t('character.rites')}} <TipButton :content="$t('character.rites.description')"/> :</label>
        <i>{{$t('editor.gifts.instruction')}}</i>

        <div class="gift-selection">
          <div class="card">
            <h5>{{$t('editor.gifts.native')}}:</h5>
            <select class="form-control" v-model="nativeGift">
              <option :value="0" disabled>{{$t('editor.gifts.select')}}</option>
              <option v-for="g in selectableNativeGifts" :key="g.id" :value="g">{{g.name}} ({{g.totalRenown}})</option>
            </select>
            <small v-if="!!nativeGift">
              {{nativeGift.description}}
            </small>
            <button v-if="!!nativeGift" class="btn btn-primary" @click="openGiftInfo(nativeGift)">{{$t('editor.gifts.read-more')}}</button>
          </div>
          <div class="card">
            <h5>{{$t('editor.gifts.auspice')}}:</h5>
            <select class="form-control" v-model="auspiceGift">
              <option :value="0" disabled>{{$t('editor.gifts.select')}}</option>
              <option v-for="g in selectableAuspiceGifts" :key="g.id" :value="g">{{g.name}} ({{g.totalRenown}})</option>
            </select>
            <small v-if="!!auspiceGift">
              {{auspiceGift.description}}
            </small>
            <button v-if="!!auspiceGift" class="btn btn-primary" @click="openGiftInfo(auspiceGift)">{{$t('editor.gifts.read-more')}}</button>
          </div>
          <div class="card">
            <h5>{{$t('editor.gifts.tribal')}}:</h5>
            <select class="form-control" v-model="tribeGift">
              <option :value="0" disabled>{{$t('editor.gifts.select')}}</option>
              <option v-for="g in selectableTribeGifts" :key="g.id" :value="g">{{g.name}} ({{g.totalRenown}})</option>
            </select>
            <small v-if="!!tribeGift">
              {{tribeGift.description}}
            </small>
            <button v-if="!!tribeGift" class="btn btn-primary" @click="openGiftInfo(tribeGift)">{{$t('editor.gifts.read-more')}}</button>
          </div>
          <div class="card">
            <h5>{{$t('editor.gifts.rite')}}:</h5>
            <select class="form-control" v-model="rite">
              <option :value="0" disabled>{{$t('editor.gifts.select')}}</option>
              <option v-for="r in selectableRites" :key="r.id" :value="r">{{r.name}}</option>
            </select>
            <small v-if="!!rite">
              {{rite.description}}
            </small>
            <button v-if="!!rite" class="btn btn-primary" @click="openRiteInfo(rite)">{{$t('editor.gifts.read-more')}}</button>
          </div>
        </div>
      </div>

      <RiteInfoModal ref="riteInfoModal"/>
      <GiftInfoModal ref="giftInfoModal"/>
    </div>
  </EditorForm>
</template>

<style scoped lang="scss">
.choose-gift-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  .gift-selection {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    gap: 2rem;
    margin-top: 1rem;
    .card {
      width: calc(100vw / 4 - 10rem);
      height: fit-content;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      h5 {
        margin: 0;
        font-weight: bold;
        font-size: 1.2rem;
      }
      small {
        text-align: left;
      }
    }
  }
}
</style>