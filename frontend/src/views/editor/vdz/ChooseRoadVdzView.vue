<script setup lang="ts">
import { computed, ref } from "vue"
import EditorForm from "@/components/editor/EditorForm.vue"
import TipButton from "@/components/editor/TipButton.vue"
import { vdzArchetypes, vdzRoads } from "@/app/data/vdz"
import { vdzVirtueHelp } from "@/libs/data/vdz-helpers"
import type { IVdzArchetype, IVdzSheet } from "@/@types/vdz"
import { useStore } from "@/app/store"

const store = useStore()
const editingCharacter = computed(() => store.editingCharacter as IVdzSheet | undefined)

const showSins = ref(false)

const nature = ref<IVdzArchetype>({ id: 0, name: "", description: "" })
const natureCustomName = ref("")
const natureCustomDescription = ref("")

const demeanor = ref<IVdzArchetype>({ id: 0, name: "", description: "" })
const demeanorCustomName = ref("")
const demeanorCustomDescription = ref("")

function onBeforeNext() {
  const c = editingCharacter.value
  if (!c) return

  c.nature =
    nature.value.id !== 0
      ? nature.value
      : { id: 0, name: natureCustomName.value.trim(), description: natureCustomDescription.value.trim() }

  c.demeanor =
    demeanor.value.id !== 0
      ? demeanor.value
      : { id: 0, name: demeanorCustomName.value.trim(), description: demeanorCustomDescription.value.trim() }
}

const canGoNext = computed(() => {
  const c = editingCharacter.value
  if (!c || !c.road) return false

  const natureOk =
    nature.value.id !== 0 || (natureCustomName.value.trim().length > 0 && natureCustomDescription.value.trim().length > 0)
  const demeanorOk =
    demeanor.value.id !== 0 ||
    (demeanorCustomName.value.trim().length > 0 && demeanorCustomDescription.value.trim().length > 0)

  return natureOk && demeanorOk
})
</script>

