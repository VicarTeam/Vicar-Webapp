# Agent/MCP-Schnittstelle: Plan

Ziel: Agents (via MCP) sollen im Namen eines Users Charaktere und Ordner
anlegen koennen - und dabei automatisch alle Editor-Regeln und alle Gamelines
befolgen. Der Kniff: **die echte Vicar-Web-UI ist die Regel-Engine.** Ein Agent
bedient die reale Oberflaeche (eingeloggt als der User), statt dass wir die
Regeln irgendwo nachbauen.

## Getroffene Entscheidungen

- **Steuerungsart: instrumentierte UI.** Wir versehen die interaktiven
  Editor-Elemente mit stabilen `data-agent`-Attributen und legen einen
  read-only `window.__vicarAgent.getState()` ueber den Pinia-Store. Der Treiber
  klickt per semantischem Attribut und liest kompaktes JSON statt rohem DOM.
  Robust, schlank, minimal-invasiv (keine Aenderung der Editor-Logik).
- **Betriebsmodi: beide.** Headless (serverseitig, Default) und Live/sichtbar
  (dedizierter Agent-Tab, den man zuschauen kann).
- **Ablage: eigenes `mcp/`-Verzeichnis im Repo** (Node/TS MCP-Server + Treiber),
  plus die `data-agent`-Hooks im `frontend/` und den Agent-Token im `backend-go/`.

## Architektur

```
Agent/LLM
   |  (MCP-Tools)
MCP-Server (mcp/, Node/TS)
   |  (CDP / Playwright bzw. WS-Relay)
Browser-Treiber (Playwright)  ── isolierter BrowserContext pro Agent-Session
   |
echte Vicar-Web-App (Vue)
   |  data-agent="..."  +  window.__vicarAgent.getState()/act()
reale Vue-Handler -> Resolver/Regeln -> Backend (Go, split Mongo/Postgres)
```

Weil jede Aktion durch die reale Vue-Logik + Resolver laeuft, gelten Regeln und
Validierung 1:1 - fuer alle Gamelines gratis.

## Komponente 1: Agent-Bridge im Frontend

Additiv und **opt-in** - nur aktiv im Agent-Modus (Query-Flag `?agent=1` bzw.
Agent-Session-Marker). Ausserhalb davon komplett inert, der normale Editor
bleibt unberuehrt.

### 1a. `data-agent`-Attribute
Stabile, semantische Marker auf allen interaktiven Elementen des Erstellungs-
und Ordner-Flows, z.B.:
- `data-agent="clan-option:Brujah"`, `data-agent="attribute:Strength:inc"`,
  `data-agent="discipline-add:Celerity"`, `data-agent="wizard:next"`,
  `data-agent="wizard:finish"`, `data-agent="folder:create"`.
Vorteil: Der Treiber zielt auf semantische IDs, nicht auf fragile CSS-Selektoren
- ueberlebt Restyling. Betrifft ~40 Editor-Komponenten + Ordner-UI (nur
Attribute anhaengen, keine Logik aendern).

### 1b. `window.__vicarAgent`
Ein kleines Modul, das nur im Agent-Modus registriert wird:
- `getState()` -> kompaktes JSON aus dem Pinia-Store + Route:
  ```
  {
    view: "editor-clan" | "characters" | ...,
    gameline: "vampire" | "werewolf" | ...,
    step: { name, index, total },
    character: { name, clan, generation, ... } | null,   // Kurzfassung
    options: [ { id, label, dataAgent } ],               // aktuell waehlbar
    canProceed: boolean,
    blockers: [ "Attribute noch nicht verteilt", ... ],  // warum nicht weiter
    errors: [ ... ]
  }
  ```
- `act(action, params)` (optional, Stufe 2): semantische Aktion, die intern
  denselben Handler/Store-Call wie der UI-Button ausloest. Anfangs reicht: der
  Treiber klickt die `data-agent`-Elemente direkt; `act()` ist die spaetere,
  robustere Abstraktion.
- `listActions()` -> welche `data-agent`-Aktionen im aktuellen View verfuegbar
  sind (fuer den Agenten "was kann ich tun").

Der State-Reader liest bestehende Store-Felder (`editingCharacter`,
`isLevelMode`, `overrideGameLine`, Schritt-Gating der Wizard-Steps) und die
`DataManager`-Optionen des aktuellen Schritts. Read-only, kein Editor-Refactor.

## Komponente 2: MCP-Server (`mcp/`)

Node/TS. Bietet dem Agenten Tools und uebersetzt sie in Treiber-Befehle.

