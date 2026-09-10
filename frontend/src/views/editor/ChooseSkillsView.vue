<script setup lang="ts">
import {computed, ref} from "vue"
import EditorForm from "@/components/editor/EditorForm.vue"
import TipButton from "@/components/editor/TipButton.vue"
import SkillInfoModal from "@/components/editor/modals/SkillInfoModal.vue"
import {DefinedSpreadTypes, getSkillSpreadName, TraitActionType} from "@/@types/data"
import type {IEdition5Sheet} from "@/@types/gameline"
import {GameLine} from "@/@types/gameline"
import {getCategoryName, getSkillName, SkillKeys} from "@/@types/models"
import {useStore} from "@/app/store.ts";

const store = useStore()

const skillInfoModal = ref<InstanceType<typeof SkillInfoModal> | null>(null)

const characterCache = ref<IEdition5Sheet | null>(null)
const definedSpecializations = ref<{ key: SkillKeys; value: string; name: any }[]>([])
const freeSpecializationKey = ref<SkillKeys | null>(null)
const freeSpecializationName = ref("")

function selectType() {
  definedSpecializations.value = [
    { key: SkillKeys.Academics, name: "Geisteswissenschaft", value: "" },
    { key: SkillKeys.Craft, name: "Handwerk", value: "" },
    { key: SkillKeys.Performance, name: "Darbietung", value: "" },
    { key: SkillKeys.Science, name: "Naturwissenschaften", value: "" },
  ]
  freeSpecializationKey.value = null
  freeSpecializationName.value = ""
  characterCache.value = JSON.parse(JSON.stringify(store.editingCharacter))
}

function getAvailablePoints(): number[] {
  const char = store.editingCharacter as IEdition5Sheet | null
  if (!char || !char.skillspread) return []
  return char.skillspread.spreads.map((s) => s.points).sort((a, b) => a - b)
}

function getUsedAmount(val: number) {
  const char = store.editingCharacter as IEdition5Sheet | null
  if (!char) return 0
  let amount = 0
  for (const cat of char.categories) {
    for (const skill of cat.skills) {
      if (skill.value === val) amount++
    }
  }
  return amount
}

function getAvailableAmount(val: number) {
  const char = store.editingCharacter as IEdition5Sheet | null
  if (!char || !char.skillspread) return -1
  return (char.skillspread.spreads.find((s) => s.points === val)?.amount ?? -1) - getUsedAmount(val)
}

function isPointAvailable(val: number, skillKey: SkillKeys) {
  const char = store.editingCharacter as IEdition5Sheet | null
  if (!char) return false
  const amount = getAvailableAmount(val)
  if (amount <= 0) return false

  for (const flaw of char.merits.packs.flatMap((p) => p.flawTraits)) {
    if (!flaw.actions) continue
    const action = flaw.actions.find((a: any) => a.type === TraitActionType.CapSkill && a.data["skill"] === skillKey)
    if (action && action.data["value"] < val) return false
  }

  return true
}

function applyCharacterData() {
  const char = store.editingCharacter as IEdition5Sheet | null
  if (!char) return

  for (const cat of char.categories) {
    for (const skill of cat.skills) {
      if (freeSpecializationKey.value === skill.key) {
        skill.specialization.push(freeSpecializationName.value)
      }
      const defined = definedSpecializations.value.find((d) => d.key === skill.key)
      if (defined) skill.specialization.push(defined.value)
    }
  }
}

const sortedSkillKeys = computed<SkillKeys[]>(() => {
  return Object.keys(SkillKeys).map(k => SkillKeys[k]).sort((a, b) => {
    return getSkillName(a) < getSkillName(b) ? -1 : 1;
  });
})

const canGoNext = computed(() => {
  const char = store.editingCharacter as IEdition5Sheet | null
  if (!char || !char.skillspread) return false
  const hasNoSkillPointsLeft = getAvailablePoints().map((p) => getAvailableAmount(p)).every((a) => a === 0)
  return (
    hasNoSkillPointsLeft &&
    definedSpecializations.value.every((d) => d.value.length > 0) &&
    freeSpecializationName.value.length > 0 &&
    freeSpecializationKey.value !== null
  )
})

