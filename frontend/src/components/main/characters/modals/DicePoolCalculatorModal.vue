<script setup lang="ts">
import { computed, ref } from "vue"
import Modal from "@/components/modal/Modal.vue"
import Dropdown from "@/components/Dropdown.vue"
import DataManager from "@/libs/data/data-manager"
import { VicarTT } from "@/libs/io/vicar-tt"
import type { IOption } from "@/components/Dropdown.vue"
import {type AttributeKeys, getAttributeName, getCategoryName, getSkillName, type ICharacter} from "@/@types/models"
import { getHumanInteractionMalus } from "@/@types/models"
import { skillTreeResolver } from "@/libs/resolvers/skilltree-resolver"

const show = ref(false)
const character = ref<ICharacter | null>(null)
const isDiscipline = ref(false)

const bonus = ref("")
const selectedAttribute = ref<AttributeKeys | null>(null)
const selectedSkill = ref<number | null>(null)
const difficulty = ref("")
const human = ref(false)

const showModal = (c: ICharacter, disc = false) => {
  character.value = c
  isDiscipline.value = disc
  selectedAttribute.value = null
  selectedSkill.value = null
  human.value = false
  bonus.value = ""

  if (c.cache) {
    selectedAttribute.value = (c.cache["dicePoolCalculatorAttribute"] as any) || null
    selectedSkill.value = (c.cache["dicePoolCalculatorSkill"] as any) || null
    bonus.value = (c.cache["dicePoolCalculatorBonus"] as any) || ""
  }

  show.value = true
}

const getAttrVal = (attr: AttributeKeys): number => {
  const c = character.value
  if (!c) return 0
  // Effektiver Wert inkl. aktiver Skill-Tree-Modifikatoren.
  return skillTreeResolver.getEffectiveAttribute(c, attr).value
}

const pool = computed(() => {
  const c = character.value
  if (!c) return null
  if (selectedAttribute.value === null || selectedSkill.value === null) return null

  const attr = getAttrVal(selectedAttribute.value)
  const skill = selectedSkill.value

  let add = 0
  if (isDiscipline.value) {
    add = DataManager.selectedLanguage.bloodPotencyTable.find(x => x.value === c.bloodPotency)!.disciplineBonus
  }
  const b = bonus.value.trim()
  if (b && !isNaN(parseInt(b))) add += parseInt(b)

  let total = attr + skill + add

  if (human.value) {
    const malus = getHumanInteractionMalus(c)
    if (malus === Number.MIN_SAFE_INTEGER) return { total: -1, simple: 0, hunger: 0 }
    total -= malus
    if (total <= 0) total = 1
  }

  const hungerDice = Math.min(c.hunger, total)
  const simple = total - hungerDice
  return { total, simple, hunger: hungerDice }
})

const attrOptions = computed<IOption[]>(() => {
  const keys = [
    "str",
    "dex",
    "sta",
    "cha",
    "man",
    "com",
    "int",
    "wit",
    "res",
  ] as AttributeKeys[]

  const opt = (key: AttributeKeys): IOption => ({
    name: `${getAttributeName(key)} (${getAttrVal(key)})`,
    value: key,
  })

  return keys.map(opt).sort((a, b) => String(a.name).localeCompare(String(b.name)))
})

const skillOptions = computed<IOption[]>(() => {
  const c = character.value
  if (!c) return []

  const opts: IOption[] = []

  for (const cat of c.categories) {
    opts.push({ name: getCategoryName(cat.name), value: "", isCategory: true })
    const skillOpts: IOption[] = cat.skills.map(s => {
      const v = skillTreeResolver.getEffectiveSkill(c, s.key).value
      return {
        name: `${getSkillName(s.key)} (${v})`,
        value: v,
      }
    })
    opts.push(...skillOpts.sort((a, b) => String(a.name).localeCompare(String(b.name))))
  }

  if (c.disciplines.length > 0) {
    opts.push({ name: "Disziplinen", value: "", isCategory: true })
    const discOpts: IOption[] = c.disciplines.map(d => ({
      name: `${d.discipline.name} (${d.currentLevel})`,
      value: d.currentLevel,
    }))
    opts.push(...discOpts.sort((a, b) => String(a.name).localeCompare(String(b.name))))
  }

  opts.push({ name: "Attribute", value: "", isCategory: true })
  const asSkill = (key: AttributeKeys): IOption => ({
    name: `${getAttributeName(key)} (${getAttrVal(key)})`,
    value: getAttrVal(key),
  })
  for (const k of ["str", "dex", "sta", "cha", "man", "com", "int", "wit", "res"] as AttributeKeys[]) {
    opts.push(asSkill(k))
  }

  return opts
})

