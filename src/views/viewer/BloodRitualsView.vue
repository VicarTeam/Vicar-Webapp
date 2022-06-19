<template>
  <div class="bloodrituals-view">
    <div class="rituals card">
      <div class="title">
        <b>{{$t('viewer.tab.bloodrituals')}}</b>
        <LevelButton icon="fa-plus" class="ml-10" @click="addNewTrait"/>
      </div>
      <div class="list">
        <div class="entry" v-for="r in sortedRituals">
          <div class="name">
            <small>
              {{r.name}} - {{$t('editor.disciplines.level')}}: {{r.level}}
            </small>
          </div>
          <TipButton class="tip" :override="true" @click="bloodRitualInfoModal.showModal(r)"/>
        </div>
      </div>
    </div>

    <ChooseBloodRitualModal ref="levelBloodRitualModal"/>
    <BloodRitualInfoModal ref="bloodRitualInfoModal"/>
  </div>
</template>

<script lang="ts">
import {Component, Ref, Vue} from "vue-property-decorator";
import LevelButton from "@/components/viewer/LevelButton.vue";
import ChooseBloodRitualModal from "@/components/editor/modals/ChooseBloodRitualModal.vue";
import {State} from "vuex-class";
import {ICharacter, IDisciplineSelection} from "@/types/models";
import {IBloodRitual} from "@/types/data";
import TipButton from "@/components/editor/TipButton.vue";
import BloodRitualInfoModal from "@/components/viewer/modals/BloodRitualInfoModal.vue";

@Component({
  components: {BloodRitualInfoModal, TipButton, ChooseBloodRitualModal, LevelButton}
})
export default class BloodRitualsView extends Vue {

  @State("editingCharacter")
  private editingCharacter!: ICharacter;

  @Ref("levelBloodRitualModal")
  private levelBloodRitualModal!: ChooseBloodRitualModal;

  @Ref("bloodRitualInfoModal")
  private bloodRitualInfoModal!: BloodRitualInfoModal;

  private addNewTrait() {
    const selection: IDisciplineSelection = this.editingCharacter.disciplines.find(d => d.discipline.id === 3)!;
    if (!selection) {
      return;
    }
    this.levelBloodRitualModal.showModal(() => {}, selection, Infinity, true);
  }

  private get sortedRituals(): IBloodRitual[] {
    return [...(this.editingCharacter.bloodRituals||[])].sort((a, b) => {
      if (a.level !== b.level) {
        return a.level - b.level;
      }
      return a.name.localeCompare(b.name);
    });
  }
}
</script>

<style scoped lang="scss">
.bloodrituals-view {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  .rituals {
    margin: auto;
    display: flex;
    flex-direction: column;
    width: 40rem;
    gap: 0.5rem;
    .title {
      width: 100%;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    }
    .list {
      width: 100%;
      display: flex;
      flex-direction: column;
      .entry {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        gap: 0.5rem;
        .name {
          flex-grow: 1;
        }
        .tip {
          flex-shrink: 0;
        }
      }
    }
  }
}
</style>
