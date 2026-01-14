<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';
import EditorForm from "@/components/editor/EditorForm.vue";
import {State} from "vuex-class";
import {IM20Archetype, IMageSheet, M20Essence} from "@/types/m20";
import TipButton from "@/components/editor/TipButton.vue";
import {hardSetTheme} from "@/libs/theme";
import {GameLine} from "@/types/gameline";
import {archetypes} from "@/.data/m20";

@Component({
  components: {TipButton, EditorForm}
})
export default class ChooseIdentityView extends Vue {

  archetypes = archetypes;
  M20Essence = M20Essence;

  @State("editingCharacter")
  private editingCharacter!: IMageSheet;

  private concept: string = "";
  private essence: M20Essence = M20Essence.None;
  private nature: IM20Archetype = {id: 0, name: "", description: ""};
  private natureCustomName: string = "";
  private natureCustomDescription: string = "";
  private demeanor: IM20Archetype = {id: 0, name: "", description: ""};
  private demeanorCustomName: string = "";
  private demeanorCustomDescription: string = "";

  mounted() {
    hardSetTheme(GameLine.Mage);
  }

  private onBeforeNext() {
    this.editingCharacter.nature = this.nature.id !== 0 ? this.nature : {id: 0, name: this.natureCustomName.trim(), description: this.natureCustomDescription.trim()};
    this.editingCharacter.demeanor = this.demeanor.id !== 0 ? this.demeanor : {id: 0, name: this.demeanorCustomName.trim(), description: this.demeanorCustomDescription.trim()};
    this.editingCharacter.concept = this.concept.trim();
    this.editingCharacter.essence = this.essence;
  }

  private get canGoNext() {
    const isNatureOk = this.nature.id !== 0 || (this.natureCustomName.trim().length > 0 && this.natureCustomDescription.trim().length > 0);
    const isDemeanorOk = this.demeanor.id !== 0 || (this.demeanorCustomName.trim().length > 0 && this.demeanorCustomDescription.trim().length > 0);
    return this.concept.trim().length > 0 && this.essence !== M20Essence.None && isNatureOk && isDemeanorOk;
  }
}
</script>

<template>
  <EditorForm :can-go-next="canGoNext" next-step="editor-tradition" @before-next="onBeforeNext">
    <div v-if="editingCharacter" class="identity-wrapper">
      <div class="card" style="width: 30rem">
        <h6>{{$t('m20.concept')}} <TipButton :content="$t('m20.concept.description')"/></h6>
        <textarea v-model="concept" class="form-control" rows="6" style="width: 100%; resize: none"></textarea>
      </div>

      <div class="card" style="width: 50rem">
        <h6>{{$t('m20.archetype')}} <TipButton :content="$t('m20.archetype.description')"/></h6>
        <div style="display: flex; gap: 4rem; justify-content: space-between;">
          <div class="archetype-col">
            <label style="margin-bottom: 0">{{$t('m20.archetype.nature')}}:</label>
            <select v-model="nature" class="form-control" style="width: 100%">
              <option :value="{id: 0, name: '', description: ''}">Benutzerdefiniert</option>
              <option v-for="a in archetypes" :key="a.id" :value="a">{{a.name}}</option>
            </select>

            <input v-if="nature.id === 0" v-model="natureCustomName" class="form-control" placeholder="Name"/>
            <textarea v-if="nature.id === 0" v-model="natureCustomDescription" class="form-control" placeholder="Beschreibung" rows="4" style="width: 100%; resize: none"></textarea>
            <small v-if="nature.id !== 0">{{nature.description}}</small>
          </div>

          <div class="archetype-col">
            <label style="margin-bottom: 0">{{$t('m20.archetype.demeanor')}}:</label>
            <select v-model="demeanor" class="form-control">
              <option :value="{id: 0, name: '', description: ''}">Benutzerdefiniert</option>
              <option v-for="a in archetypes" :key="a.id" :value="a">{{a.name}}</option>
            </select>

            <input v-if="demeanor.id === 0" v-model="demeanorCustomName" class="form-control" placeholder="Name"/>
            <textarea v-if="demeanor.id === 0" v-model="demeanorCustomDescription" class="form-control" placeholder="Beschreibung" rows="4" style="width: 100%; resize: none"></textarea>
            <small v-if="demeanor.id !== 0">{{demeanor.description}}</small>
          </div>
        </div>
      </div>

      <div class="card" style="width: 30rem">
        <h6>{{$t('m20.essence')}} <TipButton :content="$t('m20.essence.description')"/></h6>
        <select v-model="essence" class="form-control">
          <option :value="M20Essence.None" disabled>Auswählen</option>
          <option :value="M20Essence.Dynamic">{{$t('m20.essence.dynamic')}}</option>
          <option :value="M20Essence.Static">{{$t('m20.essence.static')}}</option>
          <option :value="M20Essence.Primordial">{{$t('m20.essence.primordial')}}</option>
          <option :value="M20Essence.Questing">{{$t('m20.essence.questing')}}</option>
        </select>
        <small v-if="essence !== M20Essence.None">{{$t(`m20.essence.${essence}.description`)}}</small>
      </div>
    </div>
  </EditorForm>
</template>

<style scoped lang="scss">
.identity-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  .card {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    h6 {
      margin: 0 0 0.5rem;
      font-weight: bold;
      text-align: center;
    }
    .archetype-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      justify-content: flex-start;
      align-items: center;
    }
  }
}
</style>