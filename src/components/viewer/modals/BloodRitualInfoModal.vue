<template>
  <Modal :shown="show" @close="show = false">
    <div style="max-width: 40rem" v-if="ritual" class="ability-info">
      <small><i>{{ritual.description}}</i></small>
      <hr>
      <span><b>{{$t('editor.disciplines.bloodritual.ingredients')}}</b>: {{ritual.ingredients}}</span>
      <span><b>{{$t('editor.disciplines.bloodritual.execution')}}</b>: {{ritual.execution}}</span>
      <span><b>{{$t('editor.disciplines.bloodritual.system')}}</b>: {{ritual.system}}</span>
    </div>
  </Modal>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import {IBloodRitual, IDiscipline, IDisciplineAbility} from "@/types/data";
import {ILeveledDisciplineAbility} from "@/types/models";
import DataManager from "@/libs/data-manager";
import Modal from "@/components/modal/Modal.vue";

@Component({
  components: {Modal}
})
export default class BloodRitualInfoModal extends Vue {

  private show: boolean = false;
  private ritual: IBloodRitual|null = null;

  public showModal(ritual: IBloodRitual) {
    this.ritual = ritual;
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