Tool-Oberflaeche (Entwurf):
- `open_session()` / `close_session()`
- `get_state()` -> Ergebnis von `__vicarAgent.getState()`
- `start_character(gameline)` / `create_folder(name, parent?)`
- `move_character(characterId, folderId|null)`
- `act(action, params)` -> Klick/semantische Aktion (per `data-agent`)
- `list_characters()` / `list_folders()`
- (Live) `attach_visible_tab(sessionUrl)`

Agent-Loop: `get_state` -> entscheiden -> `act` -> `get_state` -> ... -> `finish`.

Session-/Context-Pool: **ein** Playwright-Browser, viele isolierte Contexts;
warmer Context je User-Session, Idle-Eviction, Concurrency-Cap.

## Komponente 3: Browser-Treiber (Playwright)

- **Headless (Default):** serverseitig, isolierter BrowserContext pro Session.
- **Live/sichtbar:** entweder Playwright headful (streambar) oder der User
  oeffnet einen dedizierten Agent-Tab (`/editor?agent=...`), der sich per
  WebSocket beim MCP-Relay meldet; der Agent steuert genau diesen Tab, der User
  schaut zu. Immer ein **eigener** Tab, nie der Arbeits-Tab des Users.

## Komponente 4: Backend - Agent-Token

Vorbild: der vorhandene `fvttToken` (langlebig, rotierbar, per User).
- Eigener Token-Typ mit optionalen **Scopes** (`characters:create`,
  `folders:*`, `read`).
- Endpunkte analog: `GET/POST/DELETE /users/@me/agent-token`.
- **Auth-Middleware erweitern:** HTTP-Guard akzeptiert den Agent-Token als
  Bearer-Alternative (heute nur kurzlebiges Access-JWT). Optional ein
  Login-Austausch: Agent-Token -> Browser-Session (JWT) im isolierten Context,
  damit die App ganz normal laeuft.

## Isolation ("nicht in den echten Editor reingretschen")

- **Getrennter BrowserContext/Session** -> eigener In-Memory-Pinia-State +
  eigenes localStorage (`EditorHistory`, `editingCharacter`, Daten-Bundle). Der
  Arbeits-Tab des Users wird nie angefasst.
- **Backend-Daten sind geteilt**, aber der Use-Case ist *anlegen* (neue
  Charaktere/Ordner) -> kein Konflikt. Bei gleichzeitigem Editieren desselben
  Charakters droht Last-Write-Wins -> Agent arbeitet auf eigenen/neuen Objekten,
  Warnung bei Kollision.
- Realtime pusht laut aktuellem Stand **kein** `character_updated` (toter Code)
  -> Agent-Aktionen springen dem User nicht live in die offene Liste. **Zu
  verifizieren** und bewusst so belassen.
- Die Bridge ist rein additiv/opt-in -> Editor-Code bleibt sauber.

## Performance

- Headless-Browser sind schwer (~150-300 MB/Instanz). Ein Browser + viele
  isolierte Contexts, warme Wiederverwendung, Idle-Eviction, Concurrency-Cap.
- Semantische State-Abfrage = kleines JSON (kein Screenshot-Diffing) -> wenig
  Tokens, schnelle Schritte. Screenshots nur im Live-Modus.

## Repo-Struktur

```
Vicar-Webapp/
  mcp/          # neuer MCP-Server (Node/TS) + Playwright-Treiber + Session-Pool
  frontend/     # + data-agent-Attribute, window.__vicarAgent (nur Agent-Modus)
  backend-go/   # + Agent-Token (Modell/Endpunkte/Auth), Scopes
```

## Sicherheit

- Token mit Scopes, rotierbar, widerrufbar.
- Rate-Limits pro Token/Session.
- Kollisions-Warnung bei parallelem Editieren desselben Charakters.
- Agent-Modus der Bridge nur mit gueltiger Agent-Session aktiv.

## Phasen

1. **Spike/Machbarkeit:** Playwright headless gegen die laufende App, Login per
   Agent-Token, einen V5-Char rein per DOM (roh) anlegen -> beweist die Kette.
2. **Agent-Bridge:** `data-agent`-Attribute + `window.__vicarAgent.getState()`
   im Editor + Ordner-UI (V5 zuerst, dann restliche Gamelines).
3. **MCP-Server (headless):** Tools + Session/Context-Pool + Auth-Anbindung.
4. **Live-Modus + Haertung:** WS-Relay fuer den sichtbaren Agent-Tab, Isolation,
   Limits, Kollisions-Handling.

## Offene Punkte / zu verifizieren

- Ist `character_updated` wirklich toter Code (kein Live-Push in die User-Liste)?
- Hosting-Kosten der Browser bei vielen parallelen Agenten.
- `act()` (semantische Store-Aktionen) vs. reines Klicken der `data-agent`-Elemente
  - Start mit Klicken, `act()` als spaetere Haertung.
- Umfang der Instrumentierung: welche Wizard-Schritte/Optionen zuerst.
