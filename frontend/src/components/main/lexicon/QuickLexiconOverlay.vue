<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue"
import DataManager from "@/libs/data/data-manager"
import type { IClan } from "@/@types/models"
import type {
  IBloodRitual,
  IDiscipline,
  IOblivionCeremony,
  IPredatorType,
  ITraitPack,
} from "@/@types/data"
import type { ISectionatedCustomLexicon } from "@/@types/custom-lexicon"
import {useStore} from "@/app/store.ts";
import { GameLine } from "@/@types/gameline"
import { Universe, getUniverseInfo } from "@/@types/universe"
import { ensureLexiconUniverse, lexiconUniverse } from "@/components/main/lexicon/lexicon-universe"
import LexiconMarkdown from "@/components/main/lexicon/LexiconMarkdown.vue"
import { markdownToPlainText } from "@/components/main/lexicon/lexicon-markdown"
import { DarkborneData } from "@/libs/data/darkborne-data"

type LexiconKind =
  | "clan"
  | "discipline"
  | "ability"
  | "bloodritual"
  | "oblivionceremony"
  | "trait"
  | "predator"
  | "custom"
  | "dbart"
  | "dbform"
  | "dbhouse"
  | "dbscar"
  | "dbinfluence"
  | "dbanathema"
  | "dbbackground"
  | "dborder"
  | "dbcourtrank"
  | "dbfirst"
  | "dbcovenant"
  | "dbcourttype"
  | "dblexicon"

type LexiconEntry = {
  id: string
  kind: LexiconKind
  title: string
  subtitle?: string
  text?: string
  tags?: string[]
  payload?: any
  sub?: LexiconEntry[]
}

const ui = useStore()
const data = DataManager

const q = ref("")
const activeId = ref<string | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const scrollRef = ref<HTMLDivElement | null>(null)

const customLexicon = computed<ISectionatedCustomLexicon>(() => data.selectedLanguage.customLexicon)

const dbLoaded = ref(false)

const universe = computed(() => lexiconUniverse.value)
const isDarkborne = computed(() => universe.value === Universe.Darkborne)
const universeLabel = computed(() => getUniverseInfo(universe.value).name)
const searchPlaceholder = computed(() =>
  isDarkborne.value
    ? "Suchen… (Kunst, Form, Haus, Anathema, Order, …)"
    : "Suchen… (Clan, Disziplin, Kraft, Ritual, Trait, …)"
)

async function loadDarkborne() {
  if (!isDarkborne.value || dbLoaded.value) return
  try {
    await DarkborneData.load()
    dbLoaded.value = true
  } catch {
    dbLoaded.value = false
  }
}

function influenceKindLabel(kind?: string) {
  if (kind === "physical") return "körperlich"
  if (kind === "symbolic") return "symbolisch"
  return kind ?? ""
}

function dbLevelName(level?: string) {
  return level ? DarkborneData.anathemaLevelName(level) : ""
}

function dbInfluenceName(key?: string) {
  return key ? DarkborneData.influenceName(key) : ""
}

function dbArtName(key?: string) {
  return key ? DarkborneData.art(key)?.name ?? "" : ""
}

function norm(s: string) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
}

function uniqById<T extends { id: string }>(arr: T[]) {
  const seen = new Set<string>()
  const out: T[] = []
  for (const it of arr) {
    if (seen.has(it.id)) continue
    seen.add(it.id)
    out.push(it)
  }
  return out
}

