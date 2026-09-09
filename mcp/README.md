# vicar-mcp

Agent/MCP-Schnittstelle, die die **echte Vicar-Web-UI** von einem Browser aus
bedient (statt die Editor-Regeln nachzubauen). Gesamtplan: `../AGENT_MCP_PLAN.md`.

## Phase 1: Spike (fertig)

`src/spike.ts` beweist die komplette Kette **Script -> headless Browser -> echte
UI -> Backend**: er loggt sich per Dev-Login ein, legt einen Ordner ueber die
reale Oberflaeche an (serverseitig verifiziert) und betritt den V5-Erstellungs-
Wizard. Noch ohne Instrumentierung/MCP - reiner Machbarkeitsbeweis.

### Ausfuehren (lokaler Dev-Stack)

```bash
# 1. Backend (Mongo + Postgres + Go, split-Modus, DEV_MODE=true)
cd ../backend-go && docker compose up -d

# 2. Frontend-Dev-Server (spricht laut .env.local http://localhost:6660)
cd ../frontend && npm run dev        # http://localhost:5173

# 3. Spike
cd ../mcp
npm install
npx playwright install chromium
npm run spike
```

Env-Overrides: `FRONTEND_URL` (Default `http://localhost:5173`),
`BACKEND_URL` (Default `http://localhost:6660`).

## Phase 2: Bridge-Treiber (fertig)

`src/agent.ts` (`VicarAgent`) steuert die UI ueber die In-App-Bridge
(`window.__vicarAgent` getState/act). `npm run drive` (`src/drive-v5.ts`) baut
einen kompletten V5-Charakter komplett durch die echte UI und persistiert ihn.

## Phase 3: MCP-Server (fertig)

`src/mcp-server.ts` ist ein MCP-Server (stdio), der eine Browser-Session haelt
(Login per **Agent-Token**) und Tools bietet: `get_state`, `act`,
`start_character`, `create_folder`, `list_characters`, `list_folders`,
`close_session`.

Agent-Token holen (als eingeloggter Nutzer): `POST /users/@me/agent-token`.
Server starten:

```bash
VICAR_AGENT_TOKEN=<token> \
VICAR_FRONTEND_URL=http://localhost:5173 \
VICAR_BACKEND_URL=http://localhost:6660 \
npm run server
```

Ohne `VICAR_AGENT_TOKEN` faellt der Login auf Dev-Login zurueck (nur lokal).
End-to-End-Smoke-Test (mintet einen Agent-Token, startet den Server als
Subprozess, treibt Tools): `npm run mcp-test`.

## Naechste Phasen

Siehe `../AGENT_MCP_PLAN.md`:
4. Live-Modus (WS-Relay, sichtbarer Agent-Tab) + Haertung (Context-Pool, Limits).
Ausserdem: `data-agent`-Instrumentierung der uebrigen Gamelines (W5/M20/H5/VDZ).
