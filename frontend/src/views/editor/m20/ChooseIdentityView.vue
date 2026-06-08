<script setup lang="ts">
import { computed, ref } from "vue"
import EditorForm from "@/components/editor/EditorForm.vue"
import TipButton from "@/components/editor/TipButton.vue"
import { archetypes } from "@/app/data/m20"
import {getEssenceDescription, type IM20Archetype, type IMageSheet} from "@/@types/m20"
import { M20Essence } from "@/@types/m20"
import { useStore } from "@/app/store"

const store = useStore()
const editingCharacter = computed(() => store.editingCharacter as IMageSheet | undefined)

const concept = ref("")
const essence = ref<M20Essence>(M20Essence.None)

const nature = ref<IM20Archetype>({ id: 0, name: "", description: "" })
const natureCustomName = ref("")
const natureCustomDescription = ref("")

const demeanor = ref<IM20Archetype>({ id: 0, name: "", description: "" })
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

  c.concept = concept.value.trim()
  c.essence = essence.value
}

const canGoNext = computed(() => {
  const natureOk =
    nature.value.id !== 0 || (natureCustomName.value.trim().length > 0 && natureCustomDescription.value.trim().length > 0)
  const demeanorOk =
    demeanor.value.id !== 0 ||
    (demeanorCustomName.value.trim().length > 0 && demeanorCustomDescription.value.trim().length > 0)

  return concept.value.trim().length > 0 && essence.value !== M20Essence.None && natureOk && demeanorOk
})
</script>