const v5Index = computed<LexiconEntry[]>(() => {
  const entries: LexiconEntry[] = []

  const clans: IClan[] = data.selectedLanguage.books
    .map((b: any) => b.clans)
    .flat()
    .filter((x: any) => x.id !== -1)

  let idx = 0;
  const discToClan = new Map<number, LexiconEntry[]>()
  for (const c of clans) {
    const entry: LexiconEntry = {
      id: `clan:${c.id}:${idx++}`,
      kind: "clan",
      title: c.name,
      subtitle: "Clan",
      text: (c as any).description || (c as any).curse || "",
      tags: [(c as any).slogan, "clan", "vampire"].filter(Boolean) as string[],
      payload: c,
      sub: []
    }

    entries.push(entry)

    for (const d of c.disciplines) {
      const list = discToClan.get(d.id) || []
      list.push(entry)
      discToClan.set(d.id, list)
    }
  }

  const discs: IDiscipline[] = []
  for (const c of clans) {
    for (const d of (c as any).disciplines || []) if (!discs.includes(d)) discs.push(d)
  }
  for (const d of discs) {
    const entry: LexiconEntry = {
      id: `disc:${d.id}:${idx++}`,
      kind: "discipline",
      title: d.name,
      subtitle: "Disziplin",
      text: (d as any).summary || "",
      tags: ["discipline"].filter(Boolean) as string[],
      payload: d,
      sub: []
    }

    entries.push(entry)

    for (const [level, abilities] of Object.entries(d.levels)) {
      for (const a of abilities) {
        const abilityEntry: LexiconEntry = {
          id: `ability:${(a as any).id}:${idx++}`,
          kind: "ability",
          title: (a as any).name,
          subtitle: `${d.name}-Kraft | Stufe ${level}`,
          text: [(a as any).summary, (a as any).costs, (a as any).duration].filter(Boolean).join(" • "),
          tags: [String((a as any).level ?? ""), "ability"].filter(Boolean) as string[],
          payload: a,
        }

        entries.push(abilityEntry)
        entry.sub?.push(abilityEntry)
      }
    }

    if (discToClan.has(d.id)) {
      discToClan.get(d.id)!.forEach(x => {
        x.sub?.push(entry)
      })
    }
  }

  const bloodRituals: IBloodRitual[] = data.normalBloodRitualsAsArray().flat() as any
  for (const r of bloodRituals) {
    entries.push({
      id: `bloodritual:${(r as any).id}:${idx++}`,
      kind: "bloodritual",
      title: (r as any).name,
      subtitle: `Blutritual • Stufe ${(r as any).level}`,
      text: (r as any).description || (r as any).system || "",
      tags: ["ritual", "blood"].filter(Boolean) as string[],
      payload: r,
    })
  }

  const obliv: IOblivionCeremony[] = data.normalOblivionCeremoniesAsArray().flat() as any
  for (const r of obliv) {
    entries.push({
      id: `oblivion:${(r as any).id}:${idx++}`,
      kind: "oblivionceremony",
      title: (r as any).name,
      subtitle: `Zeremonie • Stufe ${(r as any).level}`,
      text: (r as any).summary || (r as any).system || "",
      tags: ["oblivion", "ceremony"].filter(Boolean) as string[],
      payload: r,
    })
  }

  const merits: ITraitPack[] = data.selectedLanguage.books.flatMap((book: any) => (book?.merits ? book.merits : []))
  const backgrounds: ITraitPack[] = data.selectedLanguage.books.flatMap((book: any) => (book?.backgrounds ? book.backgrounds : []))
  const packs = [...merits, ...backgrounds]

  for (const p of packs) {
    const adv = ((p as any).advantages || []) as any[]
    const dis = ((p as any).disadvantages || []) as any[]
    for (const t of [...adv, ...dis]) {
      entries.push({
        id: `trait:${(p as any).id}:${t.id}:${t.name}:${idx++}`,
        kind: "trait",
        title: t.name,
        subtitle: `${(p as any).name} • Stufe ${t.level}`,
        text: t.description || "",
        tags: [dis.includes(t) ? "flaw" : "merit", "trait"].filter(Boolean) as string[],
        payload: { pack: p, trait: t },
      })
    }
  }

  const predatorTypes: IPredatorType[] = data.selectedLanguage.books
    .flatMap((book: any) => (book?.predatorTypes ? book.predatorTypes : []))
    .sort((a: any, b: any) => a.name.localeCompare(b.name))

  for (const p of predatorTypes) {
    entries.push({
      id: `predator:${p.id}:${idx++}`,
      kind: "predator",
      title: p.name,
      subtitle: "Jagdverhalten",
      text: (p as any).description || "",
      tags: ["predator"].filter(Boolean) as string[],
      payload: p,
    })
  }

  const cx = customLexicon.value
  for (const s of [...(cx.prepend.sections || []), ...(cx.append.sections || [])]) {
    entries.push({
      id: `custom:${s.paragraph}:${idx++}`,
      kind: "custom",
      title: s.title,
      subtitle: "Lexikon",
      text: (s.items || [])
        .map((it: any) => (it.type === "paragraph" ? it.text : (it.items || []).join(" ")))
        .filter(Boolean)
        .join("\n"),
      tags: ["custom"].filter(Boolean) as string[],
      payload: s,
    })
    for (const sb of s.sections || []) {
      entries.push({
        id: `custom:${sb.paragraph}:${idx++}`,
        kind: "custom",
        title: sb.title,
        subtitle: s.title,
        text: (sb.items || [])
          .map((it: any) => (it.type === "paragraph" ? it.text : (it.items || []).join(" ")))
          .filter(Boolean)
          .join("\n"),
        tags: ["custom"].filter(Boolean) as string[],
        payload: sb,
      })
    }
  }

  return uniqById(entries)
})

