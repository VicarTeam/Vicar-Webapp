import { reactive } from "vue"
import { post } from "@/libs/io/rest"

export type OnyxResult = "linked" | "taken" | "other" | "failed" | "cancelled" | "expired" | "register_only"

export const onyxState = reactive({
  enabled: false,
  linked: true,
  loggedIn: false,
  result: null as OnyxResult | null,
})

const claimStorageKey = "vicar:onyx-claim"

export const onyxMessages: Record<OnyxResult, string> = {
  linked: "Dein Account ist jetzt mit Onyx verbunden. Ab sofort kannst du dich mit Onyx einloggen.",
  taken: "Dieses Onyx-Konto ist bereits mit einem anderen Vicar-Account verbunden.",
  other: "Dein Vicar-Account ist bereits mit einem anderen Onyx-Konto verbunden.",
  failed: "Die Verbindung zu Onyx ist fehlgeschlagen. Versuche es gleich noch einmal.",
  cancelled: "Die Anmeldung bei Onyx wurde abgebrochen.",
  expired: "Die Anmeldung bei Onyx ist abgelaufen. Starte sie bitte erneut.",
  register_only: "Für diesen Login gibt es keinen Vicar-Account. Neue Accounts können nur noch über Onyx erstellt werden.",
}

export function isOnyxResult(value: unknown): value is OnyxResult {
  return typeof value === "string" && value in onyxMessages
}

export function onyxApiUrl(path: string): string {
  return (import.meta as any).env.VITE_APP_API_URL + path
}

export function applyOnyxAccount(account: { onyxEnabled?: boolean; onyxLinked?: boolean }) {
  onyxState.enabled = !!account.onyxEnabled
  onyxState.linked = !!account.onyxLinked
  onyxState.loggedIn = true
}

export async function startOnyxLink(): Promise<void> {
  const [status, response] = await post<{ url: string }>("/auth/onyx/link")
  if (status !== 200 || !response.url) {
    throw new Error("onyx link failed")
  }
  window.location.href = response.url
}

export function rememberOnyxClaim(claim: string) {
  sessionStorage.setItem(claimStorageKey, claim)
}

export function hasPendingOnyxClaim(): boolean {
  return sessionStorage.getItem(claimStorageKey) !== null
}

export function forgetOnyxClaim() {
  sessionStorage.removeItem(claimStorageKey)
}

export async function completePendingOnyxClaim(): Promise<string | null> {
  const claim = sessionStorage.getItem(claimStorageKey)
  if (!claim) {
    return null
  }
  forgetOnyxClaim()
  const [status, response] = await post<{ result: string; username?: string }>("/auth/onyx/claim", { claim })
  if (status !== 200) {
    onyxState.result = "failed"
    return null
  }
  onyxState.result = isOnyxResult(response.result) ? response.result : "failed"
  if (onyxState.result === "linked") {
    onyxState.linked = true
    return response.username ?? null
  }
  return null
}
