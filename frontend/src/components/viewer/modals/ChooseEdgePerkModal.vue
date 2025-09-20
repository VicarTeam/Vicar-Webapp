<template>
  <Modal :shown="show" @close="show = false">
    <div class="perk-modal">
      <b>Perk wählen</b>
      <small class="text-muted">
        Edge: <b>{{ edge?.name || '—' }}</b> • Kosten: <b>{{ neededExp }}</b> EXP
      </small>

      <div>
        <label class="form-label">Perk</label>
        <select v-model="selectedPerkId" class="form-control">
          <option :value="null" disabled>– Bitte wählen –</option>
          <option v-for="p in (edge?.perks || [])" :key="p.id" :value="p.id">
            {{ p.name }}
          </option>
        </select>
        <small v-if="selectedPerk" class="text-muted d-block mt-5">{{ selectedPerk.description }}</small>
      </div>

      <div>
        <label class="form-label">Spezialisierung (optional)</label>
        <input
          type="text"
          class="form-control"
          v-model="specialization"
          placeholder="z. B. Kreaturentyp / Detail"
        />
      </div>

      <div class="summary text-center">
        <span v-if="selectedPerk"><b>{{ selectedPerk.name }}</b></span>
        <span v-if="selectedPerk"> &nbsp;•&nbsp; </span>
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
    </div>
  </Modal>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { State } from "vuex-class";
import Modal from "@/components/modal/Modal.vue";
import CharacterStorage from "@/libs/io/character-storage";
import { IHunterSheet, IH5Edge, IH5Perk, IH5SelectedPerk } from "@/types/h5";

@Component({
  components: { Modal }
})
export default class ChooseEdgePerkModal extends Vue {
  @State("editingCharacter")
  private editingCharacter!: IHunterSheet;

  private show = false;
  private edge: IH5Edge | null = null;
  private selectedPerkId: number | null = null;
  private specialization = "";
  private onConfirm: ((sp: IH5SelectedPerk) => void) | null = null;
  private infoMessage: string | null = null;

  public showModal(edge: IH5Edge, cb: (sp: IH5SelectedPerk) => void) {
    this.edge = edge;
    this.onConfirm = cb;
    this.selectedPerkId = null;
    this.specialization = "";
    this.infoMessage = null;
    this.show = true;
  }

  private get selectedPerk(): IH5Perk | null {
    if (!this.edge || this.selectedPerkId == null) return null;
    return this.edge.perks.find(p => p.id === this.selectedPerkId) || null;
  }

  private get neededExp(): number {
    return 3;
  }

  private get canConfirm(): boolean {
    return !!this.selectedPerk && this.editingCharacter.exp >= this.neededExp;
  }

  private confirm() {
    if (!this.canConfirm || !this.selectedPerk) {
      this.infoMessage = "Bitte einen Perk wählen und genügend EXP besitzen.";
      return;
    }

    this.editingCharacter.usedExp = (this.editingCharacter.usedExp || 0) + this.neededExp;
    this.editingCharacter.exp -= this.neededExp;
    CharacterStorage.saveCharacter(this.editingCharacter as any);

    this.onConfirm && this.onConfirm({
      perk: this.selectedPerk.id,
      specialization: (this.specialization || "").trim()
    });

    this.show = false;
  }
}
</script>

<style scoped lang="scss">
.perk-modal {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 32rem;
}
.summary {
  width: 100%;
}
</style>
