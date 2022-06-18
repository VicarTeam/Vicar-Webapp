<template>
  <EditorForm :can-go-next="canGoNext" next-step="editor-attributes">
    <div class="d-flex justify-content-center" style="width: 100%; height: 100%; padding: 5rem" v-if="editingCharacter">
      <div class="choose-traits-wrapper">
        <div class="form-group" style="text-align: center">
          <label class="required">{{ $t('editor.traits.info') }}:</label>
        </div>

        <div class="d-flex justify-content-center align-items-center" style="gap: 3rem">
          <div class="card m-0 mt-20 w-500 trait-pack">
            <span class="d-flex justify-content-center align-items-center mb-10"
                  style="width: 100%; border-bottom: 1px solid rgba(255, 255, 255, 0.4)">
              <small>{{ $t('editor.traits.merits') }}: </small><b
                class="ml-5">{{ getUsedTraitPoints() }}</b>/{{ maxTraitPoints }}{{maxTraitBonus > 0 ? ' (+' + maxTraitBonus + ')' : ''}}<TipButton class="ml-10" :content="$t('editor.traits.bonus')" v-if="maxTraitBonus > 0"/>
            </span>

            <div v-for="p in editingCharacter.merits.packs" style="width: 100%">
              <div class="trait" :class="{'locked': t.isLocked || !t.isManual}" v-for="t in [...p.traits].sort((a, b) => a.name.localeCompare(b.name))">
                <span>
                  <i>{{$t('data.trait.merit')}}</i> - <b>{{p.pack.name}}</b>: {{t.name}}{{getTraitSuffix(t)}} - <small><b>{{$t('editor.traits.modal.trait.level')}}</b>: {{getTraitLevel(t)}}</small>
                </span>
                <div class="actions">
                  <TipButton :content="t.description"/>
                  <XButton v-if="!t.isLocked && t.isManual && !isTraitNeededForOtherTrait(p, t)" class="ml-5" @click="removeTrait(p, t, false)"/>
                </div>
              </div>
            </div>

            <div v-for="p in editingCharacter.backgrounds.packs" style="width: 100%">
              <div class="trait" :class="{'locked': t.isLocked || !t.isManual}" v-for="t in [...p.traits].sort((a, b) => a.name.localeCompare(b.name))">
                <span>
                  <i>{{$t('data.trait.background')}}</i> - <b>{{p.pack.name}}</b>: {{t.name}}{{getTraitSuffix(t)}} - <small><b>{{$t('editor.traits.modal.trait.level')}}</b>: {{getTraitLevel(t)}}</small>
                </span>
                <div class="actions">
                  <TipButton :content="t.description"/>
                  <XButton v-if="!t.isLocked && t.isManual && !isTraitNeededForOtherTrait(p, t)" class="ml-5" @click="removeTrait(p, t, false)"/>
                </div>
              </div>
            </div>

            <div class="trait-add" v-if="hasTraitPointsLeft()" @click="startAddingTrait(false)">
              <i class="fa-solid fa-plus"></i>
            </div>
          </div>

          <div class="card m-0 mt-20 w-500 trait-pack">
            <span class="d-flex justify-content-center align-items-center mb-10"
                  style="width: 100%; border-bottom: 1px solid rgba(255, 255, 255, 0.4)">
              <small>{{ $t('editor.traits.flaws') }}: </small><b class="ml-5">{{ getUsedFlawPoints() }}</b>/{{ maxFlawPoints }}{{maxFlawBonus > 0 ? ' (+' + maxFlawBonus + ')' : ''}}<TipButton class="ml-10" :content="$t('editor.traits.bonus')" v-if="maxFlawBonus > 0"/>
            </span>

            <div v-for="p in editingCharacter.merits.packs" style="width: 100%">
              <div class="trait" :class="{'locked': t.isLocked || !t.isManual}" v-for="t in [...p.flawTraits].sort((a, b) => a.name.localeCompare(b.name))">
              <span>
                <i>{{$t('data.trait.merit')}}</i> - <b>{{p.pack.name}}</b>: {{t.name}}{{getTraitSuffix(t)}} - <small><b>{{$t('editor.traits.modal.trait.level')}}</b>: {{getTraitLevel(t)}}</small>
              </span>
                <div class="actions">
                  <TipButton :content="t.description"/>
                  <XButton v-if="!t.isLocked && t.isManual && !isTraitNeededForOtherTrait(p, t)" class="ml-5" @click="removeTrait(p, t, true)"/>
                </div>
              </div>
            </div>

            <div v-for="p in editingCharacter.backgrounds.packs" style="width: 100%">
              <div class="trait" :class="{'locked': t.isLocked || !t.isManual}" v-for="t in [...p.flawTraits].sort((a, b) => a.name.localeCompare(b.name))">
              <span>
                <i>{{$t('data.trait.background')}}</i> - <b>{{p.pack.name}}</b>: {{t.name}}{{getTraitSuffix(t)}} - <small><b>{{$t('editor.traits.modal.trait.level')}}</b>: {{getTraitLevel(t)}}</small>
              </span>
                <div class="actions">
                  <TipButton :content="t.description"/>
                  <XButton v-if="!t.isLocked && t.isManual && !isTraitNeededForOtherTrait(p, t)" class="ml-5" @click="removeTrait(p, t, true)"/>
                </div>
              </div>
            </div>

            <div class="trait-add" @click="startAddingTrait(true)">
              <i class="fa-solid fa-plus"></i>
            </div>
          </div>
        </div>
      </div>

      <ChooseTraitModal ref="chooseTraitModal"/>
    </div>
  </EditorForm>
