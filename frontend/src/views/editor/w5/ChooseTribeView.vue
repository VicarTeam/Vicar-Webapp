<script setup lang="ts">
import { computed } from "vue"
import EditorForm from "@/components/editor/EditorForm.vue"
import TipButton from "@/components/editor/TipButton.vue"
import TribeSymbol from "@/components/symbols/TribeSymbol.vue"
import PatronSpiritSymbol from "@/components/symbols/PatronSpiritSymbol.vue"
import { tribes } from "@/app/data/w5"
import type { IWerewolfW5Sheet } from "@/@types/w5"
import { useStore } from "@/app/store"

const store = useStore()

const editingCharacter = computed(() => store.editingCharacter as IWerewolfW5Sheet | undefined)
const canGoNext = computed(() => !!editingCharacter.value?.tribe)

const tipTribe = "Der Stamm prägt Kultur, Instinkte, Verbündete und Feinde – und legt ein bevorzugtes Ansehen fest."
const tipFavor = "Der Vorteil deines Stamms beschreibt typische Stärken oder Privilegien."
const tipPatron = "Der Schutzgeist ist ein spiritueller Verbündeter deines Stamms."
const tipRenown = "Ansehen beschreibt deinen Ruf und deine spirituelle Anerkennung."
const tipBan = "Der Bann ist ein kulturelles/spirituelles Tabu, das der Stamm ernst nimmt."

const RENOWN_NAME: Record<string, string> = {
  glory: "Ruhm",
  honor: "Ehre",
  wisdom: "Weisheit",
  none: "—",
}

function getRenownName(k: any) {
  return RENOWN_NAME[String(k)] ?? "—"
}
</script>

<template>
  <EditorForm :can-go-next="canGoNext" next-step="editor-renown">
    <div v-if="editingCharacter" class="outer">
      <div class="choose-clan-wrapper">
        <div class="clan-selection">
          <label class="required">
            Stamm:
            <TipButton :content="tipTribe" />
          </label>

          <div v-if="editingCharacter.tribe" class="info-row">
            <div class="card clan-info">
              <TribeSymbol :tribe="editingCharacter.tribe" />
              <div class="text">
                <b>{{ editingCharacter.tribe.name }}</b>
                <div class="desc">{{ editingCharacter.tribe.description }}</div>

                <h6 class="hline">
                  Vorteil:
                  <TipButton :content="tipFavor" />
                </h6>
                <div class="desc small">{{ editingCharacter.tribe.favor }}</div>
              </div>
            </div>

            <div class="card clan-info">
              <PatronSpiritSymbol :tribe="editingCharacter.tribe" />
              <div class="text">
                <b>
                  Schutzgeist: {{ editingCharacter.tribe.patron.name }}
                  <TipButton :content="tipPatron" />
                </b>
                <div class="desc">{{ editingCharacter.tribe.patron.description }}</div>

                <h6 class="hline">
                  Ansehen:
                  <TipButton :content="tipRenown" />
                </h6>
                <div class="desc">{{ getRenownName(editingCharacter.tribe.renown) }}</div>

                <h6 class="hline">
                  Bann:
                  <TipButton :content="tipBan" />
                </h6>
                <div class="desc small">{{ editingCharacter.tribe.ban }}</div>
              </div>
            </div>
          </div>

          <div class="clans">
            <div
              v-for="tribe in tribes"
              :key="tribe.id"
              class="clan"
              @click="editingCharacter.tribe = tribe"
            >
              <TribeSymbol :tribe="tribe" />
              <small>{{ tribe.name }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </EditorForm>
</template>

<style scoped lang="scss">
.outer {
  width: 100%;
  height: 100%;
  padding: 5rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.choose-clan-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;

  .clan-selection {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .info-row {
      display: flex;
      gap: 2rem;
    }

    .clan-info {
      margin: 0;
      width: 55rem;
      padding: 1rem;
      gap: 1rem;
      display: flex;

      .text {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex-grow: 1;

        .hline {
          font-weight: 800;
          margin: 1rem 0 0;
        }

        .desc {
          font-size: 1.1rem;
          max-height: 15rem;
          overflow-x: hidden;
          overflow-y: auto;

          &.small {
            font-size: 0.9rem;
          }
        }
      }
    }

    .clans {
      margin-top: 3rem;
      width: 50%;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: 2rem;

      .clan {
        width: 25%;
        height: 7rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        user-select: none;

        img {
          height: 6rem;
          -webkit-user-drag: none;
          filter: var(--image-to-primary-color-filter);
        }
      }
    }
  }
}
</style>
