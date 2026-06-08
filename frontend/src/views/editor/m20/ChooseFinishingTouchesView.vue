<script setup lang="ts">
import {computed} from "vue"
import EditorForm from "@/components/editor/EditorForm.vue"
import {getSphereName, type IM20Tradition, type IMageSheet, type M20Sphere} from "@/@types/m20"
import {useStore} from "@/app/store"
import TipButton from "@/components/editor/TipButton.vue";

const store = useStore()
const editingCharacter = computed(() => store.editingCharacter as IMageSheet | undefined)

const ARETE_BASE = 1
const ARETE_MAX = 3
const WILL_BASE = 5
const STARTING_SPHERE_POOL = 6

const COST = {
  aretePerDot: 4,
  spherePerDot: 7,
  willPerDot: 1,
  quintPerFour: 1,
}

const spheresOrder: M20Sphere[] = [
  "Correspondence" as any,
  "Entropy" as any,
  "Forces" as any,
  "Life" as any,
  "Matter" as any,
  "Mind" as any,
  "Prime" as any,
  "Spirit" as any,
  "Time" as any,
]

function getAvatarLevel(sheet: IMageSheet): number {
  try {
    const pack = sheet.backgrounds.packs.find((x) => x.pack.id === 4)
    if (!pack || pack.traits.length <= 0) return 0
    return Math.max(...pack.traits.map((x) => x.level))
  } catch {
    return 0
  }
}

const avatarLevel = computed(() => (editingCharacter.value ? getAvatarLevel(editingCharacter.value) : 0))
const baseArete = computed(() => ARETE_BASE)
const baseWill = computed(() => WILL_BASE)
const baseQuint = computed(() => avatarLevel.value)

const tradition = computed<IM20Tradition | undefined>(() => editingCharacter.value?.tradition as any)
const affinityList = computed<M20Sphere[]>(() => tradition.value?.affinitySpheres ?? [])
const hasAffinityRequirement = computed(() => (affinityList.value?.length ?? 0) > 0)

function getSphere(s: M20Sphere): number {
  const c = editingCharacter.value
  if (!c) return 0
  return ((c.spheres as any)?.[s] ?? 0) as number
}

function setSphere(s: M20Sphere, v: number) {
  const c = editingCharacter.value
  if (!c) return
  if (!c.spheres) c.spheres = {} as any
  (c.spheres as any)[s] = Math.max(0, Math.min(arete.value, v | 0))
}

const affinitySatisfied = computed(() => {
  if (!hasAffinityRequirement.value) return true
  return affinityList.value.some((s) => getSphere(s) > 0)
})

const spheresTotal = computed(() => spheresOrder.reduce((acc, s) => acc + getSphere(s), 0))
const affinityFreeDot = computed(() => (hasAffinityRequirement.value && affinitySatisfied.value ? 1 : 0))
const startingSphereSpent = computed(() => Math.min(STARTING_SPHERE_POOL, Math.max(0, spheresTotal.value - affinityFreeDot.value)))
const extraSphereDots = computed(() => Math.max(0, spheresTotal.value - affinityFreeDot.value - STARTING_SPHERE_POOL))

const arete = computed<number>({
  get() {
    const c = editingCharacter.value
    return c?.arete || baseArete.value
  },
  set(v) {
    const c = editingCharacter.value
    if (!c) return
    const maxSphere = Math.max(...spheresOrder.map((s) => getSphere(s)))
    const minAllowed = Math.max(baseArete.value, maxSphere)
    c.arete = Math.max(minAllowed, Math.min(ARETE_MAX, v | 0))
  },
})

const willpower = computed<number>({
  get() {
    const c = editingCharacter.value
    return c?.willpower || baseWill.value
  },
  set(v) {
    const c = editingCharacter.value
    if (!c) return
    c.willpower = Math.max(baseWill.value, v | 0)
  },
})

const quintessence = computed<number>({
  get() {
    const c = editingCharacter.value
    return c?.quintessence || baseQuint.value
  },
  set(v) {
    const c = editingCharacter.value
    if (!c) return
    c.quintessence = Math.max(baseQuint.value, v | 0)
  },
})

const costArete = computed(() => Math.max(0, arete.value - baseArete.value) * COST.aretePerDot)
const costWill = computed(() => Math.max(0, willpower.value - baseWill.value) * COST.willPerDot)
const costSpheres = computed(() => extraSphereDots.value * COST.spherePerDot)
const costQuint = computed(() => {
  const bought = Math.max(0, quintessence.value - baseQuint.value)
  return Math.ceil(bought / 4) * COST.quintPerFour
})

