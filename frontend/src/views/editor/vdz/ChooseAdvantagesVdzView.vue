<script setup lang="ts">
import { computed, ref, watch } from "vue"
import EditorForm from "@/components/editor/EditorForm.vue"
import TipButton from "@/components/editor/TipButton.vue"
import { vdzBackgrounds } from "@/app/data/vdz"
import { resolveVdzDiscipline, VDZ_HELP, vdzVirtueHelp } from "@/libs/data/vdz-helpers"
import { type IVdzSheet, VdzVirtue } from "@/@types/vdz"
import { useStore } from "@/app/store"

const DISCIPLINE_POINTS = 3
const BACKGROUND_POINTS = 5
const VIRTUE_POINTS = 7

const store = useStore()
const editingCharacter = computed(() => store.editingCharacter as IVdzSheet | undefined)

const clanName = computed(() => editingCharacter.value?.clan?.name)
const clanDisciplines = computed(() => editingCharacter.value?.clan?.disciplines ?? [])

const disciplineLevels = ref<Record<string, number>>({})
const pathChoice = ref<Record<string, string>>({})
const backgroundLevels = ref<Record<string, number>>({})

/** Wählbare Hauptpfade einer Blutmagie-Disziplin (ohne Ritualgruppen/Intros). */
function pathOptions(name: string) {
  const res = resolveVdzDiscipline(name, clanName.value)
  if (res.kind !== "pathbased") return []
  return res.entries.filter(e => e.levels.length > 0 && !e.name.endsWith("Rituale"))
}

function pathLabel(fullName: string): string {
  const idx = fullName.indexOf(": ")
  return idx >= 0 ? fullName.slice(idx + 2) : fullName
}

watch(clanDisciplines, (list) => {
  const next: Record<string, number> = {}
  const nextPath = { ...pathChoice.value }
  for (const d of list) {
    next[d] = disciplineLevels.value[d] ?? 0
    if (!nextPath[d]) {
      const opts = pathOptions(d)
      if (opts.length > 0) nextPath[d] = opts[0]!.name
    }
  }
  disciplineLevels.value = next
  pathChoice.value = nextPath
}, { immediate: true })

const usedDisciplinePoints = computed(() => Object.values(disciplineLevels.value).reduce((a, b) => a + b, 0))
const usedBackgroundPoints = computed(() => Object.values(backgroundLevels.value).reduce((a, b) => a + b, 0))

const virtues = computed(() => editingCharacter.value?.virtues)
const usedVirtuePoints = computed(() => {
  const v = virtues.value
  if (!v) return 0
  // Jede Tugend startet bei 1; verteilt wird obendrauf
  return (v[VdzVirtue.ConscienceOrConviction] - 1) + (v[VdzVirtue.SelfControlOrInstinct] - 1) + (v[VdzVirtue.Courage] - 1)
})

const virtueNames = computed(() => {
  const road = editingCharacter.value?.road
  return {
    [VdzVirtue.ConscienceOrConviction]: road?.virtues.conscienceOrConviction ?? "Gewissen/Überzeugung",
    [VdzVirtue.SelfControlOrInstinct]: road?.virtues.selfControlOrInstinct ?? "Selbstbeherrschung/Instinkt",
    [VdzVirtue.Courage]: "Mut",
  }
})

function disciplineSummary(name: string): string {
  const entries = resolveVdzDiscipline(name, editingCharacter.value?.clan?.name).entries
  return entries[0]?.summary ?? ""
}

function virtueHelp(key: VdzVirtue): string {
  return vdzVirtueHelp(virtueNames.value[key])
}

function changeDiscipline(name: string, delta: number) {
  const current = disciplineLevels.value[name] ?? 0
  const next = current + delta
  if (next < 0 || next > 3) return
  if (delta > 0 && usedDisciplinePoints.value + delta > DISCIPLINE_POINTS) return
  disciplineLevels.value = { ...disciplineLevels.value, [name]: next }
}

function changeBackground(name: string, delta: number) {
  const current = backgroundLevels.value[name] ?? 0
  const next = current + delta
  if (next < 0 || next > 5) return
  if (delta > 0 && usedBackgroundPoints.value + delta > BACKGROUND_POINTS) return
  backgroundLevels.value = { ...backgroundLevels.value, [name]: next }
}

function changeVirtue(key: VdzVirtue, delta: number) {
  const v = virtues.value
  if (!v) return
  const next = v[key] + delta
  if (next < 1 || next > 5) return
  if (delta > 0 && usedVirtuePoints.value + delta > VIRTUE_POINTS) return
  v[key] = next
}

function onBeforeNext() {
  const c = editingCharacter.value
  if (!c) return

  c.disciplines = Object.entries(disciplineLevels.value)
    .filter(([, level]) => level > 0)
    .map(([name, level]) => {
      // Blutmagie: den gewählten Hauptpfad statt des Oberbegriffs speichern.
      const opts = pathOptions(name)
      const effectiveName = opts.length > 0 ? (pathChoice.value[name] ?? opts[0]!.name) : name
      return { name: effectiveName, level }
    })

  c.backgrounds = Object.entries(backgroundLevels.value)
    .filter(([, level]) => level > 0)
    .map(([name, level]) => ({ name, level }))
}

const canGoNext = computed(() =>
  usedDisciplinePoints.value === DISCIPLINE_POINTS &&
  usedBackgroundPoints.value === BACKGROUND_POINTS &&
  usedVirtuePoints.value === VIRTUE_POINTS
)
</script>

