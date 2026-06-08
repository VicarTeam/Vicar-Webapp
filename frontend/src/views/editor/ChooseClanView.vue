<script setup lang="ts">
import { computed } from "vue"
import EditorForm from "@/components/editor/EditorForm.vue"
import TipButton from "@/components/editor/TipButton.vue"
import Bullet from "@/components/Bullet.vue"
import ClanSymbol from "@/components/symbols/ClanSymbol.vue"
import DataManager from "@/libs/data/data-manager"
import PTActionHandler from "@/libs/ptaction-handler"
import type { IClan, ICharacter } from "@/@types/models"
import {useStore} from "@/app/store.ts";

const store = useStore()

function applyClanActions() {
  const char = store.editingCharacter as ICharacter | undefined
  if (!char || !char.clan) return
  for (const action of char.clan.actions) {
    PTActionHandler.handle(char, action)
  }
}

const canGoNext = computed(() => {
  const char = store.editingCharacter as ICharacter | undefined
  return !!char && !!char.clan && char.sire.trim().length > 0
})

const clans = computed<IClan[]>(() => {
  const char = store.editingCharacter as ICharacter | undefined
  let books: any[] = DataManager.selectedLanguage.books
  if (char) books = books.filter((b) => char.books.includes(b.id))
  return books
    .map((b) => b.clans)
    .flat()
    .filter((b: any) => b.id >= 0)
    .sort((a: any, b: any) => a.name.localeCompare(b.name))
})
</script>

<template>
  <EditorForm
    :can-go-next="canGoNext"
    next-step="editor-predator-type"
    :is-cancel="true"
    preserve-state-on-back
    @before-next="applyClanActions"
  >
    <div v-if="store.editingCharacter" class="page">
      <div class="wrap">
        <div class="form-group center">
          <label class="required">
            Name deines Erzeugers:
            <TipButton title="Wer ist dein Erzeuger?" content="Der Erzeuger ist der Blutsverwandte, der dir die Umarmung geschenkt hat. Dich zu dem gemacht hat, was du jetzt bist: ein Vampir." />
          </label>
          <input
            class="form-control input"
            type="text"
            placeholder="Name deines Erzeugers"
            v-model="(store.editingCharacter as ICharacter).sire"
          />
        </div>

        <div class="divider"></div>

        <div class="center">
          <label class="required">
            Wähle deinen Clan:
            <TipButton title="Was ist ein Clan?" content="Der Clan beschreibt deine Zugehörigkeit in der Domäne. Sowas wie ein Kult beschreibt jedoch der Clan ebenso deine Disziplinen, also die übernatürlichen Fähigkeiten, die ein Vampir besitzt." />
          </label>
        </div>

        <div class="card info" v-if="(store.editingCharacter as ICharacter).clan">
          <ClanSymbol :clan="(store.editingCharacter as ICharacter).clan" class="symbol" />
          <div class="text">
            <b class="title">{{ (store.editingCharacter as ICharacter).clan.name }}</b>
            <small class="meta">
              <span>"<i>{{ (store.editingCharacter as ICharacter).clan.slogan }}</i>"</span> <bullet />
              <i>Fluch: </i>
              <TipButton :content="(store.editingCharacter as ICharacter).clan.curse" />
            </small>

            <div class="desc">{{ (store.editingCharacter as ICharacter).clan.description }}</div>

            <h6 class="sub">Disziplinen:</h6>

            <div class="disciplines" v-if="(store.editingCharacter as ICharacter).clan.disciplines.length < 11">
              <div class="pill" v-for="d in (store.editingCharacter as ICharacter).clan.disciplines" :key="d.id">
                {{ d.name }} <TipButton :content="d.summary" />
              </div>
            </div>

            <div class="disciplines" v-else>
              <div class="pill">Alle Disziplinen</div>
            </div>
          </div>
        </div>

        <div class="clans">
          <button
            class="clan"
            v-for="clan in clans"
            :key="clan.id"
            type="button"
            @click="(store.editingCharacter as ICharacter).clan = clan"
          >
            <ClanSymbol :clan="clan" class="clan-symbol" />
            <small>{{ clan.name }}</small>
          </button>
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
  width: min(1200px, 100%);
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
  gap: 1rem;
  display: flex;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.10);
  background:
    radial-gradient(900px 420px at 10% 0%, color-mix(in srgb, var(--accent) 10%, transparent), transparent 60%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), transparent 55%),
    linear-gradient(180deg, var(--bg-3), var(--bg-2));
  box-shadow: var(--shadow-hairline), var(--shadow-card);
}

.symbol {
  width: 7rem;
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
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.desc {
  font-size: 1.05rem;
  max-height: 14rem;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}

.sub {
  margin: 0.25rem 0 0;
  font-weight: bolder;
  font-family: Cinzel, serif;
  letter-spacing: 0.02em;
}

.disciplines {
  width: 100%;
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
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.clans {
  width: min(900px, 100%);
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 0.5rem;
}

.clan {
  appearance: none;
  border: 1px solid rgba(255, 255, 255, 0.10);
  background:
    radial-gradient(900px 420px at 10% 0%, color-mix(in srgb, var(--accent) 10%, transparent), transparent 60%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), transparent 55%),
    linear-gradient(180deg, var(--bg-3), var(--bg-2));
  box-shadow: var(--shadow-hairline), var(--shadow-card);
  border-radius: 14px;
  padding: 0.9rem 0.6rem;
  cursor: pointer;
  user-select: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  transition: transform var(--dur-2) var(--ease-2), filter var(--dur-2) var(--ease-2), border-color var(--dur-2) var(--ease-2);
  &:hover {
    transform: translateY(-1px);
    filter: brightness(1.03);
    border-color: rgba(255, 255, 255, 0.16);
  }
  &:active {
    transform: translateY(0);
    filter: brightness(0.99);
  }
}

.clan-symbol {
  width: 3.7rem;
  filter: var(--image-to-primary-color-filter);
  -webkit-user-drag: none;
}

@media (max-width: 980px) {
  .info {
    grid-template-columns: 1fr;
    text-align: center;
    justify-items: center;
  }
  .symbol {
    width: 6rem;
  }
  .clans {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
