<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import {
  IMageSheet,
  M20Attribute,
  M20AttributeCategory,
  mentalAttributes,
  physicalAttributes,
  socialAttributes
} from "@/types/m20";
import EditorForm from "@/components/editor/EditorForm.vue";

enum AttributePriority {
  None = 0,
  Primary = 1,
  Secondary = 2,
  Tertiary = 3
}

const priorities = [AttributePriority.Primary, AttributePriority.Secondary, AttributePriority.Tertiary];
const priorityMax = {
  [AttributePriority.None]: 0,
  [AttributePriority.Primary]: 7,
  [AttributePriority.Secondary]: 5,
  [AttributePriority.Tertiary]: 3
};
const baseNumbers = [0, 1, 2, 3, 4];

@Component({
  components: { EditorForm }
})
export default class ChooseAttributesView extends Vue {

  AttributePriority = AttributePriority;
  M20Attribute = M20Attribute;
  M20AttributeCategory = M20AttributeCategory;
  physicalAttributes = physicalAttributes;
  socialAttributes = socialAttributes;
  mentalAttributes = mentalAttributes;
  baseNumbers = baseNumbers;

  @State("editingCharacter")
  private editingCharacter!: IMageSheet;

  private physicalPriority: AttributePriority = AttributePriority.None;
  private socialPriority: AttributePriority = AttributePriority.None;
  private mentalPriority: AttributePriority = AttributePriority.None;

  private get selectablePhysicalPriorities(): AttributePriority[] {
    const used = [this.socialPriority, this.mentalPriority];
    return priorities.filter(x => !used.includes(x as AttributePriority)) as AttributePriority[];
  }
  private get selectableSocialPriorities(): AttributePriority[] {
    const used = [this.physicalPriority, this.mentalPriority];
    return priorities.filter(x => !used.includes(x as AttributePriority)) as AttributePriority[];
  }
  private get selectableMentalPriorities(): AttributePriority[] {
    const used = [this.physicalPriority, this.socialPriority];
    return priorities.filter(x => !used.includes(x as AttributePriority)) as AttributePriority[];
  }

  private getAttrValue(attr: M20Attribute): number {
    return (this.editingCharacter?.attributes?.[attr] ?? 0) as number;
  }

  private sumFor(attrs: readonly M20Attribute[], enabled: boolean): number {
    if (!enabled) return 0;
    let amount = 0;
    for (const attr of attrs) {
      amount += this.getAttrValue(attr);
    }
    return amount;
  }

  private maxFor(priority: AttributePriority): number {
    return priorityMax[priority] || 0;
  }

  private get usedPhysicalAmount(): number {
    return this.sumFor(this.physicalAttributes, this.physicalPriority !== AttributePriority.None);
  }
  private get usedSocialAmount(): number {
    return this.sumFor(this.socialAttributes, this.socialPriority !== AttributePriority.None);
  }
  private get usedMentalAmount(): number {
    return this.sumFor(this.mentalAttributes, this.mentalPriority !== AttributePriority.None);
  }

  private isOptionDisabled(kind: 'physical' | 'social' | 'mental', attr: M20Attribute, candidate: number): boolean {
    if (candidate === 0) return false; // 0 immer aktiv
    const current = this.getAttrValue(attr);

    let used = 0;
    let max = 0;
    switch (kind) {
      case 'physical':
        used = this.usedPhysicalAmount;
        max = this.maxFor(this.physicalPriority);
        if (this.physicalPriority === AttributePriority.None) return true;
        break;
      case 'social':
        used = this.usedSocialAmount;
        max = this.maxFor(this.socialPriority);
        if (this.socialPriority === AttributePriority.None) return true;
        break;
      case 'mental':
        used = this.usedMentalAmount;
        max = this.maxFor(this.mentalPriority);
        if (this.mentalPriority === AttributePriority.None) return true;
        break;
    }

    if (candidate === current) return false;

    const newTotal = used - current + candidate;
    return newTotal > max;
  }

  private get physicalLocked(): boolean {
    return this.physicalPriority === AttributePriority.None;
  }
  private get socialLocked(): boolean {
    return this.socialPriority === AttributePriority.None;
  }
  private get mentalLocked(): boolean {
    return this.mentalPriority === AttributePriority.None;
  }

  private get canGoNext(): boolean {
    if (
      this.physicalPriority !== AttributePriority.None &&
      this.socialPriority !== AttributePriority.None &&
      this.mentalPriority !== AttributePriority.None
    ) {
      const physicalOk = this.usedPhysicalAmount === this.maxFor(this.physicalPriority);
      const socialOk = this.usedSocialAmount === this.maxFor(this.socialPriority);
      const mentalOk = this.usedMentalAmount === this.maxFor(this.mentalPriority);
      return physicalOk && socialOk && mentalOk;
    }
    return false;
  }
}
</script>