const dbIndex = computed<LexiconEntry[]>(() => {
  if (!dbLoaded.value || !DarkborneData.isLoaded) return []

  const content = DarkborneData.content
  const entries: LexiconEntry[] = []
  let idx = 0

  for (const art of content.arts) {
    const artEntry: LexiconEntry = {
      id: `${GameLine.Deathborne}:art:${art.key}:${idx++}`,
      kind: "dbart",
      title: art.name,
      subtitle: `Blutkunst • ${art.shortName}`,
      text: [art.principle, art.summary].filter(Boolean).join(" • "),
      tags: [art.shortName, "blutkunst", art.isPrimal ? "urkunst" : ""].filter(Boolean) as string[],
      payload: art,
      sub: [],
    }

    entries.push(artEntry)

    for (const form of art.forms) {
      const formEntry: LexiconEntry = {
        id: `${GameLine.Deathborne}:form:${form.key}:${idx++}`,
        kind: "dbform",
        title: form.name,
        subtitle: `${art.shortName}-Form • Stufe ${form.level}`,
        text: [form.effect, form.limits].filter(Boolean).join(" • "),
        tags: ["form", "gefestigte form", art.shortName],
        payload: { art, form },
      }

      entries.push(formEntry)
      artEntry.sub?.push(formEntry)
    }
  }

  for (const house of content.houses) {
    const scarEntry: LexiconEntry = {
      id: `${GameLine.Deathborne}:scar:${house.scar.key}:${idx++}`,
      kind: "dbscar",
      title: house.scar.name,
      subtitle: `Blood Scar • ${house.name}`,
      text: [house.scar.summary, house.scar.permanentEffect].filter(Boolean).join(" • "),
      tags: ["blood scar", "makel", house.name],
      payload: { house, scar: house.scar },
    }

    entries.push({
      id: `${GameLine.Deathborne}:house:${house.key}:${idx++}`,
      kind: "dbhouse",
      title: house.name,
      subtitle: `Haus • ${house.epithet}`,
      text: [house.idea, house.description].filter(Boolean).join(" • "),
      tags: ["haus", "blutlinie", house.epithet, house.scar.name],
      payload: house,
      sub: [scarEntry],
    })
    entries.push(scarEntry)
  }

  for (const influence of content.influences) {
    entries.push({
      id: `${GameLine.Deathborne}:influence:${influence.key}:${idx++}`,
      kind: "dbinfluence",
      title: influence.name,
      subtitle: `Einfluss • ${influenceKindLabel(influence.kind)}`,
      text: [DarkborneData.anathemaLevelName(influence.baseLevel), influence.note].filter(Boolean).join(" • "),
      tags: ["einfluss", "anathema", influenceKindLabel(influence.kind)],
      payload: influence,
    })
  }

  for (const level of content.anathemaLevels) {
    entries.push({
      id: `${GameLine.Deathborne}:anathema:${level.level}:${idx++}`,
      kind: "dbanathema",
      title: level.name,
      subtitle: "Anathema-Stufe",
      text: [level.physical, level.symbolic].filter(Boolean).join(" • "),
      tags: ["anathema", "stufe", "verwundbarkeit"],
      payload: level,
    })
  }

  for (const background of content.backgrounds) {
    entries.push({
      id: `${GameLine.Deathborne}:background:${background.key}:${idx++}`,
      kind: "dbbackground",
      title: background.name,
      subtitle: "Hintergrund",
      text: background.description,
      tags: ["hintergrund"],
      payload: background,
    })
  }

  for (const order of content.orders) {
    entries.push({
      id: `${GameLine.Deathborne}:order:${order.key}:${idx++}`,
      kind: "dborder",
      title: order.name,
      subtitle: `Order • ${order.motto}`,
      text: order.description,
      tags: ["order", "politik", "überzeugung"],
      payload: order,
    })
  }

  for (const rank of content.court.ranks) {
    entries.push({
      id: `${GameLine.Deathborne}:courtrank:${rank.level}:${idx++}`,
      kind: "dbcourtrank",
      title: rank.name,
      subtitle: `Stand ${rank.level}`,
      text: rank.rights,
      tags: ["court", "stand", "rang"],
      payload: rank,
    })
  }

  for (const first of content.firsts ?? []) {
    entries.push({
      id: `${GameLine.Deathborne}:first:${first.key}:${idx++}`,
      kind: "dbfirst",
      title: first.name,
      subtitle: [first.title, first.houseKey ? DarkborneData.house(first.houseKey)?.name : ""].filter(Boolean).join(" • "),
      text: [first.ideal, first.description, first.urScar].filter(Boolean).join(" • "),
      tags: ["die neun", "erste", "ursprung", first.fate.toLowerCase()],
      payload: first,
    })
  }

  for (const article of content.covenant?.articles ?? []) {
    entries.push({
      id: `${GameLine.Deathborne}:covenant:${article.key}:${idx++}`,
      kind: "dbcovenant",
      title: `${article.name}: ${article.title}`,
      subtitle: "Bund der Schweigenden Nacht",
      text: markdownToPlainText(article.body),
      tags: ["bund", "artikel", "geheimhaltung", "schweigende nacht"],
      payload: article,
    })
  }

  for (const courtType of content.courtTypes ?? []) {
    entries.push({
      id: `${GameLine.Deathborne}:courttype:${courtType.key}:${idx++}`,
      kind: "dbcourttype",
      title: courtType.name,
      subtitle: "Court-Typ",
      text: courtType.description,
      tags: ["court", "politik", "herrschaft"],
      payload: courtType,
    })
  }

  for (const mandate of content.courtMandates ?? []) {
    entries.push({
      id: `${GameLine.Deathborne}:mandate:${mandate.key}:${idx++}`,
      kind: "dbcourttype",
      title: mandate.name,
      subtitle: "Mandate",
      text: mandate.description,
      tags: ["mandate", "court", "legitimation"],
      payload: mandate,
    })
  }

  for (const structure of content.courtStructures ?? []) {
    entries.push({
      id: `${GameLine.Deathborne}:structure:${structure.key}:${idx++}`,
      kind: "dbcourttype",
      title: structure.name,
      subtitle: "Einrichtung eines Courts",
      text: structure.description,
      tags: ["court", "amt", "politik"],
      payload: structure,
    })
  }

  for (const entry of content.lexicon) {
    entries.push({
      id: `${entry.gameline || GameLine.Deathborne}:lexicon:${entry.key}:${idx++}`,
      kind: "dblexicon",
      title: entry.title,
      subtitle: entry.section,
      text: markdownToPlainText(entry.body),
      tags: [...(entry.tags ?? []), "regelwerk"],
      payload: entry,
    })
  }

  return uniqById(entries)
})