const totalFreebieCost = computed(() => costArete.value + costSpheres.value + costWill.value + costQuint.value)
const freebiesAvailable = computed(() => editingCharacter.value?.freebiePoints ?? 0)
const freebiesLeft = computed(() => freebiesAvailable.value - totalFreebieCost.value)

const areteMin = computed(() => {
  const maxSphere = Math.max(...spheresOrder.map((s) => getSphere(s)))
  return Math.max(baseArete.value, maxSphere)
})

function isSphereOptionDisabled(s: M20Sphere, candidate: number): boolean {
  if (candidate === getSphere(s)) return false
  if (candidate < 0) return true
  if (candidate > arete.value) return true

  const current = getSphere(s)
  const newTotal = spheresTotal.value - current + candidate

  let newHasAffinity = affinitySatisfied.value
  if (hasAffinityRequirement.value) {
    newHasAffinity = affinityList.value.some((t) => {
      const v = t === s ? candidate : getSphere(t)
      return v > 0
    })
  }

  const newAffinityFree = hasAffinityRequirement.value && newHasAffinity ? 1 : 0
  const newExtra = Math.max(0, newTotal - newAffinityFree - STARTING_SPHERE_POOL)
  const newCostSpheres = newExtra * COST.spherePerDot

  const newTotalCost = costArete.value + costWill.value + costQuint.value + newCostSpheres
  return newTotalCost > freebiesAvailable.value
}

const canGoNext = computed(() => {
  const poolOk = startingSphereSpent.value === STARTING_SPHERE_POOL
  return poolOk && affinitySatisfied.value && freebiesLeft.value >= 0
})

function onBeforeNext() {
  const c = editingCharacter.value
  if (!c) return
  c.freebiePoints = (c.freebiePoints || 0) - totalFreebieCost.value
  c.quintessence = quintessence.value
}
</script>

<template>
  <EditorForm :can-go-next="canGoNext" :is-finish="true" @before-next="onBeforeNext">
    <div class="finishing-view" v-if="editingCharacter">
      <div class="card header">
        <h4>Letzte Schritte</h4>
        <p>
          Verteile <strong>6 Sphärenpunkte</strong> (mind. 1 Punkt in eine
          <em v-if="hasAffinityRequirement">Affinitätssphäre deiner Tradition</em>
          <em v-else>beliebige Sphäre</em>).
          <br/>
          <strong>Arete (Erleuchtung)</strong> startet bei 1 (max. 3) und kann mit Freebies erhöht werden.
          <strong>Willenskraft</strong> startet bei 5.
          <strong>Quintessenz</strong> entspricht deinem <strong>Avatar</strong>-Rang.
          <br/>
          Du kannst hier Freebies für <strong>Arete (Erleuchtung)</strong>, <strong>Sphären</strong>,
          <strong>Willenskraft</strong> und <strong>Quintessenz</strong> ausgeben.
          Freebies für <strong>Attribute</strong>, <strong>Fähigkeiten</strong> und
          <strong>Hintergründe</strong> kannst du auch später noch verwenden.
        </p>

        <div class="costs">
          <div><strong>Freebie-Kosten</strong></div>
          <ul>
            <li>Arete (Erleuchtung): <strong>4</strong> pro Punkt (max. 3 gesamt)</li>
            <li>Sphäre: <strong>7</strong> pro Punkt (nur <em>über</em> die 6 Startpunkte hinaus)</li>
            <li>Willenskraft: <strong>1</strong> pro Punkt</li>
            <li>Quintessenz: <strong>1</strong> pro <strong>4</strong> Punkte</li>
          </ul>
        </div>

        <div class="freebies">
          Verfügbar: <strong>{{ freebiesAvailable }}</strong> —
          Geplant: <strong>{{ totalFreebieCost }}</strong> —
          Übrig: <strong :class="{neg: freebiesLeft < 0}">{{ freebiesLeft }}</strong>
        </div>
      </div>

      <div class="grid trio">
        <div class="card">
          <h6>Arete (Erleuchtung) <TipButton content="Arete ist der göttliche Funke, die Exzellenz, die einen Magus von gewöhnlichen Menschen unterscheidet. Sie ist Ausdruck seines Erwachens, seiner inneren Größe und seines Weges zur Vollendung. Manche nennen es Erleuchtung, andere Vollkommenheit oder einfach nur Genialität – doch allen ist gemeinsam, dass Arete die Fähigkeit ist, die Welt nach dem eigenen Willen zu formen.

Die Reise beginnt auf der Stufe des Schläfers, der noch in den Illusionen der Welt gefangen ist. Mit dem Erwachen wird er Initiiert, erhält den ersten Blick hinter den Schleier und wächst mit Begabung und Schulung zu einem disziplinierten Anwender seiner Künste. Wer weiter voranschreitet, wird gebieterisch in seinem Auftreten, meistert schließlich die Kunst und erlangt tiefes Verständnis. Auf den höchsten Stufen folgt Weisheit, wahre Erleuchtung und schließlich die Transzendenz, in der der Magus selbst zur Verkörperung der Magie wird.

