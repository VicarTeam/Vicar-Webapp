<script setup lang="ts">
import { computed, inject, onMounted, ref } from "vue"
import { useStore } from "@/app/store"
import CruorTrack from "@/components/progress/CruorTrack.vue"
import Dots from "@/components/progress/Dots.vue"
import Bullet from "@/components/Bullet.vue"
import LevelButton from "@/components/viewer/LevelButton.vue"
import TipButton from "@/components/editor/TipButton.vue"
import WrappedSpinner from "@/components/spinners/WrappedSpinner.vue"
import DbHouseSymbol from "@/components/symbols/DbHouseSymbol.vue"
import CharacterStorage from "@/libs/io/character-storage"
import { DarkborneData } from "@/libs/data/darkborne-data"
import {
  DB_MAX_HUNGER,
  dbAnathemaFor,
  dbBloodDice,
  dbCruorMax,
  dbCruorState,
  dbCruorValue,
  dbCruorStateHint,
  dbCruorStateName,
  dbSetCruorValue,
  dbFreeIncreases,
  dbMaxDepth,
  dbUpkeep,
} from "@/libs/data/darkborne-rules"
import { DbAnathemaSource, type IDbSheet } from "@/@types/deathborne"

type DbRequestLevelFn = (type: string, subject?: unknown) => void

const store = useStore()
const sheet = computed(() => store.editingCharacter as unknown as IDbSheet | undefined)
const isLevelMode = computed(() => store.isLevelMode)

const requestLevel = inject("request-db-level") as DbRequestLevelFn | undefined

const ready = ref(DarkborneData.isLoaded)
const showEffects = ref(false)
const showIncreases = ref(false)

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

const cruorMax = computed(() => (sheet.value ? dbCruorMax(sheet.value) : 0))
const cruorValue = computed(() => (sheet.value ? dbCruorValue(sheet.value) : 0))
const upkeep = computed(() => (sheet.value ? dbUpkeep(sheet.value) : 0))
const bloodDice = computed(() => (sheet.value ? dbBloodDice(sheet.value) : 0))
const stateName = computed(() => (sheet.value ? dbCruorStateName(dbCruorState(sheet.value)) : ""))
const stateHint = computed(() => (sheet.value ? dbCruorStateHint(dbCruorState(sheet.value)) : ""))

const bloodStrength = computed(() => {
  const c = sheet.value
  if (!c || !ready.value) return undefined
  return DarkborneData.bloodStrength(c.bloodStrength)
})

const maxDepth = computed(() => (sheet.value ? dbMaxDepth(sheet.value.bloodStrength) : 0))
const freeIncreases = computed(() => (sheet.value ? dbFreeIncreases(sheet.value.bloodStrength) : 0))

const house = computed(() => {
  const c = sheet.value
  if (!c || !ready.value) return undefined
  return DarkborneData.house(c.bloodline || c.house)
})

function sourceLabel(source: DbAnathemaSource): string {
  if (source === DbAnathemaSource.Inherited) return "Blutlinie"
  if (source === DbAnathemaSource.Personal) return "Persönlich"
  return "Grundprofil"
}

const anathema = computed(() => {
  const c = sheet.value
  if (!c || !ready.value) return []
  return dbAnathemaFor(c).map(entry => {
    const influence = DarkborneData.influence(entry.influence)
    const level = DarkborneData.anathemaLevel(entry.level)
    const symbolic = influence?.kind === "symbolic"
    return {
      key: entry.influence,
      name: DarkborneData.influenceName(entry.influence),
      levelName: DarkborneData.anathemaLevelName(entry.level),
      kindLabel: symbolic ? "symbolisch" : "körperlich",
      rule: (symbolic ? level?.symbolic : level?.physical) ?? "",
      note: entry.note || influence?.note || "",
      source: sourceLabel(entry.source),
      active: entry.level !== "none",
    }
  })
})

function attributeName(key: string): string {
  if (!ready.value) return key
  return DarkborneData.content.attributes.find(a => a.key === key)?.name ?? key
}

function skillName(key: string): string {
  if (!ready.value) return key
  return DarkborneData.content.skills.find(s => s.key === key)?.name ?? key
}

const huntMethods = computed(() => {
  const c = sheet.value
  if (!c || !ready.value) return []
  return DarkborneData.content.hunt.methods.map(method => {
    const attribute = method.attribute || ""
    const skill = method.skill || ""
    const hasPool = attribute !== "" && skill !== ""
    return {
      key: method.key,
      name: method.name,
      note: method.note,
      difficulty: method.difficulty,
      hasPool,
      poolLabel: hasPool ? `${attributeName(attribute)} + ${skillName(skill)}` : "",
      pool: (c.attributes[attribute] ?? 0) + (c.skills[skill] ?? 0),
    }
  })
})