<template>
  <EditorForm :can-go-next="canGoNext" next-step="editor-vdz-finishing" @before-next="onBeforeNext">
    <div v-if="editingCharacter" class="advantages-view">
      <div class="card" style="width: 50rem">
        <small>
          Verteile <b>3 Punkte</b> auf deine Clan-Disziplinen, <b>5 Punkte</b> auf Hintergründe und
          <b>7 Punkte</b> auf deine Tugenden (jede Tugend startet mit 1 Punkt).
        </small>
      </div>

      <div class="panels">
        <div class="card">
          <h6>
            Disziplinen
            <TipButton :content="VDZ_HELP.disciplinesGeneral + ' Bei der Erschaffung stehen dir nur die drei Disziplinen deines Clans offen; weitere lernst du im Spiel.'" />
          </h6>
          <div class="info"><span>{{ usedDisciplinePoints }} / {{ DISCIPLINE_POINTS }}</span></div>

          <div class="rows">
            <div v-for="d in clanDisciplines" :key="d" class="disc-group">
              <div class="row">
                <label>
                  {{ d }}:
                  <TipButton v-if="disciplineSummary(d)" :content="disciplineSummary(d)" />
                </label>
                <div class="stepper">
                  <button class="btn incdec" :disabled="(disciplineLevels[d] ?? 0) <= 0" @click="changeDiscipline(d, -1)">−</button>
                  <div class="value">{{ disciplineLevels[d] ?? 0 }}</div>
                  <button class="btn incdec" :disabled="usedDisciplinePoints >= DISCIPLINE_POINTS || (disciplineLevels[d] ?? 0) >= 3" @click="changeDiscipline(d, 1)">+</button>
                </div>
              </div>

              <!-- Blutmagie: Hauptpfad wählen (dein Wert steht für diesen Pfad). -->
              <div v-if="pathOptions(d).length > 0" class="path-row">
                <small>Hauptpfad:</small>
                <select class="form-control" v-model="pathChoice[d]">
                  <option v-for="p in pathOptions(d)" :key="p.name" :value="p.name">{{ pathLabel(p.name) }}</option>
                </select>
                <TipButton content="Blutmagie läuft über Pfade: Dein Wert steht für diesen Hauptpfad. Weitere Pfade und Rituale erlernst du später im Spiel — sie sind unabhängig vom Wert deines Hauptpfads." />
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <h6>
            Tugenden
            <TipButton content="Die drei Tugenden bestimmen, wie dein Kainit der Bestie widersteht. Welches Paar dir offensteht (Gewissen oder Überzeugung, Selbstbeherrschung oder Instinkt), legt dein Weg fest — Mut hat jeder. Aus den beiden Weg-Tugenden ergibt sich dein Wegwert, aus dem Mut deine Willenskraft. Klicke die einzelnen Tugenden für Details." />
          </h6>
          <div class="info"><span>{{ usedVirtuePoints }} / {{ VIRTUE_POINTS }}</span></div>

          <div class="rows" v-if="virtues">
            <div v-for="key in [VdzVirtue.ConscienceOrConviction, VdzVirtue.SelfControlOrInstinct, VdzVirtue.Courage]" :key="key" class="row">
              <label>
                {{ virtueNames[key] }}:
                <TipButton :content="virtueHelp(key)" />
              </label>
              <div class="stepper">
                <button class="btn incdec" :disabled="virtues[key] <= 1" @click="changeVirtue(key, -1)">−</button>
                <div class="value">{{ virtues[key] }}</div>
                <button class="btn incdec" :disabled="usedVirtuePoints >= VIRTUE_POINTS || virtues[key] >= 5" @click="changeVirtue(key, 1)">+</button>
              </div>
            </div>
          </div>
        </div>

        <div class="card backgrounds">
          <h6>
            Hintergründe
            <TipButton content="Hintergründe beschreiben deinen Platz in der Welt von 1242: Besitz, Gefolge, Einfluss und Blutslinie. Der Hintergrund Generation senkt deine Generation und erhöht so deinen Blutvorrat." />
          </h6>
          <div class="info"><span>{{ usedBackgroundPoints }} / {{ BACKGROUND_POINTS }}</span></div>

          <div class="rows">
            <div v-for="bg in vdzBackgrounds" :key="bg.id" class="row">
              <label>
                {{ bg.name }}
                <TipButton :content="bg.description" />
              </label>
              <div class="stepper">
                <button class="btn incdec" :disabled="(backgroundLevels[bg.name] ?? 0) <= 0" @click="changeBackground(bg.name, -1)">−</button>
                <div class="value">{{ backgroundLevels[bg.name] ?? 0 }}</div>
                <button class="btn incdec" :disabled="usedBackgroundPoints >= BACKGROUND_POINTS || (backgroundLevels[bg.name] ?? 0) >= 5" @click="changeBackground(bg.name, 1)">+</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </EditorForm>
</template>

<style scoped lang="scss">
.advantages-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem;

  .panels {
    display: flex;
    align-items: flex-start;
    gap: 2rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .card {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 22rem;

    h6 {
      margin: 0 0 0.5rem;
      font-weight: bold;
      text-align: center;
    }

    .info {
      font-size: 0.85rem;
      text-align: right;
      opacity: 0.8;
    }

    .rows {
      margin-top: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .disc-group {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    .path-row {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      padding-left: 0.5rem;

      small {
        opacity: 0.75;
        white-space: nowrap;
      }

      select {
        flex-grow: 1;
        min-height: 2rem;
        padding: 0.25rem 0.5rem;
      }
    }

    .row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;

      label {
        margin: 0;
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
      }
    }

    .stepper {
      display: flex;
      align-items: center;
      gap: 0.4rem;

      .btn.incdec {
        min-width: 2rem;
        height: 2rem;
        font-size: 1.2rem;
        font-weight: bold;
        padding: 0;
        line-height: 1;
      }

      .value {
        min-width: 2rem;
        text-align: center;
        font-weight: 600;
      }
    }
  }
}
</style>
