<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';
import EditorForm from "@/components/editor/EditorForm.vue";
import {State} from "vuex-class";
import {IHunterSheet} from "@/types/h5";
import {creeds, drives} from "@/.data/h5";
import TipButton from "@/components/editor/TipButton.vue";
import {hardSetTheme} from "@/libs/theme";
import {GameLine} from "@/types/gameline";

@Component({
  components: {TipButton, EditorForm}
})
export default class ChooseCreedView extends Vue {

  creeds = creeds;
  drives = drives;

  @State("editingCharacter")
  private editingCharacter!: IHunterSheet;

  mounted() {
    hardSetTheme(GameLine.Hunter);
  }

  private get canGoNext(): boolean {
    return !!this.editingCharacter.creed && !!this.editingCharacter.drive;
  }
}
</script>

<template>
  <EditorForm :can-go-next="canGoNext" next-step="editor-traits">
    <div v-if="editingCharacter" class="creeds-view">
      <div class="card">
        <h6>{{$t('h5.creed')}} <TipButton :content="$t('h5.creed.description')"/></h6>

        <select class="form-control" v-model="editingCharacter.creed">
          <option :value="undefined" disabled>Wähle ein Credo</option>
          <option v-for="creed in creeds" :key="creed.id" :value="creed">{{creed.name}}</option>
        </select>

        <small v-if="editingCharacter.creed">{{editingCharacter.creed.description}}</small>
        <small v-if="editingCharacter.creed">
          <b style="margin-right: 1rem">Persönlichkeit</b> {{editingCharacter.creed.personality}}
        </small>
        <small v-if="editingCharacter.creed">
          <b style="margin-right: 1rem">Taktiken</b> {{editingCharacter.creed.tactics}}
        </small>
        <small v-if="editingCharacter.creed">
          <b style="margin-right: 1rem">Gefahren</b> {{editingCharacter.creed.dangers}}
        </small>
      </div>
      <div class="card">
        <h6>{{$t('h5.drive')}} <TipButton :content="$t('h5.drive.description')"/></h6>

        <select class="form-control" v-model="editingCharacter.drive">
          <option :value="undefined" disabled>Wähle einen Antrieb</option>
          <option v-for="drive in drives" :key="drive.id" :value="drive">{{drive.name}}</option>
        </select>

        <small v-if="editingCharacter.drive">{{editingCharacter.drive.description}}</small>
        <small v-if="editingCharacter.drive">
          <b style="margin-right: 1rem">Erlösung</b> {{editingCharacter.drive.redemption}}
        </small>
      </div>
    </div>
  </EditorForm>
</template>

<style scoped lang="scss">
.creeds-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 5rem;
  .card {
    width: 60rem;
    h6 { margin: 0; font-weight: bold; }
    display: flex;
    flex-direction: column;
    gap: 2rem;
    small {
      display: block;
      max-height: 10rem;
      overflow-y: auto;
      padding-right: 0.5rem;
    }
  }
}
</style>