const index = computed<LexiconEntry[]>(() => (isDarkborne.value ? dbIndex.value : v5Index.value))

const results = computed(() => {
  const query = norm(q.value)
  if (!query) return index.value.slice(0, 40)

  const tokens = query.split(/\s+/).filter(Boolean)
  const scored = index.value
    .map((e) => {
      const hay = norm([e.title, e.subtitle, e.text, (e.tags || []).join(" ")].filter(Boolean).join(" • "))
      let score = 0
      for (const t of tokens) {
        const idx = hay.indexOf(t)
        if (idx === -1) return null
        score += 50
        if (norm(e.title).includes(t)) score += 40
        if (idx < 12) score += 10
      }
      return { e, score }
    })
    .filter(Boolean) as { e: LexiconEntry; score: number }[]

  return scored
    .sort((a, b) => b.score - a.score || a.e.title.localeCompare(b.e.title))
    .slice(0, 60)
    .map((x) => x.e)
})

const active = computed(() => {
  const list = results.value
  if (!list.length) return null
  const id = activeId.value ?? list[0]!.id
  return list.find((x) => x.id === id) ?? list[0]
})

function close() {
  ui.closeLexicon()
}

function onKeyDown(e: KeyboardEvent) {
  if (!ui.lexiconOpen) return

  if (e.key === "Escape") {
    e.preventDefault()
    close()
    return
  }

  if (e.key === "ArrowDown") {
    e.preventDefault()
    const list = results.value
    if (!list.length) return
    const idx = Math.max(0, list.findIndex((x) => x.id === (activeId.value ?? list[0]!.id)))
    const next = list[Math.min(list.length - 1, idx + 1)]!
    activeId.value = next.id
    return
  }

  if (e.key === "ArrowUp") {
    e.preventDefault()
    const list = results.value
    if (!list.length) return
    const idx = Math.max(0, list.findIndex((x) => x.id === (activeId.value ?? list[0]!.id)))
    const next = list[Math.max(0, idx - 1)]!
    activeId.value = next.id
    return
  }

  if (e.key === "Enter") {
    e.preventDefault()
    if (!active.value) return
    activeId.value = active.value.id
    nextTick(() => scrollPreviewTop())
  }
}

function scrollPreviewTop() {
  scrollRef.value?.scrollTo({ top: 0, behavior: "smooth" })
}

watch(
  () => ui.lexiconOpen,
  async (open) => {
    if (!open) return
    q.value = ""
    activeId.value = null
    ensureLexiconUniverse(ui.editingCharacter?.game)
    void loadDarkborne()
    await nextTick()
    inputRef.value?.focus()
  }
)

watch(
  () => universe.value,
  () => {
    activeId.value = null
    void loadDarkborne()
  }
)

onMounted(() => window.addEventListener("keydown", onKeyDown))
onUnmounted(() => window.removeEventListener("keydown", onKeyDown))

function pick(entry: LexiconEntry) {
  activeId.value = entry.id
  nextTick(() => scrollPreviewTop())
}