Regeln: Dein Arete-Wert bestimmt, wie viele Würfel du für Zaubereffekte nutzt und wie mächtig deine Magie sein kann. Keine Sphäre darf höher sein als dein Arete. Um Arete zu steigern, musst du eine Suche bestehen – eine visionäre Prüfung, in der du dich selbst überwindest. Auf niedrigen Stufen bist du an Instrumente und Rituale gebunden; mit wachsender Erleuchtung kannst du diese Hilfsmittel Stück für Stück ablegen, bis du keine Werkzeuge mehr brauchst, sondern selbst zum Katalysator der Wirklichkeit wirst."/></h6>
          <div class="row">
            <button class="btn incdec" :disabled="arete <= areteMin" @click="arete = arete - 1">−</button>
            <div class="value">{{ arete }}</div>
            <button
              class="btn incdec"
              :disabled="arete >= ARETE_MAX || (totalFreebieCost + COST.aretePerDot) > freebiesAvailable"
              @click="arete = arete + 1"
            >+</button>
          </div>
          <small>Basis: {{ baseArete }} &nbsp;|&nbsp; Kosten: {{ costArete }}</small>
        </div>

        <div class="card">
          <h6>Willenskraft <TipButton content="Willenskraft ist der eiserne Wille, die innere Stärke, mit der ein Magus die Realität beugt. Sie ist Selbstvertrauen, Entschlossenheit und die Fähigkeit, trotz Schmerz, Zweifel und Furcht weiterzumachen. Ohne Willenskraft kann ein Erwachter seine Einsichten nicht umsetzen – Wissen allein reicht nicht, man muss auch den Mut und die Energie haben, den eigenen Willen durchzusetzen.

Regeln: Willenskraft besteht aus einem festen Wert (dein permanenter Wille) und einem Vorrat an Punkten (dein temporärer Wille). Du kannst Punkte ausgeben, um automatische Erfolge zu erzielen, Verletzungen zu ignorieren oder Zwängen zu widerstehen. Manche Effekte wie Paradox oder Mind-Magie kannst du mit einem Willenskraftwurf abwehren. Verlierst du Willenskraft durch Traumata oder Erschöpfung, sinkt auch die Grenze deiner Magie – denn kein Arete ist stärker als dein dauerhafter Wille. Willenskraft regenerierst du durch Schlaf, durch große Erfolge oder wenn du nach deiner wahren Natur handelst."/></h6>
          <div class="row">
            <button class="btn incdec" :disabled="willpower <= baseWill" @click="willpower = willpower - 1">−</button>
            <div class="value">{{ willpower }}</div>
            <button
              class="btn incdec"
              :disabled="(totalFreebieCost + COST.willPerDot) > freebiesAvailable"
              @click="willpower = willpower + 1"
            >+</button>
          </div>
          <small>Basis: {{ baseWill }} &nbsp;|&nbsp; Kosten: {{ costWill }}</small>
        </div>

        <div class="card">
          <h6>Quintessenz <TipButton content="Quintessenz ist die reine Lebensenergie des Kosmos – die Substanz, aus der alles besteht. Sie fließt durch die Schöpfung, gespeist von Knotenpunkten und Artefakten, und kann von einem Magus aufgenommen und gelenkt werden. Quintessenz ist die Währung der Magie: Mit ihr verstärkst du Zauber, senkst Schwierigkeiten und gibst deinen Effekten Dauer und Kraft. Dein Avatar ist das Gefäß, in dem du sie speichern kannst.

Doch wo Licht ist, ist auch Schatten: Paradoxon ist die Rückkopplung der Realität gegen jene, die sie zu offen verbiegen. Jedes Mal, wenn du „vulgäre“ Magie vor den Augen der Welt wirkst oder einen Zauber verpatzt, sammelst du Paradoxon an. Zu viel davon und die Wirklichkeit schlägt zurück – mit Rückstößen, Flüchen, bizarren Mutationen oder Wahnsinn. Erreichst du einen kritischen Punkt, kann dich Paradoxon in Quiet stürzen, dich zerreißen oder dich sogar in einen Marauder verwandeln.