<template>
  <EditorForm :can-go-next="canGoNext" next-step="editor-tradition" @before-next="onBeforeNext">
    <div v-if="editingCharacter" class="identity-wrapper">
      <div class="card" style="width: 30rem">
        <h6>Konzept <TipButton content="Das Konzept deines Charakters ist oftmals einfach nur der Beruf des Charakters, kann und stellt jedoch zusätzlich die Rolle in der Welt dar. Es ist eine kurze Phrase, die den Kern dessen zusammenfasst, wer dein Charakter ist und was er tut. Beispiele sind Unternehmenshai, Street Magier, Verlorener Adliger oder Rebellischer Künstler. Dein Konzept sollte dir helfen, Entscheidungen über die Persönlichkeit, die Ziele und die Handlungen deines Charakters zu treffen. Es sollte auch als Ausgangspunkt für die Entwicklung der Hintergrundgeschichte deines Charakters dienen." /></h6>
        <textarea v-model="concept" class="form-control" rows="6" style="width: 100%; resize: none"></textarea>
      </div>

      <div class="card" style="width: 50rem">
        <h6>Persönlichkeitsarchetypen: Wesen und Verhalten <TipButton content="Basierend auf diesen Tendenzen hat jede Figur Persönlichkeitsarchetypen: ein Wesen und ein Verhalten, die zeigen, wie sie mit ihrer Welt interagiert. Das Wesen spiegelt das Innere der Figur wider, während das Verhalten zeigt, wie sie sich anderen Leuten präsentiert. Je nach Figur können diese beiden Eigenschaften ziemlich ähnlich oder total unterschiedlich sein. Unser Unternehmenshai könnte sich zum Beispiel als Kreuzritter präsentieren, der eine bessere Welt aufbaut; unter dieser Fassade ist er aber eigentlich ein Trickster, der es liebt, die Erwartungen seiner Kollegen zu unterlaufen. Unser Unternehmenshai zum Beispiel könnte sich als Kreuzritter präsentieren, der eine bessere Welt aufbaut; unter diesem Verhalten ist er jedoch eigentlich ein Trickster, der Freude daran hat, die Erwartungen seiner Kollegen zu unterlaufen. Die Natur eines Magiers hängt normalerweise stark von seiner Essenz ab. Diese Tendenz beeinflusst, was der Charakter wirklich will und wertschätzt. Im Laufe der Chronik wirst du die Willenskraft deines Charakters Willenskraft-Eigenschaft, indem du Dinge tust, die seine Natur stärken und die Bedürfnisse seines inneren Selbst befriedigen. Das Auftreten hingegen kann eine reine Fassade sein. Es könnte ein ehrliches Spiegelbild der inneren Landschaft des Magiers sein, aber wahrscheinlich ist es das nicht. Selbst die ausgeglichensten Menschen schützen ihr wahres Ich vor der Öffentlichkeit. Besonders in der tückischen Welt der Erwachten sind Leute, die ihre intimen Wahrheiten offenbaren – und damit der Welt einen wahren Namen geben, den sie gegen sie verwenden kann – sind ziemlich selten. Zusammengenommen sagen dir diese miteinander verbundenen Elemente viel darüber, wer dein Charakter ist, was er braucht, wie er sich verhält und wer seine Freunde und Feinde sein könnten. Ein Unternehmenshai mit dem Namen Malcolm Jamal Leonard könnte ein Ngoma Trickster sein, der seine Führungsposition und sein Crusader , um große Unternehmen zu infiltrieren und zu untergraben, um ein Ziel zu verfolgen, das außer ihm niemand versteht. Seine Questing Essence inspiriert ihn dazu, eine bessere Welt zu schaffen ... nachdem er die Herrscher der aktuellen Welt gestürzt und sich und seine Verbündeten dabei bereichert hat! Sobald du weißt, wer dein Charakter ist, finde heraus, was er tun kann." /></h6>

        <div style="display: flex; gap: 4rem; justify-content: space-between">
          <div class="archetype-col">
            <label style="margin-bottom: 0">Wesen:</label>
            <select v-model="nature" class="form-control" style="width: 100%">
              <option :value="{ id: 0, name: '', description: '' }">Benutzerdefiniert</option>
              <option v-for="a in archetypes" :key="a.id" :value="a">{{ a.name }}</option>
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
            <label style="margin-bottom: 0">Verhalten:</label>
            <select v-model="demeanor" class="form-control">
              <option :value="{ id: 0, name: '', description: '' }">Benutzerdefiniert</option>
              <option v-for="a in archetypes" :key="a.id" :value="a">{{ a.name }}</option>
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

      <div class="card" style="width: 30rem">
        <h6>Essenz <TipButton content="Noch wichtiger für die Kernidentität deines Magiers ist die Essenz seines Avatars: der innere Antrieb, der seine Einstellung zum Leben und zur Magie prägt. Dieses mystische innere Selbst gibt dir einen groben Überblick über die allgemeine Persönlichkeit deines Magiers. Ein dynamischer Magier würde zum Beispiel seine Ziele mit intensiver Leidenschaft verfolgen, während ein musterorientierter Magier nach Stabilität und Beständigkeit streben würde. Übrigens solltest du daran denken, dass jeder Magiercharakter mindestens einen Punkt im Avatar-Hintergrund haben sollte. Starke Avatare (also solche mit mehr Punkten in dieser Eigenschaft) drücken ein stärkeres Gefühl der Essenz durch den Magier aus. Ein Charakter mit nur einem Punkt in seinem Avatar wird zum Beispiel gelegentlich seine dynamische Essenz spüren, und einer mit Avatar 5 wäre so dynamisch, dass er selten länger als ein paar Minuten still sitzen könnte." /></h6>

        <select v-model="essence" class="form-control">
          <option :value="M20Essence.None" disabled>Auswählen</option>
          <option :value="M20Essence.Dynamic">Dynamisch</option>
          <option :value="M20Essence.Static">Statisch</option>
          <option :value="M20Essence.Primordial">Ursprünglich</option>
          <option :value="M20Essence.Questing">Suchend</option>
        </select>

        <small v-if="essence !== M20Essence.None">{{ getEssenceDescription(essence) }}</small>
      </div>
    </div>
  </EditorForm>
</template>

<style scoped lang="scss">
.identity-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-evenly;
  align-items: center;

  .card {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    h6 {
      margin: 0 0 0.5rem;
      font-weight: bold;
      text-align: center;
    }

    .archetype-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      justify-content: flex-start;
      align-items: center;
    }
  }
}
</style>
