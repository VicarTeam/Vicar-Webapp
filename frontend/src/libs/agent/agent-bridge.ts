import type { Router } from "vue-router"
import { useStore } from "@/app/store"

/**
 * Read-only + action bridge that lets an external driver (Playwright/MCP) observe
 * and drive the real editor UI. Active only in agent mode (opt-in), so the normal
 * app is completely unaffected. The single source of truth for "what can I do" are
 * the `data-agent` attributes already rendered by the UI - getState scans them,
 * act clicks/sets them, so every action goes through the real Vue handlers and
 * therefore obeys the same rules and works for every gameline.
 */

const AGENT_FLAG = "vicar::agent"

export interface AgentAction {
  agent: string
  kind: string
  label: string
  disabled: boolean
  value?: string
}

export interface AgentState {
  agentMode: true
  view: string
  path: string
  gameline: string | null
  character: Record<string, unknown> | null
  actions: AgentAction[]
  canProceed: boolean
  isFinishStep: boolean
}

export interface AgentActResult {
  ok: boolean
  error?: string
}

export function isAgentMode(): boolean {
  try {
    if (new URLSearchParams(window.location.search).has("agent")) {
      window.sessionStorage.setItem(AGENT_FLAG, "1")
      return true
    }
    return window.sessionStorage.getItem(AGENT_FLAG) === "1"
  } catch {
    return false
  }
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
      action.value = (el as HTMLInputElement).value
    }
    return action
  })
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
    disciplines: Array.isArray(char.disciplines) ? char.disciplines.length : undefined,
    tribe: char.tribe?.name ?? undefined,
    auspice: char.auspice?.name ?? undefined,
    tradition: char.tradition?.name ?? undefined,
    creed: char.creed?.name ?? undefined,
    road: char.road?.name ?? undefined,
  }
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
    return {
      agentMode: true,
      view: String(router.currentRoute.value.name ?? ""),
      path: window.location.pathname,
      gameline: char?.game ?? null,
      character: summarizeCharacter(char),
      actions,
      canProceed: proceed ? !proceed.disabled : false,
      isFinishStep: !!finish,
    }
  }

  function act(agent: string, params?: { value?: string }): AgentActResult {
    let el: Element | null = null
    try {
      el = document.querySelector(`[data-agent="${window.CSS.escape(agent)}"]`)
    } catch {
      el = null
    }
    if (!el) return { ok: false, error: `no element for data-agent="${agent}"` }
    const tag = el.tagName
    if ((tag === "INPUT" || tag === "TEXTAREA") && params && params.value !== undefined) {
      setNativeValue(el as HTMLInputElement, String(params.value))
      return { ok: true }
    }
    ;(el as HTMLElement).click()
    return { ok: true }
  }

  window.__vicarAgent = { getState, act, listActions: readActions }
}

declare global {
  interface Window {
    __vicarAgent?: {
      getState: () => AgentState
      act: (agent: string, params?: { value?: string }) => AgentActResult
      listActions: () => AgentAction[]
    }
  }
}