const nextStep = computed(() => {
  const char = store.editingCharacter as IEdition5Sheet | null
  if (char && char.game === GameLine.Werewolf) return "editor-gifts"
  if (char && char.game === GameLine.Hunter) return "editor-edges"
  return "editor-disciplines"
})
</script>

<template>
  <EditorForm :can-go-next="canGoNext" :next-step="nextStep" :fallback-history-char="characterCache as any" @before-next="applyCharacterData">
    <div v-if="store.editingCharacter" class="page">
      <div class="wrap">
        <div class="form-group center">
          <label class="required"><b>Wähle eine Fähigkeitenverteilung:</b></label>
          <select class="form-control input" v-model="(store.editingCharacter as IEdition5Sheet).skillspread" :disabled="!!characterCache" data-agent="select:skill-spread">
            <option v-for="t in DefinedSpreadTypes" :key="t.id" :value="t">
              {{ getSkillSpreadName(t.id) }}
            </option>
          </select>
        </div>

        <ul v-if="(store.editingCharacter as IEdition5Sheet).skillspread" class="list" data-agent-hint>
          <li v-for="(s, i) in (store.editingCharacter as IEdition5Sheet).skillspread.spreads" :key="i">
            {{ `${getAvailableAmount(s.points)} Fähigkeit(en) auf ${s.points}` }}
          </li>
        </ul>

        <div class="divider"></div>

        <button class="btn btn-primary" v-if="(store.editingCharacter as IEdition5Sheet).skillspread && !characterCache" @click="selectType" data-agent="skills:confirm">
          Auswählen
        </button>

        <div class="grid" v-if="characterCache && (store.editingCharacter as IEdition5Sheet).skillspread">
          <div class="card cat" v-for="cat in (store.editingCharacter as IEdition5Sheet).categories" :key="cat.name">
            <div class="cat-title">
              <b>{{ getCategoryName(cat.name) }}</b>
            </div>

            <div class="row" v-for="skill in cat.skills" :key="skill.key">
              <small class="label">
                <TipButton :override="true" @click="skillInfoModal?.showModal(skill.key)" />
                {{ getSkillName(skill.key) }}:
              </small>

              <select class="form-control control" v-model="skill.value" :data-agent="'select:skill:' + skill.key">
                <option :value="0">0</option>
                <option
                  v-for="i in getAvailablePoints()"
                  :key="i"
                  :value="i"
                  :disabled="!isPointAvailable(i, skill.key)"
                >
                  {{ i }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div class="card specs" v-if="characterCache && (store.editingCharacter as IEdition5Sheet).skillspread">
          <b class="mb-10">Füge bei Geisteswissenschaften, Handwerk, Darbietung und Naturwissenschaften eine kostenlose Spezialisierung hinzu:</b>

          <div class="defined">
            <div class="pair" v-for="(d, i) in definedSpecializations" :key="d.key">
              <input v-model="d.name" type="text" class="form-control" disabled />
              <input v-model="d.value" type="text" class="form-control" :data-agent="'input:spec-defined:' + i" :data-agent-label="d.name" />
            </div>
          </div>

          <b class="mb-10">und eine kostenlose deiner Wahl:</b>

          <div class="free">
            <select class="form-control" v-model="freeSpecializationKey" data-agent="select:free-spec">
              <option v-for="key in sortedSkillKeys" :key="key" :value="key">{{ getSkillName(key) }}</option>
            </select>
            <input v-model="freeSpecializationName" type="text" class="form-control" data-agent="input:free-spec-name" />
          </div>
        </div>
      </div>

      <SkillInfoModal ref="skillInfoModal" />
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

.grid {
  width: 100%;
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.cat {
  margin: 0;
  padding: 1rem;
}

.cat-title {
  width: 100%;
  text-align: center;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 0.75rem;
}

.row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.35rem 0;
}

.label {
  flex: 1;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.control {
  width: 7rem;
  flex: 0 0 auto;
}

.specs {
  width: 100%;
  margin: 0;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 0 0 auto;
  min-height: auto;
  overflow: visible;
}


.defined {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
}

.free {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
}

@media (max-width: 1050px) {
  .grid {
    grid-template-columns: 1fr;
  }
  .defined,
  .free,
  .pair {
    grid-template-columns: 1fr;
  }
  .control {
    width: 6.5rem;
  }
}
</style>
