<script setup lang="ts">
import { computed, ref } from "vue"
import { useRouter, useRoute } from "vue-router"
import Modal from "@/components/modal/Modal.vue"
import Dropdown from "@/components/Dropdown.vue"
import type { IOption } from "@/components/Dropdown.vue"
import {type AttributeKeys, getAttributeName, getCategoryName, getSkillName, type ICharacter} from "@/@types/models"

const HIGHLIGHT_SKILL = "hlsk-"
const HIGHLIGHT_ATTRIBUTE = "hlat-"
const HIGHLIGHT_STAT = "hlst-"
const HIGHLIGHT_DISCIPLINE = "hldc-"

const router = useRouter()
const route = useRoute()

const show = ref(false)
const character = ref<ICharacter | null>(null)
const highlight = ref<string | null>(null)

const showModal = (c: ICharacter) => {
  character.value = c
  highlight.value = null
  show.value = true
}

const getAttrVal = (attr: AttributeKeys): number => {
  const c = character.value
  if (!c) return 0
  for (const cat of c.categories) {
    for (const a of cat.attributes) {
      if (a.key === attr) return a.value
    }
  }
  return 0
}

const options = computed<IOption[]>(() => {
  const c = character.value
  if (!c) return []
  const opts: IOption[] = []

  for (const cat of c.categories) {
    opts.push({ name: getCategoryName(cat.name), value: "", isCategory: true })
    const skillOpts: IOption[] = cat.skills.map(s => ({
      name: `${getSkillName(s.key)} (${s.value})`,
      value: HIGHLIGHT_SKILL + s.key,
    }))
    opts.push(...skillOpts.sort((a, b) => String(a.name).localeCompare(String(b.name))))
  }

  if (c.disciplines.length > 0) {
    opts.push({ name: "Clandisziplinen", value: "", isCategory: true })
    const discOpts: IOption[] = c.disciplines.map(d => ({
      name: `${d.discipline.name} (${d.currentLevel})`,
      value: HIGHLIGHT_DISCIPLINE + d.discipline.id,
    }))
    opts.push(...discOpts.sort((a, b) => String(a.name).localeCompare(String(b.name))))
  }

  opts.push({ name: "Attribute", value: "", isCategory: true })

  const attrs = ["str", "dex", "sta", "cha", "man", "com", "int", "wit", "res"] as AttributeKeys[]
  for (const k of attrs) {
    opts.push({
      name: `${getAttributeName(k)} (${getAttrVal(k)})`,
      value: HIGHLIGHT_ATTRIBUTE + k,
    })
  }

  opts.push({ name: "Stats", value: "", isCategory: true })
  opts.push({ name: "Gesundheit", value: "hlst-health" })
  opts.push({ name: "Willenskraft", value: "hlst-willpower" })
  opts.push({ name: "Blutmacht", value: "hlst-blood" })
  opts.push({ name: "Menschlichkeit", value: "hlst-humanity" })
  opts.push({ name: "Hunger", value: "hlst-hunger" })

  return opts
})

const reset = () => {
  show.value = false
  highlight.value = null
  setTimeout(() => (show.value = true), 10)
}

const jump = async () => {
  if (!highlight.value) return

  const name = route.name?.toString() ?? ""
  const id = highlight.value

  if (id.startsWith(HIGHLIGHT_DISCIPLINE) && name !== "viewer-disciplines") {
    await router.push({ name: "viewer-disciplines" })
  } else if (id.startsWith(HIGHLIGHT_SKILL) && name !== "viewer-skills") {
    await router.push({ name: "viewer-skills" })
  } else if (id.startsWith(HIGHLIGHT_ATTRIBUTE) && name !== "viewer-attributes") {
    await router.push({ name: "viewer-attributes" })
  } else if (id.startsWith(HIGHLIGHT_STAT) && name !== "viewer-profile") {
    await router.push({ name: "viewer-profile" })
  }

  setTimeout(() => {
    const el = document.getElementById(id)
    if (!el) return

    let count = 0
    const interval = setInterval(() => {
      if (count >= 5) {
        clearInterval(interval)
        el.classList.remove("vicar-highlight")
        return
      }
      el.classList.toggle("vicar-highlight")
      count++
    }, 500)
  }, 10)

  show.value = false
}

defineExpose({ showModal })
</script>

<template>
  <Modal :shown="show" @close="show = false" v-if="character">
    <div class="shm">
      <b class="shm__title">Charakter durchsuchen:</b>

      <Dropdown
        v-if="show"
        :options="options"
        v-model="highlight"
        placeholder="Suchen..."
        :autofocus="true"
      />

      <div class="shm__actions">
        <button class="btn" @click="reset">Zurücksetzen</button>
        <button class="btn btn-primary" @click="jump">Hinspringen</button>
      </div>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.shm {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.shm__title {
  text-align: center;
  font-family: var(--font-display, Cinzel), serif;
  letter-spacing: 0.04em;
}

.shm__actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 1rem;

  @media (max-width: 520px) {
    flex-direction: column;
    align-items: stretch;
    button {
      width: 100%;
    }
  }
}
</style>
