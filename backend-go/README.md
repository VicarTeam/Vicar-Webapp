# vicar-backend (Go) — Phase 0

Go-Portierung des Vicar-Backends. **Phase 0** bildet die komplette HTTP-Route-Kontur
des alten Bun/Express-Backends **1:1** gegen das **bestehende MongoDB** nach — das
aktuelle Vue-Frontend spricht ohne Änderung dagegen.

Status laut `../BACKEND_REWORK_PLAN.md`:
- ✅ Phase 0 — Go-Skeleton + MongoDB (diese Codebasis)
- ✅ Phase 1 — Postgres dazu (Dual-Store, Hybrid-JSONB, sqlc+pgx)
- ✅ Phase 2 — Split-Betrieb (`split`) + On-Demand-Migration (Export/Migrate/Sweeper)
- ✅ Phase 3 — Realtime (socket.io v4: FVTT-Brücke + `fx`) + CDN final
- ⏳ Phase 4 — Regeldaten in die DB (optional)

**Der Bun→Go-Cutover ist damit vollständig abgedeckt** (HTTP + Realtime + CDN + Auth).

## Realtime (Phase 3)

`internal/realtime` bildet die socket.io-Brücke des Altsystems nach — **socket.io v4**
(`zishang520/socket.io`), damit sowohl das unveränderte Web-Frontend (`socket.io-client`)
als auch das externe FoundryVTT-Modul weiterlaufen. Gemountet unter `/socket.io/*` (via
Dual-Mount auch `/api/socket.io`), Auth außerhalb des HTTP-Guards:
- **Web-Client:** verbindet ohne Auth, sendet `authenticate` (Access-JWT) → Raum `web:<uid>`.
- **FVTT-Client:** verbindet mit `auth:{fvttToken}` → Raum `fvtt:<uid>`, bekommt `fvtt-authenticated`.
- Brücke: `fvtt-heartbeat`/`fvtt-roll-result` → Web; `fvtt-roll` → FVTT; GM-`fx-trigger`
  (Whitelist, nur eigene/geteilte Charaktere bzw. Admin) → `fx` beim Spieler.

Verifiziert 8/8 mit echten socket.io-Clients (Web + FVTT).

## DB-Modus & Dual-DB (Phase 1)

`DB_MODE` steuert den schrittweisen Mongo→Postgres-Übergang **ohne Big-Bang**:
- `mongo_only` (Default) — nur Mongo, wie Phase 0.
- **`split` (empfohlener Betriebsmodus)** — **alte Charaktere bleiben auf Mongo, neue werden auf Postgres angelegt.** Kein Dual-Write: jeder Char lebt in genau einer DB. Reads prüfen erst Postgres, dann Mongo; Listen unionen beide. Edits an einem alten Char gehen zu seiner Herkunfts-DB (Mongo). Migration erfolgt **on-demand** (Endpunkt/Sweeper, s.u.).
- `dual_write_mongo_primary` — Mongo autoritativ, Postgres als Schatten mitgeschrieben (validieren).
- `dual_write_pg_primary` — Postgres autoritativ; Lese-Fehltreffer fallen auf Mongo zurück und **backfillen Postgres lazy**; Listen unionen beide.
- `pg_only` — nur Postgres, Mongo abgeschaltet.

`POSTGRES_URL` ist nötig, sobald `DB_MODE != mongo_only`.

### Migration alter Charaktere (split-Modus)

- **Export / „download as JSON":** `GET /characters/:id/export` → der volle Charakter als Download (`Content-Disposition: attachment`). Für Backup und manuelle Migration.
- **Einzel-Migration:** `POST /characters/:id/migrate` (Owner) verschiebt den Charakter Mongo→Postgres (idempotent).
- **Bulk-Sweeper (auto):** `cmd/sweep` migriert alle verbliebenen Mongo-Charaktere nach Postgres.
  ```bash
  DB_MODE=split MONGO_URI=... POSTGRES_URL=... go run ./cmd/sweep          # alle
  ... go run ./cmd/sweep -user <ownerId>      # nur ein Owner
  ... go run ./cmd/sweep -dry-run             # nur anzeigen
  ```

**Datenmodell (hybrid):** voller Sheet-Blob in `characters.data jsonb`; die queryable
Summary-Felder (name, clan_name, generation, …) sind **GENERATED-Spalten** daraus →
der Schreibpfad berührt nur `data` (+ `viewers`). IDs sind der ObjectId-Hex (verbatim
mit Mongo geteilt, als `text`-PK) → kein uuid/Mapping. Schema/Queries: `internal/storage/postgres/sql/`,
generiert via `sqlc generate` nach `internal/storage/postgres/gen/`. Schema wird beim
Start einmal idempotent angewandt (`schema_migrations`).

