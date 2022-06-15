<template>
  <Modal :shown="show" v-if="editingCharacter" @close="show = false">

  </Modal>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import Modal from "@/components/modal/Modal.vue";
import {State} from "vuex-class";
import {ICharacter} from "@/types/models";

@Component({
  components: {Modal}
})
export default class ChooseTraitModal extends Vue {

  @State("editingCharacter")
  private editingCharacter!: ICharacter|undefined;

  private show: boolean = false;
}
</script>

<style scoped lang="scss">

</style>
