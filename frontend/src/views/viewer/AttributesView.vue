<template>
  <div class="attributes-view">
    <div v-if="!isMage" class="card category" v-for="cat in editingCharacter.categories">
      <div style="width: 100%; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.3)"><b>{{$t('data.category.' + cat.name)}}</b></div>

      <div class="attribute" v-for="attr in cat.attributes" :id="`hlat-${attr.key}`">
        <LevelButton v-if="attr.value < 5" @click="levelAttributeModal.showModal(attr)"/>
        <i class="iconbtnprim fa-solid fa-minus" v-if="editingCharacter.fullCustomization && attr.value > 0" @click="deleteAttribute(attr)"></i>
        <small class="name" @click="setDicePool('attr', $t('data.attribute.' + attr.key).toString(), attr.value, isHumanInteractionAttribute(attr.key))"><TipButton :content="$t('data.attribute.' + attr.key + '.desc')"/> {{$t('data.attribute.' + attr.key)}}</small>
        <Dots :amount="attr.value" :max="5"/>
      </div>
    </div>

    <div v-if="isMage" class="card category">
      <div style="width: 100%; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.3)"><b>{{$t('m20.attribute_category.physical')}}</b></div>
      <div class="attribute" v-for="a in physicalAttributes">
        <LevelButton v-if="editingCharacter.attributes[a] < 5" @click="requestLevel('attribute', a)"/>
        <i class="iconbtnprim fa-solid fa-minus" v-if="editingCharacter.fullCustomization && editingCharacter.attributes[a] > 0" @click="deleteAttribute(attr)"></i>
        <small class="name">{{$t('m20.attribute.' + a)}}</small>
        <Dots :amount="editingCharacter.attributes[a]" :max="5"/>
      </div>
    </div>
    <div v-if="isMage" class="card category">
      <div style="width: 100%; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.3)"><b>{{$t('m20.attribute_category.social')}}</b></div>
      <div class="attribute" v-for="a in socialAttributes">
        <LevelButton v-if="editingCharacter.attributes[a] < 5" @click="requestLevel('attribute', a)"/>
        <i class="iconbtnprim fa-solid fa-minus" v-if="editingCharacter.fullCustomization && editingCharacter.attributes[a] > 0" @click="deleteAttribute(attr)"></i>
        <small class="name">{{$t('m20.attribute.' + a)}}</small>
        <Dots :amount="editingCharacter.attributes[a]" :max="5"/>
      </div>
    </div>
    <div v-if="isMage" class="card category">
      <div style="width: 100%; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.3)"><b>{{$t('m20.attribute_category.mental')}}</b></div>
      <div class="attribute" v-for="a in mentalAttributes">
        <LevelButton v-if="editingCharacter.attributes[a] < 5" @click="requestLevel('attribute', a)"/>
        <i class="iconbtnprim fa-solid fa-minus" v-if="editingCharacter.fullCustomization && editingCharacter.attributes[a] > 0" @click="deleteAttribute(attr)"></i>
        <small class="name">{{$t('m20.attribute.' + a)}}</small>
        <Dots :amount="editingCharacter.attributes[a]" :max="5"/>
      </div>
    </div>

    <AttributeModal ref="levelAttributeModal"/>
    <ConfirmDeleteModal ref="confirmDeleteModal"/>
  </div>
</template>

<script lang="ts">
import {Component, Inject, Ref, Vue} from "vue-property-decorator";
import {State} from "vuex-class";
import {IAttributeData, ICharacter, isHumanInteractionAttribute} from "@/types/models";
import Dots from "@/components/progress/Dots.vue";
import LevelButton from "@/components/viewer/LevelButton.vue";
import AttributeModal from "@/components/viewer/modals/leveling/AttributeModal.vue";
import TipButton from "@/components/editor/TipButton.vue";
import ConfirmDeleteModal from "@/components/viewer/modals/ConfirmDeleteModal.vue";
import CharacterStorage from "@/libs/io/character-storage";
import {GameLine} from "@/types/gameline";
import {M20Attribute, mentalAttributes, physicalAttributes, RequestLevelFn, socialAttributes} from "@/types/m20";

@Component({
  components: {ConfirmDeleteModal, AttributeModal, LevelButton, Dots, TipButton}
})
export default class AttributesView extends Vue {

  physicalAttributes = physicalAttributes;
  socialAttributes = socialAttributes;
  mentalAttributes = mentalAttributes;

  @State("editingCharacter")
  private editingCharacter!: ICharacter;

  @Ref("levelAttributeModal")
  private levelAttributeModal!: AttributeModal;

  @Ref("confirmDeleteModal")
  private confirmDeleteModal!: ConfirmDeleteModal;

  @Inject("set-dice-pool")
  private setDicePool!: (type: 'attr'|'skill'|'disc', name: string, value: number, isHuman?: boolean) => void;

  @Inject("request-m20-level")
  private requestLevel!: RequestLevelFn;

  isHumanInteractionAttribute = isHumanInteractionAttribute;

  private deleteAttribute(attr: IAttributeData|M20Attribute) {
    if (!this.isMage) {
      attr = attr as IAttributeData;
      this.confirmDeleteModal.showModal(this.$t('data.attribute.' + attr.key) + ' ' + attr.value, () => {
        attr.value--;
        CharacterStorage.saveCharacter(this.editingCharacter);
      });
    } else {
      attr = attr as M20Attribute;
      this.confirmDeleteModal.showModal(this.$t('m20.attribute.' + attr) + ' ' + this.editingCharacter.attributes[attr], () => {
        this.editingCharacter.attributes[attr]--;
        CharacterStorage.saveCharacter(this.editingCharacter);
      });
    }
  }

  private get isMage() {
    return this.editingCharacter?.game === GameLine.Mage;
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
