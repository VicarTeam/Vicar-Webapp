<script setup lang="ts">
import { computed, ref } from "vue"
import EditorForm from "@/components/editor/EditorForm.vue"
import EdgeInfoModal from "@/components/viewer/modals/EdgeInfoModal.vue"
import type { H5EdgeCategory, IH5Edge, IH5Perk, IH5SelectedPerk, IHunterSheet } from "@/@types/h5"
import { edges as allEdges } from "@/app/data/h5"
import { useStore } from "@/app/store"

const store = useStore()
const editingCharacter = computed(() => store.editingCharacter as IHunterSheet | undefined)

const edges = allEdges

const edgeInfoModal = ref<InstanceType<typeof EdgeInfoModal> | null>(null)
const infoMessage = ref<string | null>(null)

const categoryLabelMap: Record<any, string> = {
  Asset: "Vermögen",
  Aptitude: "Begabung",
  Endowment: "Weihe",
}

function categoryLabel(cat: H5EdgeCategory) {
  return categoryLabelMap[cat as any] || String(cat)
}

const selectedEdges = computed<IH5Edge[]>(() => editingCharacter.value?.edges || [])
const selectedPerks = computed<IH5SelectedPerk[]>(() => editingCharacter.value?.perks || [])

const perkIdToEdge = computed<Record<number, IH5Edge>>(() => {
  const map: Record<number, IH5Edge> = {}
  edges.forEach((e) => e.perks.forEach((p) => (map[p.id] = e)))
  return map
})

const perkIdToPerk = computed<Record<number, IH5Perk>>(() => {
  const map: Record<number, IH5Perk> = {}
  edges.forEach((e) => e.perks.forEach((p) => (map[p.id] = p)))
  return map
})

function notify(msg: string) {
  infoMessage.value = msg
  setTimeout(() => (infoMessage.value = null), 10_000)
}

function isEdgeSelected(edge: IH5Edge) {
  return selectedEdges.value.some((e) => e.id === edge.id)
}

function isPerkFromEdge(sp: IH5SelectedPerk, edge: IH5Edge) {
  return edge.perks.some((p) => p.id === sp.perk)
}

function isPerkFromOneOfSelectedEdges(sp: IH5SelectedPerk) {
  return selectedEdges.value.some((e) => isPerkFromEdge(sp, e))
}

function toggleEdge(edge: IH5Edge) {
  const char = editingCharacter.value
  if (!char) return

  if (isEdgeSelected(edge)) {
    char.edges = selectedEdges.value.filter((e) => e.id !== edge.id)
    char.perks = selectedPerks.value.filter((sp) => !isPerkFromEdge(sp, edge))
    return
  }

  if (selectedEdges.value.length >= 2) {
    notify("Du kannst maximal zwei Edges wählen.")
    return
  }

  char.edges = [...selectedEdges.value, edge]
}

function addPerk(perk: IH5Perk) {
  const char = editingCharacter.value
  if (!char) return

  const eCount = selectedEdges.value.length
  const pCount = selectedPerks.value.length

  if (eCount === 0) return notify("Wähle zuerst mindestens ein Edge aus.")
  if (eCount === 2 && pCount >= 1) return notify("Mit zwei Edges kannst du nur einen einzelnen Perk wählen.")
  if (eCount === 1 && pCount >= 2) return notify("Mit einem Edge kannst du nur zwei Perks wählen – beide aus diesem Edge.")

  if (eCount === 1) {
    if (!isPerkFromEdge({ perk: perk.id, specialization: "" }, selectedEdges.value[0]!)) {
      return notify("Perks müssen aus dem gewählten Edge stammen.")
    }
  } else {
    if (!isPerkFromOneOfSelectedEdges({ perk: perk.id, specialization: "" })) {
      return notify("Perk muss zu einem der gewählten Edges gehören.")
    }
  }

  char.perks = [...selectedPerks.value, { perk: perk.id, specialization: "" }]
}

function removePerk(index: number) {
  const char = editingCharacter.value
  if (!char) return
  const next = [...selectedPerks.value]
  next.splice(index, 1)
  char.perks = next
}

function updateSpecialization(index: number, value: string) {
  const char = editingCharacter.value
  if (!char) return
  const next = [...selectedPerks.value]
  next[index] = { ...next[index], specialization: value } as any
  char.perks = next
}

function openEdgeInfo(edge: IH5Edge) {
  edgeInfoModal.value?.showModal(edge)
}

const canGoNext = computed(() => {
  const eCount = selectedEdges.value.length
  const pCount = selectedPerks.value.length

  const ruleA = eCount === 2 && pCount === 1 && isPerkFromOneOfSelectedEdges(selectedPerks.value[0]!)
  const ruleB = eCount === 1 && pCount === 2 && selectedPerks.value.every((sp) => isPerkFromEdge(sp, selectedEdges.value[0]!))
  return ruleA || ruleB
})
</script>

<template>
  <EditorForm :can-go-next="canGoNext" :is-finish="true">
    <div class="content d-flex flex-column gap-20">
      <div v-if="infoMessage" class="alert alert-secondary">
        {{ infoMessage }}
      </div>

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
                      :id="'edge_' + edge.id"
                      :checked="isEdgeSelected(edge)"
                      @change="toggleEdge(edge)"
                    />
                    <label class="custom-control-label" :for="'edge_' + edge.id"></label>
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

              <div class="card-footer" style="margin-top: 2rem">
                <div class="small mb-10"><b>Verfügbare Perks</b></div>

                <div v-if="edge.perks?.length">
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

      <div>
        <h5 class="mb-10">Gewählte Perks</h5>

        <div v-if="selectedPerks.length">
          <div class="card">
            <div class="table-responsive">
              <table class="table">
                <thead>
                <tr>
                  <th style="min-width: 10rem">Edge</th>
                  <th style="min-width: 12rem">Perk</th>
                  <th>Spezialisierung (optional)</th>
                  <th class="text-right" style="width: 6rem">Aktion</th>
                </tr>
                </thead>

                <tbody>
                <tr v-for="(sp, idx) in selectedPerks" :key="idx">
                  <td>
                    {{ perkIdToEdge[sp.perk]?.name || "—" }}
                    <small class="d-block text-muted">
                      {{ categoryLabel(perkIdToEdge[sp.perk]?.category!) }}
                    </small>
                  </td>

                  <td>{{ perkIdToPerk[sp.perk]?.name || "#" + sp.perk }}</td>

                  <td>
                    <input
                      type="text"
                      class="form-control"
                      placeholder="z. B. Kreaturentyp / Detail ..."
                      :value="sp.specialization"
                      @input="updateSpecialization(idx, ($event.target as HTMLInputElement).value)"
                    />
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

    <EdgeInfoModal ref="edgeInfoModal" />
  </EditorForm>
</template>

<style scoped lang="scss">
.content {
  gap: 1.25rem;
}

.card + .card {
  margin-top: 0.75rem;
}
</style>
