<script setup lang="ts">
import { computed } from "vue"
import EditorForm from "@/components/editor/EditorForm.vue"
import TipButton from "@/components/editor/TipButton.vue"
import AuspiceSymbol from "@/components/symbols/AuspiceSymbol.vue"
import { auspices } from "@/app/data/w5"
import type { IWerewolfW5Sheet } from "@/@types/w5"
import { useStore } from "@/app/store"

const store = useStore()

const editingCharacter = computed(() => store.editingCharacter as IWerewolfW5Sheet | undefined)
const canGoNext = computed(() => !!editingCharacter.value?.auspice)

const tipTitle = "Auspizium"
const tipContent =
  "Auspizien beschreiben deine Rolle im Rudel und prägen Sichtweisen, Pflichten und spirituelle Ausrichtung."
</script>

<template>
  <EditorForm :can-go-next="canGoNext" next-step="editor-tribe" :is-cancel="true">
    <div v-if="editingCharacter" class="outer">
      <div class="choose-clan-wrapper">
        <div class="clan-selection">
          <label class="required">
            Auspizium:
            <TipButton :title="tipTitle" :content="tipContent" />
          </label>

          <div v-if="editingCharacter.auspice" class="card clan-info">
            <AuspiceSymbol :auspice="editingCharacter.auspice" />
            <div class="text">
              <b>{{ editingCharacter.auspice.name }}</b>
              <div class="desc">{{ editingCharacter.auspice.description }}</div>
            </div>
          </div>

          <div class="clans">
            <div
              v-for="auspice in auspices"
              :key="auspice.id"
              class="clan"
              @click="editingCharacter.auspice = auspice"
            >
              <AuspiceSymbol :auspice="auspice" />
              <small>{{ auspice.name }}</small>
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

        .desc {
          font-size: 1.1rem;
          max-height: 15rem;
          overflow-x: hidden;
          overflow-y: auto;
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
          height: 30rem;
          -webkit-user-drag: none;
          filter: var(--image-to-primary-color-filter);
        }
      }
    }
  }
}
</style>
