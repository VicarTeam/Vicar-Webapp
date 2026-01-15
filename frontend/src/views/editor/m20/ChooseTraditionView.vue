<script setup lang="ts">
import { computed, ref, watch } from "vue"
import EditorForm from "@/components/editor/EditorForm.vue"
import TipButton from "@/components/editor/TipButton.vue"
import TraditionSymbol from "@/components/symbols/TraditionSymbol.vue"
import SphereSymbol from "@/components/symbols/SphereSymbol.vue"
import {
  getSphereDescription,
  getSphereName,
  getTraditionTypeDescription, getTraditionTypeName,
  getTraditionTypeSubname,
  type IM20Tradition,
  type IMageSheet
} from "@/@types/m20"
import { M20TraditionType } from "@/@types/m20"
import { traditions as allTraditions } from "@/app/data/m20"
import { useStore } from "@/app/store"

const props = withDefaults(defineProps<{ forced?: boolean }>(), { forced: false })

const store = useStore()
const editingCharacter = computed(() => store.editingCharacter as IMageSheet | undefined)

const type = ref<M20TraditionType>(M20TraditionType.Tradition)

const selectableTraditions = computed(() => allTraditions.filter((x) => x.type === type.value))
const tradition = ref<IM20Tradition>(selectableTraditions.value[0]!)

watch(type, () => {
  tradition.value = selectableTraditions.value[0]!
})

function getOtherTypes(t: M20TraditionType) {
  if (t === M20TraditionType.Tradition) return [M20TraditionType.Technocracy, M20TraditionType.Disparate]
  if (t === M20TraditionType.Technocracy) return [M20TraditionType.Disparate, M20TraditionType.Tradition]
  return [M20TraditionType.Tradition, M20TraditionType.Technocracy]
}

function onBeforeNext() {
  const c = editingCharacter.value
  if (!c) return
  c.tradition = tradition.value
}

const canGoNext = computed(() => true)
</script>

<template>
  <EditorForm :can-go-next="canGoNext" :show-only="forced" next-step="editor-m20-attributes" @before-next="onBeforeNext">
    <div v-if="editingCharacter" class="tradition-view">
      <div class="card" style="width: 50rem">
        <h6 style="text-align: center">
          Allianz <TipButton content="Die Allianzen/Bündnisse sind die großen Fraktionen der Magi. Jede von ihnen steht für ein anderes Paradigma, also für eine eigene Wahrheit darüber, wie die Welt funktioniert und warum Magie möglich ist. Sie sind Schulen, Gemeinschaften und Glaubensrichtungen zugleich. Wenn ein Magus einer Tradition beitritt, bedeutet das mehr als nur eine Zugehörigkeit – er übernimmt ein Erbe, eine Geschichte und eine bestimmte Art, Wirklichkeit zu formen. Eine Tradition bestimmt damit: wie du Magie beschreibst und wirkst, welche Sphäre deine „natürliche Stärke“ ist (Affinitätssphären), und mit wem du in der Welt von Mage verbündet oder verfeindet bist." />
        </h6>

        <select v-model="type" class="form-control" :disabled="forced">
          <option :value="M20TraditionType.Tradition">Rat der neun mystischen Traditionen</option>
          <option :value="M20TraditionType.Technocracy">Technokratische Union</option>
          <option :value="M20TraditionType.Disparate">Ungleiche Allianz</option>
        </select>

        <small>{{ getTraditionTypeDescription(type) }}</small>
      </div>

      <div class="card" style="width: 70%; margin-top: 0.5rem">
        <h6 style="text-align: center">{{ getTraditionTypeSubname(type) }}</h6>

        <select v-model="tradition" class="form-control" :disabled="forced">
          <option v-for="item in selectableTraditions" :key="item.id" :value="item">
            {{ item.name }}
          </option>
        </select>

        <div style="display: flex; gap: 2rem; margin-top: 1rem">
          <TraditionSymbol :tradition="tradition" />

          <div style="display: flex; flex-direction: column; gap: 1rem">
            <small>{{ tradition.description }}</small>

            <small><b style="margin-right: 1rem">Organisation</b> {{ tradition.organization }}</small>
            <small><b style="margin-right: 1rem">Initiation</b> {{ tradition.initiation }}</small>
            <small><b style="margin-right: 1rem">Fokus</b> {{ tradition.focus }}</small>

            <div
              style="padding-left: 1rem; padding-top: 0.5rem; padding-bottom: 0.5rem; border-left: 4px solid var(--primary-color); display: flex; flex-direction: column; gap: 0.5rem"
            >
              <small><b style="margin-right: 1rem">Meinung über andere Allianzen (gleiches Bündnis)</b> {{ tradition.stereotypes.fellowTraditions }}</small>
              <small>
                <b style="margin-right: 1rem">{{ `Meinung über ${getTraditionTypeName(getOtherTypes(type)[0]!)}` }}</b>
                {{ tradition.stereotypes.disparates }}
              </small>
              <small>
                <b style="margin-right: 1rem">{{ `Meinung über ${getTraditionTypeName(getOtherTypes(type)[1]!)}` }}</b>
                {{ tradition.stereotypes.technocracy }}
              </small>
            </div>

            <div v-if="tradition.affinitySpheres.length > 0" style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1rem">
              <h6 style="font-size: 1.1rem; text-align: center">
                <b>Affinitätssphären</b>
                <TipButton content="Sphären sind die grundlegenden Bausteine der Magie im Mage: The Ascension-Universum. Jede Sphäre repräsentiert einen Aspekt der Realität, den ein Magus beeinflussen und formen kann. Durch das Studium und die Meisterung dieser Sphären erlangen Magier die Fähigkeit, Wunder zu vollbringen, die die Grenzen des Möglichen sprengen." />
              </h6>

              <div style="display: flex; flex-direction: row; gap: 1rem; justify-content: center; align-content: center">
                <div
                  v-for="sphere in tradition.affinitySpheres"
                  :key="sphere"
                  style="display: flex; flex-direction: column; align-items: center; gap: 0.25rem"
                >
                  <SphereSymbol :sphere="sphere" />
                  <small>{{ getSphereName(sphere) }} <TipButton :content="getSphereDescription(sphere)" /></small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </EditorForm>
</template>

<style scoped lang="scss">
.tradition-view {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  justify-content: center;

  .card {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    h6 {
      margin: 0 0 0.5rem;
      font-weight: bold;
    }

    select option {
      text-align: center;
    }
  }
}
</style>
