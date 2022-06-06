<template>
  <div class="d-flex flex-grow-1" style="padding: 3rem">
    <div class="d-flex flex-column" style="width: 20rem">
      <button class="btn btn-primary" style="height: 4rem" @click="createCharacterModal.showModal()">
        {{$t('main.characters.create')}}
      </button>
    </div>

    <div class="d-flex flex-column flex-grow-1">

    </div>

    <CreateCharacterModal ref="createCharacterModal"/>
  </div>
</template>

<script lang="ts">
import {Component, Ref, Vue} from "vue-property-decorator";
import Modal from "@/components/modal/Modal.vue";
import CreateCharacterModal from "@/components/main/characters/CreateCharacterModal.vue";

@Component({
  components: {CreateCharacterModal, Modal}
})
export default class Characters extends Vue {

  @Ref("createCharacterModal")
  private createCharacterModal!: CreateCharacterModal;
}
</script>

<style scoped lang="scss">

</style>
