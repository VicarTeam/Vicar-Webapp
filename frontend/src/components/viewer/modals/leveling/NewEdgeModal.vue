<template>
  <Modal :shown="show" @close="show = false">
    <div class="edge-modal">
      <b>Neues Edge wählen</b>
      <small class="text-muted">Kosten: <b>{{ neededExp }}</b> EXP</small>

      <div>
        <label class="form-label">Edge <TipButton v-if="selectedEdge" :override="true" @click="showCurrentInfo"/></label>
        <select v-model="selectedEdgeId" class="form-control">
          <option :value="null" disabled>– Bitte wählen –</option>
          <option v-for="e in availableEdges" :key="e.id" :value="e.id">
            {{ e.name }} ({{ categoryLabel(e.category) }})
          </option>
        </select>
      </div>

      <div class="summary text-center">
        <span v-if="selectedEdge"><b>{{ selectedEdge.name }}</b></span>
        <span v-if="selectedEdge"> &nbsp;•&nbsp; </span>
        <span>Benötigte EXP: <b>{{ neededExp }}</b> &nbsp;|&nbsp; Verfügbar: <b>{{ editingCharacter.exp }}</b></span>
      </div>

      <div class="d-flex justify-content-center">
        <button
          class="btn btn-primary"
          :disabled="!canConfirm"
          @click="confirm"
        >
          Bestätigen (−{{ neededExp }} EXP)
        </button>
      </div>

      <div v-if="infoMessage" class="alert alert-secondary mt-10">{{ infoMessage }}</div>

      <EdgeInfoModal ref="edgeInfoModal"/>
    </div>
  </Modal>
</template>

<script lang="ts">
import {Component, Ref, Vue} from "vue-property-decorator";
import { State } from "vuex-class";
import Modal from "@/components/modal/Modal.vue";
import { IHunterSheet, IH5Edge, H5EdgeCategory } from "@/types/h5";
import { edges as allEdges } from "@/.data/h5";
import CharacterStorage from "@/libs/io/character-storage";
import EdgeInfoModal from "@/components/viewer/modals/EdgeInfoModal.vue";
import TipButton from "@/components/editor/TipButton.vue";

@Component({
  components: {TipButton, EdgeInfoModal, Modal }
})
export default class NewEdgeModal extends Vue {
  @State("editingCharacter")
  private editingCharacter!: IHunterSheet;

  @Ref("edgeInfoModal")
  private edgeInfoModal!: EdgeInfoModal;

  private show = false;
  private selectedEdgeId: number | null = null;
  private onConfirm: ((edge: IH5Edge) => void) | null = null;
  private infoMessage: string | null = null;

  public showModal(cb: (edge: IH5Edge) => void) {
    this.onConfirm = cb;
    this.selectedEdgeId = null;
    this.infoMessage = null;
    this.show = true;
  }

  private showCurrentInfo() {
    if (this.selectedEdge) {
      this.edgeInfoModal.showModal(this.selectedEdge);
    }
  }

  private get availableEdges(): IH5Edge[] {
    const chosen = new Set((this.editingCharacter.edges || []).map(e => e.id));
    return allEdges
      .filter(e => !chosen.has(e.id))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  private get selectedEdge(): IH5Edge | null {
    if (this.selectedEdgeId == null) return null;
    return allEdges.find(e => e.id === this.selectedEdgeId) || null;
  }

  private get neededExp(): number {
    return 7;
  }

  private get canConfirm(): boolean {
    return !!this.selectedEdge && this.editingCharacter.exp >= this.neededExp;
  }

  private categoryLabelMap: Record<H5EdgeCategory, string> = {
    [H5EdgeCategory.Asset]: "Vermögen",
    [H5EdgeCategory.Aptitude]: "Begabung",
    [H5EdgeCategory.Endowment]: "Weihe"
  };
  private categoryLabel(cat: H5EdgeCategory) {
    return this.categoryLabelMap[cat] || String(cat);
  }

  private confirm() {
    if (!this.canConfirm || !this.selectedEdge) {
      this.infoMessage = "Bitte ein Edge wählen und genügend EXP besitzen.";
      return;
    }

    this.editingCharacter.usedExp = (this.editingCharacter.usedExp || 0) + this.neededExp;
    this.editingCharacter.exp -= this.neededExp;
    CharacterStorage.saveCharacter(this.editingCharacter as any);

    this.onConfirm && this.onConfirm(this.selectedEdge);
    this.show = false;
  }
}
</script>

<style scoped lang="scss">
.edge-modal {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 30rem;
}
.summary {
  width: 100%;
}
</style>
