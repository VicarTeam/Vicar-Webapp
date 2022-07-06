<template>
  <div class="attributes-view">
    <div class="card category" v-for="cat in editingCharacter.categories">
      <div style="width: 100%; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.3)"><b>{{$t('data.category.' + cat.name)}}</b></div>

      <div class="attribute" v-for="attr in cat.attributes">
        <LevelButton v-if="attr.value < 5" @click="levelAttributeModal.showModal(attr)"/>
        <i class="iconbtnprim fa-solid fa-minus" v-if="editingCharacter.fullCustomization && attr.value > 0" @click="deleteAttribute(attr)"></i>
        <small class="name"><TipButton :content="$t('data.attribute.' + attr.key + '.desc')"/> {{$t('data.attribute.' + attr.key)}}</small>
        <Dots :amount="attr.value" :max="5"/>
      </div>
    </div>

    <AttributeModal ref="levelAttributeModal"/>
    <ConfirmDeleteModal ref="confirmDeleteModal"/>
  </div>
</template>

<script lang="ts">
import {Component, Ref, Vue} from "vue-property-decorator";
import {State} from "vuex-class";
import {IAttributeData, ICharacter} from "@/types/models";
import Dots from "@/components/progress/Dots.vue";
import LevelButton from "@/components/viewer/LevelButton.vue";
import AttributeModal from "@/components/viewer/modals/leveling/AttributeModal.vue";
import TipButton from "@/components/editor/TipButton.vue";
import ConfirmDeleteModal from "@/components/viewer/modals/ConfirmDeleteModal.vue";
import CharacterStorage from "@/libs/io/character-storage";

@Component({
  components: {ConfirmDeleteModal, AttributeModal, LevelButton, Dots, TipButton}
})
export default class AttributesView extends Vue {

  @State("editingCharacter")
  private editingCharacter!: ICharacter;

  @Ref("levelAttributeModal")
  private levelAttributeModal!: AttributeModal;

  @Ref("confirmDeleteModal")
  private confirmDeleteModal!: ConfirmDeleteModal;

  private deleteAttribute(attr: IAttributeData) {
    this.confirmDeleteModal.showModal(this.$t('data.attribute.' + attr.key) + ' ' + attr.value, () => {
      attr.value--;
      CharacterStorage.saveCharacter(this.editingCharacter);
    });
  }
}
</script>

<style scoped lang="scss">
.attributes-view {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5rem;
  .category {
    display: flex;
    flex-direction: column;
    width: 30rem;
    gap: 0.5rem;
    .attribute {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 1rem;
      .name {
        flex-grow: 1;
      }
      .value {
        flex-shrink: 0;
      }
    }
  }
}
</style>
