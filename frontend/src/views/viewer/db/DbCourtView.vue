<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useStore } from "@/app/store"
import Bullet from "@/components/Bullet.vue"
import TipButton from "@/components/editor/TipButton.vue"
import WrappedSpinner from "@/components/spinners/WrappedSpinner.vue"
import ConfirmDeleteModal from "@/components/viewer/modals/ConfirmDeleteModal.vue"
import CharacterStorage from "@/libs/io/character-storage"
import { DarkborneData } from "@/libs/data/darkborne-data"
import { DbDebtDirection, type IDbDebt, type IDbSheet } from "@/@types/deathborne"

const store = useStore()
const sheet = computed(() => store.editingCharacter as unknown as IDbSheet | undefined)

const confirmDeleteModal = ref<InstanceType<typeof ConfirmDeleteModal> | null>(null)

const ready = ref(DarkborneData.isLoaded)
const showReference = ref(false)

onMounted(async () => {
  if (!DarkborneData.isLoaded) {
    await DarkborneData.load()
  }
  ready.value = true
})

function save() {
  const c = sheet.value
  if (!c) return
  CharacterStorage.saveCharacter(c as any)
}

const rank = computed(() => {
  const c = sheet.value
  if (!c || !ready.value) return undefined
  return DarkborneData.courtRank(c.courtRank)
})

const office = computed(() => {
  const c = sheet.value
  if (!c || !ready.value || !c.office) return undefined
  return DarkborneData.office(c.office)
})

const order = computed(() => {
  const c = sheet.value
  if (!c || !ready.value || !c.order) return undefined
  return DarkborneData.order(c.order)
})

const debtSizes = computed(() => (ready.value ? DarkborneData.content.court.debts : []))
const judgements = computed(() => (ready.value ? DarkborneData.content.court.judgements : []))
const awareness = computed(() => (ready.value ? DarkborneData.content.court.awareness : []))
const courtTypes = computed(() => (ready.value ? DarkborneData.content.courtTypes : []))
const courtMandates = computed(() => (ready.value ? DarkborneData.content.courtMandates : []))

const owing = computed(() => (sheet.value?.debts ?? []).filter(d => d.direction === DbDebtDirection.Owing))
const owed = computed(() => (sheet.value?.debts ?? []).filter(d => d.direction === DbDebtDirection.Owed))

function debtSizeName(key: string): string {
  if (!ready.value) return key
  return DarkborneData.debtSize(key)?.name ?? key
}

function debtSizeDescription(key: string): string {
  if (!ready.value) return ""
  return DarkborneData.debtSize(key)?.description ?? ""
}

function addDebt(direction: DbDebtDirection) {
  const c = sheet.value
  if (!c) return
  c.debts.push({
    direction,
    size: debtSizes.value[0]?.key ?? "gefallen",
    party: "",
    note: "",
  })
  save()
}

function removeDebt(debt: IDbDebt) {
  const c = sheet.value
  if (!c) return
  const label = `${debtSizeName(debt.size)}${debt.party ? ` an ${debt.party}` : ""}`
  confirmDeleteModal.value?.showModal(label, () => {
    c.debts = c.debts.filter(d => d !== debt)
    save()
  })
}
</script>

