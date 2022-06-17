<template>
  <div class="skills-view">
    <div class="card category" v-for="cat in editingCharacter.categories">
      <div style="width: 100%; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.3)"><b>{{$t('data.category.' + cat.name)}}</b></div>

      <div class="skill" v-for="skill in cat.skills">
        <small class="name">
          {{$t('data.skill.' + skill.key)}} <span style="color: #a6a6a6" v-if="hasSpecialization(skill)">(<i>{{skill.specialization.join(', ')}}</i>)</span>
        </small>
        <Dots :amount="skill.value" :max="5"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import Dots from "@/components/progress/Dots.vue";
import {State} from "vuex-class";
import {ICharacter, ISkillData} from "@/types/models";

@Component({
  components: {Dots}
})
export default class SkillsView extends Vue {

  @State("editingCharacter")
  private editingCharacter!: ICharacter;

  private hasSpecialization(skill: ISkillData): boolean {
    return !!skill.specialization && skill.specialization.length > 0;
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
