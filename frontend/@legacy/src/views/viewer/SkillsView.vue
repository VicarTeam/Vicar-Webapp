<template>
  <div class="skills-view">
    <div v-if="!isMage" class="card category" v-for="cat in editingCharacter.categories">
      <div style="width: 100%; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.3)"><b>{{$t('data.category.' + cat.name)}}</b></div>

      <div class="skill" v-for="skill in cat.skills" :id="`hlsk-${skill.key}`">
        <LevelButton v-if="skill.value < 5" @click="levelSkillModal.showModal(skill)"/>
        <LevelButton @click="levelSpecializationModal.showModal(skill)" icon="fa-plus"/>
        <i class="iconbtnprim fa-solid fa-minus" v-if="editingCharacter.fullCustomization && skill.value > 0" @click="deleteSkill(skill)"></i>
        <i class="iconbtnprim fa-solid fa-trash" v-if="editingCharacter.fullCustomization && skill.specialization.length > 0" @click="deleteSkillSpecs(skill)"></i>
        <small class="name" @click.self="setDicePool('skill', $t('data.skill.' + skill.key).toString(), skill.value, isHumanInteractionSkill(skill.key))">
          <TipButton :content="$t('data.skill.' + skill.key + '.desc')"/> {{$t('data.skill.' + skill.key)}} <span style="color: #a6a6a6" v-if="hasSpecialization(skill)">(<i><span v-for="s in skill.specialization" style="margin-left: 0.25rem; margin-right: 0.25rem" @click="setDicePool('skill', $t('data.skill.' + skill.key).toString() + ' (' + s + ')', skill.value + 1, isHumanInteractionSkill(skill.key))">{{s}}</span></i>)</span>
        </small>
        <Dots :amount="skill.value" :max="5"/>
      </div>
    </div>

    <div v-if="isMage" class="card category">
      <div style="width: 100%; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.3)"><b>{{$t('m20.ability_category.talents')}}</b></div>

      <div class="skill" v-for="a in talentAbilities">
        <LevelButton v-if="editingCharacter.abilities[a] < 5" @click="requestLevel('ability', a)"/>
        <i class="iconbtnprim fa-solid fa-minus" v-if="editingCharacter.fullCustomization && editingCharacter.abilities[a] > 0" @click="deleteSkill(a)"></i>
        <small class="name">{{$t('m20.ability.' + a)}}</small>
        <Dots :amount="editingCharacter.abilities[a]" :max="5"/>
      </div>
    </div>
    <div v-if="isMage" class="card category">
      <div style="width: 100%; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.3)"><b>{{$t('m20.ability_category.skills')}}</b></div>

      <div class="skill" v-for="a in skillAbilities">
        <LevelButton v-if="editingCharacter.abilities[a] < 5" @click="requestLevel('ability', a)"/>
        <i class="iconbtnprim fa-solid fa-minus" v-if="editingCharacter.fullCustomization && editingCharacter.abilities[a] > 0" @click="deleteSkill(a)"></i>
        <small class="name">{{$t('m20.ability.' + a)}}</small>
        <Dots :amount="editingCharacter.abilities[a]" :max="5"/>
      </div>
    </div>
    <div v-if="isMage" class="card category">
      <div style="width: 100%; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.3)"><b>{{$t('m20.ability_category.knowledges')}}</b></div>

      <div class="skill" v-for="a in knowledgeAbilities">
        <LevelButton v-if="editingCharacter.abilities[a] < 5" @click="requestLevel('ability', a)"/>
        <i class="iconbtnprim fa-solid fa-minus" v-if="editingCharacter.fullCustomization && editingCharacter.abilities[a] > 0" @click="deleteSkill(a)"></i>
        <small class="name">{{$t('m20.ability.' + a)}}</small>
        <Dots :amount="editingCharacter.abilities[a]" :max="5"/>
      </div>
    </div>

    <SkillModal ref="levelSkillModal"/>
    <NewSpecializationModal ref="levelSpecializationModal"/>
    <ConfirmDeleteModal ref="confirmDeleteModal"/>
  </div>
</template>

<script lang="ts">
import {Component, Inject, Ref, Vue} from "vue-property-decorator";
import Dots from "@/components/progress/Dots.vue";
import {State} from "vuex-class";
import {ICharacter, isHumanInteractionSkill, ISkillData, SkillKeys} from "@/types/models";
import LevelButton from "@/components/viewer/LevelButton.vue";
import SkillModal from "@/components/viewer/modals/leveling/SkillModal.vue";
import NewSpecializationModal from "@/components/viewer/modals/leveling/NewSpecializationModal.vue";
import TipButton from "@/components/editor/TipButton.vue";
import ConfirmDeleteModal from "@/components/viewer/modals/ConfirmDeleteModal.vue";
import CharacterStorage from "@/libs/io/character-storage";
import EventBus from "@/libs/event-bus";
import {GameLine} from "@/types/gameline";
import {knowledgeAbilities, M20Ability, RequestLevelFn, skillAbilities, talentAbilities} from "@/types/m20";

@Component({
  components: {ConfirmDeleteModal, NewSpecializationModal, SkillModal, LevelButton, Dots, TipButton}
})
export default class SkillsView extends Vue {

  talentAbilities = talentAbilities;
  skillAbilities = skillAbilities;
  knowledgeAbilities = knowledgeAbilities;

  @State("editingCharacter")
  private editingCharacter!: ICharacter;

  @Ref("levelSkillModal")
  private levelSkillModal!: SkillModal;

  @Ref("levelSpecializationModal")
  private levelSpecializationModal!: NewSpecializationModal;

  @Ref("confirmDeleteModal")
  private confirmDeleteModal!: ConfirmDeleteModal;

  @Inject("set-dice-pool")
  private setDicePool!: (type: 'attr'|'skill'|'disc', name: string, value: number, isHuman?: boolean) => void;

  @Inject("request-m20-level")
  private requestLevel!: RequestLevelFn;

  isHumanInteractionSkill = isHumanInteractionSkill;

  private hasSpecialization(skill: ISkillData): boolean {
    return !!skill.specialization && skill.specialization.length > 0;
  }

  private deleteSkill(skill: ISkillData|M20Ability) {
    if (!this.isMage) {
      skill = skill as ISkillData;
      this.confirmDeleteModal.showModal(this.$t('data.skill.' + skill.key) + ' ' + skill.value, () => {
        skill.value--;
        CharacterStorage.saveCharacter(this.editingCharacter);
      });
    } else {
      skill = skill as M20Ability;
      this.confirmDeleteModal.showModal(this.$t('m20.ability.' + skill) + ' ' + this.editingCharacter.abilities[skill], () => {
        this.editingCharacter.abilities[skill]--;
        CharacterStorage.saveCharacter(this.editingCharacter);
      });
    }
  }

  private deleteSkillSpecs(skill: ISkillData) {
    this.confirmDeleteModal.showModal(skill.specialization.join(", "), () => {
      skill.specialization = [];
      CharacterStorage.saveCharacter(this.editingCharacter);
    });
  }

  private get isMage() {
    return this.editingCharacter?.game === GameLine.Mage;
  }
}
</script>

<style scoped lang="scss">
.skills-view {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4rem;
  .category {
    display: flex;
    flex-direction: column;
    width: 40rem;
    gap: 0.5rem;
    .skill {
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