<template>
  <EditorForm :can-go-next="canGoNext" next-step="editor-m20-abilities">
    <div v-if="editingCharacter" class="attributes-view">
      <div class="card" style="width: 50rem">
        <small>{{$t('m20.editor.choose_attribute')}}</small>
      </div>

      <div class="panels">
        <!-- Physical -->
        <div class="card">
          <h6>{{$t('m20.attribute_category.physical')}}</h6>
          <select class="form-control" v-model="physicalPriority">
            <option :value="AttributePriority.None">Auswählen</option>
            <option v-for="p in selectablePhysicalPriorities" :key="p" :value="p">
              {{ p === AttributePriority.Primary ? 'Primär' : (p === AttributePriority.Secondary ? 'Sekundär' : 'Tertiär') }}
            </option>
          </select>

          <div class="info">
            <span>{{ usedPhysicalAmount }} / {{ (physicalPriority && (physicalPriority !== AttributePriority.None)) ? ('' + (physicalPriority && (physicalPriority !== AttributePriority.None) ? (physicalPriority === AttributePriority.Primary ? 7 : (physicalPriority === AttributePriority.Secondary ? 5 : 3)) : 0)) : 0 }}</span>
          </div>

          <div class="attribute-col">
            <div v-for="attr in physicalAttributes" :key="attr" class="attribute">
              <label>{{ $t('m20.attribute.' + attr) }}:</label>
              <select
                class="form-control"
                v-model.number="editingCharacter.attributes[attr]"
                :disabled="physicalLocked"
              >
                <option
                  v-for="n in baseNumbers"
                  :key="n"
                  :value="n"
                  :disabled="isOptionDisabled('physical', attr, n)"
                >{{ n }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Social -->
        <div class="card">
          <h6>{{$t('m20.attribute_category.social')}}</h6>
          <select class="form-control" v-model="socialPriority">
            <option :value="AttributePriority.None">Auswählen</option>
            <option v-for="p in selectableSocialPriorities" :key="p" :value="p">
              {{ p === AttributePriority.Primary ? 'Primär' : (p === AttributePriority.Secondary ? 'Sekundär' : 'Tertiär') }}
            </option>
          </select>

          <div class="info">
            <span>{{ usedSocialAmount }} / {{ (socialPriority && (socialPriority !== AttributePriority.None)) ? ('' + (socialPriority === AttributePriority.Primary ? 7 : (socialPriority === AttributePriority.Secondary ? 5 : 3))) : 0 }}</span>
          </div>

          <div class="attribute-col">
            <div v-for="attr in socialAttributes" :key="attr" class="attribute">
              <label>{{ $t('m20.attribute.' + attr) }}:</label>
              <select
                class="form-control"
                v-model.number="editingCharacter.attributes[attr]"
                :disabled="socialLocked"
              >
                <option
                  v-for="n in baseNumbers"
                  :key="n"
                  :value="n"
                  :disabled="isOptionDisabled('social', attr, n)"
                >{{ n }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Mental -->
        <div class="card">
          <h6>{{$t('m20.attribute_category.mental')}}</h6>
          <select class="form-control" v-model="mentalPriority">
            <option :value="AttributePriority.None">Auswählen</option>
            <option v-for="p in selectableMentalPriorities" :key="p" :value="p">
              {{ p === AttributePriority.Primary ? 'Primär' : (p === AttributePriority.Secondary ? 'Sekundär' : 'Tertiär') }}
            </option>
          </select>

          <div class="info">
            <span>{{ usedMentalAmount }} / {{ (mentalPriority && (mentalPriority !== AttributePriority.None)) ? ('' + (mentalPriority === AttributePriority.Primary ? 7 : (mentalPriority === AttributePriority.Secondary ? 5 : 3))) : 0 }}</span>
          </div>

          <div class="attribute-col">
            <div v-for="attr in mentalAttributes" :key="attr" class="attribute">
              <label>{{ $t('m20.attribute.' + attr) }}:</label>
              <select
                class="form-control"
                v-model.number="editingCharacter.attributes[attr]"
                :disabled="mentalLocked"
              >
                <option
                  v-for="n in baseNumbers"
                  :key="n"
                  :value="n"
                  :disabled="isOptionDisabled('mental', attr, n)"
                >{{ n }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

    </div>
  </EditorForm>
</template>

<style scoped lang="scss">
.attributes-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

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

    .attribute-col {
      margin-top: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      .attribute {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.5rem;

        label {
          margin: 0;
        }

        select {
          width: 6rem;
        }
      }
    }
  }
}
</style>
