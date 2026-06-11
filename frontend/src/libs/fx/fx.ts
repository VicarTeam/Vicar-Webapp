import { SettingsData } from "@/libs/io/settings"

/** Atmosphäre-Effekte (Vampire-Flair). Zentral ausgelöst über playFx(). */

export type FxKind =
  | "resonance"
  | "messyCrit"
  | "bestialFail"
  | "critSuccess"
  | "frenzy"
  | "hungerSpike"

export interface FxEvent {
  kind: FxKind
  payload?: any
}

type Handler = (e: FxEvent) => void
const handlers = new Set<Handler>()

export function onFx(handler: Handler): () => void {
  handlers.add(handler)
  return () => handlers.delete(handler)
}

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
}

/** Aufwändige visuelle Effekte erlaubt? (Master-Toggle + reduced-motion-Respekt) */
export function visualsEnabled(): boolean {
  return SettingsData.isFxEnabled() && !prefersReducedMotion()
}

/** Effekt auslösen. Master-Schalter aus -> komplett nichts. */
export function playFx(kind: FxKind, payload?: any) {
  if (!SettingsData.isFxEnabled()) return
  for (const h of handlers) h({ kind, payload })
}
