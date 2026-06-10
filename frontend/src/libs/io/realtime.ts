import { io, type Socket } from "socket.io-client"
import { ref } from "vue"

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

export function initRealtime() {
  if (socket) return
  if (!localStorage.getItem("vicar:session")) return

  socket = io(apiOrigin(), { path: "/api/socket.io" })

  socket.on("connect", () => socket?.emit("authenticate", localStorage.getItem("vicar:session")))

  socket.on("character_updated", (character: any) => {
    for (const h of charUpdateHandlers) h(character)
  })

  socket.on("fvtt-heartbeat", () => {
    fvttOnline.value = true
    if (hbTimeout) clearTimeout(hbTimeout)
    // Bleiben Heartbeats aus, gilt FVTT als offline.
    hbTimeout = setTimeout(() => { fvttOnline.value = false }, 8000)
  })
}

export function onCharacterUpdated(cb: (character: any) => void) {
  charUpdateHandlers.push(cb)
}

/** Würfelpool-Wurf an FoundryVTT (VicarTT) senden. */
export function rollInFvtt(data: any) {
  socket?.emit("fvtt-roll", data)
}
