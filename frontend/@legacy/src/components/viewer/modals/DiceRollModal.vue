<script lang="ts">
import {Vue, Component} from 'vue-property-decorator';
import {ICharacter} from "@/types/models";
import Modal from "@/components/modal/Modal.vue";
import {VicarTT} from "@/libs/io/vicar-tt";

@Component({
  components: {Modal}
})
export default class DiceRollModal extends Vue {

  private visible: boolean = false;
  private character: ICharacter = null!;
  private dices: number = 1;
  private difficulty: string = "";

  public showModal(character: ICharacter) {
    this.character = character;
    this.dices = 1;
    this.difficulty = "";
    this.visible = true;
  }

  private sendDiceRoll() {
    if (!this.canSend) {
      return;
    }

    let difficulty: number|undefined = undefined;
    if (this.difficulty.trim().length > 0 && !isNaN(parseInt(this.difficulty))) {
      difficulty = parseInt(this.difficulty);
    }

    const hunger = Math.min(this.character.hunger, this.dices);
    const simple = this.dices - hunger;

    VicarTT.rollDiceFor(this.character, simple, hunger, difficulty);

    this.visible = false;
  }

  private get canSend() {
    return this.dices > 0;
  }
}
</script>

<template>
  <Modal :shown="visible" @close="visible = false">
    <div class="w-250 flex-column d-flex" style="gap: 1rem; font-size: 1rem">
      <b style="text-align: center">{{$t('character.vicartt.roll.modal.title')}}</b>
      <div class="form-group mb-0">
        <label>{{$t('character.vicartt.roll.modal.dices')}}:</label>
        <input type="number" class="form-control" v-model.number="dices">
      </div>
      <div class="form-group mb-0">
        <label>{{$t('character.vicartt.difficulty')}}:</label>
        <input type="text" class="form-control" v-model="difficulty">
      </div>

      <div style="margin-top: 1rem; display: flex; justify-content: center; align-items: center">
        <button :disabled="!canSend" class="btn btn-primary" @click="sendDiceRoll">{{$t('character.vicartt.roll')}}</button>
      </div>
    </div>
  </Modal>
</template>

<style scoped lang="scss">

</style>