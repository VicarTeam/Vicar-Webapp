<template>
  <EditorForm :can-go-next="canGoNext" next-step="editor-skills">
    <div class="d-flex justify-content-center" style="width: 100%; height: 100%; padding: 5rem" v-if="editingCharacter">
      <div class="choose-attributes-wrapper">
        <div class="form-group" style="text-align: center">
          <label class="required"><b>{{$t('editor.step3.attributes.spend')}}:</b></label>
          <ul style="text-align: left">
            <li v-for="i in [4, 3, 2, 1]" :key="i">{{$t(`editor.step3.attributes.point${i}`, {amount: getAvailableAmount(i)})}}</li>
          </ul>
        </div>

        <div class="categories">
          <div class="card" v-for="cat in editingCharacter.categories" :key="cat.name">
            <div style="width: 100%; text-align: center"><b>{{$t('data.category.' + cat.name)}}</b></div>
            <div class="attribute mt-10" v-for="attr in cat.attributes" :key="attr.key">
              <small>{{$t('data.attribute.' + attr.key)}}:</small>
              <select class="form-control" v-model="attr.value" style="width: 7rem">
                <option :value="0">0</option>
                <option v-for="i in [1, 2, 3, 4]" :key="i" :value="i" :disabled="!isPointAvailable(i)">{{i}}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  </EditorForm>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import {State} from "vuex-class";
import {ICharacter} from "@/types/models";
import EditorForm from "@/components/editor/EditorForm.vue";

type PointUsage = {
  point: number;
  amount: number;
}

@Component({
  components: {EditorForm}
})
export default class ChooseAttributesView extends Vue {

  @State("editingCharacter")
  private editingCharacter!: ICharacter|undefined;

  private isPointAvailable(val: number) {
    const amount = this.getAvailableAmount(val);
    return amount > 0;
  }

  private getAvailableAmount(val: number) {
    const pool = this.getSubtractedPool();
    const usage = pool.find(p => p.point === val);
    return usage ? usage.amount : -1;
  }

  private getSubtractedPool(): PointUsage[] {
    const pool = this.getPointsPool();
    const used = this.getUsedPoints();
    used.forEach(p => {
      const pp = pool.find(p2 => p2.point === p.point);
      if (pp) {
        pp.amount -= p.amount;
      }
    });
    return pool;
  }

  private getUsedPoints(): PointUsage[] {
    const used: PointUsage[] = [];
    const usage = (val: number) => {
      const index = used.findIndex(p => p.point === val);
      if (index === -1) {
        used.push({point: val, amount: 1});
      } else {
        used[index].amount++;
      }
    };
    this.editingCharacter!.categories.forEach(cat => {
      cat.attributes.forEach(attr => {
        usage(attr.value);
      });
    });
    return used;
  }

  private getPointsPool(): PointUsage[] {
    return [
      {
        point: 1,
        amount: 1
      },
      {
        point: 2,
        amount: 4
      },
      {
        point: 3,
        amount: 3
      },
      {
        point: 4,
        amount: 1
      }
    ]
  }

  private get canGoNext() {
    const pool = this.getSubtractedPool();
    return pool.every(p => p.amount === 0);
  }
}
</script>

<style scoped lang="scss">
.choose-attributes-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  ul > li {
    margin: 0;
  }
  .categories {
    gap: 2rem;
    display: flex;
    flex-direction: row;
    width: 60%;
    justify-content: center;
    align-items: center;
    .card {
      width: 50rem;
      display: flex;
      flex-direction: column;
      .attribute {
        display: flex;
        flex-direction: row;
        align-items: center;
        small {
          flex-grow: 1;
        }
        .control {
          flex-shrink: 0;
        }
      }
    }
  }
}
</style>
