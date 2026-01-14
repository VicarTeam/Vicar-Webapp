<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import {
  IMageSheet, knowledgeAbilities,
  M20Ability, skillAbilities, talentAbilities,
} from '@/types/m20';
import EditorForm from '@/components/editor/EditorForm.vue';

enum AbilityPriority {
  None = 0,
  Primary = 1,
  Secondary = 2,
  Tertiary = 3
}

const priorities = [AbilityPriority.Primary, AbilityPriority.Secondary, AbilityPriority.Tertiary];
const priorityMax = {
  [AbilityPriority.None]: 0,
  [AbilityPriority.Primary]: 13,
  [AbilityPriority.Secondary]: 9,
  [AbilityPriority.Tertiary]: 5
};

const baseNumbers = [0, 1, 2, 3];

@Component({
  components: { EditorForm }
})
export default class ChooseAbilitiesView extends Vue {
  AbilityPriority = AbilityPriority;
  baseNumbers = baseNumbers;
  talentAbilities = talentAbilities;
  skillAbilities = skillAbilities;
  knowledgeAbilities = knowledgeAbilities;
  M20Ability = M20Ability;

  @State('editingCharacter')
  private editingCharacter!: IMageSheet;

  private talentsPriority: AbilityPriority = AbilityPriority.None;
  private skillsPriority: AbilityPriority = AbilityPriority.None;
  private knowledgesPriority: AbilityPriority = AbilityPriority.None;

  private get selectableTalentsPriorities(): AbilityPriority[] {
    const used = [this.skillsPriority, this.knowledgesPriority];
    return priorities.filter(x => !used.includes(x as AbilityPriority)) as AbilityPriority[];
  }

  private get selectableSkillsPriorities(): AbilityPriority[] {
    const used = [this.talentsPriority, this.knowledgesPriority];
    return priorities.filter(x => !used.includes(x as AbilityPriority)) as AbilityPriority[];
  }

  private get selectableKnowledgesPriorities(): AbilityPriority[] {
    const used = [this.talentsPriority, this.skillsPriority];
    return priorities.filter(x => !used.includes(x as AbilityPriority)) as AbilityPriority[];
  }

  private getAbilityValue(ab: M20Ability): number {
    return (this.editingCharacter?.abilities?.[ab] ?? 0) as number;
  }

  private setAbilityValue(ab: M20Ability, v: number) {
    const safe = Math.max(0, Math.min(3, v | 0));
    this.$set(this.editingCharacter.abilities, ab, safe);
  }

  private sumFor(list: readonly M20Ability[], enabled: boolean): number {
    if (!enabled) return 0;
    return list.reduce((acc, ab) => acc + this.getAbilityValue(ab), 0);
  }

  private maxFor(p: AbilityPriority): number {
    return priorityMax[p] || 0;
  }

  private get usedTalents(): number {
    return this.sumFor(this.talentAbilities, this.talentsPriority !== AbilityPriority.None);
  }

  private get usedSkills(): number {
    return this.sumFor(this.skillAbilities, this.skillsPriority !== AbilityPriority.None);
  }

  private get usedKnowledges(): number {
    return this.sumFor(this.knowledgeAbilities, this.knowledgesPriority !== AbilityPriority.None);
  }

  private isOptionDisabled(kind: 'talent' | 'skill' | 'knowledge', ab: M20Ability, candidate: number): boolean {
    if (candidate === 0) return false;
    const current = this.getAbilityValue(ab);

    let used = 0, max = 0, locked = false;
    switch (kind) {
      case 'talent':
        used = this.usedTalents;
        max = this.maxFor(this.talentsPriority);
        locked = this.talentsPriority === AbilityPriority.None;
        break;
      case 'skill':
        used = this.usedSkills;
        max = this.maxFor(this.skillsPriority);
        locked = this.skillsPriority === AbilityPriority.None;
        break;
      case 'knowledge':
        used = this.usedKnowledges;
        max = this.maxFor(this.knowledgesPriority);
        locked = this.knowledgesPriority === AbilityPriority.None;
        break;
    }

    if (locked) return true;
    if (candidate > 3) return true;
    if (candidate === current) return false;

    const newTotal = used - current + candidate;
    return newTotal > max;
  }

  private get talentsLocked(): boolean { return this.talentsPriority === AbilityPriority.None; }
  private get skillsLocked(): boolean { return this.skillsPriority === AbilityPriority.None; }
  private get knowledgesLocked(): boolean { return this.knowledgesPriority === AbilityPriority.None; }

  private get canGoNext(): boolean {
    if (
      this.talentsPriority !== AbilityPriority.None &&
      this.skillsPriority !== AbilityPriority.None &&
      this.knowledgesPriority !== AbilityPriority.None
    ) {
      const okTal = this.usedTalents === this.maxFor(this.talentsPriority);
      const okSki = this.usedSkills === this.maxFor(this.skillsPriority);
      const okKno = this.usedKnowledges === this.maxFor(this.knowledgesPriority);
      return okTal && okSki && okKno;
    }
    return false;
  }
}
</script>

