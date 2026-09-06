# Backend-Rework: Bun/Mongo → Go + (Postgres ⟷ Mongo dual)

Stand: 2026-09-05. Reine Planung, noch keine Umsetzung.

## Getroffene Entscheidungen (2026-09-05)
- **Charakter-Datenmodell:** Hybrid (JSONB + Summary-Spalten), **schrittweise entzerrbar** (siehe unten).
- **DB-Zugriff:** sqlc + pgx.
- **Regeldaten-in-DB:** späterer, separater Track (Phase 4).
- **WebSocket / Router:** offen, Empfehlung native WS + chi (siehe unten).

## Ziel & Nicht-Ziele

**Ziel**
- Backend von **Bun/Express/Mongoose** auf **Go** portieren.
- **PostgreSQL** einführen und den fetten `data`-JSON-Blob dort ablegen (nicht mehr Mongo).
- Das Go-Backend spricht **beide** DBs an (Mongo + Postgres) → **kein Big-Bang-Cutover**, sondern gradueller Übergang mit Rollback-Möglichkeit.
- Optional/später: die Regeldaten (VicarData + hartkodierte W5/H5/M20/VDZ) in die DB.

**Nicht-Ziele**
- Kein Frontend-Rewrite. Das aktuelle Vue-3-Frontend (inkl. VDZ) bleibt und redet weiter gegen dieselbe API-Kontur.
- Keine Wiederbelebung des verworfenen v2 (`more-modernize`, Go/Fiber/GORM/Nuxt, voll normalisiert). Der Branch dient höchstens als **Teilelager** (Schema-Ideen, Seeder, UUIDv5-Schema, Importer). ⚠️ Er liegt nur lokal, nicht auf origin — bei Interesse vorher pushen.

## Ist-Zustand (verifiziert)

- **Runtime:** Bun, Express, dual-gemountet unter `/` und `/api` (Coolify strippt `/api` mal weg, mal nicht). Port 6660.
- **DB:** MongoDB via Mongoose. Modelle: `User`, `RefreshToken`, `Character{userId, viewers[], data:Object}`, `SkillTree{bonusCode, userId, data:Object}`, `HomebrewDiscipline`, `HomebrewClan`. Charakter = schemaloser `data`-Blob (Sheet + eingebetteter Regelwerk-Snapshot; historisch bis ~3,5 MB, Avatar heute im CDN).
- **Auth:** JWT HS256, Access 15 min + Refresh 90 d mit Rotation + 60 s Grace (`services/auth.ts`), bcrypt-Passwörter, Discord-OAuth + Passwort- + Dev-Login. Refresh-Tokens in Mongo.
- **Realtime:** socket.io unter `/api/socket.io`. Nur zwei echte Zwecke: (1) FoundryVTT-Brücke (Würfel/Heartbeat, Räume `fvtt:<uid>`/`web:<uid>`), (2) GM-`fx-trigger` → `fx`. Der frühere `character_updated`-Push ist toter Code.
- **Regeldaten:** `/data/checksum` + `/data/bundle` proxien das **VicarData-GitHub-Release** (bundle.zip base64). Frontend entpackt es in `localStorage` und lädt `de-DE/*.json`. W5/H5/M20/VDZ-Daten liegen hartkodiert im Frontend (`app/data/*.ts`).
- **Assets:** `/cdn/*` statisch (7 d immutable) + `POST /cdn/upload`.

