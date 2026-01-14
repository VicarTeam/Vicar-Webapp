<script lang="ts">
import { Vue, Component, Ref } from 'vue-property-decorator';
import EditorForm from "@/components/editor/EditorForm.vue";
import { State } from "vuex-class";
import {IHunterSheet, IH5Edge, IH5Perk, IH5SelectedPerk, H5EdgeCategory} from "@/types/h5";
import { edges } from "@/.data/h5";
import EdgeInfoModal from "@/components/viewer/modals/EdgeInfoModal.vue";

@Component({
  components: { EdgeInfoModal, EditorForm }
})
export default class ChooseEdgesView extends Vue {

  edges: IH5Edge[] = edges;

  // aus dem Store
  @State("editingCharacter")
  private editingCharacter!: IHunterSheet;

  // Modal-Ref
  @Ref("edgeInfoModal")
  private edgeInfoModal!: any;

  // ===== Helpers / Maps =====
  private categoryLabelMap: Record<H5EdgeCategory, string> = {
    [H5EdgeCategory.Asset]: 'Vermögen',
    [H5EdgeCategory.Aptitude]: 'Begabung',
    [H5EdgeCategory.Endowment]: 'Weihe'
  };

  private infoMessage: string | null = null;

  // Fast-Lookups
  private get perkIdToEdge(): Record<number, IH5Edge> {
    const map: Record<number, IH5Edge> = {};
    this.edges.forEach(e => e.perks.forEach(p => (map[p.id] = e)));
    return map;
  }
  private get perkIdToPerk(): Record<number, IH5Perk> {
    const map: Record<number, IH5Perk> = {};
    this.edges.forEach(e => e.perks.forEach(p => (map[p.id] = p)));
    return map;
  }

  // ===== Derived selections from character =====
  private get selectedEdges(): IH5Edge[] {
    return this.editingCharacter.edges || [];
  }
  private get selectedPerks(): IH5SelectedPerk[] {
    return this.editingCharacter.perks || [];
  }

  // ===== Validation for navigation =====
  private get canGoNext(): boolean {
    const eCount = this.selectedEdges.length;
    const pCount = this.selectedPerks.length;

    // Regel 1: genau 2 Edges + 1 Perk (Perk muss zu einem der beiden Edges gehören)
    const ruleA =
      eCount === 2 &&
      pCount === 1 &&
      this.isPerkFromOneOfSelectedEdges(this.selectedPerks[0]);

    // Regel 2: genau 1 Edge + 2 Perks (beide Perks müssen zu diesem Edge gehören)
    const ruleB =
      eCount === 1 &&
      pCount === 2 &&
      this.selectedPerks.every(sp => this.isPerkFromEdge(sp, this.selectedEdges[0]));

    return ruleA || ruleB;
  }

  // ===== UI helpers =====
  private categoryLabel(cat: H5EdgeCategory): string {
    return this.categoryLabelMap[cat] || String(cat);
  }
  private isEdgeSelected(edge: IH5Edge): boolean {
    return this.selectedEdges.some(e => e.id === edge.id);
  }

  // ===== Edge selection handlers =====
  private toggleEdge(edge: IH5Edge) {
    const isSelected = this.isEdgeSelected(edge);

    if (isSelected) {
      // Edge abwählen: dazu passende Perks entfernen
      this.editingCharacter.edges = this.selectedEdges.filter(e => e.id !== edge.id);
      this.editingCharacter.perks = this.selectedPerks.filter(sp => !this.isPerkFromEdge(sp, edge));
      return;
    }

    // Edge anwählen
    if (this.selectedEdges.length >= 2) {
      // Max 2 Edges
      this.notify("Du kannst maximal zwei Edges wählen.");
      return;
    }
    this.editingCharacter.edges = [...this.selectedEdges, edge];

    // Wenn vorher 1 Edge + 2 Perks gewählt waren, kann durch das Hinzufügen eines
    // zweiten Edges die Validität kippen – Benutzer*in wählt dann passend einen Perk ab.
  }

  // ===== Perk selection handlers =====
  private addPerk(perk: IH5Perk) {
    const eCount = this.selectedEdges.length;
    const pCount = this.selectedPerks.length;

    if (eCount === 0) {
      this.notify("Wähle zuerst mindestens ein Edge aus.");
      return;
    }

    // Regelgrenzen prüfen
    if (eCount === 2 && pCount >= 1) {
      this.notify("Mit zwei Edges kannst du nur einen einzelnen Perk wählen.");
      return;
    }
    if (eCount === 1 && pCount >= 2) {
      this.notify("Mit einem Edge kannst du nur zwei Perks wählen – beide aus diesem Edge.");
      return;
    }

    // Zugehörigkeit prüfen
    if (eCount === 1 && !this.isPerkFromEdge({ perk: perk.id, specialization: '' }, this.selectedEdges[0])) {
      this.notify("Perks müssen aus dem gewählten Edge stammen.");
      return;
    }
    if (eCount === 2 && !this.isPerkFromOneOfSelectedEdges({ perk: perk.id, specialization: '' })) {
      this.notify("Perk muss zu einem der gewählten Edges gehören.");
      return;
    }

    // Doppelte Perks erlaubt => einfach pushen
    const next: IH5SelectedPerk = { perk: perk.id, specialization: '' };
    this.editingCharacter.perks = [...this.selectedPerks, next];
  }

  private removePerk(index: number) {
    const next = [...this.selectedPerks];
    next.splice(index, 1);
    this.editingCharacter.perks = next;
  }