function kindLabel(k: LexiconKind) {
  if (k === "clan") return "Clan"
  if (k === "discipline") return "Disziplin"
  if (k === "ability") return "Kraft"
  if (k === "bloodritual") return "Blutritual"
  if (k === "oblivionceremony") return "Zeremonie"
  if (k === "trait") return "Trait"
  if (k === "predator") return "Jagdverhalten"
  if (k === "dbart") return "Blutkunst"
  if (k === "dbform") return "Form"
  if (k === "dbhouse") return "Haus"
  if (k === "dbscar") return "Blood Scar"
  if (k === "dbinfluence") return "Einfluss"
  if (k === "dbanathema") return "Anathema"
  if (k === "dbbackground") return "Hintergrund"
  if (k === "dborder") return "Order"
  if (k === "dbcourtrank") return "Stand"
  if (k === "dbfirst") return "Die Neun"
  if (k === "dbcovenant") return "Bund"
  if (k === "dbcourttype") return "Court"
  if (k === "dblexicon") return "Regelwerk"
  return "Lexikon"
}
</script>

<template>
  <teleport to="body">
    <div v-if="ui.lexiconOpen" class="qlx-root" role="dialog" aria-modal="true">
      <div class="qlx-backdrop" @click="close" />

      <div class="qlx-panel">
        <div class="qlx-head">
          <div class="qlx-title">
            <span class="qlx-kbd">Ctrl</span><span class="qlx-kbd">K</span>
            <b>Quick Lexikon</b>
            <span class="qlx-chip qlx-universe">{{ universeLabel }}</span>
          </div>

          <button class="qlx-close" type="button" @click="close">×</button>
        </div>

        <div class="qlx-search">
          <input
            ref="inputRef"
            class="form-control qlx-input"
            type="text"
            v-model="q"
            :placeholder="searchPlaceholder"
          />
          <div class="qlx-hint">
            <span class="qlx-chip">↑↓</span>
            <span class="qlx-chip">Enter</span>
            <span class="qlx-chip">Esc</span>
          </div>
        </div>

        <div class="qlx-body">
          <div class="qlx-results">
            <div v-if="!results.length" class="qlx-empty">
              <b>Keine Treffer.</b>
              <small class="text-muted">Versuch andere Begriffe.</small>
            </div>

            <button
              v-for="r in results"
              :key="r.id"
              type="button"
              class="qlx-item"
              :class="{ active: active?.id === r.id }"
              @click="pick(r)"
            >
              <div class="qlx-item-top">
                <span class="qlx-kind">{{ kindLabel(r.kind) }}</span>
                <b class="qlx-item-title">{{ r.title }}</b>
              </div>
              <small class="qlx-item-sub text-muted">{{ r.subtitle }}</small>
            </button>
          </div>

          <div class="qlx-preview" ref="scrollRef">
            <div v-if="active" class="qlx-preview-inner">
              <div class="qlx-preview-head">
                <div class="qlx-preview-title">
                  <span class="qlx-kind big">{{ kindLabel(active.kind) }}</span>
                  <h3>{{ active.title }}</h3>
                  <small class="text-muted" v-if="active.subtitle">{{ active.subtitle }}</small>
                </div>
              </div>

              <div class="qlx-preview-content">
                <template v-if="active.kind === 'ability'">
                  <small v-if="active.payload?.summary"><i>{{ active.payload.summary }}</i></small>
                  <div class="qlx-sep" />
                  <p><b>Kosten</b>: {{ active.payload?.costs }}</p>
                  <p v-if="active.payload?.diceSupplies"><b>Würfelpool</b>: {{ active.payload?.diceSupplies }}</p>
                  <p v-if="active.payload?.system"><b>System</b>: <span v-html="active.payload.system" /></p>
                  <p v-if="active.payload?.duration"><b>Dauer</b>: {{ active.payload.duration }}</p>
                </template>

                <template v-else-if="active.kind === 'bloodritual'">
                  <small v-if="active.payload?.description"><i>{{ active.payload.description }}</i></small>
                  <div class="qlx-sep" />
                  <p v-if="active.payload?.ingredients"><b>Zutaten</b>: {{ active.payload.ingredients }}</p>
                  <p v-if="active.payload?.execution"><b>Ausführung</b>: {{ active.payload.execution }}</p>
                  <p v-if="active.payload?.system"><b>System</b>: {{ active.payload.system }}</p>
                </template>

                <template v-else-if="active.kind === 'oblivionceremony'">
                  <small v-if="active.payload?.summary"><i>{{ active.payload.summary }}</i></small>
                  <div class="qlx-sep" />
                  <p v-if="active.payload?.cost"><b>Kosten</b>: {{ active.payload.cost }}</p>
                  <p v-if="active.payload?.roll"><b>Zeremonienwurf</b>: {{ active.payload.roll }}</p>
                  <p v-if="active.payload?.ingredients"><b>Zutaten</b>: {{ active.payload.ingredients }}</p>
                  <p v-if="active.payload?.execution"><b>Ausführung</b>: {{ active.payload.execution }}</p>
                  <p v-if="active.payload?.system"><b>System</b>: {{ active.payload.system }}</p>
                  <p v-if="active.payload?.duration"><b>Dauer</b>: {{ active.payload.duration }}</p>
                </template>

                <template v-else-if="active.kind === 'trait'">
                  <small class="text-muted">{{ active.payload?.pack?.name }}</small>
                  <div class="qlx-sep" />
                  <p>{{ active.payload?.trait?.description }}</p>
                </template>

                <template v-else-if="active.kind === 'predator'">
                  <small v-if="active.payload?.description"><i>{{ active.payload.description }}</i></small>
                  <div class="qlx-sep" />
                  <b>Das erhältst du:</b>
                  <p v-for="(pa, i) in (active.payload?.actions || [])" :key="i" class="qlx-effect">
                    • {{ (pa as any).description }}
                  </p>
                </template>

                <template v-else-if="active.kind === 'dbart'">
                  <small v-if="active.payload?.principle"><i>{{ active.payload.principle }}</i></small>
                  <div class="qlx-sep" />
                  <p v-if="active.payload?.summary">{{ active.payload.summary }}</p>
                  <p v-if="active.payload?.isPrimal"><b>Urkunst</b>: ohne Gegenkunst, erzeugt Instabilität</p>
                  <p v-else-if="dbArtName(active.payload?.counterKey)">
                    <b>Gegenkunst</b>: {{ dbArtName(active.payload?.counterKey) }}
                  </p>
                  <b>Stufen</b>
                  <p v-for="l in (active.payload?.levels || [])" :key="l.depth" class="qlx-effect">
                    • Tiefe {{ l.depth }}: {{ (l.examples || []).join(", ") }}
                  </p>
                  <template v-if="(active.payload?.limits || []).length > 0">
                    <b>Grenzen</b>
                    <p v-for="(limit, i) in active.payload.limits" :key="i" class="qlx-effect">• {{ limit }}</p>
                  </template>
                </template>

                <template v-else-if="active.kind === 'dbform'">
                  <small class="text-muted">{{ active.payload?.art?.name }}</small>
                  <div class="qlx-sep" />
                  <p><b>Stufe</b>: {{ active.payload?.form?.level }}</p>
                  <p><b>Schwierigkeit</b>: {{ active.payload?.form?.difficulty }}</p>
                  <p><b>Cruor</b>: {{ active.payload?.form?.cost }}</p>
                  <p><b>Wirkung</b>: {{ active.payload?.form?.effect }}</p>
                  <p v-if="active.payload?.form?.limits"><b>Grenzen</b>: {{ active.payload.form.limits }}</p>
                </template>

                <template v-else-if="active.kind === 'dbhouse'">
                  <small v-if="active.payload?.epithet"><i>{{ active.payload.epithet }}</i></small>
                  <div class="qlx-sep" />
                  <p><b>Leitidee</b>: {{ active.payload?.idea }}</p>
                  <p v-if="active.payload?.reputation"><b>Ruf</b>: {{ active.payload.reputation }}</p>
                  <p v-if="active.payload?.description">{{ active.payload.description }}</p>
                  <p v-if="active.payload?.scar">
                    <b>Blood Scar</b>: {{ active.payload.scar.name }}, {{ active.payload.scar.summary }}
                  </p>
                  <b>Anathema</b>
                  <p v-for="(a, i) in (active.payload?.anathema || [])" :key="i" class="qlx-effect">
                    • {{ dbInfluenceName(a.influenceKey) }}: {{ dbLevelName(a.level) }}
                  </p>
                </template>

                <template v-else-if="active.kind === 'dbscar'">
                  <small v-if="active.payload?.scar?.summary"><i>{{ active.payload.scar.summary }}</i></small>
                  <div class="qlx-sep" />
                  <p><b>Auslöser</b>: {{ (active.payload?.scar?.triggers || []).join(", ") }}</p>
                  <p><b>Dauerhafte Wirkung</b>: {{ active.payload?.scar?.permanentEffect }}</p>
                  <b>Zwänge</b>
                  <p v-for="(c, i) in (active.payload?.scar?.compulsions || [])" :key="i" class="qlx-effect">
                    • {{ c }}
                  </p>
                </template>

                <template v-else-if="active.kind === 'dbinfluence'">
                  <small class="text-muted">{{ influenceKindLabel(active.payload?.kind) }}</small>
                  <div class="qlx-sep" />
                  <p><b>Grundstufe</b>: {{ dbLevelName(active.payload?.baseLevel) }}</p>
                  <p v-if="active.payload?.note">{{ active.payload.note }}</p>
                </template>

                <template v-else-if="active.kind === 'dbanathema'">
                  <small class="text-muted">Anathema-Stufe</small>
                  <div class="qlx-sep" />
                  <p><b>Körperlich</b>: {{ active.payload?.physical }}</p>
                  <p><b>Symbolisch</b>: {{ active.payload?.symbolic }}</p>
                </template>

                <template v-else-if="active.kind === 'dbbackground'">
                  <small v-if="active.payload?.description"><i>{{ active.payload.description }}</i></small>
                  <div class="qlx-sep" />
                  <p v-for="l in (active.payload?.levels || [])" :key="l.level" class="qlx-effect">
                    • Stufe {{ l.level }}: {{ l.description }}
                  </p>
                </template>

                <template v-else-if="active.kind === 'dborder'">
                  <small v-if="active.payload?.motto"><i>{{ active.payload.motto }}</i></small>
                  <div class="qlx-sep" />
                  <p>{{ active.payload?.description }}</p>
                </template>

                <template v-else-if="active.kind === 'dbcourtrank'">
                  <small class="text-muted">Stand im Court</small>
                  <div class="qlx-sep" />
                  <p><b>Rechte</b>: {{ active.payload?.rights }}</p>
                  <p><b>Bonus</b>: {{ active.payload?.bonus }} Würfel</p>
                </template>

                <template v-else-if="active.kind === 'dblexicon'">
                  <small class="text-muted">{{ active.payload?.section }}</small>
                  <div class="qlx-sep" />
                  <LexiconMarkdown class="qlx-md" :source="active.payload?.body || ''" />
                </template>

                <template v-else-if="active.kind === 'dbfirst'">
                  <small class="text-muted">{{ active.payload?.role }}</small>
                  <div class="qlx-sep" />
                  <p><b>Antrieb:</b> {{ active.payload?.motivation }}</p>
                  <p><b>Späteres Ideal:</b> {{ active.payload?.ideal }}</p>
                  <p>{{ active.payload?.description }}</p>
                  <p v-if="active.payload?.urScar"><b>Ur-Scar:</b> {{ active.payload?.urScar }}</p>
                  <p v-if="active.payload?.fate"><b>Schicksal:</b> {{ active.payload?.fate }}</p>
                  <blockquote v-if="active.payload?.question">{{ active.payload?.question }}</blockquote>
                </template>

                <template v-else-if="active.kind === 'dbcovenant'">
                  <small class="text-muted">Der Bund der Schweigenden Nacht</small>
                  <div class="qlx-sep" />
                  <LexiconMarkdown class="qlx-md" :source="active.payload?.body || ''" />
                </template>

                <template v-else>
                  <p v-if="active.text">{{ active.text }}</p>
                  <small v-else class="text-muted">Keine Vorschau verfügbar.</small>
                </template>
              </div>

              <div v-if="active.sub" class="qlx-sub">
                <h4>Verwandte Einträge</h4>
                <button
                  v-for="s in active.sub"
                  :key="s.id"
                  type="button"
                  class="qlx-sub-item"
                  @click="pick(s)"
                >
                  <span class="qlx-kind">{{ kindLabel(s.kind) }}</span>
                  {{ s.title }} <small v-if="s.subtitle">» {{ s.subtitle }}</small>
                </button>
              </div>
            </div>

            <div v-else class="qlx-preview-inner qlx-empty">
              <b>Wähle links einen Eintrag.</b>
              <small class="text-muted">Oder tippe, um zu suchen.</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<style scoped lang="scss">
