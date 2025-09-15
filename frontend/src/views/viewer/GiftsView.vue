<script lang="ts">
import {Component, Ref, Vue} from 'vue-property-decorator';
import {State} from "vuex-class";
import {IW5Gift, IWerewolfW5Sheet, W5GiftCategory} from "@/types/w5";
import {getAvailableGiftsForCharacter} from "@/.data/w5";
import RiteInfoModal from "@/components/viewer/modals/w5/RiteInfoModal.vue";
import GiftInfoModal from "@/components/viewer/modals/w5/GiftInfoModal.vue";
import TipButton from "@/components/editor/TipButton.vue";
import GiftModal from "@/components/viewer/modals/leveling/GiftModal.vue";
import LevelButton from "@/components/viewer/LevelButton.vue";

@Component({
  components: {LevelButton, GiftModal, TipButton, GiftInfoModal, RiteInfoModal}
})
export default class GiftsView extends Vue {

  @State("editingCharacter")
  private editingCharacter!: IWerewolfW5Sheet;

  @Ref("riteInfoModal")
  private riteInfoModal!: RiteInfoModal;

  @Ref("giftInfoModal")
  private giftInfoModal!: GiftInfoModal;

  @Ref("levelGiftModal")
  private levelGiftModal!: GiftModal;

  private gifts: IW5Gift[] = [];

  mounted() {
    this.gifts = getAvailableGiftsForCharacter(this.editingCharacter);
  }

  private levelNativeGifts() {
    const gifts = this.gifts.filter(x => x.category === W5GiftCategory.Native && x.totalRenown <= this.totalRenown).sort((a, b) => {
      if (a.totalRenown === b.totalRenown) {
        return a.name.localeCompare(b.name);
      } else {
        return a.totalRenown - b.totalRenown;
      }
    });
    const neededXp = (this.nativeGifts.length + 1) * 2;
    this.levelGiftModal.showModal(W5GiftCategory.Native, neededXp, gifts);
  }

  private levelAuspiceGifts() {
    const gifts = this.gifts.filter(x => x.category === W5GiftCategory.Auspice && x.totalRenown <= this.totalRenown).sort((a, b) => {
      if (a.totalRenown === b.totalRenown) {
        return a.name.localeCompare(b.name);
      } else {
        return a.totalRenown - b.totalRenown;
      }
    });
    const neededXp = (this.auspiceGifts.length + 1) * 2;
    this.levelGiftModal.showModal(W5GiftCategory.Auspice, neededXp, gifts);
  }

  private levelTribalGifts() {
    const gifts = this.gifts.filter(x => x.category === W5GiftCategory.Tribal && x.totalRenown <= this.totalRenown).sort((a, b) => {
      if (a.totalRenown === b.totalRenown) {
        return a.name.localeCompare(b.name);
      } else {
        return a.totalRenown - b.totalRenown;
      }
    });
    const neededXp = (this.tribalGifts.length + 1) * 2;
    this.levelGiftModal.showModal(W5GiftCategory.Tribal, neededXp, gifts);
  }

  private levelRites() {
    const neededXp = 5;
    this.levelGiftModal.showModal(W5GiftCategory.Rite, neededXp);
  }

  private get totalRenown() {
    return this.editingCharacter.renown.reduce((sum, r) => sum + r.value, 0);
  }

  private get nativeGifts() {
    return this.editingCharacter.selectedGifts.filter(x => x.category === W5GiftCategory.Native).sort((a, b) => {
      if (a.totalRenown === b.totalRenown) {
        return a.name.localeCompare(b.name);
      } else {
        return a.totalRenown - b.totalRenown;
      }
    });
  }

  private get tribalGifts() {
    return this.editingCharacter.selectedGifts.filter(x => x.category === W5GiftCategory.Tribal).sort((a, b) => {
      if (a.totalRenown === b.totalRenown) {
        return a.name.localeCompare(b.name);
      } else {
        return a.totalRenown - b.totalRenown;
      }
    });
  }

  private get auspiceGifts() {
    return this.editingCharacter.selectedGifts.filter(x => x.category === W5GiftCategory.Auspice).sort((a, b) => {
      if (a.totalRenown === b.totalRenown) {
        return a.name.localeCompare(b.name);
      } else {
        return a.totalRenown - b.totalRenown;
      }
    });
  }

  private get charRites() {
    return this.editingCharacter.selectedRites.sort((a, b) => a.name.localeCompare(b.name));
  }
}
</script>

<template>
  <div class="gifts-view">
    <div class="card">
      <h5>
        {{$t('editor.gifts.native')}}n
        <LevelButton @click="levelNativeGifts()"/>
      </h5>

      <small v-for="g in nativeGifts" :key="g.id">
        <span>{{g.name}} ({{g.totalRenown}})</span>
        <TipButton @click="giftInfoModal.showModal(g)" :override="true"/>
      </small>
    </div>

    <div class="card">
      <h5>
        {{$t('editor.gifts.auspice')}}n
        <LevelButton @click="levelAuspiceGifts()"/>
      </h5>

      <small v-for="g in auspiceGifts" :key="g.id">
        <span>{{g.name}} ({{g.totalRenown}})</span>
        <TipButton @click="giftInfoModal.showModal(g)" :override="true"/>
      </small>
    </div>

    <div class="card">
      <h5>
        {{$t('editor.gifts.tribal')}}n
        <LevelButton @click="levelTribalGifts()"/>
      </h5>

      <small v-for="g in tribalGifts" :key="g.id">
        <span>{{g.name}} ({{g.totalRenown}})</span>
        <TipButton @click="giftInfoModal.showModal(g)" :override="true"/>
      </small>
    </div>

    <div class="card">
      <h5>
        {{$t('character.rites')}}
        <LevelButton @click="levelRites()"/>
      </h5>

      <small v-for="r in charRites" :key="r.id">
        <span>{{r.name}}</span>
        <TipButton @click="riteInfoModal.showModal(r)" :override="true"/>
      </small>
    </div>

    <GiftModal ref="levelGiftModal"/>
    <RiteInfoModal ref="riteInfoModal"/>
    <GiftInfoModal ref="giftInfoModal"/>
  </div>
</template>

<style scoped lang="scss">
.gifts-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  .card {
    width: calc(100vw / 4 - 10rem);
    height: fit-content;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    h5 {
      margin: 0;
      font-weight: bold;
      font-size: 1.2rem;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    }
    small {
      display: flex;
      justify-content: space-between;
    }
  }
}
</style>