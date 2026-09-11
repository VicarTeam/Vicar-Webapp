import type { Router } from "vue-router"
import { io } from "socket.io-client"
import { useStore } from "@/app/store"
import { getAccessToken } from "@/libs/auth"

/**
 * Read-only + action bridge that lets an external driver (Playwright/MCP) observe
 * and drive the real editor UI. Active only in agent mode (opt-in), so the normal
 * app is completely unaffected. The single source of truth for "what can I do" are
 * the `data-agent` attributes already rendered by the UI - getState scans them,
 * act clicks/sets them, so every action goes through the real Vue handlers and
 * therefore obeys the same rules and works for every gameline.
 */

const AGENT_FLAG = "vicar::agent"

export interface AgentOption {
  text: string
  disabled: boolean
  blocked: boolean
}

export interface AgentAction {
  agent: string
  kind: string
  label: string
  disabled: boolean
  value?: string
  options?: AgentOption[]
}

export interface AgentState {
  agentMode: true
  view: string
  path: string
  gameline: string | null
  levelMode: boolean
  activeTab: string | null
  step: string | null
  hints: string[]
  character: Record<string, unknown> | null
  actions: AgentAction[]
  canProceed: boolean
  isFinishStep: boolean
}

export interface AgentActResult {
  ok: boolean
  error?: string
}

export interface AgentActParams {
  value?: string
  first?: boolean
  index?: number
}

export function agentMode(): string | null {
  try {
    const q = new URLSearchParams(window.location.search).get("agent")
    if (q) {
      window.sessionStorage.setItem(AGENT_FLAG, q)
      return q
    }
    return window.sessionStorage.getItem(AGENT_FLAG)
  } catch {
    return null
  }
}

export function isAgentMode(): boolean {
  return agentMode() !== null
}

/** Live mode (?agent=live): the tab is driven remotely via the socket.io relay. */
export function isLiveAgentMode(): boolean {
  return agentMode() === "live"
}

function isDisabled(el: Element): boolean {
  return (
    el.hasAttribute("disabled") ||
    (el as HTMLButtonElement).disabled === true ||
    el.getAttribute("aria-disabled") === "true"
  )
}

function readActions(): AgentAction[] {
  const els = Array.from(document.querySelectorAll<HTMLElement>("[data-agent]"))
  return els.map((el) => {
    const agent = el.getAttribute("data-agent") ?? ""
    const tag = el.tagName
    const isField = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT"
    const label = (
      el.getAttribute("data-agent-label") ||
      (isField ? (el as HTMLInputElement).placeholder : el.textContent) ||
      ""
    )
      .trim()
      .replace(/\s+/g, " ")
      .slice(0, 80)
    const action: AgentAction = { agent, kind: agent.split(":")[0] ?? "", label, disabled: isDisabled(el) }
    if (isField) {
      const input = el as HTMLInputElement
      action.value = input.type === "checkbox" ? (input.checked ? "checked" : "unchecked") : input.value
    }
    if (el.hasAttribute("data-agent-richtext")) {
      action.value = (el.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 400)
    }
    if (tag === "SELECT") {
      const sel = el as HTMLSelectElement
      action.options = Array.from(sel.options).map((o) => ({
        text: (o.textContent ?? "").trim(),
        disabled: o.disabled,
        blocked: o.classList.contains("not-selectable"),
      }))
      // Object-valued selects (v-model bound to an object) render el.value as
      // "[object Object]"; report the selected option's text instead.
      const selected = sel.options[sel.selectedIndex]
      action.value = selected ? (selected.textContent ?? "").trim() : ""
    }
    return action
  })
}

/**
 * Short, view-specific orientation for the driving agent: what this step is for
 * and how to complete it efficiently (pointing at bulk helpers where they apply).
 */