<template>
  <div v-if="sheet && ready" class="db-court-view">
    <div class="wrap">
      <div class="card standing">
        <b class="title">
          {{ sheet.court || "Kein Court" }}
          <TipButton content="Der Court ist die politische Ordnung einer Stadt. Der Stand regelt, welche Rechte ein Vesper dort hat, und gibt einen Bonus auf Proben in politischen Szenen des Courts." />
        </b>

        <div class="stat-grid">
          <div class="stat">
            <small class="stat-label">Stand</small>
            <b class="stat-value">{{ rank?.name ?? "unbekannt" }}</b>
          </div>
          <div class="stat">
            <small class="stat-label">Stufe</small>
            <b class="stat-value">{{ sheet.courtRank }}</b>
          </div>
          <div class="stat">
            <small class="stat-label">Bonus</small>
            <b class="stat-value">{{ rank ? "+" + rank.bonus : "-" }}</b>
          </div>
        </div>

        <small v-if="rank" class="rights">Rechte: {{ rank.rights }}</small>
      </div>

      <div class="card office">
        <b class="subtitle">Amt</b>
        <template v-if="office">
          <b class="office-name">{{ office.name }}</b>
          <small class="desc">Aufgabe: {{ office.task }}</small>
          <small class="desc">Regel: {{ office.rule }}</small>
          <small class="hint">Ein Amt ist ein nächtlicher Anker, sobald der Spieler es einträgt.</small>
        </template>
        <div v-else class="empty"><small>Kein Amt im Court.</small></div>
      </div>

      <div class="card order">
        <b class="subtitle">Order</b>
        <template v-if="order">
          <b class="order-name">{{ order.name }}</b>
          <small class="motto">{{ order.motto }}</small>
          <small class="desc">{{ order.description }}</small>
          <small class="hint">Eine Order gibt keinen Stand, aber Kontakte in jeder Stadt, in der sie vertreten ist, und darf als nächtlicher Anker eingetragen werden.</small>
        </template>
        <div v-else class="empty"><small>Keiner Order beigetreten.</small></div>
      </div>

      <div class="card debts">
        <b class="title">
          Schulden
          <TipButton content="Schulden sind die Währung des Courts. Ein Gefallen öffnet eine Tür, eine Schuld verlangt ein echtes Risiko, eine Blutschuld ein Leben. Ein Enathar, der eine Blutschuld feierlich anerkennt, bindet sie an The Oath." />
        </b>

        <div class="debt-block">
          <div class="debt-head">
            <b class="subtitle">Ich schulde</b>
            <button class="btn pill" data-agent="db:court:debt:add-owing" @click="addDebt(DbDebtDirection.Owing)">
              + Schuld
            </button>
          </div>

          <div v-if="owing.length === 0" class="empty"><small>Keine offenen Schulden.</small></div>

          <div v-for="(debt, index) in owing" :key="'owing' + index" class="debt-row">
            <select class="form-control size-select" v-model="debt.size" :data-agent="'db:court:debt:size:owing:' + index" @change="save">
              <option v-for="size in debtSizes" :key="size.key" :value="size.key">{{ size.name }}</option>
            </select>
            <input class="form-control" v-model="debt.party" placeholder="Gegenüber" :data-agent="'db:court:debt:party:owing:' + index" @change="save" />
            <input class="form-control" v-model="debt.note" placeholder="Wofür" :data-agent="'db:court:debt:note:owing:' + index" @change="save" />
            <button class="btn remove" :data-agent="'db:court:debt:remove:owing:' + index" @click="removeDebt(debt)">
              <i class="fa-solid fa-xmark" />
            </button>
            <small class="debt-desc">{{ debtSizeDescription(debt.size) }}</small>
          </div>
        </div>

        <div class="debt-block">
          <div class="debt-head">
            <b class="subtitle">Mir wird geschuldet</b>
            <button class="btn pill" data-agent="db:court:debt:add-owed" @click="addDebt(DbDebtDirection.Owed)">
              + Schuld
            </button>
          </div>

          <div v-if="owed.length === 0" class="empty"><small>Niemand steht in der Schuld.</small></div>

          <div v-for="(debt, index) in owed" :key="'owed' + index" class="debt-row">
            <select class="form-control size-select" v-model="debt.size" :data-agent="'db:court:debt:size:owed:' + index" @change="save">
              <option v-for="size in debtSizes" :key="size.key" :value="size.key">{{ size.name }}</option>
            </select>
            <input class="form-control" v-model="debt.party" placeholder="Gegenüber" :data-agent="'db:court:debt:party:owed:' + index" @change="save" />
            <input class="form-control" v-model="debt.note" placeholder="Wofür" :data-agent="'db:court:debt:note:owed:' + index" @change="save" />
            <button class="btn remove" :data-agent="'db:court:debt:remove:owed:' + index" @click="removeDebt(debt)">
              <i class="fa-solid fa-xmark" />
            </button>
            <small class="debt-desc">{{ debtSizeDescription(debt.size) }}</small>
          </div>
        </div>
      </div>

      <div class="card reference">
        <button class="btn link-btn" data-agent="db:court:reference" data-agent-label="Aufsehen und Urteile" @click="showReference = !showReference">
          <i class="fas fa-chevron-down" :class="showReference ? 'fa-rotate-180' : ''" />
          {{ showReference ? "Aufsehen und Urteile verbergen" : "Aufsehen und Urteile anzeigen" }}
        </button>

        <template v-if="showReference">
          <h6 class="sub">Aufsehen</h6>
          <small class="hint">Aufsehen wird pro Schauplatz geführt, meist pro Stadt, und hat 12 Kästchen.</small>
          <div v-for="stage in awareness" :key="stage.key" class="stage">
            <b>{{ stage.name }} <small class="stage-boxes">Kästchen {{ stage.boxes }}</small></b>
            <small class="desc">{{ stage.consequence }}</small>
            <small class="hint">{{ stage.covenant }}</small>
          </div>

          <h6 class="sub">Urteile des Courts</h6>
          <div class="table-scroll">
            <table class="table">
              <thead>
              <tr>
                <th>Urteil</th>
                <th>Wirkung</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="judgement in judgements" :key="judgement.key">
                <td>{{ judgement.name }}</td>
                <td>{{ judgement.effect }}</td>
              </tr>
              </tbody>
            </table>
          </div>

          <small class="hint">
            Urteile fällt der Arbiter nach Artikel 11 des Bundes.
            <Bullet />
            Ein Urteil trifft, wer Beweise hinterlässt, nicht wer nur Gerüchte streut.
          </small>

          <template v-if="courtTypes.length > 0">
            <h6 class="sub">Court-Typen</h6>
            <div v-for="type in courtTypes" :key="type.key" class="stage">
              <b>{{ type.name }}</b>
              <small class="hint">{{ type.description }}</small>
            </div>
          </template>

          <template v-if="courtMandates.length > 0">
            <h6 class="sub">Mandate</h6>
            <small class="hint">Jeder Regent muss erklären können, warum dieser Court ihm gehorcht.</small>
            <div v-for="mandate in courtMandates" :key="mandate.key" class="stage">
              <b>{{ mandate.name }}</b>
              <small class="hint">{{ mandate.description }}</small>
            </div>
          </template>
        </template>
      </div>
    </div>

    <ConfirmDeleteModal ref="confirmDeleteModal" />
  </div>

  <WrappedSpinner v-else>
    <small>Regelwerk wird geladen</small>
  </WrappedSpinner>
