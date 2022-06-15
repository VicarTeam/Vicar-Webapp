<template>
  <EditorForm :can-go-next="canGoNext" next-step="editor-attributes">
    <div class="d-flex justify-content-center" style="width: 100%; height: 100%; padding: 5rem" v-if="editingCharacter">
      <div class="choose-traits-wrapper">
        <div class="form-group" style="text-align: center">
          <label class="required">{{$t('editor.traits.info')}}:</label>
        </div>

        <div class="d-flex justify-content-center align-items-center" style="gap: 3rem">
          <div class="card m-0 mt-20 w-350 trait-pack">
            <span class="d-flex justify-content-center align-items-center mb-10" style="width: 100%; border-bottom: 1px solid rgba(255, 255, 255, 0.4)">
              <small>{{$t('editor.traits.merits')}}: </small><b class="ml-5">{{getUsedTraitPoints()}}</b>/{{maxTraitPoints}}
            </span>

            <div class="trait-add" v-if="hasTraitPointsLeft()">
              <i class="fa-solid fa-plus"></i>
            </div>
          </div>

          <div class="card m-0 mt-20 w-350 trait-pack">
            <span class="d-flex justify-content-center align-items-center mb-10" style="width: 100%; border-bottom: 1px solid rgba(255, 255, 255, 0.4)">
              <small>{{$t('editor.traits.flaws')}}: </small><b class="ml-5">{{getUsedFlawPoints()}}</b>/{{maxFlawPoints}}
            </span>

            <div class="trait-add" v-if="hasFlawPointsLeft()">
              <i class="fa-solid fa-plus"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </EditorForm>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import EditorForm from "@/components/editor/EditorForm.vue";
import {State} from "vuex-class";
import {ICharacter, IUsingTraitPacks} from "@/types/models";

@Component({
  components: {EditorForm}
})
export default class ChooseTraitsView extends Vue {

  @State("editingCharacter")
  private editingCharacter!: ICharacter|undefined;

  private maxTraitPoints: number = 0;
  private maxFlawPoints: number = 0;

  mounted() {
    if (this.editingCharacter) {
      const traitPoints = (using: IUsingTraitPacks) => using.freePoints + using.packs.map(value => value.bonusPoints).reduce((a, b) => a + b, 0);
      const flawPoints = (using: IUsingTraitPacks) => using.packs.map(value => value.flawBonusPoints).reduce((a, b) => a + b, 0);
      this.maxTraitPoints = traitPoints(this.editingCharacter.backgrounds) + traitPoints(this.editingCharacter.merits) + 7;
      this.maxFlawPoints = flawPoints(this.editingCharacter.backgrounds) + flawPoints(this.editingCharacter.merits) + 2;
    }
  }

  private hasTraitPointsLeft(): boolean {
    return this.getUsedTraitPoints() < this.maxTraitPoints;
  }

  private hasFlawPointsLeft(): boolean {
    return this.getUsedFlawPoints() < this.maxFlawPoints;
  }

  private getUsedTraitPoints(): number {
    const t = (using: IUsingTraitPacks) => using.packs.map(pack => pack.traits.filter(trait => trait.isManual)
        .map(trait => trait.level).reduce((a, b) => a + b, 0)).reduce((a, b) => a + b, 0);
    return t(this.editingCharacter!.backgrounds) + t(this.editingCharacter!.merits);
  }

  private getUsedFlawPoints(): number {
    const t = (using: IUsingTraitPacks) => using.packs.map(pack => pack.flawTraits.filter(flaw => flaw.isManual)
        .map(flaw => flaw.level).reduce((a, b) => a + b, 0)).reduce((a, b) => a + b, 0);
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
    justify-content: center;

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