Verifiziert (Docker Mongo+Postgres, 14/14): dual-write in beide DBs, PG-primary
Fallback+Backfill+Listen-Union, Update-Spiegelung, pg_only standalone.

## Architektur

- `cmd/server` — Einstiegspunkt.
- `internal/config` — Env-Config (kompatibel zu den alten Keys).
- `internal/models` — Domänen-Entities (spiegeln die Mongoose-Schemas).
- `internal/storage` — **Persistenz-Interfaces** (CharacterStore, UserStore, …).
  Phase 1 steckt hier die Postgres-Implementierung + einen Dual-Store dazu.
- `internal/storage/mongostore` — MongoDB-Implementierung (Collections: `users`,
  `refreshtokens`, `characters`, `skilltrees` — die Mongoose-Namen).
- `internal/auth` — JWT (HS256) + bcrypt, Access 15min / Refresh 90d mit Rotation
  + 60s-Grace. **Gleiche Secrets/Claims wie alt → bestehende Sessions bleiben gültig.**
- `internal/discord` — Discord-OAuth (Code→Token, Profil, Revoke).
- `internal/httpapi` — chi-Router, `/`+`/api`-Dual-Mount, CORS, alle Handler.

## Endpunkte (1:1 zum Altsystem)

Public: `GET /auth/login|callback`, `POST /auth/logout|refresh`,
`GET /auth/login/password|dev`, `GET /data/checksum|bundle`, `GET /cdn/*`, `GET /health`.
Auth (Bearer): `/characters*`, `/users/@me*`, `/skilltrees*`, `POST /cdn/upload`,
`/admin/*` (zusätzlich admin-gated).

**Bewusst noch NICHT portiert** (Phase 3): socket.io (FVTT-Brücke + `fx`-Trigger).
Der Produktiv-Cutover sollte deshalb erst nach Phase 3 erfolgen. Homebrew ist tot
und wurde nicht portiert.

## Lokal starten

```bash
cp .env.example .env   # Werte eintragen (MONGO_URI etc.)
go run ./cmd/server
```

Env: `PORT` (6660), `MONGO_URI` (nötig), `MONGO_DB` (optional, sonst aus URI),
`DISCORD_CLIENT_ID|SECRET|REDIRECT_URI`, `FRONTEND_URL`, `BACKEND_URL`,
`JWT_SECRET`, `CDN_DIR` (./cdn-data), `DEV_MODE=true` (aktiviert `/auth/login/dev`).

## Lokal testen (Docker) — schnellster Weg

```bash
cd backend-go
docker compose up --build          # Mongo + Postgres + Go-Backend auf :6660
```

Danach das Frontend dagegen starten (nutzt `frontend/.env.local` → `http://localhost:6660`):

```bash
cd ../frontend && npm run dev       # http://localhost:5173, Dev-Login aktiv
```

Der Stack läuft im `split`-Modus (neue Chars → Postgres, alte → Mongo). Health:
`http://localhost:6660/health`. Daten bleiben in den Volumes (`docker compose down`
behält sie, `down -v` löscht sie).

## Deployment (Coolify/Prod)

`Dockerfile` (multi-stage, `golang:1.25-alpine` → `alpine`) baut `server` + `sweep`,
lauscht auf `PORT` (6660), wendet das Postgres-Schema beim Start idempotent an.
Nötige Env in Prod: `MONGO_URI`, `POSTGRES_URL`, `DB_MODE=split`, `JWT_SECRET`,
`DISCORD_*`, `FRONTEND_URL`, `BACKEND_URL`. Der `/`+`/api`-Dual-Mount bleibt für den
Coolify-Proxy erhalten (inkl. `/api/socket.io`). Migration im Betrieb: `cmd/sweep`
(als `/usr/local/bin/sweep` im Image) mit denselben Env-Variablen.

## Build & Test (ohne Docker)

```bash
go build ./...            # kompiliert (go 1.25+)
go vet ./...              # statische Prüfung
go build -o server ./cmd/server
```

Ein End-to-End-Smoke-Test gegen ein Wegwerf-Mongo (`docker run --rm mongo:7`) wurde
durchgeführt: Health, Dual-Mount, Auth-Guard, Dev-/Passwort-Login, Token-Refresh
(Rotation), Charakter-CRUD inkl. Summary-Projektion vs. Voll-Blob, Directory-Patch,
404-Handling — alles grün.
