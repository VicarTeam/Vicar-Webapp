<script lang="ts">
import { Vue, Component, Ref } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { IHunterSheet, IH5Edge, IH5Perk, IH5SelectedPerk, H5EdgeCategory } from "@/types/h5";
import { edges as allEdges } from "@/.data/h5";
import EdgeInfoModal from "@/components/viewer/modals/EdgeInfoModal.vue";
import LevelButton from "@/components/viewer/LevelButton.vue";
import NewEdgeModal from "@/components/viewer/modals/leveling/NewEdgeModal.vue";
import ChooseEdgePerkModal from "@/components/viewer/modals/ChooseEdgePerkModal.vue";

@Component({
  components: {
    EdgeInfoModal,
    LevelButton,
    NewEdgeModal,
    ChooseEdgePerkModal,
  }
})
export default class EdgesView extends Vue {

  @State("editingCharacter")
  private editingCharacter!: IHunterSheet;

  @State("isLevelMode")
  private isLevelMode!: boolean;

  @Ref("edgeInfoModal")
  private edgeInfoModal!: EdgeInfoModal;

  @Ref("newEdgeModal")
  private newEdgeModal!: any;

  @Ref("chooseEdgePerkModal")
  private chooseEdgePerkModal!: any;

  private categoryLabelMap: Record<H5EdgeCategory, string> = {
    [H5EdgeCategory.Asset]: 'Vermögen',
    [H5EdgeCategory.Aptitude]: 'Begabung',
    [H5EdgeCategory.Endowment]: 'Weihe',
  };

  private get perkIdToPerk(): Record<number, IH5Perk> {
    const map: Record<number, IH5Perk> = {};
    allEdges.forEach(e => e.perks.forEach(p => (map[p.id] = p)));
    return map;
  }
  private get perkIdToEdge(): Record<number, IH5Edge> {
    const map: Record<number, IH5Edge> = {};
    allEdges.forEach(e => e.perks.forEach(p => (map[p.id] = e)));
    return map;
  }

  private get currentEdges(): IH5Edge[] {
    return (this.editingCharacter.edges || []).slice().sort((a, b) => a.name.localeCompare(b.name));
  }

  private perksForEdge(edge: IH5Edge): IH5SelectedPerk[] {
    const perks = this.editingCharacter.perks || [];
    return perks.filter(sp => this.perkIdToEdge[sp.perk]?.id === edge.id);
  }

  private categoryLabel(cat: H5EdgeCategory): string {
    return this.categoryLabelMap[cat] || String(cat);
  }

  private openEdgeInfo(edge: IH5Edge) {
    this.edgeInfoModal.showModal(edge);
  }

  private levelEdge(edge: IH5Edge) {
    this.chooseEdgePerkModal.showModal(edge, (selected: IH5SelectedPerk) => {
      this.editingCharacter.perks = [...(this.editingCharacter.perks || []), selected];
    });
  }

  private addNewEdge() {
    this.newEdgeModal.showModal((edge: IH5Edge) => {
      const set = new Set((this.editingCharacter.edges || []).map(e => e.id));
      if (!set.has(edge.id)) {
        this.editingCharacter.edges = [...(this.editingCharacter.edges || []), edge];
      }
    });
  }
}
</script>

<template>
  <div class="edges-view">
    <div class="edges">
      <div
        class="edge card"
        v-for="e in currentEdges"
        :key="e.id"
        :id="`edge-${e.id}`"
      >
        <div class="top">
          <div class="d-flex align-items-center" style="gap: 0.5rem; flex-grow: 1">
            <LevelButton v-if="isLevelMode" @click="levelEdge(e)"/>
            <b @click="openEdgeInfo(e)">{{ e.name }}</b>
            <span class="badge badge-primary ml-5">{{ categoryLabel(e.category) }}</span>
          </div>
          <button class="btn btn-sm" type="button" @click="openEdgeInfo(e)">Info</button>
        </div>

        <div class="perks">
          <div class="perks-title"><b>Perks</b></div>
          <div v-if="perksForEdge(e).length">
            <div
              v-for="(sp, idx) in perksForEdge(e)"
              :key="idx"
              class="perk-row"
            >
              <div class="perk-name">
                {{ perkIdToPerk[sp.perk]?.name || ('#'+sp.perk) }}
                <small v-if="sp.specialization" class="text-muted">({{ sp.specialization }})</small>
              </div>
              <small class="perk-desc text-muted">
                {{ perkIdToPerk[sp.perk]?.description }}
              </small>
            </div>
          </div>
          <div v-else class="text-muted"><small>Keine Perks gewählt.</small></div>
        </div>
      </div>
    </div>

    <div class="card" v-if="isLevelMode">
      <div class="content d-flex justify-content-between align-items-center">
        <div>
          <b>Edges erweitern</b>
          <div class="text-muted small">Füge neue Edges hinzu oder wähle zusätzliche Perks.</div>
        </div>
        <button class="btn btn-primary" @click="addNewEdge">Neues Edge hinzufügen</button>
      </div>
    </div>

    <EdgeInfoModal ref="edgeInfoModal"/>
    <ChooseEdgePerkModal ref="chooseEdgePerkModal"/>
    <NewEdgeModal ref="newEdgeModal"/>
  </div>
</template>

<style scoped lang="scss">
.edges-view {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: stretch;
  flex-direction: column;
  gap: 2rem;
  padding: 0 2rem;
}

.edges {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  align-content: flex-start;
  justify-content: center;
}

.edge {
  width: 30rem;
  display: flex;
  flex-direction: column;
  gap: .5rem;

  .top {
    display: flex;
    align-items: center;
    width: 100%;
    border-bottom: 1px solid rgba(255, 255, 255, .3);
    padding-bottom: .25rem;
  }

  .perks {
    display: flex;
    flex-direction: column;
    gap: .5rem;

    .perks-title {
      margin-top: .5rem;
    }

    .perk-row {
      display: flex;
      flex-direction: column;
      gap: .15rem;
      padding: .4rem .5rem;
      border-radius: .5rem;
      background: rgba(255,255,255,0.04);
    }

    .perk-name {
      font-weight: 600;
    }

    .perk-desc {
      line-height: 1.2;
    }
  }
}
</style>