.qlx-root {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: grid;
  place-items: center;
  padding: 2rem 1.25rem;
}

.qlx-backdrop {
  position: absolute;
  inset: 0;
  background: radial-gradient(900px 500px at 20% 10%, color-mix(in srgb, var(--accent) 20%, transparent), transparent 60%),
  rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(10px);
  animation: qlxFade 160ms ease-out;
}

.qlx-panel {
  position: relative;
  width: min(1100px, 100%);
  height: min(720px, 100%);
  border-radius: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.10);
  background:
    radial-gradient(900px 420px at 12% 0%, color-mix(in srgb, var(--accent) 16%, transparent), transparent 60%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.08), transparent 55%),
    linear-gradient(180deg, var(--bg-2), var(--bg-1));
  box-shadow:
    0 30px 90px rgba(0, 0, 0, 0.65),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  overflow: hidden;
  animation: qlxPop 180ms var(--ease-2);
}

.qlx-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.1rem 0.85rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.qlx-title {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-family: Cinzel, serif;
  letter-spacing: 0.02em;
  font-size: 1.05rem;
}

.qlx-kbd {
  font-family: Inter, system-ui, sans-serif;
  font-size: 0.85rem;
  padding: 0.12rem 0.45rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.06);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.qlx-close {
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.08), transparent 60%),
    rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.06);
  transition: transform var(--dur-2) var(--ease-2), filter var(--dur-2) var(--ease-2), border-color var(--dur-2) var(--ease-2);
}

