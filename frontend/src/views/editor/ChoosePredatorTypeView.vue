<script setup lang="ts">
import { computed, ref } from "vue"
import EditorForm from "@/components/editor/EditorForm.vue"
import TipButton from "@/components/editor/TipButton.vue"
import DataManager from "@/libs/data/data-manager"
import PTActionHandler from "@/libs/ptaction-handler"
import { ptActionResolver } from "@/libs/resolvers/ptactions-resolver"
import AdditionalSpecializationAction from "@/components/editor/actions/AdditionalSpecializationAction.vue"
import DisciplinePointAction from "@/components/editor/actions/DisciplinePointAction.vue"
import AddFlawAction from "@/components/editor/actions/AddFlawAction.vue"
import SpendBackgroundPointsBetweenAction from "@/components/editor/actions/SpendBackgroundPointsBetweenAction.vue"
import SpendFlawPointsBetweenAction from "@/components/editor/actions/SpendFlawPointsBetweenAction.vue"
import type { ICharacter } from "@/@types/models"
import { type IPredatorType, PTActionType } from "@/@types/data"
import {useStore} from "@/app/store.ts";

type ActionInstance = {
  isReady: () => boolean
  applyOutput: (char: ICharacter) => void
}

const store = useStore()

const characterCache = ref<ICharacter | null>(null)
const actionRefs = ref<ActionInstance[]>([])

function registerAction(el: any) {
  if (!el) return
  if (actionRefs.value.includes(el)) return
  actionRefs.value.push(el as ActionInstance)
}

function selectType() {
  actionRefs.value = []
  characterCache.value = JSON.parse(JSON.stringify(store.editingCharacter))
}

function applyPredatorType() {
  const char = store.editingCharacter as ICharacter | undefined
  if (!char || !char.predatorType) return

  const interactables = interactableActions.value
  const nonInteractables = char.predatorType.actions.filter((a) => !interactables.find((ia) => ia.type === a.type))

  for (const a of actionRefs.value) {
    a.applyOutput(char)
  }

  for (const a of nonInteractables) {
    PTActionHandler.handle(char, a)
  }
}

function actionComponent(type: PTActionType) {
  if (type === PTActionType.AdditionalSpecialization) return AdditionalSpecializationAction
  if (type === PTActionType.DisciplinePoint) return DisciplinePointAction
  if (type === PTActionType.AddFlaw) return AddFlawAction
  if (type === PTActionType.SpendBackgroundPointsBetween) return SpendBackgroundPointsBetweenAction
  if (type === PTActionType.SpendFlawPointsBetween) return SpendFlawPointsBetweenAction
  return AdditionalSpecializationAction
}

const interactableActions = computed(() => {
  const char = store.editingCharacter as ICharacter | undefined
  if (!char || !char.predatorType) return []
  return ptActionResolver.resolve(char.predatorType.actions, char)
})

const predatorTypes = computed<IPredatorType[]>(() => {
  const char = store.editingCharacter as ICharacter | undefined
  let books: any[] = DataManager.selectedLanguage.books
  if (char) books = books.filter((b) => char.books.includes(b.id))
  const all = books.map((b) => b.predatorTypes).flat()
  return DataManager.filterRestrictions(char, all).sort((a: any, b: any) => a.name.localeCompare(b.name))
})

const canGoNext = computed(() => {
  const char = store.editingCharacter as ICharacter | undefined
  if (!char) return false
  if (!characterCache.value || !characterCache.value.predatorType) return false
  if (actionRefs.value.length <= 0) return false
  return actionRefs.value.every((a) => a.isReady())
})

const isElder = computed(() => (store.editingCharacter as ICharacter | undefined)?.isElder ?? false)
</script>

<template>
  <EditorForm
    :can-go-next="canGoNext"
    :is-finish="isElder"
    next-step="editor-traits"
    :fallback-history-char="characterCache"
    @before-next="applyPredatorType"
  >
    <div v-if="store.editingCharacter" class="page">
      <div class="wrap">
        <div class="form-group center">
          <label class="required">
            Wähle dein Jagdverhalten:
            <TipButton title="Was ist das Jagdverhalten?" content="Das Jagdverhalten beschreibt deine Art des Jagens, also wie du an das Blut kommst, um dich zu ernähren. Das Jagdverhalten kann dabei jedoch nicht nur die Art des Jagens beschreiben, sondern auch die Beute beschränken, also das WAS du jagst." />
          </label>

          <select class="form-control input" v-model="(store.editingCharacter as ICharacter).predatorType" :disabled="!!characterCache">
            <option v-for="p in predatorTypes" :key="p.id" :value="p">{{ p.name }}</option>
          </select>
        </div>

        <i v-if="(store.editingCharacter as ICharacter).predatorType" class="desc">{{ (store.editingCharacter as ICharacter).predatorType.description }}</i>

        <b v-if="(store.editingCharacter as ICharacter).predatorType">und das erhälst du:</b>
        <ul v-if="(store.editingCharacter as ICharacter).predatorType" class="list">
          <li v-for="(a, i) in (store.editingCharacter as ICharacter).predatorType.actions" :key="i">{{ a.description }}</li>
        </ul>

        <div class="divider"></div>

        <button
          v-if="(store.editingCharacter as ICharacter).predatorType && !characterCache"
          class="btn btn-primary"
          @click="selectType"
        >
          Auswählen
        </button>

        <div v-if="characterCache" class="actions-grid">
          <div v-for="(a, i) in interactableActions" :key="i" class="card action-card">
            <component
              :is="actionComponent(a.type)"
              :data="a.data"
              :ref="(el: any) => registerAction(el)"
            />
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
  gap: 1.1rem;
}

.center {
  text-align: center;
}

.input {
  width: min(30rem, 100%);
}

.desc {
  width: min(60rem, 100%);
  text-align: center;
  opacity: 0.92;
}

.list {
  margin: 0;
  padding-left: 1.2rem;
  width: min(60rem, 100%);
  li {
    margin: 0;
  }
}

.divider {
  width: min(760px, 100%);
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
}

.actions-grid {
  width: min(900px, 100%);
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.action-card {
  margin: 0;
  padding: 1rem;
}

@media (max-width: 900px) {
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
