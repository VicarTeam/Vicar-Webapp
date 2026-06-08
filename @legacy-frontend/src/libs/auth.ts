export type SessionInput = {
  accessToken: string;
  exp: number;
  refreshToken: string;
};

export type SessionStatus =
  | { status: "ok", accessToken: string }
  | { status: "needs_refresh"; accessToken: string; refreshToken: string }
  | { status: "not_found" };

export type RefreshResult =
  | { status: "ok" }
  | { status: "refreshed"; accessToken: string; exp: number }
  | { status: "not_found" }
  | { status: "failed"; reason: string };

// ========================
// In-Memory Cache
// ========================
let _accessToken: string | null = null;
let _expMs: number | null = null;
let _refreshToken: string | null = null;

// ========================
// Storage Keys
// ========================
const LS_ATK = "vicar:__s";

// ========================
// IndexedDB minimal helpers
// ========================
const IDB_NAME = "vicar:auth";
const IDB_STORE = "vicar:session";
const IDB_KEY_REFRESH = "vicar:rtk";

const PREEMPT_SECONDS = 15;

export async function setSession(session: SessionInput): Promise<void> {
  _accessToken = session.accessToken;
  _expMs = session.exp;
  _refreshToken = session.refreshToken;

  localStorage.setItem(LS_ATK, btoa(JSON.stringify({atk: _accessToken, exp: _expMs})));

  await idbSetRefreshToken(session.refreshToken);
}


export async function checkSession(): Promise<SessionStatus> {
  await ensureLoadedFromStorage();

  if (!_accessToken || !_expMs || !_refreshToken) {
    return { status: "not_found" };
  }

  const now = Date.now();
  const preemptMs = PREEMPT_SECONDS * 1000;

  if (_expMs - now <= preemptMs) {
    return { status: "needs_refresh", accessToken: _accessToken, refreshToken: _refreshToken };
  }

  return { status: "ok", accessToken: _accessToken };
}

export async function logout(): Promise<void> {
  _accessToken = null;
  _expMs = null;
  _refreshToken = null;

  localStorage.removeItem(LS_ATK);

  await idbDeleteRefreshToken();
}

export async function getAccessToken(): Promise<string | null> {
  await ensureLoadedFromStorage();
  return _accessToken;
}

export async function refreshIfNeeded(): Promise<RefreshResult> {
  const status = await checkSession();

  if (status.status === "not_found") return { status: "not_found" };
  if (status.status === "ok") return { status: "ok" };

  // needs_refresh
  const { accessToken, refreshToken } = status;

  try {
    const url = new URL("/auth/refresh", (import.meta as any).env.VITE_APP_API_URL || window.location.origin);
    url.searchParams.set("rtk", refreshToken);

    const resp = await fetch(url.toString(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!resp.ok) {
      // Refresh fehlgeschlagen → lokale Session leeren
      await logout();
      return { status: "failed", reason: `HTTP ${resp.status}` };
    }

    const data: { accessToken: string; refreshToken: string; exp: number } = await resp.json();

    await setSession({
      accessToken: data.accessToken,
      exp: data.exp,
      refreshToken: data.refreshToken,
    });

    return { status: "refreshed", accessToken: data.accessToken, exp: data.exp };
  } catch (e: any) {
    return { status: "failed", reason: e?.message ?? "network_error" };
  }
}

async function ensureLoadedFromStorage(): Promise<void> {
  if (_accessToken == null || _expMs) {
    const stored = localStorage.getItem(LS_ATK);
    if (stored) {
      try {
        const parsed = JSON.parse(atob(stored));
        _accessToken = parsed.atk;
        _expMs = parsed.exp;
      } catch (e) {
        console.error("Failed to parse session from localStorage", e);
        _accessToken = null;
        _expMs = null;
      }
    } else {
      _accessToken = null;
      _expMs = null;
    }
  }
  if (_refreshToken == null) {
    _refreshToken = await idbGetRefreshToken();
  }
}

function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbSetRefreshToken(token: string): Promise<void> {
  const db = await openIDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put(token, IDB_KEY_REFRESH);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function idbGetRefreshToken(): Promise<string | null> {
  const db = await openIDB();
  const val = await new Promise<string | null>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readonly");
    const req = tx.objectStore(IDB_STORE).get(IDB_KEY_REFRESH);
    req.onsuccess = () => resolve((req.result as string) ?? null);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return val;
}

async function idbDeleteRefreshToken(): Promise<void> {
  const db = await openIDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).delete(IDB_KEY_REFRESH);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}