.qlx-close:hover {
  filter: brightness(1.06);
  border-color: rgba(255, 255, 255, 0.18);
  transform: translateY(-1px);
}

.qlx-close:active {
  transform: translateY(0);
  filter: brightness(0.98);
}

.qlx-search {
  padding: 0.9rem 1.1rem 0.95rem;
  display: flex;
  gap: 0.9rem;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.qlx-input {
  flex: 1;
  height: 3.1rem;
  font-size: 1.05rem;
  border-radius: 0.9rem;
}

.qlx-hint {
  display: flex;
  gap: 0.4rem;
  align-items: center;
  flex-shrink: 0;
}

.qlx-chip {
  font-family: Inter, system-ui, sans-serif;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.75);
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.10);
  background: rgba(255, 255, 255, 0.05);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.qlx-body {
  display: grid;
  grid-template-columns: 360px 1fr;
  height: calc(100% - 128px);
}

.qlx-results {
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  overflow: auto;
  padding: 0.75rem;
}

.qlx-item {
  width: 100%;
  text-align: left;
  border: 1px solid transparent;
  background: transparent;
  border-radius: 0.9rem;
  padding: 0.65rem 0.7rem;
  margin-bottom: 0.5rem;
  transition: transform var(--dur-2) var(--ease-2), background var(--dur-2) var(--ease-2), border-color var(--dur-2) var(--ease-2);
}