const sendDiceRoll = async () => {
  const c = character.value
  const p = pool.value
  if (!c || !p) return

  const attr = attrOptions.value.find(x => x.value === selectedAttribute.value)
  const skill = skillOptions.value.find(x => x.value === selectedSkill.value)

  const attrName = (attr?.name ?? "").replace(/\(\d+\)/g, "").trim()
  const skillName = (skill?.name ?? "").replace(/\(\d+\)/g, "").trim()

  let diff: number | undefined
  const d = difficulty.value.trim()
  if (d && !isNaN(parseInt(d))) diff = parseInt(d)

  VicarTT.rollNamedDiceFor(c, `${attrName} + ${skillName}`, p.simple, p.hunger, diff)
  show.value = false
}

const handleClose = () => {
  const c = character.value
  if (!c) {
    show.value = false
    return
  }

  show.value = false
  c.cache = c.cache || {}

  if (selectedAttribute.value) c.cache["dicePoolCalculatorAttribute"] = selectedAttribute.value
  else delete c.cache["dicePoolCalculatorAttribute"]

  if (selectedSkill.value !== null) c.cache["dicePoolCalculatorSkill"] = selectedSkill.value
  else delete c.cache["dicePoolCalculatorSkill"]

  if (bonus.value) c.cache["dicePoolCalculatorBonus"] = bonus.value
  else delete c.cache["dicePoolCalculatorBonus"]
}

defineExpose({ showModal })
</script>

<template>
  <Modal :shown="show" @close="handleClose" v-if="character">
    <div class="dpcm">
      <b class="dpcm__title">{{ `Würfelpool für "${character.name}" berechnen` }}:</b>

      <div class="dpcm__row">
        <Dropdown :options="attrOptions" v-model="selectedAttribute" placeholder="Wähle ein Attribut" />
        <Dropdown :options="skillOptions" v-model="selectedSkill" placeholder="Wähle eine Fähigkeit/Disziplin" />
      </div>

      <div class="dpcm__divider"></div>

      <div class="dpcm__col">
        <input class="form-control" type="text" v-model="bonus" placeholder="Weitere Boni/Mali" inputmode="numeric" />

        <div class="custom-checkbox">
          <input type="checkbox" id="is-disc" v-model="isDiscipline" />
          <label for="is-disc">Ist für Disziplin?</label>
        </div>

        <div class="custom-checkbox">
          <input type="checkbox" id="dicehuman" v-model="human" />
          <label for="dicehuman">Menschliche Interaktion?</label>
        </div>
      </div>

      <div class="dpcm__divider"></div>

      <div v-if="pool" class="dpcm__result">
        <span v-if="pool.hunger > 0">
          <b><u>{{ pool.total }}</u></b>
          Würfel davon
          <b class="dpcm__accent">{{ pool.hunger }}</b>
          Hungerwürfel und
          <b>{{ pool.simple }}</b>
          normale Würfel
        </span>

        <span v-else-if="pool.total === -1">Unmöglich (Wasail?!)</span>

        <span v-else><b>{{ pool.total }}</b> Würfel</span>

        <template v-if="character.connectedFoundryId">
          <div class="dpcm__divider"></div>
          <div class="dpcm__row dpcm__row--tight">
            <input class="form-control" type="text" v-model="difficulty" placeholder="Schwierigkeit (optional)" inputmode="numeric" />
            <button class="btn btn-primary" @click="sendDiceRoll">In FoundryVTT würfeln</button>
          </div>
        </template>
      </div>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.dpcm {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.dpcm__title {
  text-align: center;
  font-family: var(--font-display, Cinzel), serif;
  letter-spacing: 0.04em;
}

.dpcm__row {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  justify-content: center;

  > * {
    flex: 1 1 0;
    min-width: 0;
  }

  @media (max-width: 520px) {
    flex-direction: column;
    align-items: stretch;
  }
}

.dpcm__row--tight {
  justify-content: stretch;
  @media (max-width: 520px) {
    flex-direction: column;
  }
}

.dpcm__col {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.dpcm__divider {
  width: 100%;
  height: 1px;
  background: rgba(255, 255, 255, 0.12);
  margin: 0.5rem 0;
}

.dpcm__result {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  text-align: center;
}

.dpcm__accent {
  color: var(--primary-color);
}
</style>
