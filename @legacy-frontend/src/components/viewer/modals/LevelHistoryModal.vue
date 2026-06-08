<script lang="ts">
import {Vue, Component} from 'vue-property-decorator';
import {ICharacter} from "@/types/models";
import Modal from "@/components/modal/Modal.vue";
import {ILevelChange, levelChangeTypeLabel} from "@/types/gameline";

@Component({
  methods: {levelChangeTypeLabel},
  components: {Modal}
})
export default class LevelHistoryModal extends Vue {

  private char: ICharacter = null!;
  private show: boolean = false;

  public showModal(char: ICharacter) {
    this.char = char;
    this.show = true;
    console.log("Level history modals opened for:", char);
  }

  private get entries(): ILevelChange[] {
    return (this.char.levelHistory || []).reverse();
  }
}
</script>

<template>
  <Modal :shown="show" @close="show = false">
    <div v-if="char && show" style="display: flex; flex-direction: column; gap: 1rem; width: 70rem;">
      <b>{{char.name}}'s Level-Verlauf:</b>
      <div style="max-height: 50vh; overflow-y: auto;">
        <table class="table">
          <thead>
          <tr>
            <th scope="col">Datum</th>
            <th scope="col">Art der Änderung</th>
            <th scope="col">Beschreibung</th>
            <th scope="col">XP-Kosten</th>
          </tr>
          </thead>
          <tbody v-if="entries.length > 0">
          <tr v-for="(entry, index) in entries" :key="index">
            <td>{{new Date(entry.date).toLocaleString()}}</td>
            <td>{{levelChangeTypeLabel(entry.type)}}</td>
            <td>{{entry.text}}</td>
            <td>{{entry.exp.before}} &#8594; {{entry.exp.after}} (-{{entry.exp.used}})</td>
          </tr>
          </tbody>
          <tbody v-else>
          <tr>
            <td colspan="4" style="text-align: center;">Keine Level-Änderungen vorhanden.</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </Modal>
</template>

<style scoped lang="scss">

</style>