.qlx-item:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
}

.qlx-item.active {
  background:
    radial-gradient(420px 160px at 10% 20%, color-mix(in srgb, var(--accent) 18%, transparent), transparent 55%),
    rgba(255, 255, 255, 0.04);
  border-color: color-mix(in srgb, var(--accent) 35%, rgba(255, 255, 255, 0.10));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.qlx-item-top {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
}

.qlx-kind {
  font-size: 0.75rem;
  padding: 0.12rem 0.45rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.75);
}

.qlx-kind.big {
  font-size: 0.78rem;
}

.qlx-universe {
  font-family: Cinzel, serif;
  letter-spacing: 0.02em;
}

.qlx-md {
  font-size: 1rem;
}

.qlx-item-title {
  font-size: 1rem;
}

.qlx-item-sub {
  display: block;
  margin-top: 0.2rem;
  font-size: 0.9rem;
}

.qlx-preview {
  overflow: auto;
  padding: 1.1rem 1.25rem;
}

.qlx-preview-inner {
  border-radius: 1.1rem;
  border: 1px solid rgba(255, 255, 255, 0.10);
  background:
    radial-gradient(680px 220px at 15% 0%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 58%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), transparent 55%),
    rgba(255, 255, 255, 0.03);
  box-shadow: 0 22px 60px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.06);
  padding: 1rem 1.05rem 1.15rem;
}

.qlx-preview-title h3 {
  margin: 0.2rem 0 0;
  font-family: Cinzel, serif;
  letter-spacing: 0.02em;
}

.qlx-preview-content {
  margin-top: 0.9rem;
  font-size: 1.05rem;
  line-height: 1.6;
}

.qlx-sub {
  margin-top: 1.25rem;
}

.qlx-sub h4 {
  margin-bottom: 0.75rem;
}

.qlx-sub-item {
  cursor: pointer;
  width: 100%;
  text-align: left;
  border: 1px solid transparent;
  background: transparent;
  border-radius: 0.75rem;
  padding: 0.5rem 0.65rem;
  margin-bottom: 0.45rem;
  transition: transform var(--dur-2) var(--ease-2), background var(--dur-2) var(--ease-2), border-color var(--dur-2) var(--ease-2);
  &:hover {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.08);
  }
  &:active {
    background: radial-gradient(420px 160px at 10% 20%, color-mix(in srgb, var(--accent) 18%, transparent), transparent 55%),
    rgba(255, 255, 255, 0.04);
    border-color: color-mix(in srgb, var(--accent) 35%, rgba(255, 255, 255, 0.10));
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
  }
}

.qlx-sep {
  height: 1px;
  background: rgba(255, 255, 255, 0.10);
  margin: 0.85rem 0;
}

.qlx-effect {
  margin: 0.2rem 0;
  padding-left: 0.25rem;
}

.qlx-empty {
  padding: 1.2rem;
  border-radius: 1rem;
  border: 1px dashed rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.03);
}

@media (max-width: 980px) {
  .qlx-panel {
    height: min(780px, 100%);
  }
  .qlx-body {
    grid-template-columns: 1fr;
  }
  .qlx-results {
    max-height: 38%;
    border-right: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }
}

@keyframes qlxPop {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.985);
    filter: blur(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

@keyframes qlxFade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
