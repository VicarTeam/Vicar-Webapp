<template>
  <Modal :shown="show" @close="show = false" v-if="dir">
    <div class="w-400 d-flex justify-content-center align-items-center flex-column" style="gap: 1rem">
      <span><b>{{$t('main.characters.dir.delete', {dir: dir.name})}}</b></span>

      <div class="form-group mb-0">
        <select class="form-control" v-model="deleteChars">
          <option :value="0">{{$t('main.characters.dir.delete.chars.keep')}}</option>
          <option :value="1">{{$t('main.characters.dir.delete.chars.delete')}}</option>
        </select>
      </div>

      <button class="btn btn-primary" @click="deleteDir">{{$t('main.characters.dir.delete.btn')}}</button>
    </div>
  </Modal>

</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import Modal from "@/components/modal/Modal.vue";
import {ICharacterDirectory} from "@/types/models";
import CharacterStorage from "@/libs/io/character-storage";

@Component({
  components: {Modal}
})
export default class DeleteDirectoryModal extends Vue {

  private show: boolean = false;
  private deleteChars: number = 0;
  private dir: ICharacterDirectory|null = null;

  public showModal(dir: ICharacterDirectory|null) {
    this.dir = dir;
    this.deleteChars = 0;
    this.show = true;
  }

  private deleteDir() {
    if (this.dir) {
      CharacterStorage.removeDirectory(this.dir, this.deleteChars === 1);
      this.$emit("deleted");
      this.show = false;
    }
  }
}
</script>

<style scoped lang="scss">

</style>