<template>
  <EditorForm :can-go-next="canGoNext" next-step="editor-traits">
    <div v-if="editingCharacter" class="abilities-view">
      <div class="card header">
        <small>Step Three: Select Abilities — Priorisiere 13 / 9 / 5. Kein Wert über 3.</small>
      </div>

      <div class="panels">
        <div class="card">
          <h6>Talents</h6>
          <select class="form-control" v-model="talentsPriority">
            <option :value="AbilityPriority.None">Auswählen</option>
            <option v-for="p in selectableTalentsPriorities" :key="p" :value="p">
              {{ p === AbilityPriority.Primary ? 'Primär (13)' : (p === AbilityPriority.Secondary ? 'Sekundär (9)' : 'Tertiär (5)') }}
            </option>
          </select>
          <div class="info"><span>{{ usedTalents }} / {{ talentsPriority === AbilityPriority.None ? 0 : (talentsPriority === AbilityPriority.Primary ? 13 : (talentsPriority === AbilityPriority.Secondary ? 9 : 5)) }}</span></div>

          <div class="ability-col">
            <div v-for="ab in talentAbilities" :key="ab" class="ability-row">
              <label>{{ $t('m20.ability.' + ab) }}</label>
              <select
                class="form-control"
                :disabled="talentsLocked"
                :value="editingCharacter.abilities[ab]"
                @change="setAbilityValue(ab, $event.target.value)"
              >
                <option
                  v-for="n in baseNumbers"
                  :key="n"
                  :value="n"
                  :disabled="isOptionDisabled('talent', ab, n)"
                >{{ n }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="card">
          <h6>Skills</h6>
          <select class="form-control" v-model="skillsPriority">
            <option :value="AbilityPriority.None">Auswählen</option>
            <option v-for="p in selectableSkillsPriorities" :key="p" :value="p">
              {{ p === AbilityPriority.Primary ? 'Primär (13)' : (p === AbilityPriority.Secondary ? 'Sekundär (9)' : 'Tertiär (5)') }}
            </option>
          </select>
          <div class="info"><span>{{ usedSkills }} / {{ skillsPriority === AbilityPriority.None ? 0 : (skillsPriority === AbilityPriority.Primary ? 13 : (skillsPriority === AbilityPriority.Secondary ? 9 : 5)) }}</span></div>

          <div class="ability-col">
            <div v-for="ab in skillAbilities" :key="ab" class="ability-row">
              <label>{{ $t('m20.ability.' + ab) }}</label>
              <select
                class="form-control"
                :disabled="skillsLocked"
                :value="editingCharacter.abilities[ab]"
                @change="setAbilityValue(ab, $event.target.value)"
              >
                <option
                  v-for="n in baseNumbers"
                  :key="n"
                  :value="n"
                  :disabled="isOptionDisabled('skill', ab, n)"
                >{{ n }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="card">
          <h6>Knowledges</h6>
          <select class="form-control" v-model="knowledgesPriority">
            <option :value="AbilityPriority.None">Auswählen</option>
            <option v-for="p in selectableKnowledgesPriorities" :key="p" :value="p">
              {{ p === AbilityPriority.Primary ? 'Primär (13)' : (p === AbilityPriority.Secondary ? 'Sekundär (9)' : 'Tertiär (5)') }}
            </option>
          </select>
          <div class="info"><span>{{ usedKnowledges }} / {{ knowledgesPriority === AbilityPriority.None ? 0 : (knowledgesPriority === AbilityPriority.Primary ? 13 : (knowledgesPriority === AbilityPriority.Secondary ? 9 : 5)) }}</span></div>

          <div class="ability-col">
            <div v-for="ab in knowledgeAbilities" :key="ab" class="ability-row">
              <label>{{ $t('m20.ability.' + ab) }}</label>
              <select
                class="form-control"
                :disabled="knowledgesLocked"
                :value="editingCharacter.abilities[ab]"
                @change="setAbilityValue(ab, $event.target.value)"
              >
                <option
                  v-for="n in baseNumbers"
                  :key="n"
                  :value="n"
                  :disabled="isOptionDisabled('knowledge', ab, n)"
                >{{ n }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <small class="hint">
        Tip: „0“ ist immer verfügbar, um Punkte freizugeben. Du kannst innerhalb des Budgets beliebig umschichten.
      </small>
    </div>
  </EditorForm>
</template>

<style scoped lang="scss">
.abilities-view {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;

  .header {
    width: 50rem;
  }

  .panels {
    display: flex;
    align-items: flex-start;
    gap: 2rem;
    flex-wrap: wrap;
  }

  .card {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 30rem;

    h6 {
      margin: 0 0 0.5rem;
      font-weight: bold;
      text-align: center;
    }

    .info {
      font-size: 0.85rem;
      text-align: right;
      opacity: 0.8;
    }

    .ability-col {
      margin-top: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      .ability-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.5rem;

        label { margin: 0; }
        select { width: 6rem; }
      }
    }
  }

  .hint {
    opacity: 0.8;
  }
}
</style>