</template>

<script lang="ts">
import {Component, Ref, Vue} from "vue-property-decorator";
import EditorForm from "@/components/editor/EditorForm.vue";
import {State} from "vuex-class";
import {ICharacter, ILockableTrait, IUsingTraitPack, IUsingTraitPacks} from "@/types/models";
import ChooseTraitModal from "@/components/editor/modals/ChooseTraitModal.vue";
import TipButton from "@/components/editor/TipButton.vue";
import XButton from "@/components/editor/XButton.vue";
import LevelButton from "@/components/viewer/LevelButton.vue";

@Component({
  components: {LevelButton, XButton, TipButton, ChooseTraitModal, EditorForm}
})
export default class ChooseTraitsView extends Vue {

  @State("editingCharacter")
  private editingCharacter!: ICharacter | undefined;

  @Ref("chooseTraitModal")
  private chooseTraitModal!: ChooseTraitModal;

  private maxTraitPoints: number = 7;
  private maxTraitBonus: number = 0;
  private maxFlawPoints: number = 2;
  private maxFlawBonus: number = 0;

  mounted() {
    if (this.editingCharacter) {
      this.maxTraitBonus = this.editingCharacter.requiredPointSpreads.filter(s => !s.isFlaw).map(s => s.points).reduce((a, b) => a + b, 0);
      this.maxFlawBonus = this.editingCharacter.requiredPointSpreads.filter(s => s.isFlaw).map(s => s.points).reduce((a, b) => a + b, 0);
    }
  }

  private removeTrait(pack: IUsingTraitPack, trait: ILockableTrait, isFlaw: boolean) {
    if (trait.isLocked || !trait.isManual) {
      return;
    }

    if (this.isTraitNeededForOtherTrait(pack, trait)) {
      return;
    }

    if (isFlaw) {
      pack.flawTraits.splice(pack.flawTraits.indexOf(trait), 1);
    } else {
      pack.traits.splice(pack.traits.indexOf(trait), 1);
    }
  }

  private isTraitNeededForOtherTrait(pack: IUsingTraitPack, trait: ILockableTrait): boolean {
    for (const existingTrait of pack.traits) {
      if (existingTrait.requirement) {
        if (existingTrait.requirement.type === "or") {
          if (existingTrait.requirement.values.includes(trait.id)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private startAddingTrait(isFlaw: boolean) {
    if (isFlaw) {
      this.chooseTraitModal.showModal(isFlaw, Infinity);
    } else {
      if (!this.hasTraitPointsLeft()) {
        return;
      }

      this.chooseTraitModal.showModal(isFlaw, this.maxTraitPoints + this.maxTraitBonus - this.getUsedTraitPoints());
    }
  }

  private getTraitSuffix(trait: ILockableTrait): string {
    if (trait.suffix) {
      return " (" + trait.suffix + ")";
    }
    return "";
  }

  private getTraitLevel(trait: ILockableTrait) {
    return parseInt((trait.customLevel ?? trait.level).toString());
  }

  private hasTraitPointsLeft(): boolean {
    return this.getUsedTraitPoints() < this.maxTraitPoints + this.maxTraitBonus;
  }

  private hasFlawPointsLeft(): boolean {
    return this.getUsedFlawPoints() < this.maxFlawPoints + this.maxFlawBonus;
  }

  private getUsedTraitPoints(): number {
    const t = (using: IUsingTraitPacks) => using.packs.map(pack => pack.traits.filter(trait => trait.isManual)
        .map(trait => this.getTraitLevel(trait)).reduce((a, b) => a + b, 0)).reduce((a, b) => a + b, 0);
    return t(this.editingCharacter!.backgrounds) + t(this.editingCharacter!.merits);
  }

  private getUsedFlawPoints(): number {
    const t = (using: IUsingTraitPacks) => using.packs.map(pack => pack.flawTraits.filter(flaw => flaw.isManual)
        .map(flaw => this.getTraitLevel(flaw)).reduce((a, b) => a + b, 0)).reduce((a, b) => a + b, 0);
    return t(this.editingCharacter!.backgrounds) + t(this.editingCharacter!.merits);
  }

  private get canGoNext(): boolean {
    return !!this.editingCharacter && !this.hasTraitPointsLeft() && !this.hasFlawPointsLeft();
  }
}
</script>

<style scoped lang="scss">
.choose-traits-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;

  .trait-pack {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: left;
    .trait {
      display: flex;
      padding: 0.5rem;
      gap: 1rem;
      justify-content: left !important;
      align-items: center;
      span {
        flex-grow: 1;
      }
      .actions {
        flex-shrink: 0;
      }
      &.locked {
        opacity: 0.7;
        cursor: not-allowed;
        user-select: none;
      }
    }

    .trait-add {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
      cursor: pointer;
      user-select: none;

      &:hover {
        color: var(--primary-color-light);
      }

      &:active {
        color: var(--primary-color);
      }
    }
  }
}
</style>