const STEP_INFO: Record<string, string> = {
  "editor-clan": "Clan-Schritt: waehle einen Clan (option:clan:<Name>) und trage den Erzeuger ein (input:sire), dann control:next.",
  "editor-predator-type": "Jagdverhalten: select:predator + predator:confirm, danach die Folge-Selects (select:pt-action:<i>), dann control:next.",
  "editor-traits": "Vorzuege/Schwaechen: pro Eintrag trait:add bzw. flaw:add, dann im Modal Kategorie (select:trait-pack) -> Eintrag (option:trait:<Name>) -> trait:confirm. Budget siehe hints.",
  "editor-attributes": "Attribute verteilen: setze alle select:attr:<key> auf die geforderten Werte (siehe hints). Nutze act_many, um alle in EINEM Aufruf zu setzen statt einzeln.",
  "editor-skills": "Faehigkeiten: zuerst select:skill-spread + skills:confirm, dann alle select:skill:<key> setzen (act_many!), danach die Spezialisierungen (input:spec-defined:<i>, select:free-spec, input:free-spec-name).",
  "editor-disciplines": "Disziplinen (Abschluss-Schritt): select:disc-1/disc-2 + disc:confirm, dann pro Karte disc:add:<id> -> select:disc-ability -> disc-ability:confirm bis alle Punkte weg sind, dann control:finish.",
  "editor-gifts": "Gaben-Schritt: folge den sichtbaren Aktionen, dann control:next/finish.",
  "editor-edges": "Edges-Schritt: folge den sichtbaren Aktionen, dann control:next/finish.",
  "viewer-attributes": "Attribute (Level-Modus): level:attr:<key> oeffnet das Modal; dort select:level-target auf die Zielstufe setzen (Kosten kumulativ) und level:confirm - ein einziger Sprung statt vieler Schritte.",
  "viewer-skills": "Faehigkeiten (Level-Modus): level:skill:<key> oeffnet das Modal; select:level-target auf die Zielstufe, dann level:confirm.",
  "viewer-disciplines": "Disziplinen (Level-Modus): level:disc:<id> zum Steigern (Faehigkeit via select:disc-ability + disc-ability:confirm) oder disc:new fuer eine neue Disziplin.",
  "viewer-profile": "Profil: Felder wie input:concept/ambition/sire, level:blood-potency (Modal mit select:level-target), set:humanity:<i>, set:hunger:<i>, input:anchors. XP via exp:open.",
  "viewer-inventory": "Inventar: inventory:add-carried/add-owned -> select:item-category -> select:item -> input:item-amount -> inventory:add-submit.",
  "viewer-traits": "Vorzuege/Schwaechen (Level-Modus): trait:add/flaw:add, dann im Modal Kategorie + Eintrag + trait:confirm.",
}

function stepInfo(view: string, levelMode: boolean): string | null {
  const base = STEP_INFO[view]
  if (!base) return null
  if (view.startsWith("viewer-") && !levelMode && view !== "viewer-profile" && view !== "viewer-inventory") {
    return `${base} Hinweis: Level-Modus ist aus - erst level:toggle, sonst sind die Level-Buttons nicht sichtbar.`
  }
  return base
}

function summarizeCharacter(char: any): Record<string, unknown> | null {
  if (!char) return null
  return {
    name: char.name ?? "",
    game: char.game ?? "vampire",
    sire: char.sire,
    clan: char.clan?.name ?? null,
    predatorType: char.predatorType?.name ?? null,
    generation: char.generation,
    generationEra: char.generationEra,
    exp: char.exp,
    humanity: char.humanity,
    hunger: char.hunger,
    bloodPotency: char.bloodPotency,
    avatar: char.avatar,
    disciplines: Array.isArray(char.disciplines) ? char.disciplines.length : undefined,
    tribe: char.tribe?.name ?? undefined,
    auspice: char.auspice?.name ?? undefined,
    tradition: char.tradition?.name ?? undefined,
    creed: char.creed?.name ?? undefined,
    road: char.road?.name ?? undefined,
  }
}

function selectOption(sel: HTMLSelectElement, params?: AgentActParams): AgentActResult {
  const options = Array.from(sel.options)
  let idx = -1
  if (params?.value !== undefined) {
    const target = String(params.value)
    idx = options.findIndex((o) => (o.textContent ?? "").trim() === target || o.value === target)
  } else if (typeof params?.index === "number") {
    idx = params.index
  } else if (params?.first) {
    idx = options.findIndex((o) => !o.disabled && o.value !== "")
    if (idx < 0) idx = options.findIndex((o) => !o.disabled)
  }
  if (idx < 0 || idx >= options.length) return { ok: false, error: "no matching option" }
  if (options[idx]!.disabled) return { ok: false, error: "option is disabled" }
  sel.selectedIndex = idx
  sel.dispatchEvent(new Event("change", { bubbles: true }))
  sel.dispatchEvent(new Event("input", { bubbles: true }))
  return { ok: true }
}

function setNativeValue(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
  const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set
  setter?.call(el, value)
  el.dispatchEvent(new Event("input", { bubbles: true }))
  el.dispatchEvent(new Event("change", { bubbles: true }))
}

