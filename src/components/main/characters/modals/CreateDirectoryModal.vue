<template>
  <Modal :shown="show" @close="show = false">
    <div class="w-400 d-flex justify-content-center align-items-center flex-column" style="gap: 1rem">
      <span>{{$t('main.characters.create.dir.input')}}:</span>
      <input type="text" class="form-control" v-model="name"/>
      <button class="btn btn-primary" @click="createDir">{{$t('editor.toolbar.finish')}}</button>
    </div>
  </Modal>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import CharacterStorage from "@/libs/io/character-storage";
import Modal from "@/components/modal/Modal.vue";

@Component({
  components: {Modal}
})
export default class CreateDirectoryModal extends Vue {

  private show: boolean = false;
  private name: string = "";

  public showModal() {
    this.name = "";
    this.show = true;
  }

  private createDir() {
    CharacterStorage.addDirectory({
      id: "",
      name: this.name,
      open: false
    });
    this.$emit("created");
    this.show = false;
  }
}
</script>

<style scoped lang="scss">

</style>
