<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';
import EditorForm from "@/components/editor/EditorForm.vue";
import {State} from "vuex-class";
import {IWerewolfW5Sheet, W5RenownKey} from "@/types/w5";
import TipButton from "@/components/editor/TipButton.vue";

@Component({
  components: {TipButton, EditorForm}
})
export default class ChooseRenownView extends Vue {

  W5RenownKey = W5RenownKey;

  @State("editingCharacter")
  private editingCharacter!: IWerewolfW5Sheet|undefined;

  private otherRenown: W5RenownKey = W5RenownKey.none;

  private applyRenown() {
    if (this.editingCharacter && this.otherRenown) {
      for (const r of this.editingCharacter.renown) {
        if (r.key === this.editingCharacter.tribe.renown) {
          r.value = 2;
        } else if (r.key === this.otherRenown) {
          r.value = 1;
        } else {
          r.value = 0;
        }
      }
    }
  }

  private get availableRenownKeys(): W5RenownKey[] {
    if (!this.editingCharacter || !this.editingCharacter.tribe) {
      return [];
    }

    const all = [
      W5RenownKey.Glory,
      W5RenownKey.Honor,
      W5RenownKey.Wisdom,
    ];
    return all.filter(k => this.editingCharacter!.tribe.renown !== k);
  }

  private get canGoNext() {
    return this.otherRenown !== W5RenownKey.none;
  }
}
</script>

<template>
  <EditorForm :can-go-next="canGoNext" next-step="editor-traits" @before-next="applyRenown()">
    <div class="d-flex justify-content-center" style="width: 100%; height: 100%; padding: 5rem" v-if="editingCharacter">
      <div class="form-group" style="text-align: center; display: flex; align-items: center; flex-direction: column">
        <label>{{$t('editor.renown.through-tribe', {type: $t('character.renown.' + editingCharacter.tribe.renown)})}}</label>
        <label class="required">{{$t('editor.renown.custom')}}:</label>
        <select class="form-control" style="width: 30rem" v-model="otherRenown">
          <option :value="W5RenownKey.none" disabled>{{$t('editor.renown.select')}}</option>
          <option v-for="r in availableRenownKeys" :key="r" :value="r">{{$t('character.renown.' + r)}}</option>
        </select>
      </div>
    </div>
  </EditorForm>
</template>

<style scoped lang="scss">

</style>