### Vollständige Route-Kontur (muss 1:1 erhalten bleiben)
- **Auth (public):** `GET /auth/login`, `GET /auth/callback`, `POST /auth/logout`, `POST /auth/refresh`, `GET /auth/login/password`, `GET /auth/login/dev`
- **Data (public):** `GET /data/checksum`, `GET /data/bundle`
- **CDN:** `GET /cdn/*` (static), `POST /cdn/upload`
- **Characters (auth):** `GET /characters`, `GET /characters/:id`, `POST /characters`, `PUT /characters/:id`, `PATCH /characters/:id/directory`, `DELETE /characters/:id`, `POST /characters/:id/share`, `GET /characters/:id/viewers`, `DELETE /characters/:id/viewers/:viewerId`
- **Users (auth):** `GET /users/@me`, `PATCH /users/@me/password`, `GET|POST|DELETE /users/@me/fvtt-token`
- **SkillTrees (auth):** `GET /skilltrees/mine`, `POST /skilltrees`, `PUT /skilltrees/:id`, `DELETE /skilltrees/:id`, `GET /skilltrees/redeem/:code`
- **Admin (auth+admin):** `GET /admin/users`, `PATCH|DELETE /admin/users/:id`, `GET /admin/users/:id/characters`, `GET|PUT|DELETE /admin/characters/:id`
- **Offener Punkt:** `homebrew.ts` ist in `index.ts` **nicht** gemountet (Modelle existieren, Routen tot?). Vor Port klären, ob Homebrew live ist.
- Global: alles außer auth/data/cdn hinter Bearer-Access-JWT-Middleware.

## Zielarchitektur (Go)

