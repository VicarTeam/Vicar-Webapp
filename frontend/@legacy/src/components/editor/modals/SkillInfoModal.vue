<template>
  <Modal :shown="show" v-if="skill" @close="show = false">
    <div class="skill-info">
      <b>{{$t('editor.skills.modal.desc')}}:</b>
      <span>{{$t('data.skill.' + skill + '.desc')}}</span>

      <b class="mt-10">{{$t('editor.skills.modal.specializations')}}:</b>
      <span>{{$t('data.skill.' + skill + '.spec')}}</span>
    </div>
  </Modal>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import Modal from "@/components/modal/Modal.vue";
import {SkillKeys} from "@/types/models";

@Component({
  components: {Modal}
})
export default class SkillInfoModal extends Vue {

  private show = false;
  private skill: SkillKeys = null!;

  public showModal(skill: SkillKeys) {
    this.skill = skill;
    this.show = true;
  }
}
</script>

<style scoped lang="scss">
.skill-info {
  display: flex;
  flex-direction: column;
  width: 40rem;
  font-size: 1.3rem;
}
</style>