export function installAgentBridge(router: Router) {
  const store = useStore()

  function getState(): AgentState {
    const actions = readActions()
    const next = actions.find((a) => a.agent === "control:next")
    const finish = actions.find((a) => a.agent === "control:finish")
    const proceed = finish ?? next
    const char = store.editingCharacter as any
    const view = String(router.currentRoute.value.name ?? "")
    const levelMode = !!store.isLevelMode
    return {
      agentMode: true,
      view,
      path: window.location.pathname,
      gameline: char?.game ?? null,
      levelMode,
      activeTab: document.querySelector('[data-agent^="tab:"].active')?.getAttribute("data-agent") ?? null,
      step: stepInfo(view, levelMode),
      hints: Array.from(document.querySelectorAll<HTMLElement>("[data-agent-hint]"))
        .map((el) => (el.textContent ?? "").trim().replace(/\s+/g, " "))
        .filter((t) => t.length > 0),
      character: summarizeCharacter(char),
      actions,
      canProceed: proceed ? !proceed.disabled : false,
      isFinishStep: !!finish,
    }
  }

  function act(agent: string, params?: AgentActParams): AgentActResult {
    let el: Element | null = null
    try {
      el = document.querySelector(`[data-agent="${window.CSS.escape(agent)}"]`)
    } catch {
      el = null
    }
    if (!el) return { ok: false, error: `no element for data-agent="${agent}"` }
    const tag = el.tagName
    if (tag === "SELECT") {
      return selectOption(el as HTMLSelectElement, params)
    }
    if ((tag === "INPUT" || tag === "TEXTAREA") && params && params.value !== undefined) {
      setNativeValue(el as HTMLInputElement, String(params.value))
      return { ok: true }
    }
    if (el.hasAttribute("data-agent-richtext") && params && params.value !== undefined) {
      el.dispatchEvent(new CustomEvent("vicar-agent-set", { detail: { value: String(params.value) } }))
      return { ok: true }
    }
    ;(el as HTMLElement).click()
    return { ok: true }
  }

  window.__vicarAgent = { getState, act, listActions: readActions }
}

function apiOrigin(): string {
  const base = ((import.meta as any).env.VITE_APP_API_URL as string) || ""
  return base.startsWith("http") ? base : window.location.origin
}

function showLiveIndicator() {
  if (document.getElementById("vicar-agent-live")) return
  const el = document.createElement("div")
  el.id = "vicar-agent-live"
  el.textContent = "● Agent steuert diesen Tab live"
  Object.assign(el.style, {
    position: "fixed",
    bottom: "12px",
    right: "12px",
    zIndex: "999999",
    background: "rgba(200,30,30,0.92)",
    color: "#fff",
    padding: "8px 12px",
    borderRadius: "8px",
    font: "600 13px system-ui, sans-serif",
    pointerEvents: "none",
    boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
  })
  document.body.appendChild(el)
}

/**
 * Connects the visible tab to the socket.io agent relay as the "bridge": the MCP
 * controller sends agent-command, this executes it against the local bridge and
 * returns agent-result. Pairing is automatic via the logged-in user.
 */
export function startLiveBridge() {
  const socket = io(apiOrigin(), { path: "/api/socket.io" })

  socket.on("connect", async () => {
    const token = await getAccessToken()
    if (token) {
      socket.emit("agent-authenticate", { token, role: "bridge" })
    }
  })

  socket.on("agent-authenticated", () => showLiveIndicator())

  socket.on("agent-command", (msg: { id?: string; kind?: string; action?: string; params?: AgentActParams }) => {
    const bridge = window.__vicarAgent
    let result: unknown
    try {
      if (!bridge) {
        result = { ok: false, error: "bridge not ready" }
      } else if (msg?.kind === "getState") {
        result = { ok: true, state: bridge.getState() }
      } else if (msg?.kind === "act") {
        result = bridge.act(msg.action ?? "", msg.params)
      } else {
        result = { ok: false, error: `unknown kind: ${msg?.kind}` }
      }
    } catch (e) {
      result = { ok: false, error: String(e) }
    }
    socket.emit("agent-result", { id: msg?.id, result })
  })
}

declare global {
  interface Window {
    __vicarAgent?: {
      getState: () => AgentState
      act: (agent: string, params?: AgentActParams) => AgentActResult
      listActions: () => AgentAction[]
    }
  }
}