  private updateSpecialization(index: number, value: string) {
    const next = [...this.selectedPerks];
    next[index] = { ...next[index], specialization: value };
    this.editingCharacter.perks = next;
  }

  // ===== Membership checks =====
  private isPerkFromEdge(sp: IH5SelectedPerk, edge: IH5Edge): boolean {
    return edge.perks.some(p => p.id === sp.perk);
  }
  private isPerkFromOneOfSelectedEdges(sp: IH5SelectedPerk): boolean {
    return this.selectedEdges.some(e => this.isPerkFromEdge(sp, e));
  }

  // ===== Modal =====
  private openEdgeInfo(edge: IH5Edge) {
    this.edgeInfoModal.showModal(edge);
  }

  // ===== UX helper =====
  private notify(msg: string) {
    this.infoMessage = msg;
    // Nachricht nach 5 Sekunden automatisch ausblenden
    setTimeout(() => (this.infoMessage = null), 10_000);
  }
}
</script>

<template>
  <EditorForm :can-go-next="canGoNext" :is-finish="true">
    <div class="content d-flex flex-column gap-20">
      <div v-if="infoMessage" class="alert alert-secondary">
        {{ infoMessage }}
      </div>

      <!-- Auswahl: Edges -->
      <div>
        <h5 class="mb-10">Wähle Edges</h5>
        <small class="text-muted">
          Regel: <b>2 Edges + 1 Perk</b> ODER <b>1 Edge + 2 Perks (aus demselben Edge)</b>.
        </small>

        <div class="row mt-15">
          <div class="col-12 col-lg-6 mb-15" v-for="edge in edges" :key="edge.id">
            <div class="card">
              <div class="card-header d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center">
                  <div class="custom-checkbox mr-10">
                    <input
                      type="checkbox"
                      class="custom-control-input"
                      :id="'edge_'+edge.id"
                      :checked="isEdgeSelected(edge)"
                      @change="toggleEdge(edge)"
                    >
                    <label class="custom-control-label" :for="'edge_'+edge.id"></label>
                  </div>
                  <div>
                    <div class="d-flex align-items-center">
                      <strong class="mr-10">{{ edge.name }}</strong>
                      <span class="badge badge-primary">{{ categoryLabel(edge.category) }}</span>
                    </div>
                    <small class="text-muted d-block">{{ edge.pool }}</small>
                  </div>
                </div>

                <button class="btn btn-sm" type="button" @click="openEdgeInfo(edge)">Info</button>
              </div>

              <div class="card-body">
                <p class="mb-10">{{ edge.description }}</p>
                <div class="text-muted small">System:</div>
                <div class="small" v-html="edge.system"></div>
              </div>

              <!-- Perk-Liste mit Add-Buttons -->
              <div class="card-footer" style="margin-top: 2rem">
                <div class="small mb-10"><b>Verfügbare Perks</b></div>
                <div v-if="edge.perks && edge.perks.length">
                  <div
                    v-for="perk in edge.perks"
                    :key="perk.id"
                    class="d-flex align-items-center justify-content-between mb-10"
                  >
                    <div class="mr-10">
                      <span class="font-weight-bold">{{ perk.name }}</span>
                      <small class="d-block text-muted">{{ perk.description }}</small>
                    </div>
                    <button class="btn btn-sm" type="button" @click="addPerk(perk)">Hinzufügen</button>
                  </div>
                </div>
                <div v-else class="text-muted"><small>Keine Perks für dieses Edge.</small></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Auswahl: Perks (verwaltet, inkl. Spezialisierung) -->
      <div>
        <h5 class="mb-10">Gewählte Perks</h5>
        <div v-if="selectedPerks.length">
          <div class="card">
            <div class="table-responsive">
              <table class="table">
                <thead>
                <tr>
                  <th style="min-width: 10rem;">Edge</th>
                  <th style="min-width: 12rem;">Perk</th>
                  <th>Spezialisierung (optional)</th>
                  <th class="text-right" style="width: 6rem;">Aktion</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(sp, idx) in selectedPerks" :key="idx">
                  <td>
                    {{ perkIdToEdge[sp.perk]?.name || '—' }}
                    <small class="d-block text-muted">{{ categoryLabel(perkIdToEdge[sp.perk]?.category) }}</small>
                  </td>
                  <td>
                    {{ perkIdToPerk[sp.perk]?.name || ('#'+sp.perk) }}
                  </td>
                  <td>
                    <input
                      type="text"
                      class="form-control"
                      :placeholder="'z. B. Kreaturentyp / Detail ...'"
                      :value="sp.specialization"
                      @input="updateSpecialization(idx, $event.target.value)"
                    >
                  </td>
                  <td class="text-right">
                    <button class="btn btn-sm btn-danger" type="button" @click="removePerk(idx)">Entfernen</button>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>

            <div class="content px-20 pb-15">
              <small class="text-muted">
                Aktuelle Regelprüfung:
                <b v-if="canGoNext" class="text-success">erfüllt</b>
                <b v-else class="text-danger">nicht erfüllt</b>
              </small>
            </div>
          </div>
        </div>
        <div v-else class="text-muted"><small>Noch keine Perks gewählt.</small></div>
      </div>

    </div>

    <!-- Modal -->
    <EdgeInfoModal ref="edgeInfoModal"/>
  </EditorForm>
</template>

<style scoped lang="scss">
.content {
  gap: 1.25rem;
}

/* etwas luft in Kartenlisten */
.card + .card {
  margin-top: 0.75rem;
}
</style>
