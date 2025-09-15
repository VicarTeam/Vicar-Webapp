<template>
  <Modal :shown="show" @close="show = false">
    <div v-if="editingCharacter" style="display: flex; flex-direction: column; gap: 1rem; width: 20rem">
      <b>Ansehen: {{$t('character.renown.' + renown.key)}}:</b>
      <div style="width: 100%; text-align: center">{{renown.value}} &#8594; {{renown.value + 1}} <bullet/> {{$t('viewer.modal.level.costs', {xp: neededExp})}}</div>
      <div style="width: 100%; display: flex; justify-content: center; align-items: center">
        <button class="btn btn-primary" :disabled="neededExp > editingCharacter.exp" @click="level">{{$t('viewer.modal.level.btn')}}</button>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import Modal from "@/components/modal/Modal.vue";
import Bullet from "@/components/Bullet.vue";
import CharacterStorage from "@/libs/io/character-storage";
import {IW5Renown, IWerewolfW5Sheet, W5RenownKey} from "@/types/w5";

@Component({
  components: {Bullet, Modal}
})
export default class RenownModal extends Vue {

  private show: boolean = false;
  private editingCharacter: IWerewolfW5Sheet = null!;
  private renown: IW5Renown = {
    key: W5RenownKey.none,
    value: 0
  };

  public showModal(char: IWerewolfW5Sheet, renownKey: W5RenownKey) {
    this.editingCharacter = char;
    this.renown = char.renown.find(r => r.key === renownKey) || {key: renownKey, value: 0};
    this.show = true;
  }

  private level() {
    if (this.editingCharacter.exp < this.neededExp) {
      return;
    }
    this.editingCharacter.usedExp = (this.editingCharacter.usedExp || 0) + this.neededExp;
    this.editingCharacter.exp -= this.neededExp;
    this.renown.value++;
    if (!this.editingCharacter.renown.find(r => r.key === this.renown.key)) {
      this.editingCharacter.renown.push(this.renown);
    } else {
      const idx = this.editingCharacter.renown.findIndex(r => r.key === this.renown.key);
      this.editingCharacter.renown[idx] = this.renown;
    }
    CharacterStorage.saveCharacter(this.editingCharacter as any);
    this.show = false;
  }

  private get neededExp(): number {
    return (this.renown.value + 1) * 5;
  }
}
</script>

<style scoped lang="scss">

</style>
