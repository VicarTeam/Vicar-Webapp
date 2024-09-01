<template>
  <Modal :shown="show" @close="show = false">
    <div class="form-group">
      <label class="required">{{$t('viewer.modal.addexp')}}:</label>
      <input class="form-control" type="number" v-model="exp"/>
    </div>
    <div style="width: 100%; display: flex; justify-content: center; align-items: center">
      <button class="btn btn-primary" @click="addExp">{{$t('viewer.modal.addexp.btn')}}</button>
    </div>
  </Modal>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import Modal from "@/components/modal/Modal.vue";
import {State} from "vuex-class";
import {ICharacter} from "@/types/models";
import CharacterStorage from "@/libs/io/character-storage";

@Component({
  components: {Modal}
})
export default class AddExpModal extends Vue {

  @State("editingCharacter")
  private editingCharacter!: ICharacter;

  private show: boolean = false;
  private exp: number = 0;

  public showModal() {
    this.exp = 0;
    this.show = true;
  }

  private addExp() {
    this.editingCharacter.exp += parseInt(this.exp.toString());
    this.editingCharacter.exp = Math.max(this.editingCharacter.exp, 0);
    CharacterStorage.saveCharacter(this.editingCharacter);
    this.show = false;
  }
}
</script>

<style scoped lang="scss">

</style>