Regeln: Du speicherst Quintessenz entsprechend deines Avatar-Werts und kannst sie beim Wirken einsetzen. Paradoxon sammelst du als Punkte an; jeder Punkt erhöht die Gefahr eines Backlash. Ab ca. 20 Punkten bist du ein wandelnder Riss in der Realität. Paradoxon kannst du abbauen, indem du für eine Weile keine Magie wirkst – doch je stärker du die Wirklichkeit brichst, desto stärker wird sie zurückschlagen."/></h6>
          <div class="row">
            <button class="btn incdec" :disabled="quintessence <= baseQuint" @click="quintessence = quintessence - 1">−</button>
            <div class="value">{{ quintessence }}</div>
            <button
              class="btn incdec"
              :disabled="(costArete + costSpheres + costWill + Math.ceil((Math.max(0, (quintessence + 1) - baseQuint)) / 4)) > freebiesAvailable"
              @click="quintessence = quintessence + 1"
            >+</button>
          </div>
          <small>Basis (Avatar): {{ baseQuint }} &nbsp;|&nbsp; Kosten: {{ costQuint }}</small>
        </div>
      </div>

      <div class="card">
        <h6 style="margin-bottom: 1rem">Sphären sind die grundlegenden Bausteine der Magie im Mage: The Ascension-Universum. Jede Sphäre repräsentiert einen Aspekt der Realität, den ein Magus beeinflussen und formen kann. Durch das Studium und die Meisterung dieser Sphären erlangen Magier die Fähigkeit, Wunder zu vollbringen, die die Grenzen des Möglichen sprengen.</h6>

        <div class="spheres-bar">
          <div>Startpool: <strong>{{ startingSphereSpent }}</strong> / {{ STARTING_SPHERE_POOL }}</div>
          <div>Gratis Affinitätspunkt: <strong>{{ affinityFreeDot }}</strong></div>
          <div>Zusatz über Pool: <strong>{{ extraSphereDots }}</strong> (Kosten: {{ costSpheres }})</div>
          <div>Arete-Limit pro Sphäre: <strong>{{ arete }}</strong></div>
          <div v-if="hasAffinityRequirement">
            Affinität erfüllt:
            <strong :class="{ok: affinitySatisfied, bad: !affinitySatisfied}">
              {{ affinitySatisfied ? 'Ja' : 'Nein' }}
            </strong>
          </div>
        </div>

        <div class="spheres-grid">
          <div v-for="s in spheresOrder" :key="s" class="sphere-row">
            <div class="label">
              {{getSphereName(s)}}
              <span v-if="hasAffinityRequirement && affinityList.includes(s)" class="badge">Affinity</span>
            </div>
            <select
              class="form-control"
              :value="getSphere(s)"
              @change="setSphere(s, +($event.target! as any).value)"
            >
              <option
                v-for="n in (arete + 1)"
                :key="n-1"
                :value="n-1"
                :disabled="isSphereOptionDisabled(s, n-1)"
              >{{ n-1 }}</option>
            </select>
          </div>
        </div>
      </div>

      <div class="guards">
        <span v-if="startingSphereSpent !== STARTING_SPHERE_POOL">Bitte verteile alle 6 Sphärenpunkte.</span>
        <span v-else-if="!affinitySatisfied">Mindestens 1 Punkt in eine Affinity-Sphäre deiner Tradition.</span>
        <span v-else-if="freebiesLeft < 0">Zu wenig Freebie-Punkte.</span>
      </div>
    </div>
  </EditorForm>
</template>

<style scoped lang="scss">
.finishing-view {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .card {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    border-radius: 0.75rem;
  }

  .header p { margin: 0; }

  .costs ul {
    margin: 0.25rem 0 0;
    padding-left: 1.25rem;
  }

  .freebies { margin-top: 0.25rem; }
  .freebies .neg { color: #b00020; }

  .grid.trio {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
    gap: 1rem;
  }

  h4, h6 {
    margin-bottom: 0;
  }

  .row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    .btn {
      min-width: 2.25rem;
      height: 2.25rem;
      &.incdec {
        font-size: 1.5rem;
        font-weight: bold;
        padding: 0;
        line-height: 1;
      }
    }
    .value {
      min-width: 3rem;
      text-align: center;
      font-weight: 600;
      font-size: 1.1rem;
    }
  }

  .spheres-bar {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
    gap: 0.5rem;
    align-items: center;

    .ok { color: #2e7d32; }
    .bad { color: #b00020; }
  }

  .spheres-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(22rem, 1fr));
    gap: 0.5rem 1rem;
    margin-top: 0.5rem;
  }

  .sphere-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;

    .label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .badge {
      font-size: 0.7rem;
      padding: 0.1rem 0.4rem;
      border-radius: 0.5rem;
      background: #1a73e8;
      color: white;
    }
    select { width: 6rem; }
  }

  .guards {
    color: #b00020;
    display: flex;
    justify-content: center;
    font-weight: 600;
  }
}
</style>
