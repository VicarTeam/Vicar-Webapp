<template>
  <Modal :shown="show" @close="show = false">
    <div style="max-width: 40rem" v-if="ability" class="ability-info">
      <h6 style="margin-bottom: 0">{{ability.name}}</h6>
      <small><i>{{ability.description}}</i></small>
      <hr>
      <small><b>{{$t('character.gifts.category')}}</b>: {{$t('character.gifts.category.' + ability.category)}}</small>
      <small><b>{{$t('character.renown')}} ({{ability.totalRenown}})</b>: {{$t('character.renown.' + ability.renown)}}</small>
      <hr>
      <span><b>{{$t('editor.disciplines.costs')}}</b>: {{ability.cost}}</span>
      <span><b>{{$t('editor.gifts.action')}}</b>: {{ability.action}}</span>
      <span v-if="ability.pool"><b>{{$t('editor.disciplines.dices')}}</b>: {{ability.pool}}</span>
      <span><b>{{$t('editor.disciplines.system')}}</b>: <span v-html="ability.system"/></span>
      <span><b>{{$t('editor.disciplines.duration')}}</b>: {{ability.duration}}</span>
    </div>
  </Modal>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import Modal from "@/components/modal/Modal.vue";
import {IW5Gift} from "@/types/w5";

@Component({
  components: {Modal}
})
export default class GiftInfoModal extends Vue {

  private show: boolean = false;
  private ability: IW5Gift|null = null;

  public showModal(ability: IW5Gift) {
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