const bloodSources = computed(() => (ready.value ? DarkborneData.content.hunt.sources : []))
const huntIncreases = computed(() => {
  if (!ready.value) return []
  return DarkborneData.content.hunt.increases.map(increase => ({
    key: increase.key,
    name: DarkborneData.content.increases.find(i => i.key === increase.key)?.name ?? increase.key,
    effect: increase.effect,
  }))
})

const hungerEffects = computed(() => (ready.value ? DarkborneData.content.effects.hunger : []))
const instabilityEffects = computed(() => (ready.value ? DarkborneData.content.effects.instability : []))

function severityLabel(severity: string): string {
  return severity === "heavy" ? "schwer" : "leicht"
}

function setCruorValue(value: number) {
  const c = sheet.value
  if (!c) return
  dbSetCruorValue(c, value)
  save()
}



const torporWarning = computed(() => {
  const c = sheet.value
  if (!c) return false
  const open = Math.max(0, upkeep.value - c.cruor)
  return c.hunger + open > DB_MAX_HUNGER
})

function payUpkeep() {
  const c = sheet.value
  if (!c) return
  dbSetCruorValue(c, dbCruorValue(c) - upkeep.value)
  save()
}

function drink(amount: number) {
  const c = sheet.value
  if (!c) return
  dbSetCruorValue(c, dbCruorValue(c) + amount)
  save()
}
</script>

