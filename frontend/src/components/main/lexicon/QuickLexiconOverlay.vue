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

type LexiconKind =
  | "clan"
  | "discipline"
  | "ability"
  | "bloodritual"
  | "oblivionceremony"
  | "trait"
  | "predator"
  | "custom"

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

const index = computed<LexiconEntry[]>(() => {
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
    await nextTick()
    inputRef.value?.focus()
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
          </div>

          <button class="qlx-close" type="button" @click="close">×</button>
        </div>

        <div class="qlx-search">
          <input
            ref="inputRef"
            class="form-control qlx-input"
            type="text"
            v-model="q"
            placeholder="Suchen… (Clan, Disziplin, Kraft, Ritual, Trait, …)"
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