- **HTTP:** `net/http` (Go ≥1.22 `ServeMux`) + **chi** für Middleware/Routing. Idiomatisch, `context.Context`, einfache WS-Integration. (Bewusst nicht Fiber/fasthttp — v2 nutzte das und war „nicht gut".)
- **DB-Zugriff:** **pgx** (Postgres) + **sqlc** (typisiertes SQL aus Schema) für Postgres; **mongo-driver** für Mongo. Wenige Tabellen, JSONB-lastig → sqlc passt besser als ein ORM. (Alternativen: GORM/Ent — siehe Entscheidungen.)
- **Migrations:** `golang-migrate` oder `goose`, versionierte SQL-Dateien.
- **Auth:** `golang-jwt/jwt` (HS256, identische Claims: `type`, `sub`, `iss=VicarWebApp`, exp), `golang.org/x/crypto/bcrypt` (Hashes wandern **verbatim** — Identität ist portabel). Dieselbe Rotation + Grace.
- **Realtime:** siehe Abschnitt WebSocket.
- **Layout:** `cmd/server`, `internal/{http,auth,character,user,skilltree,admin,storage,realtime,assets,rulebook}`, `internal/storage/{mongo,postgres,dual}`.

## Kernidee: Storage-Abstraktion + Dual-DB (der „keine direkte Migration"-Mechanismus)

Pro Aggregat ein **Repository-Interface**, z.B.:

```go
type CharacterStore interface {
    Get(ctx, id, requestingUser) (*Character, error)
    ListForUser(ctx, userID) ([]CharacterSummary, error)
    ListShared(ctx, userID) ([]CharacterSummary, error)
    Create(ctx, ownerID, data json.RawMessage) (id string, err error)
    Update(ctx, id, ownerID, data json.RawMessage) error
    UpdateDirectory(ctx, id, ownerID, dir string) error
    Delete(ctx, id, userID) error
    Share(ctx, id, ownerID, viewerUsername) error
    Viewers(ctx, id, ownerID) ([]Viewer, error)
    RemoveViewer(ctx, id, ownerID, viewerID) error
}
```

Zwei Implementierungen (`mongoStore`, `pgStore`) plus ein **`dualStore`**, der den Übergang orchestriert. Modus per Env/Config umschaltbar:

1. `MONGO_ONLY` — verhält sich exakt wie heute. Sicherheitsnetz/Rollback.
2. `DUAL_WRITE_MONGO_PRIMARY` — **liest Mongo**, **schreibt beide** (Postgres als Schatten). Postgres in Produktion validieren, ohne Risiko.
3. `DUAL_WRITE_PG_PRIMARY` — **liest Postgres**, bei Miss Fallback auf Mongo (+ **Lazy-Backfill**: den getroffenen Charakter beim ersten Zugriff nach PG kopieren), **schreibt beide**. ← Haupt-Übergangsmodus.
4. `PG_ONLY` — Mongo abgeschaltet.

**Lazy-Migration ohne Downtime:** Sobald ein Charakter geöffnet/gespeichert wird, wandert er nach Postgres. Ein **Hintergrund-Sweeper** (`cmd/sweep` oder Goroutine) migriert den kalten Rest in Ruhe. Kein Stichtag, kein Big-Bang; jederzeit auf `MONGO_PRIMARY` zurückschaltbar, solange dual geschrieben wird.

**Kleine Tabellen dürfen springen:** `users`, `refresh_tokens`, `skill_trees`, Homebrew sind klein und identitäts-portabel → einmaliger Bulk-Copy nach PG genügt, sie brauchen die Lazy-Logik nicht. Nur der **Charakter-Blob** (groß, viele, riskant) nutzt den vollen Dual-Pfad. Das vereinfacht enorm.

## Charakter-Datenmodell in Postgres: **Hybrid (JSONB + Summary-Spalten)** — Empfehlung

Nicht voll normalisieren (das war v2 und „nicht gut" — es erzwang neues Frontend + Assembler + Per-Gameline-Schema). Stattdessen:

```sql
create table characters (
    id            uuid primary key default gen_random_uuid(),
    user_id       uuid not null references users(id),
    game          text,                 -- v5/w5/m20/h5/vdz
    -- Summary-Spalten = exakt die heutige SUMMARY_PROJECTION (schnelle Liste/Filter/Share):
    name text, avatar text, avatar_orientation text, sex text, concept text,
    clan_name text, clan_slogan text, clan_nickname text,
    tribe_name text, auspice_name text, tradition_name text, creed_name text,
    generation int, generation_era text, has_cains_mark bool,
    chronicle text, exp int, directory text, data_version text,
    data          jsonb not null,       -- der VOLLE Sheet-Blob (heutige Mongo-`data`-Form)
    revision      bigint not null default 0,
    created_at timestamptz default now(), updated_at timestamptz default now()
);
create index characters_data_gin on characters using gin (data);

create table character_viewers (
    character_id uuid references characters(id) on delete cascade,
    user_id      uuid references users(id),
    primary key (character_id, user_id)
);
```

- Die API baut die Response wie heute zusammen (`{...data, id}`) — **Frontend bleibt unverändert**. Summary-Endpunkt liest nur die Spalten (kein Blob).
- Summary-Felder werden beim Schreiben aus dem Blob extrahiert (ein `extractSummary(data)`), Blob bleibt Source of Truth.
- **Gewinn:** raus aus Mongo, Blob liegt in einer echten, indizierbaren JSONB-Spalte; Listen/Sharing/Filter über Spalten; **spätere Teilnormalisierung inkrementell möglich** (z.B. Disziplinen in eine Tabelle ziehen, wenn ein Feature es braucht) — ohne alles vorab umzubauen.
- Migration Mongo→PG ist damit **nahezu verlustfrei** (Blob-Form identisch), was den Lazy-Dual-Pfad trivial macht.

### Späteres Entzerren: schrittweise raus aus JSONB (Strangler pro Feld)

Der Hybrid ist bewusst die **On-Ramp** zu so viel Normalisierung, wie später gewünscht — feldweise, online, reversibel, nie als Big-Bang:

1. **Summary-Spalten sind bereits Schritt 1.** Das Muster „Feld/Teilbaum aus `data` in echte Spalte/Tabelle heben" verallgemeinert sich auf alles, was man queryen/joinen/constrainen will.
2. **Teilbaum → Tabelle, wenn ein Feature es braucht.** Beispiel Disziplinen:
   - Migration `create table character_disciplines (character_id, name, level, …)`.
   - Einmaliger Online-Backfill aus dem Blob: `insert … select … from characters, jsonb_array_elements(data->'disciplines')` — kein Downtime.
   - Schreibpfad upsertet ab jetzt zusätzlich die Zeilen (**Dual-Write auf Feldebene**, dieselbe Idee wie der DB-Dual-Write, nur feiner).
   - Der **DTO-Assembler** liest Disziplinen aus der Tabelle statt aus dem Blob.
   - Grace-Phase: parallel weiter in den Blob schreiben (Rollback möglich), dann `data->'disciplines'` entfernen.
3. **Für den Client unsichtbar.** Die API setzt die Response immer aus „Spalten + Tabellen + Rest-Blob" zusammen; solange das DTO stabil bleibt, merkt das Vue-Frontend von blob→Spalte→Tabelle nichts.
4. **`revision`-Guard** schützt konkurrierende Writes während der Umstellung.
5. **Zwischenzustände sind billig** (Postgres): JSONB-Ausdrucksindizes, Generated Columns aus JSONB, Queries über beide Welten. Man kann auf jedem Normalisierungsgrad **stehenbleiben** — selten abgefragte gameline-spezifische Details dürfen für immer im JSONB bleiben.

Kurz: von „alles Blob" bis „fast alles normalisiert" ist jeder Punkt erreichbar, jederzeit, in kleinen reversiblen Schritten — genau das, was reiner Blob (kein Weg) und Voll-Normalisierung-jetzt (v2, verworfen) nicht bieten.

## Regeldaten in die DB (optionaler, späterer Track)

Eigenständig vom Charakter-Move. Wenn gewünscht:
- VicarData + W5/H5/M20/VDZ als PG-Tabellen (`clans`, `disciplines`, `merits`, `predator_types`, `roads`, `bloodlines`, …), geseedet via `cmd/seed`. **Teile aus v2 harvestbar** (Seeder, deterministische UUIDv5 aus `(gameline:type:legacyId)`).
- Read-API `/api/rulebook/*`, ermöglicht Server-Content, **Admin-Editierung**, Homebrew, und langfristig das **Verschlanken des Charakter-Blobs** (nur noch Referenzen/IDs statt eingebettetem Regelwerk).
- **Aber:** berührt den Frontend-`data-manager` (lädt heute alles aus dem VicarData-Bundle in localStorage). Deshalb **spätere Phase**; bis dahin bleibt der Bundle-Proxy 1:1, Frontend unangetastet.

## Realtime / WebSocket

Kleiner Umfang (FVTT-Brücke + `fx`). Zwei Wege:
- **A) `googollee/go-socket.io`** — Frontend (`socket.io-client`) bleibt unverändert. Risiko: EIO4-Kompatibilität historisch wackelig.
- **B) Native WS** (`coder/websocket`) + dünner Frontend-Shim. Sauberer/idiomatischer, aber minimaler Frontend-Eingriff.
Empfehlung: **B**, da die Socket-Fläche winzig ist und go-socket.io Wartungsrisiko trägt. Vor Umsetzung die tatsächliche Socket-Nutzung im Frontend (`libs/io/realtime.ts`, `vicar-sync.ts`) verifizieren.

