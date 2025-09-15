<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';
import {IW5Gift, IW5Rite, IWerewolfW5Sheet, W5GiftCategory} from "@/types/w5";
import {rites} from "@/.data/w5";
import Modal from "@/components/modal/Modal.vue";
import Bullet from "@/components/Bullet.vue";
import {State} from "vuex-class";
import CharacterStorage from "@/libs/io/character-storage";

@Component({
  components: {Bullet, Modal}
})
export default class GiftModal extends Vue {

  GiftCategory = W5GiftCategory;

  @State("editingCharacter")
  private editingCharacter!: IWerewolfW5Sheet;

  private show: boolean = false;
  private category: W5GiftCategory = W5GiftCategory.Rite;
  private neededXp: number = 0;

  private gifts: IW5Gift[] = [];
  private rites: IW5Rite[] = [];

  private selected: IW5Gift|IW5Rite = 0 as any;

  public showModal(category: W5GiftCategory, neededXp: number, gifts?: IW5Gift[]) {
    this.category = category;
    this.neededXp = neededXp;
    this.selected = 0 as any;
    this.gifts = (gifts || []).filter(x => !this.editingCharacter.selectedGifts.find(j => x.id === j.id));
    this.rites = rites.filter(x => !this.editingCharacter.selectedRites.find(j => x.id === j.id)).sort((a, b) => a.name.localeCompare(b.name));
    this.show = true;
  }

  private addSelected() {
    if (!this.selected || this.editingCharacter.exp < this.neededXp) {
      return;
    }

    this.editingCharacter.usedExp = (this.editingCharacter.usedExp || 0) + this.neededXp;
    this.editingCharacter.exp -= this.neededXp;

    if (this.category === W5GiftCategory.Rite) {
      this.editingCharacter.selectedRites.push({...this.selected as IW5Rite});
    } else {
      this.editingCharacter.selectedGifts.push({...this.selected as IW5Gift});
    }

    CharacterStorage.saveCharacter(this.editingCharacter as any);
    this.show = false;
  }
}
</script>

<template>
  <Modal :shown="show" @close="show = false">
    <div class="gift-modal">
      <h5>
        <span v-if="category === GiftCategory.Rite">Ritus hinzufügen <bullet/> {{neededXp}} XP</span>
        <span v-else>{{$t('editor.gifts.' + category)}} hinzufügen <bullet/> {{neededXp}} XP</span>
      </h5>

      <select v-if="category !== GiftCategory.Rite" class="form-control" v-model="selected" style="margin-top: 0.5rem">
        <option :value="0" disabled>{{$t('editor.gifts.select')}}</option>
        <option v-for="item in gifts" :key="item.id" :value="item">
          {{item.name}} ({{item.totalRenown}})
        </option>
      </select>
      <select v-else class="form-control" v-model="selected" style="margin-top: 0.5rem">
        <option :value="0" disabled>{{$t('editor.gifts.select-rite')}}</option>
        <option v-for="item in rites" :key="item.id" :value="item">
          {{item.name}}
        </option>
      </select>

      <div v-if="selected && category !== GiftCategory.Rite" class="gift-info">
        <small><i>{{selected.description}}</i></small>
        <hr>
        <small><b>{{$t('character.gifts.category')}}</b>: {{$t('character.gifts.category.' + selected.category)}}</small>
        <small><b>{{$t('character.renown')}} ({{selected.totalRenown}})</b>: {{$t('character.renown.' + selected.renown)}}</small>
        <hr>
        <span><b>{{$t('editor.disciplines.costs')}}</b>: {{selected.cost}}</span>
        <span><b>{{$t('editor.gifts.action')}}</b>: {{selected.action}}</span>
        <span v-if="selected.pool"><b>{{$t('editor.disciplines.dices')}}</b>: {{selected.pool}}</span>
        <span><b>{{$t('editor.disciplines.system')}}</b>: <span v-html="selected.system"/></span>
        <span><b>{{$t('editor.disciplines.duration')}}</b>: {{selected.duration}}</span>
      </div>
      <div v-else-if="selected" class="gift-info">
        <small><i>{{selected.description}}</i></small>
        <hr>
        <small v-if="!selected.pool || !selected.system"><b>{{$t('character.rites.social')}}</b>: {{$t('character.rites.social.description')}}</small>
        <span v-if="selected.pool"><b>{{$t('editor.disciplines.dices')}}</b>: {{selected.pool}}</span>
        <span v-if="selected.system"><b>{{$t('editor.disciplines.system')}}</b>: <span v-html="selected.system"/></span>
      </div>

      <button v-if="editingCharacter && editingCharacter.exp >= neededXp && selected" class="btn btn-primary" style="width: fit-content; margin: 0 auto;" @click="addSelected()">Hinzufügen</button>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.gift-modal {
  display: flex;
  flex-direction: column;
  width: 40rem;
  gap: 0.5rem;
  h5 {
    margin: 0;
    font-weight: bold;
    font-size: 1.2rem;
    text-align: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  }
  .gift-info {
    display: flex;
    flex-direction: column;
    margin-top: 2rem;
    margin-bottom: 1rem;
    gap: 0.5rem;
    max-height: 30rem;
    overflow-y: auto;
    overflow-x: hidden;
  }
}
</style>