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

## Naechste Phasen

Siehe `../AGENT_MCP_PLAN.md`:
2. Agent-Bridge im Frontend (`data-agent`-Attribute + `window.__vicarAgent.getState()`).
3. MCP-Server (Tools + Session/Context-Pool + Agent-Token-Auth).
4. Live-Modus (WS-Relay) + Haertung.
