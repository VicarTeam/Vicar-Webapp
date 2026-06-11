import { io, type Socket } from "socket.io-client"
import { ref } from "vue"
import { checkSession, getAccessToken, refreshIfNeeded } from "@/libs/auth"
import { playFx, type FxKind } from "@/libs/fx/fx"

function outcomeToFx(outcome: string): FxKind | null {
  switch (outcome) {
    case "MESSY_CRITICAL": return "messyCrit"
    case "BESTIAL_FAILURE": return "bestialFail"
    case "CRITICAL_SUCCESS": return "critSuccess"
    default: return null
  }
}

/**
 * Gemeinsamer Realtime-Socket: Character-Updates (Legacy) + FoundryVTT-Bridge.
 * Läuft unter dem Pfad /api/socket.io, damit er in der single-origin-Prod durch
 * den nginx-/api-Proxy (mit WS-Upgrade) erreichbar ist.
 */

let socket: Socket | null = null
const charUpdateHandlers: ((character: any) => void)[] = []

/** true, solange regelmäßig FVTT-Heartbeats eintreffen (steuert den „In FVTT würfeln"-Button). */
export const fvttOnline = ref(false)
let hbTimeout: ReturnType<typeof setTimeout> | null = null

function apiOrigin(): string {
  const base = ((import.meta as any).env.VITE_APP_API_URL as string) || ""
  // Prod: relative Base "/api" -> aktueller Origin. Dev: absolute Backend-URL.
  return base.startsWith("http") ? base : window.location.origin
}

/** Aktuellen (ggf. aufgefrischten) Access-Token holen – wie rest.ts buildHeaders. */
async function currentToken(): Promise<string | null> {
  const s = await checkSession()
  if (s.status === "needs_refresh") await refreshIfNeeded().catch(() => void 0)
  return getAccessToken()
}

export function initRealtime() {
  if (socket) return

  socket = io(apiOrigin(), { path: "/api/socket.io" })

  // Beim (Re-)Connect mit dem echten Access-Token authentifizieren (in IndexedDB/LS,
  // NICHT unter dem localStorage-Key "vicar:session" – das war der bisherige Bug).
  socket.on("connect", async () => {
    const tok = await currentToken()
    if (tok) socket?.emit("authenticate", tok)
  })

  socket.on("character_updated", (character: any) => {
    for (const h of charUpdateHandlers) h(character)
  })

  socket.on("fvtt-heartbeat", () => {
    fvttOnline.value = true
    if (hbTimeout) clearTimeout(hbTimeout)
    // Bleiben Heartbeats aus, gilt FVTT als offline.
    hbTimeout = setTimeout(() => { fvttOnline.value = false }, 8000)
  })

  // GM-Trigger (z.B. Raserei) -> Effekt beim Spieler.
  socket.on("fx", ({ kind }: { kind: FxKind }) => playFx(kind))

  // Wurf-Ergebnis aus FVTT -> Outcome-Effekt (Messy/Bestial/Critical).
  socket.on("fvtt-roll-result", ({ outcome }: { outcome: string }) => {
    const k = outcomeToFx(outcome)
    if (k) playFx(k)
  })
}

/** GM löst einen Effekt beim Spieler des Charakters aus (Server prüft Owner/Viewer/Admin). */
export function triggerFx(characterId: string, kind: string) {
  socket?.emit("fx-trigger", { characterId, kind })
}

export function onCharacterUpdated(cb: (character: any) => void) {
  charUpdateHandlers.push(cb)
}

/** Würfelpool-Wurf an FoundryVTT (VicarTT) senden. */
export function rollInFvtt(data: any) {
  socket?.emit("fvtt-roll", data)
}