<template>
  <div v-if="sheet && ready" class="db-blood-view">
    <div class="wrap">
      <div class="card cockpit">
        <b class="title">Cruor und Hunger</b>

        <div class="track">
          <CruorTrack
            :value="cruorValue"
            :max="cruorMax"
            :hunger-max="DB_MAX_HUNGER"
            agent-id="db:blood:cruor"
            @update:value="setCruorValue"
          >
            <template #tip>
              <TipButton content="Ein Zähler für beides: Der Vorrat reicht von 0 bis zum Maximum deiner Blutstärke. Was du darunter ausgibst, wird zu Hunger und reicht bis 5. Jeder Hungerpunkt ist ein Blutwürfel, ein sechster bedeutet Hungerstarre." />
            </template>
          </CruorTrack>
        </div>

        <div class="state">
          <b>Füllstand: {{ stateName }}</b>
          <small>{{ stateHint }}</small>
        </div>

        <div class="upkeep">
          <div class="upkeep-text">
            <b>Unterhalt: {{ upkeep }} Cruor pro Nacht</b>
            <small>Beim Erwachen fällig. Was der Vorrat nicht deckt, wird zu Hunger.</small>
          </div>
          <button class="btn btn-primary" data-agent="db:blood:upkeep" data-agent-label="Unterhalt zahlen" @click="payUpkeep">
            Unterhalt zahlen
          </button>
        </div>

        <div v-if="torporWarning" class="alert alert-danger">
          Der Unterhalt lässt den Hunger über 5 steigen. Das bedeutet Hungerstarre.
        </div>

        <div class="stat-grid">
          <div class="stat">
            <small class="stat-label">Blutwürfel aus Hunger</small>
            <b class="stat-value">{{ bloodDice }}</b>
          </div>
          <div class="stat">
            <small class="stat-label">Blutalter</small>
            <b class="stat-value">{{ sheet.bloodAge }} Jahre</b>
          </div>
          <div class="stat">
            <small class="stat-label">Glied</small>
            <b class="stat-value">{{ sheet.glied }}</b>
          </div>
        </div>

        <small class="hint">
          Eine 1 auf einem Blutwürfel löst eine Folge aus. Mehrere Einsen bedeuten eine schwere Folge.
          <Bullet />
          Wer Hunger hat, bekommt keine Routine.
        </small>
      </div>

      <div class="card strength">
        <b class="title">
          Blutstärke {{ sheet.bloodStrength }}
          <LevelButton v-if="sheet.bloodStrength < 10" data-agent="db:blood:strength" @click="requestLevel?.('blood-strength')" />
          <TipButton content="Eine Verdichtung verlangt alle vier Bedingungen: XP in Höhe von neuer Wert mal 10 plus Glied, ein Ereignis, das das Blut verändert, ein erschütterter menschlicher Anker und den Preis der neuen Stufe." />
        </b>

        <div class="strength-row">
          <small class="strength-label">Stufe</small>
          <Dots :amount="sheet.bloodStrength" :max="10" :margin-at="5" />
        </div>

        <div class="stat-grid">
          <div class="stat">
            <small class="stat-label">Höchste Tiefe</small>
            <b class="stat-value">{{ maxDepth }}</b>
          </div>
          <div class="stat">
            <small class="stat-label">Freie Steigerungen</small>
            <b class="stat-value">{{ freeIncreases }}</b>
          </div>
          <div class="stat">
            <small class="stat-label">Vorrat und Unterhalt</small>
            <b class="stat-value">{{ cruorMax }} / {{ upkeep }}</b>
          </div>
        </div>

        <ul v-if="bloodStrength && bloodStrength.notes.length > 0" class="list">
          <li v-for="(note, index) in bloodStrength.notes" :key="index">{{ note }}</li>
        </ul>

        <div v-if="sheet.alienation" class="alienation">
          <small>
            Entfremdung: Schwierigkeit +1 bei moderner Technik, heutigen Umgangsformen und aktueller Sprache.
          </small>
          <button
            v-if="isLevelMode"
            class="btn pill"
            data-agent="db:blood:alienation"
            data-agent-label="Entfremdung ablegen"
            @click="requestLevel?.('alienation')"
          >
            Entfremdung ablegen, 5 XP
          </button>
        </div>
      </div>

      <div v-if="house" class="card scar">
        <b class="title">
          <DbHouseSymbol :house="house" size="2rem" />
          {{ house.scar.name }}
        </b>
        <small class="meta">{{ house.name }} {{ house.epithet }}</small>
        <small class="desc">{{ house.scar.summary }}</small>

        <h6 class="sub">Auslöser</h6>
        <div class="chips">
          <span v-for="trigger in house.scar.triggers" :key="trigger" class="chip">{{ trigger }}</span>
        </div>

        <h6 class="sub">Dauerwirkung</h6>
        <small>{{ house.scar.permanentEffect }}</small>

        <h6 class="sub">Zwänge</h6>
        <ul class="list">
          <li v-for="(compulsion, index) in house.scar.compulsions" :key="index">{{ compulsion }}</li>
        </ul>
        <small class="hint">Annehmen gibt 1 Wille, Ablehnen kostet 1 Wille. Ohne Wille muss der Zwang angenommen werden.</small>
      </div>

      <div class="card anathema">
        <b class="title">
          Anathema
          <TipButton content="Körperliche Anathema verletzen den Körper, symbolische halten den Vesper auf. Vererbte Anathema werden ab Blutstärke 3 eine Stufe stärker, Grund-Anathema ab Blutstärke 5." />
        </b>

        <div v-for="entry in anathema" :key="entry.key" class="ana-row" :class="{ inactive: !entry.active }">
          <div class="ana-head">
            <b class="ana-name">{{ entry.name }}</b>
            <span class="badge">{{ entry.levelName }}</span>
            <small class="ana-kind">{{ entry.kindLabel }}</small>
            <small class="ana-source">{{ entry.source }}</small>
          </div>
          <small class="ana-rule">{{ entry.rule }}</small>
          <small v-if="entry.note" class="ana-note">{{ entry.note }}</small>
        </div>

        <div v-if="anathema.length === 0" class="empty"><small>Keine Anathema eingetragen.</small></div>
      </div>

      <div class="card hunt">
        <b class="title">Jagd</b>
        <small class="desc">Eine Szene, ein Wurf. Erfolg heißt maßvoll trinken, 2 Cruor.</small>

        <div class="table-scroll">
          <table class="table">
            <thead>
            <tr>
              <th>Methode</th>
              <th>Pool</th>
              <th>Würfel</th>
              <th>Schwierigkeit</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="method in huntMethods" :key="method.key">
              <td>
                <b>{{ method.name }}</b>
                <small class="cell-note">{{ method.note }}</small>
              </td>
              <td>{{ method.hasPool ? method.poolLabel : "Routine" }}</td>
              <td>
                <template v-if="method.hasPool">
                  <b>{{ method.pool }}</b>
                  <small v-if="bloodDice > 0" class="cell-note">davon {{ bloodDice }} Blutwürfel</small>
                </template>
                <template v-else>-</template>
              </td>
              <td>{{ method.hasPool ? method.difficulty : "-" }}</td>
            </tr>
            </tbody>
          </table>
        </div>

        <h6 class="sub">Blutquellen</h6>
        <div class="sources">
          <div v-for="source in bloodSources" :key="source.key" class="source">
            <button
              class="btn pill"
              :data-agent="'db:blood:source:' + source.key"
              :data-agent-label="source.name + ' trinken'"
              @click="drink(source.cruor)"
            >
              + {{ source.cruor }} Cruor
            </button>
            <div class="source-text">
              <b>{{ source.name }}</b>
              <small>{{ source.note }}</small>
            </div>
          </div>
        </div>
        <small class="hint">Trinken baut zuerst Hunger ab, 1 Cruor pro Hungerpunkt, und füllt erst danach den Vorrat.</small>

        <button class="btn link-btn" data-agent="db:blood:increases" data-agent-label="Steigerungen der Jagd" @click="showIncreases = !showIncreases">
          <i class="fas fa-chevron-down" :class="showIncreases ? 'fa-rotate-180' : ''" />
          {{ showIncreases ? "Steigerungen verbergen" : "Steigerungen der Jagd anzeigen" }}
        </button>
        <ul v-if="showIncreases" class="list">
          <li v-for="increase in huntIncreases" :key="increase.key">
            <b>{{ increase.name }}:</b> {{ increase.effect }}
          </li>
        </ul>

        <small class="hint">
          Misserfolg: Das Opfer entkommt, wehrt sich oder es gibt einen Zeugen, Aufsehen +1.
          <Bullet />
          Eine 1 auf einem Blutwürfel: Ein menschlicher Anker gibt Halt, oder das Opfer stirbt und ein menschlicher Anker wird erschüttert.
        </small>
      </div>

      <div class="card effects">
        <button class="btn link-btn" data-agent="db:blood:effects" data-agent-label="Folgen anzeigen" @click="showEffects = !showEffects">
          <i class="fas fa-chevron-down" :class="showEffects ? 'fa-rotate-180' : ''" />
          {{ showEffects ? "Folgen verbergen" : "Hunger- und Instabilitäts-Folgen anzeigen" }}
        </button>

        <template v-if="showEffects">
          <h6 class="sub">Hunger-Folgen</h6>
          <small class="hint">Menschliche Anker wenden sie ab.</small>
          <div v-for="effect in hungerEffects" :key="effect.key" class="effect">
            <b>{{ effect.name }} <span class="badge">{{ severityLabel(effect.severity) }}</span></b>
            <small>{{ effect.effect }}</small>
          </div>

          <h6 class="sub">Instabilität</h6>
          <small class="hint">Nächtliche Anker wenden sie ab.</small>
          <div v-for="effect in instabilityEffects" :key="effect.key" class="effect">
            <b>{{ effect.name }} <span class="badge">{{ severityLabel(effect.severity) }}</span></b>
            <small>{{ effect.effect }}</small>
          </div>
        </template>
      </div>
    </div>
  </div>

  <WrappedSpinner v-else>
    <small>Regelwerk wird geladen</small>
  </WrappedSpinner>
