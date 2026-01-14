<script lang="ts">
import {Component, Prop, Vue, Watch} from 'vue-property-decorator';
import EditorForm from "@/components/editor/EditorForm.vue";
import {State} from "vuex-class";
import {IM20Tradition, IMageSheet, M20TraditionType} from "@/types/m20";
import {traditions} from "@/.data/m20";
import TipButton from "@/components/editor/TipButton.vue";
import TraditionSymbol from "@/components/symbols/TraditionSymbol.vue";
import SphereSymbol from "@/components/symbols/SphereSymbol.vue";

@Component({
  components: {SphereSymbol, TraditionSymbol, TipButton, EditorForm}
})
export default class ChooseTraditionView extends Vue {

  traditions = traditions;
  M20TraditionType = M20TraditionType;

  @State("editingCharacter")
  private editingCharacter!: IMageSheet;

  @Prop({default: false})
  private forced!: boolean;

  private type: M20TraditionType = M20TraditionType.Tradition;
  private tradition: IM20Tradition = this.selectableTraditions[0];

  private onBeforeNext() {
    this.editingCharacter.tradition = this.tradition;
  }

  private getOtherTypes(type: M20TraditionType) {
    if (type === M20TraditionType.Tradition) {
      return [M20TraditionType.Technocracy, M20TraditionType.Disparate];
    } else if (type === M20TraditionType.Technocracy) {
      return [M20TraditionType.Disparate, M20TraditionType.Tradition];
    } else {
      return [M20TraditionType.Tradition, M20TraditionType.Technocracy];
    }
  }

  private get selectableTraditions() {
    return this.traditions.filter(x => x.type === this.type);
  }

  private get canGoNext() {
    return true;
  }

  @Watch("type")
  private onTypeChanged() {
    this.tradition = this.selectableTraditions[0];
  }
}
</script>

<template>
  <EditorForm :can-go-next="canGoNext" :show-only="forced" next-step="editor-m20-attributes" @before-next="onBeforeNext">
    <div v-if="editingCharacter" class="tradition-view">
      <div class="card" style="width: 50rem">
        <h6 style="text-align: center">{{$t('m20.tradition')}} <TipButton :content="$t('m20.tradition.description')"/></h6>
        <select v-model="type" class="form-control" :disabled="forced">
          <option :value="M20TraditionType.Tradition">{{$t('m20.tradition.type.tradition')}}</option>
          <option :value="M20TraditionType.Technocracy">{{$t('m20.tradition.type.technocracy')}}</option>
          <option :value="M20TraditionType.Disparate">{{$t('m20.tradition.type.disparate')}}</option>
        </select>
        <small>{{$t('m20.tradition.type.' + type + '.description')}}</small>
      </div>

      <div class="card" style="width: 70%; margin-top: 0.5rem">
        <h6 style="text-align: center">{{$t('m20.tradition.type.' + type + '.name')}}</h6>
        <select v-model="tradition" class="form-control" :disabled="forced">
          <option v-for="item in selectableTraditions" :key="item.id" :value="item">
            {{item.name}}
          </option>
        </select>

        <div style="display: flex; gap: 2rem; margin-top: 1rem">
          <TraditionSymbol :tradition="tradition"/>

          <div style="display: flex; flex-direction: column; gap: 1rem">
            <small>{{tradition.description}}</small>
            <small>
              <b style="margin-right: 1rem">{{$t('m20.tradition.organization')}}</b> {{tradition.organization}}
            </small>
            <small>
              <b style="margin-right: 1rem">{{$t('m20.tradition.initiation')}}</b> {{tradition.initiation}}
            </small>
            <small>
              <b style="margin-right: 1rem">{{$t('m20.tradition.focus')}}</b> {{tradition.focus}}
            </small>

            <div style="padding-left: 1rem; padding-top: 0.5rem; padding-bottom: 0.5rem; border-left: 4px solid var(--primary-color); display: flex; flex-direction: column; gap: 0.5rem">
              <small>
                <b style="margin-right: 1rem">{{$t('m20.tradition.stereotype.fellow')}}</b> {{tradition.stereotypes.fellowTraditions}}
              </small>
              <small>
                <b style="margin-right: 1rem">{{$t('m20.tradition.stereotype.other', {type: $t('m20.tradition.type.' + getOtherTypes(type)[0])})}}</b> {{tradition.stereotypes.disparates}}
              </small>
              <small>
                <b style="margin-right: 1rem">{{$t('m20.tradition.stereotype.other', {type: $t('m20.tradition.type.' + getOtherTypes(type)[1])})}}</b> {{tradition.stereotypes.technocracy}}
              </small>
            </div>

            <div v-if="tradition.affinitySpheres.length > 0" style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1rem">
              <h6 style="font-size: 1.1rem; text-align: center"><b>{{$t('m20.tradition.affinity_spheres')}}</b> <TipButton :content="$t('m20.sphere.description')"/></h6>
              <div style="display: flex; flex-direction: row; gap: 1rem; justify-content: center; align-content: center">
                <div v-for="sphere in tradition.affinitySpheres" style="display: flex; flex-direction: column; align-items: center; gap: 0.25rem" :key="sphere">
                  <SphereSymbol :sphere="sphere"/>
                  <small>{{$t('m20.sphere.' + sphere)}} <TipButton :content="$t('m20.sphere.' + sphere + '.description')"/></small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </EditorForm>
</template>

<style scoped lang="scss">
.tradition-view {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  .card {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    h6 {
      margin: 0 0 0.5rem;
      font-weight: bold;
    }
    select option {
      text-align: center;
    }
  }
}
</style>