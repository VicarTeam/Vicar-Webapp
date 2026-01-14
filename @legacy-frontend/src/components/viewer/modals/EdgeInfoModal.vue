<template>
  <Modal :shown="show" @close="show = false">
    <div v-if="edge" class="edge-info">
      <div class="d-flex align-items-center justify-content-between">
        <h5 class="m-0">
          {{ edge.name }}
          <span class="badge badge-primary ml-5">{{ edge.category }}</span>
        </h5>
        <button class="btn btn-sm"
                type="button"
                @click="toggleAll()">
          {{ areAllExpanded ? 'Alle einklappen' : 'Alle ausklappen' }}
        </button>
      </div>

      <small v-if="edge.description"><i>{{ edge.description }}</i></small>
      <hr>

      <div class="edge-meta">
        <span v-if="edge.pool"><b>Würfelpool</b>: {{ edge.pool }}</span>
        <span><b>Regeln</b>: <span v-html="edge.system"></span></span>
      </div>

      <div class="mt-20">
        <b>Perks</b>
        <div v-if="edge.perks && edge.perks.length" class="mt-10">
          <div v-for="perk in edge.perks"
               :key="perk.id"
               class="card mb-10">
            <div class="card-header d-flex align-items-center justify-content-between"
                 role="button"
                 @click="togglePerk(perk.id)">
              <span>{{ perk.name }}</span>
              <span class="text-muted">{{ expanded[perk.id] ? '▾' : '▸' }}</span>
            </div>
            <div v-show="expanded[perk.id]" class="card-body p-15">
              <p class="m-0">{{ perk.description }}</p>
            </div>
          </div>
        </div>
        <div v-else class="text-muted mt-10">
          <small>Keine Perks verfügbar.</small>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { IH5Edge } from '@/types/h5';
import Modal from '@/components/modal/Modal.vue';

@Component({
  components: { Modal }
})
export default class EdgesInfoModal extends Vue {

  private show: boolean = false;
  private edge: IH5Edge | null = null;
  private expanded: Record<number, boolean> = {};

  public showModal(edge: IH5Edge) {
    this.edge = edge;
    this.show = true;
    this.expanded = {};
  }

  private togglePerk(id: number) {
    this.$set(this.expanded, id, !this.expanded[id]);
  }

  private get areAllExpanded(): boolean {
    if (!this.edge?.perks?.length) return false;
    return this.edge.perks.every(p => this.expanded[p.id]);
  }

  private toggleAll() {
    if (!this.edge?.perks) return;
    const target = !this.areAllExpanded;
    const next: Record<number, boolean> = {};
    this.edge.perks.forEach(p => (next[p.id] = target));
    this.expanded = next;
  }
}
</script>

<style scoped lang="scss">
.edge-info {
  max-width: 40rem;
  max-height: 50rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  overflow-x: hidden;
}

.edge-meta {
  display: flex;
  flex-direction: column;
  gap: .5rem;
}

.card-header {
  cursor: pointer;
  user-select: none;
}
</style>
