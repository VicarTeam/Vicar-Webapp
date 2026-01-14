<template>
  <div class="bloodrituals-view">
    <div v-if="editingCharacter.bloodRituals.length > 0 || editingCharacter.fullCustomization" class="rituals card">
      <div class="title">
        <b>{{$t('viewer.tab.bloodrituals')}}</b>
        <LevelButton icon="fa-plus" class="ml-10" @click="addNewBloodRitual"/>
      </div>
      <div class="list">
        <div class="entry" v-for="r in sortedBloodRituals">
          <div class="name">
            <i class="iconbtnprim fa-solid fa-xmark" v-if="editingCharacter.fullCustomization" @click="deleteBloodRitual(r)"></i>
            <small>
              {{r.name}} - {{$t('editor.disciplines.level')}}: {{r.level}}
            </small>
          </div>
          <TipButton class="tip" :override="true" @click="bloodRitualInfoModal.showModal(r)"/>
        </div>
      </div>
    </div>

    <div v-if="(editingCharacter.oblivionCeremonies && editingCharacter.oblivionCeremonies.length > 0) || editingCharacter.clan.id === 4 || editingCharacter.clan.id === 5 || editingCharacter.fullCustomization" class="rituals card">
      <div class="title">
        <b>{{$t('viewer.tab.oblivionceremonies')}}</b>
        <LevelButton icon="fa-plus" class="ml-10" @click="addNewOblivionCeremony"/>
      </div>
      <div class="list">
        <div class="entry" v-for="r in sortedOblivionCeremonies">
          <div class="name">
            <i class="iconbtnprim fa-solid fa-xmark" v-if="editingCharacter.fullCustomization" @click="deleteOblivionCeremony(r)"></i>
            <small>
              {{r.name}} - {{$t('editor.disciplines.level')}}: {{r.level}}
            </small>
          </div>
          <TipButton class="tip" :override="true" @click="oblivionCeremonyInfoModal.showModal(r)"/>
        </div>
      </div>
    </div>

    <ChooseBloodRitualModal ref="levelBloodRitualModal"/>
    <ChooseOblivionCeremonyModal ref="levelOblivionCeremonyModal"/>
    <BloodRitualInfoModal ref="bloodRitualInfoModal"/>
    <OblivionCeremonyInfoModal ref="oblivionCeremonyInfoModal"/>
    <ConfirmDeleteModal ref="confirmDeleteModal"/>
  </div>
</template>

<script lang="ts">
import {Component, Ref, Vue} from "vue-property-decorator";
import LevelButton from "@/components/viewer/LevelButton.vue";
import ChooseBloodRitualModal from "@/components/editor/modals/ChooseBloodRitualModal.vue";
import {State} from "vuex-class";
import {ICharacter, IDisciplineSelection} from "@/types/models";
import {IBloodRitual, IOblivionCeremony} from "@/types/data";
import TipButton from "@/components/editor/TipButton.vue";
import BloodRitualInfoModal from "@/components/viewer/modals/BloodRitualInfoModal.vue";
import ConfirmDeleteModal from "@/components/viewer/modals/ConfirmDeleteModal.vue";
import CharacterStorage from "@/libs/io/character-storage";
import ChooseOblivionCeremonyModal from "@/components/editor/modals/ChooseOblivionCeremonyModal.vue";
import OblivionCeremonyInfoModal from "@/components/viewer/modals/OblivionCeremonyInfoModal.vue";

@Component({
  components: {
    OblivionCeremonyInfoModal,
    ChooseOblivionCeremonyModal,
    ConfirmDeleteModal, BloodRitualInfoModal, TipButton, ChooseBloodRitualModal, LevelButton}
})
export default class BloodRitualsView extends Vue {

  @State("editingCharacter")
  private editingCharacter!: ICharacter;

  @Ref("levelBloodRitualModal")
  private levelBloodRitualModal!: ChooseBloodRitualModal;

  @Ref("levelOblivionCeremonyModal")
  private levelOblivionCeremonyModal!: ChooseOblivionCeremonyModal;

  @Ref("bloodRitualInfoModal")
  private bloodRitualInfoModal!: BloodRitualInfoModal;

  @Ref("oblivionCeremonyInfoModal")
  private oblivionCeremonyInfoModal!: OblivionCeremonyInfoModal;

  @Ref("confirmDeleteModal")
  private confirmDeleteModal!: ConfirmDeleteModal;

  private addNewBloodRitual() {
    const selection: IDisciplineSelection = this.editingCharacter.disciplines.find(d => d.discipline.id === 3)!;
    if (!selection) {
      return;
    }
    this.levelBloodRitualModal.showModal(() => {}, selection, Infinity, true);
  }

  private addNewOblivionCeremony() {
    const selection: IDisciplineSelection = this.editingCharacter.disciplines.find(d => d.discipline.id === 11)!;
    if (!selection) {
      return;
    }
    this.levelOblivionCeremonyModal.showModal(() => {}, selection, Infinity);
  }

  private deleteBloodRitual(ritual: IBloodRitual) {
    this.confirmDeleteModal.showModal(ritual.name, () => {
      this.editingCharacter.bloodRituals = this.editingCharacter.bloodRituals.filter(x => x.id !== ritual.id);
      CharacterStorage.saveCharacter(this.editingCharacter);
    });
  }

  private deleteOblivionCeremony(ritual: IOblivionCeremony) {
    this.confirmDeleteModal.showModal(ritual.name, () => {
      this.editingCharacter.oblivionCeremonies = this.editingCharacter.oblivionCeremonies.filter(x => x.id !== ritual.id);
      CharacterStorage.saveCharacter(this.editingCharacter);
    });
  }

  private get sortedBloodRituals(): IBloodRitual[] {
    return [...(this.editingCharacter.bloodRituals||[])].sort((a, b) => {
      if (a.level !== b.level) {
        return a.level - b.level;
      }
      return a.name.localeCompare(b.name);
    });
  }

  private get sortedOblivionCeremonies(): IOblivionCeremony[] {
    return [...(this.editingCharacter.oblivionCeremonies||[])].sort((a, b) => {
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
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        .tip {
          flex-shrink: 0;
        }
      }
    }
  }
}
</style>
