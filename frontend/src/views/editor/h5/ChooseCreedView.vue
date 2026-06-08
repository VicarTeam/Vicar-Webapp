<script setup lang="ts">
import { computed } from "vue"
import EditorForm from "@/components/editor/EditorForm.vue"
import TipButton from "@/components/editor/TipButton.vue"
import { creeds, drives } from "@/app/data/h5"
import type { IHunterSheet } from "@/@types/h5"
import { useStore } from "@/app/store"

const store = useStore()
const editingCharacter = computed(() => store.editingCharacter as IHunterSheet | undefined)

const canGoNext = computed(() => {
  const c = editingCharacter.value
  return !!c?.creed && !!c?.drive
})
</script>

<template>
  <EditorForm :can-go-next="canGoNext" next-step="editor-traits">
    <div v-if="editingCharacter" class="creeds-view">
      <div class="card">
        <h6>Credo" <TipButton content="Credos helfen dabei, die Jäger der Spieler von den Organisationen zu unterscheiden. Zu einer Organisation zu gehören, ist ein Job. Ein Credo zu haben, ist eine Lebenseinstellung, eine persönliche Sichtweise. Diese Philosophien, die als Credos bekannt sind, zeigen nicht nur, wie jemand an die Jagd herangeht, sondern auch soziale Gemeinsamkeiten, die es in einer größeren Welt, die nicht weiß, dass es Monster gibt, einfach nicht gibt. Wenn dein Job die Geisterjagd ist, wer könnte dann ein besserer Vertrauter sein als ein anderer Geisterjäger? Glaubensbekenntnisse sind in der Welt präsent und werden von den Mitgliedern als eine Mischung aus Geheimgesellschaft und beruflicher Interessengruppe angesehen. In den meisten Fällen besteht eine Zelle aus Jägern mit unterschiedlichen Glaubensbekenntnissen. Das gibt den Zellen eine breite Palette an Perspektiven und Herangehensweisen, auf die sie zurückgreifen können. Schließlich ist es ein begrenztes Werkzeugkasten, der nur Hämmer enthält." /></h6>

        <select class="form-control" v-model="editingCharacter.creed">
          <option :value="undefined" disabled>Wähle ein Credo</option>
          <option v-for="creed in creeds" :key="creed.id" :value="creed">{{ creed.name }}</option>
        </select>

        <small v-if="editingCharacter.creed">{{ editingCharacter.creed.description }}</small>
        <small v-if="editingCharacter.creed">
          <b style="margin-right: 1rem">Persönlichkeit</b> {{ editingCharacter.creed.personality }}
        </small>
        <small v-if="editingCharacter.creed">
          <b style="margin-right: 1rem">Taktiken</b> {{ editingCharacter.creed.tactics }}
        </small>
        <small v-if="editingCharacter.creed">
          <b style="margin-right: 1rem">Gefahren</b> {{ editingCharacter.creed.dangers }}
        </small>
      </div>

      <div class="card">
        <h6>Antrieb <TipButton content="Jeder Jäger hat einen bestimmten Antrieb, der ihn dazu bringt, gegen das Übernatürliche vorzugehen. Du wählst den Antrieb deines Charakters bei der Charaktererstellung (siehe S. 57) und jeder hat einen starken Einfluss auf die Sichtweise des Jägers. Motivationen können das Credo eines Charakters ergänzen, aber auch eine Opposition dazu andeuten: Jäger sind komplexe Individuen und können sich die Umstände ihrer Erleuchtungsmomente oft nicht aussuchen (obwohl die Spieler das tun ...). Motivationen geben die Charakterisierung des Jägers vor, bestimmen aber auch bestimmte Konsequenzen für einige Ergebnisse, die mit Verzweiflungswürfeln zu tun haben (siehe oben). Diese Liste von Antrieben soll nicht vollständig sein. Zukünftige Hunter-Ergänzungen können zusätzliche Antriebe enthalten, oder die Spieler können gemeinsam mit ihren Storytellern neue erfinden. Neue Triebe sollten sich von den bestehenden unterscheiden und nicht nur eine eng gefasste Situation darstellen. (Ein Trieb, der als „Neugierig” konzipiert ist, sollte zum Beispiel besser als „Neugier” behandelt werden.) Letztendlich sollen Triebe die Jäger in Schwierigkeiten bringen und ihnen gleichzeitig durch Verzweiflungswürfel außergewöhnliches Potenzial bieten." /></h6>

        <select class="form-control" v-model="editingCharacter.drive">
          <option :value="undefined" disabled>Wähle einen Antrieb</option>
          <option v-for="drive in drives" :key="drive.id" :value="drive">{{ drive.name }}</option>
        </select>

        <small v-if="editingCharacter.drive">{{ editingCharacter.drive.description }}</small>
        <small v-if="editingCharacter.drive">
          <b style="margin-right: 1rem">Erlösung</b> {{ editingCharacter.drive.redemption }}
        </small>
      </div>
    </div>
  </EditorForm>
</template>

<style scoped lang="scss">
.creeds-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 5rem;

  .card {
    width: 60rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;

    h6 {
      margin: 0;
      font-weight: bold;
    }

    small {
      display: block;
      max-height: 10rem;
      overflow-y: auto;
      padding-right: 0.5rem;
    }
  }
}
</style>
