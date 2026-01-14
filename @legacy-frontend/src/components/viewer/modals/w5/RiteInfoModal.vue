<template>
  <Modal :shown="show" @close="show = false">
    <div style="max-width: 40rem" v-if="ability" class="ability-info">
      <h6 style="margin-bottom: 0">{{ability.name}}</h6>
      <small><i>{{ability.description}}</i></small>
      <hr>
      <small v-if="!ability.pool || !ability.system"><b>{{$t('character.rites.social')}}</b>: {{$t('character.rites.social.description')}}</small>
      <span v-if="ability.pool"><b>{{$t('editor.disciplines.dices')}}</b>: {{ability.pool}}</span>
      <span v-if="ability.system"><b>{{$t('editor.disciplines.system')}}</b>: <span v-html="ability.system"/></span>
    </div>
  </Modal>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import Modal from "@/components/modal/Modal.vue";
import {IW5Rite} from "@/types/w5";

@Component({
  components: {Modal}
})
export default class RiteInfoModal extends Vue {

  private show: boolean = false;
  private ability: IW5Rite|null = null;

  public showModal(ability: IW5Rite) {
    this.ability = ability;
    this.show = true;
  }
}
</script>

<style scoped lang="scss">
.ability-info {
  max-height: 50rem;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  gap: 1rem;
}
</style>