</template>

<style scoped lang="scss">
.db-court-view {
  width: 100%;
  min-height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 1.5rem;
}

.wrap {
  width: min(1100px, 100%);
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 24rem), 1fr));
  gap: 1rem;
  align-items: start;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.standing,
.debts,
.reference {
  grid-column: 1 / -1;
}

.title {
  font-size: 1.25rem;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.subtitle {
  font-size: 1rem;
  font-family: var(--font-display);
}

.sub {
  margin: 0.4rem 0 0;
  font-family: var(--font-display);
  letter-spacing: 0.02em;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
  gap: 0.75rem;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;

  .stat-label {
    color: var(--text-3);
  }

  .stat-value {
    font-size: 1.1rem;
  }
}

.rights,
.desc {
  color: var(--text-2);
}

.motto {
  color: var(--accent-soft);
  font-style: italic;
}

.office-name,
.order-name {
  font-size: 1.05rem;
}

.debt-block {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}

.debt-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.debt-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;

  input {
    flex-grow: 1;
    min-width: 9rem;
  }

  .size-select {
    max-width: 10rem;
  }

  .remove {
    min-width: 2rem;
    height: 2rem;
    padding: 0;
    line-height: 1;
  }

  .debt-desc {
    flex-basis: 100%;
    color: var(--text-3);
  }
}

.pill {
  padding: 0.3rem 0.6rem;
  font-size: 0.85rem;
}

.link-btn {
  align-self: flex-start;
  padding: 0.2rem 0;
  background: none;
  border: none;
  box-shadow: none;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;

  i {
    transition: transform var(--dur-2) var(--ease-2);
    font-size: 0.75rem;
  }
}

.stage {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  padding-top: 0.35rem;

  .stage-boxes {
    font-weight: normal;
    color: var(--text-3);
  }
}

.table-scroll {
  width: 100%;
  overflow-x: auto;
}

.hint {
  color: var(--text-3);
}

.empty {
  color: var(--text-3);
}
</style>
