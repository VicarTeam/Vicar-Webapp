<script setup lang="ts">
import { computed } from "vue"
import EditorForm from "@/components/editor/EditorForm.vue"
import TipButton from "@/components/editor/TipButton.vue"
import VdzClanSymbol from "@/components/symbols/VdzClanSymbol.vue"
import { vdzBloodlines, vdzClans } from "@/app/data/vdz"
import type { IVdzSheet } from "@/@types/vdz"
import { useStore } from "@/app/store"

const store = useStore()
const editingCharacter = computed(() => store.editingCharacter as IVdzSheet | undefined)

const canGoNext = computed(() => {
  const c = editingCharacter.value
  return !!c && !!c.clan && c.sire.trim().length > 0
})
</script>

<template>
  <EditorForm :can-go-next="canGoNext" next-step="editor-vdz-road" :is-cancel="true">
    <div v-if="editingCharacter" class="page">
      <div class="wrap">
        <div class="form-group center">
          <label class="required">
            Name deines Erzeugers:
            <TipButton title="Wer ist dein Erzeuger?" content="Der Erzeuger ist der Kainit, der dir den Kuss geschenkt hat und dich in die Welt der finsteren Nächte des Jahres 1242 geführt hat. In der mittelalterlichen Welt bindet dich das Vermächtnis stärker als jedes Lehnsverhältnis." />
          </label>
          <input
            class="form-control input"
            type="text"
            placeholder="Name deines Erzeugers"
            v-model="editingCharacter.sire"
          />
        </div>

        <div class="divider"></div>

        <div class="center">
          <label class="required">
            Wähle deinen Clan:
            <TipButton title="Was ist ein Clan?" content="Der Clan ist deine Blutlinie, zurückreichend bis zu den Vorsintflutlichen. Er bestimmt deine Disziplinen, deine Schwäche und deinen Platz in der Gesellschaft der Verdammten des dunklen Zeitalters." />
          </label>
        </div>

        <select class="form-control input" v-model="editingCharacter.clan">
          <optgroup label="Clans">
            <option v-for="clan in vdzClans" :key="'c' + clan.id" :value="clan">{{ clan.name }}</option>
          </optgroup>
          <optgroup v-if="vdzBloodlines.length > 0" label="Blutlinien (selten — mit der Erzählerin absprechen)">
            <option v-for="clan in vdzBloodlines" :key="'b' + clan.id" :value="clan">{{ clan.name }}</option>
          </optgroup>
        </select>

        <div class="card info" v-if="editingCharacter.clan">
          <VdzClanSymbol :clan="editingCharacter.clan" class="symbol" />
          <div class="text">
            <b class="title">{{ editingCharacter.clan.name }}</b>
            <small class="meta"><i>{{ editingCharacter.clan.nickname }}</i></small>

            <div class="desc">{{ editingCharacter.clan.description }}</div>

            <h6 class="sub">Disziplinen:</h6>
            <div class="pills">
              <div class="pill" v-for="d in editingCharacter.clan.disciplines" :key="d">{{ d }}</div>
            </div>

            <h6 class="sub">Schwäche:</h6>
            <div class="weakness">{{ editingCharacter.clan.weakness }}</div>

            <template v-if="editingCharacter.clan.characterCreationHint">
              <h6 class="sub">Charaktererschaffung:</h6>
              <div class="hint">{{ editingCharacter.clan.characterCreationHint }}</div>
            </template>
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

.info {
  margin: 0;
  width: min(55rem, 100%);
  padding: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.10);
  background:
    radial-gradient(900px 420px at 10% 0%, color-mix(in srgb, var(--accent) 10%, transparent), transparent 60%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), transparent 55%),
    linear-gradient(180deg, var(--bg-3), var(--bg-2));
  box-shadow: var(--shadow-hairline), var(--shadow-card);
}

.symbol {
  width: 6rem;
  flex-shrink: 0;
  filter: var(--image-to-primary-color-filter);
  -webkit-user-drag: none;
}

.text {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.title {
  font-size: 1.35rem;
}

.meta {
  color: #b2b2b2;
}

.desc {
  font-size: 1.05rem;
  max-height: 12rem;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
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
  font-size: 1.05rem;
  padding: 0.45rem 0.65rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.10);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), transparent 55%),
    linear-gradient(180deg, var(--bg-3), var(--bg-2));
  box-shadow: var(--shadow-hairline);
}

.weakness,
.hint {
  font-size: 0.95rem;
  opacity: 0.92;
  max-height: 9rem;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}
</style>