</template>

<style scoped lang="scss">
.db-blood-view {
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
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 28rem), 1fr));
  gap: 1rem;
  align-items: start;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.cockpit,
.hunt {
  grid-column: 1 / -1;
}

.title {
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.meta,
.desc {
  color: var(--text-2);
}

.sub {
  margin: 0.4rem 0 0;
  font-family: var(--font-display);
  letter-spacing: 0.02em;
}

.track {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;

  .track-label {
    width: 5.5rem;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }

  .track-value {
    color: var(--text-2);
  }
}

.state {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-1);
  border: 1px solid var(--accent-border);
  background: var(--accent-mute);
}

.upkeep {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;

  .upkeep-text {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
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

.strength-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;

  .strength-label {
    width: 5.5rem;
    color: var(--text-3);
  }
}

.list {
  margin: 0;
  padding-left: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  color: var(--text-2);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.chip {
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  border: 1px solid var(--accent-border);
  background: var(--accent-mute);
}

.badge {
  font-size: 0.65rem;
  padding: 0.1rem 0.4rem;
  border-radius: 0.5rem;
  background: var(--primary-color);
  color: var(--accent-contrast);
}

.ana-row {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding-top: 0.4rem;
  border-top: 1px solid rgba(255, 255, 255, 0.07);

  &.inactive {
    opacity: 0.5;
  }

  .ana-head {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .ana-name {
    flex-grow: 1;
  }

  .ana-kind,
  .ana-source {
    color: var(--text-3);
  }

  .ana-rule {
    color: var(--text-2);
  }

  .ana-note {
    color: var(--text-3);
    font-style: italic;
  }
}

.table-scroll {
  width: 100%;
  overflow-x: auto;
}

.cell-note {
  display: block;
  color: var(--text-3);
}

.sources {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
  gap: 0.5rem;
}

.source {
  display: flex;
  align-items: center;
  gap: 0.6rem;

  .source-text {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }

  small {
    color: var(--text-3);
  }
}

.pill {
  padding: 0.3rem 0.6rem;
  font-size: 0.85rem;
  white-space: nowrap;
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

.effect {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  padding-top: 0.35rem;

  small {
    color: var(--text-2);
  }
}

.alienation {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  align-items: flex-start;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-1);
  border: 1px solid var(--accent-border);
  background: var(--accent-mute);
}

.hint {
  color: var(--text-3);
}

.empty {
  color: var(--text-3);
}
</style>