## Auth, CDN, Discord

- JWT/bcrypt/Refresh-Rotation 1:1 in Go nachbilden (gleiche Secrets/Claims → **bestehende Sessions bleiben gültig**).
- `/cdn/*` static + `POST /cdn/upload` in Go (Dateisystem wie heute, `CDN_DIR`).
- Discord-OAuth-Flow (`/auth/login`+`/callback`) portieren (Env `DISCORD_*`).
- Dual-Mount `/` + `/api` beibehalten (Coolify-Quirk).

## Phasenplan

- **Phase 0 — Go-Skeleton, Mongo unverändert. ✅ FERTIG** (`backend-go/`, 2026-09-05). chi + Config + Health + Dual-Mount + CORS + JWT-Middleware + `mongostore` reproduziert die komplette Route-Kontur 1:1. Storage-Interfaces (`internal/storage`) stehen für den Phase-1-Dual-Store bereit. End-to-end gegen ein Wegwerf-Mongo verifiziert (26/26 Checks: Dev-/Passwort-Login, Refresh-Rotation, Charakter-CRUD, Summary-Projektion, Dual-Mount, 401/404). **Offen vor Produktiv-Cutover:** socket.io (FVTT-Brücke + fx) ist Phase 3 — bis dahin nicht scharfschalten. Homebrew tot, nicht portiert.
- **Phase 1 — Postgres dazu. ✅ FERTIG** (`backend-go/internal/storage/postgres` + `dualstore`, 2026-09-05). Schema (hybrid, GENERATED-Summary-Spalten aus `data jsonb`) + sqlc+pgx-Queries + `pgStore` + `dualStore` mit vier `DB_MODE`-Werten. IDs = ObjectId-Hex als `text`-PK (verbatim mit Mongo geteilt → kein uuid/Mapping, dual-write-konsistent). Reads: primary mit pg→mongo-Fallback + Lazy-Backfill; Listen-Union in pg-primary. End-to-end gegen Docker Mongo+Postgres verifiziert (14/14: dual-write beide DBs, Fallback+Backfill+Union, Update-Spiegelung, pg_only). Schema idempotent beim Start (`schema_migrations`).
- **Phase 2 — Split-Betrieb + Migration. ✅ FERTIG** (2026-09-05). **Gewählter Betriebsmodus = `split`** (Entscheidung des Users): alte Charaktere bleiben auf Mongo, neue werden auf Postgres angelegt, jeder Char lebt in genau einer DB (kein Dual-Write). Reads PG-first→Mongo-Fallback, Listen unioniert, Edits zur Herkunfts-DB. Migration on-demand: `GET /characters/:id/export` (download as JSON), `POST /characters/:id/migrate` (einzeln), `cmd/sweep` (Bulk-Auto, `-user`/`-dry-run`). `internal/storage/splitstore` + `storage.Migrator`. End-to-end verifiziert (17/19, die 2 „Fehler" waren Test-Skript-Artefakte: PG-Tabelle in mongo_only noch nicht angelegt; Header-Groß/Kleinschreibung). Die Dual-Modi bleiben als alternative Strategie erhalten.
- **Phase 3 — Realtime + CDN. ✅ FERTIG** (`backend-go/internal/realtime`, 2026-09-05). socket.io-Brücke nachgebaut mit **socket.io v4** (`zishang520/socket.io`) statt native WS — bewusst, damit das externe FoundryVTT-Modul (kann hier nicht geändert werden) UND das unveränderte Web-Frontend (`socket.io-client`) weiterlaufen. FVTT-Brücke (fvtt-roll/-result/-heartbeat, fvtt-authenticated) + GM-`fx-trigger`→`fx` (Whitelist + Owner/Viewer/Admin-Check), Räume `web:<uid>`/`fvtt:<uid>`, gemountet `/socket.io/*` (Dual-Mount → auch `/api/socket.io`, außerhalb des HTTP-Guards). CDN war bereits ab Phase 0 final. End-to-end 8/8 mit echten socket.io-Clients. **Damit ist der Bun→Go-Cutover vollständig abgedeckt.**
- **Phase 4 (optional, später) — Regeldaten in die DB** + `/api/rulebook/*` + Admin-Editierung + Blob-Verschlankung. Seeder aus v2 harvesten.

## Risiken & Gegenmaßnahmen

- **Dual-Write-Konsistenz** (ein Schreibpfad schelägt fehl): Schreibreihenfolge PG→Mongo, Fehler loggen + Reconcile-Job; im PG_PRIMARY-Modus ist PG Source of Truth, Mongo nur Fallback/Backup.
- **`_id`-Typen:** Mongo `ObjectId` (String im Frontend) ↔ PG `uuid`. Beim Backfill Mapping-Spalte `legacy_mongo_id` auf `characters` führen; die API akzeptiert beide IDs während des Übergangs.
- **Blob-Größe/`markModified`-Fallen:** in PG kein Mongoose-Mixed-Problem; JSONB wird komplett geschrieben (heutiges `PUT` ersetzt eh den ganzen Blob).
- **Sessions:** gleiche JWT-Secrets → kein Zwangs-Logout.
- **Coolify-Routing:** Dual-Mount beibehalten, sonst brechen `/api`-Pfade.

## Offene Entscheidungen (mit Empfehlung)

1. **Charakter-Datenmodell:** Hybrid JSONB+Summary (empfohlen) ↔ reiner JSONB-Blob (noch simpler, keine Filter-Spalten) ↔ voll normalisiert (v2, verworfen).
2. **DB-Zugriff:** sqlc+pgx (empfohlen) ↔ GORM ↔ Ent.
3. **WebSocket:** Native WS + Shim (empfohlen) ↔ go-socket.io (kein Frontend-Eingriff).
4. **Regeldaten-in-DB:** später/separat (empfohlen) ↔ Teil dieses Reworks.
5. **Router-Framework:** chi (empfohlen) ↔ Gin/Echo.