<template>
  <EditorForm :can-go-next="canGoNext" next-step="editor-vdz-attributes" @before-next="onBeforeNext">
    <div v-if="editingCharacter" class="page">
      <div class="wrap">
        <div class="center">
          <label class="required">
            Wähle deinen Weg:
            <TipButton title="Was ist ein Weg?" content="Die Wege sind die Moralvorstellungen der Kainiten des dunklen Zeitalters. Statt der Menschlichkeit folgt jeder Vampir einem Weg, der ihm hilft, der Bestie zu widerstehen. Der Weg bestimmt deine Tugenden, deine Aura und die Sünden, die deinen Wegwert senken." />
          </label>
        </div>

        <select class="form-control input" v-model="editingCharacter.road">
          <option v-for="road in vdzRoads" :key="road.id" :value="road">{{ road.name }} ({{ road.latinName }})</option>
        </select>

        <div class="card info" v-if="editingCharacter.road">
          <div class="text">
            <b class="title">{{ editingCharacter.road.name }} <i class="latin">({{ editingCharacter.road.latinName }})</i></b>
            <small v-if="editingCharacter.road.followerName" class="meta">Anhänger: {{ editingCharacter.road.followerName }}</small>

            <div class="desc">{{ editingCharacter.road.description }}</div>

            <h6 class="sub">
              Tugenden dieses Wegs:
              <TipButton content="Dein Weg legt fest, welches Tugendpaar dich der Bestie widerstehen lässt: Gewissen oder Überzeugung sowie Selbstbeherrschung oder Instinkt. Mut hat jeder Kainit. Aus den beiden Weg-Tugenden ergibt sich später dein Wegwert. Die Punkte verteilst du im nächsten Vorteile-Schritt." />
            </h6>
            <div class="pills">
              <div class="pill">{{ editingCharacter.road.virtues.conscienceOrConviction }} <TipButton :content="vdzVirtueHelp(editingCharacter.road.virtues.conscienceOrConviction)" /></div>
              <div class="pill">{{ editingCharacter.road.virtues.selfControlOrInstinct }} <TipButton :content="vdzVirtueHelp(editingCharacter.road.virtues.selfControlOrInstinct)" /></div>
              <div class="pill">Mut <TipButton :content="vdzVirtueHelp('Mut')" /></div>
            </div>

            <h6 class="sub">Aura: {{ editingCharacter.road.aura.name }}</h6>
            <div class="aura">{{ editingCharacter.road.aura.description }}</div>

            <h6 class="sub">Moralvorstellungen:</h6>
            <ul class="ethics">
              <li v-for="(e, i) in editingCharacter.road.ethics" :key="i">{{ e }}</li>
            </ul>

            <button class="btn sins-toggle" @click="showSins = !showSins">
              <i class="fas fa-chevron-down" :class="showSins ? 'fa-rotate-180' : ''" />
              Sündenhierarchie
            </button>

            <table v-if="showSins" class="table sins">
              <thead>
              <tr>
                <th>Wegwert</th>
                <th>Moralische Schwelle</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="s in editingCharacter.road.hierarchyOfSins" :key="s.rating">
                <td>{{ s.rating }}</td>
                <td>{{ s.sin }}</td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="divider"></div>

        <div class="card archetypes">
          <h6 class="center">
            Wesen und Verhalten
            <TipButton content="Das Wesen zeigt, wer dein Charakter im Innersten ist – über es gewinnst du Willenskraft zurück. Das Verhalten ist die Maske, die er der Welt zeigt. Beide dürfen sich unterscheiden." />
          </h6>

          <div class="archetype-row">
            <div class="archetype-col">
              <label>Wesen:</label>
              <select v-model="nature" class="form-control">
                <option :value="{ id: 0, name: '', description: '' }">Benutzerdefiniert</option>
                <option v-for="a in vdzArchetypes" :key="a.id" :value="a">{{ a.name }}</option>
              </select>

              <input v-if="nature.id === 0" v-model="natureCustomName" class="form-control" placeholder="Name" />
              <textarea
                v-if="nature.id === 0"
                v-model="natureCustomDescription"
                class="form-control"
                placeholder="Beschreibung"
                rows="4"
                style="width: 100%; resize: none"
              ></textarea>
              <small v-if="nature.id !== 0">{{ nature.description }}</small>
            </div>

            <div class="archetype-col">
              <label>Verhalten:</label>
              <select v-model="demeanor" class="form-control">
                <option :value="{ id: 0, name: '', description: '' }">Benutzerdefiniert</option>
                <option v-for="a in vdzArchetypes" :key="a.id" :value="a">{{ a.name }}</option>
              </select>

              <input v-if="demeanor.id === 0" v-model="demeanorCustomName" class="form-control" placeholder="Name" />
              <textarea
                v-if="demeanor.id === 0"
                v-model="demeanorCustomDescription"
                class="form-control"
                placeholder="Beschreibung"
                rows="4"
                style="width: 100%; resize: none"
              ></textarea>
              <small v-if="demeanor.id !== 0">{{ demeanor.description }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </EditorForm>
</template>

<style scoped lang="scss">
.page {
  width: 100%;
  height: 100%;
  padding: clamp(1rem, 4vw, 5rem);
  display: flex;
  justify-content: center;
}

.wrap {
  width: min(1100px, 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.center {
  text-align: center;
}

.input {
  width: min(30rem, 100%);
}

.divider {
  width: min(760px, 100%);
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 0.25rem 0;
}

.info,
.archetypes {
  margin: 0;
  width: min(55rem, 100%);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.10);
  background:
    radial-gradient(900px 420px at 10% 0%, color-mix(in srgb, var(--accent) 10%, transparent), transparent 60%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), transparent 55%),
    linear-gradient(180deg, var(--bg-3), var(--bg-2));
  box-shadow: var(--shadow-hairline), var(--shadow-card);
}

.text {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.title {
  font-size: 1.35rem;

  .latin {
    font-size: 1rem;
    font-weight: normal;
    color: #b2b2b2;
  }
}

.meta {
  color: #b2b2b2;
}

.desc,
.aura {
  font-size: 1rem;
  opacity: 0.95;
}

.sub {
  margin: 0.25rem 0 0;
  font-weight: bolder;
  font-family: Cinzel, serif;
  letter-spacing: 0.02em;
}

.pills {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.pill {
  font-size: 1rem;
  padding: 0.4rem 0.65rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.10);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), transparent 55%),
    linear-gradient(180deg, var(--bg-3), var(--bg-2));
  box-shadow: var(--shadow-hairline);
}

.ethics {
  margin: 0;
  padding-left: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.sins-toggle {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.sins {
  width: 100%;
}

.archetypes {
  gap: 1rem;

  h6 {
    margin: 0;
    font-weight: bold;
  }

  .archetype-row {
    display: flex;
    gap: 3rem;
    justify-content: space-between;

    @media (max-width: 800px) {
      flex-direction: column;
      gap: 1.5rem;
    }
  }

  .archetype-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    align-items: center;

    label {
      margin: 0;
    }

    select,
    input {
      width: 100%;
    }
  }
}
</style>
