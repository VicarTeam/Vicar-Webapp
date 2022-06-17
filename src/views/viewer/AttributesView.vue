<template>
  <div class="attributes-view">
    <div class="card category" v-for="cat in editingCharacter.categories">
      <div style="width: 100%; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.3)"><b>{{$t('data.category.' + cat.name)}}</b></div>

      <div class="attribute" v-for="attr in cat.attributes">
        <LevelButton v-if="attr.value < 5" @click="levelAttributeModal.showModal(attr)"/>
        <small class="name">{{$t('data.attribute.' + attr.key)}}</small>
        <Dots :amount="attr.value" :max="5"/>
      </div>
    </div>

    <AttributeModal ref="levelAttributeModal"/>
  </div>
</template>

<script lang="ts">
import {Component, Ref, Vue} from "vue-property-decorator";
import {State} from "vuex-class";
import {ICharacter} from "@/types/models";
import Dots from "@/components/progress/Dots.vue";
import LevelButton from "@/components/viewer/LevelButton.vue";
import AttributeModal from "@/components/viewer/modals/leveling/AttributeModal.vue";

@Component({
  components: {AttributeModal, LevelButton, Dots}
})
export default class AttributesView extends Vue {

  @State("editingCharacter")
  private editingCharacter!: ICharacter;

  @Ref("levelAttributeModal")
  private levelAttributeModal!: AttributeModal;
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
