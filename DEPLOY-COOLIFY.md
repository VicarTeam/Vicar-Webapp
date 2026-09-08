# Deployment auf Coolify (Single-Origin)

Ziel: App und Backend laufen unter **einer** Domain, dadurch sind die CDN-Bilder same-origin und es gibt keine
CORP/CORS-Probleme mehr.

- Frontend: `https://vicar.cloud/`
- Backend (inkl. `/cdn`): `https://vicar.cloud/api/`

Das Backend mountet **alle Routen doppelt** (`/` UND `/api`), funktioniert also egal, ob Coolify/Traefik den
`/api`-Prefix strippt oder nicht.

## 1. Ressource anlegen
In Coolify eine **Docker-Compose-Ressource** aus diesem Repo mit `docker-compose.coolify.yml` erstellen.

## 2. Env-Variablen setzen
| Variable | Beispiel | Zweck |
| --- | --- | --- |
| `APP_URL` | `https://vicar.cloud` | Basis-URL (für Auth-Redirects / BACKEND_URL) |
| `APP_DOMAIN` | `vicar.cloud` | Domain (falls du rohe Traefik-Labels nutzt, s.u.) |
| `JWT_SECRET` | (langes Geheimnis) | Token-Signatur — **muss identisch zum bisherigen Wert bleiben**, sonst werden alle Sessions ungültig |
| `DISCORD_CLIENT_ID` | … | Discord-OAuth |
| `DISCORD_CLIENT_SECRET` | … | Discord-OAuth |
| `POSTGRES_PASSWORD` | (langes Geheimnis) | Passwort der neuen Postgres-DB (nur für den Go-Cutover, s.u.) |

## 2a. Go-Backend-Cutover (Split-Modus) — `rework/backend`

Ab dem Branch `rework/backend` ersetzt `docker-compose.coolify.yml` das alte Bun-Backend durch das
**Go-Backend mit MongoDB + Postgres im Split-Modus**:

- **MongoDB bleibt unverändert** (gleiches Volume `mongo_data`). Alle bestehenden Charaktere, Nutzer,
  Skill-Bäume und Logins funktionieren weiter — Auth liest Postgres-first mit Mongo-Fallback, das
  `JWT_SECRET` bleibt gleich, also bleiben aktive Sessions gültig.
- **Postgres kommt neu dazu** (Volume `pg_data`, Schema wird beim Start idempotent angelegt).
- **`DB_MODE=split`**: alte Charaktere bleiben in Mongo, **neue** Charaktere werden in Postgres angelegt.
  Kein Dual-Write, keine Big-Bang-Migration. Einzelne Alt-Charaktere lassen sich später on-demand
  migrieren („Charakter modernisieren" im UI bzw. `cmd/sweep` im Container).

**Deploy:** Branch in Coolify auf `rework/backend` stellen → **Save** → `POSTGRES_PASSWORD` als Env
setzen → **Deploy**. Das `cdn_data`-Volume (Avatare/Bilder) wird 1:1 weiterverwendet.

**Rollback:** Branch zurück auf `main` → Deploy. Das alte Bun-Backend kommt zurück, Mongo ist
unverändert. In Postgres neu angelegte Charaktere sind für das Bun-Backend dann nicht sichtbar
(liegen aber weiter in Postgres, gehen also nicht verloren).

## 3. Domain (Coolify-UI) — NUR das Frontend
- **frontend** → `https://vicar.cloud`
- **backend** → **KEINE** öffentliche Domain (bleibt intern auf dem Compose-Netzwerk).

Das Frontend-nginx proxyt `/api` intern an den `backend`-Service (siehe `frontend/nginx-default.conf`,
`location /api/`). Dadurch gibt es nur **eine** Route in Coolify und das Traefik-Pfad-Routing/Stripping ist irrelevant
— genau das verhindert den Fehler „/api zeigt das Frontend". (Das Backend mountet zusätzlich unter `/` UND `/api`, also
egal wie der Pfad ankommt.)

> Falls du dem **backend**-Service doch eine Domain (`vicar.cloud/api`) gibst, könnte Traefik /api direkt ans Backend
> leiten — auch okay — aber der zuverlässige, versionsunabhängige Weg ist: **nur Frontend = Domain**, Rest macht nginx.
> Der Service muss in der Compose `backend` heißen (so wird er per DNS im Netzwerk gefunden).

## 4. Discord-OAuth anpassen
In der Discord-Developer-App die Redirect-URI auf **`https://vicar.cloud/api/auth/callback`** umstellen.

## 5. Bilddateien (cdn-data)
Das DB-Backup enthält **nicht** die hochgeladenen Bilddateien. Diese liegen im Volume `cdn_data` (`/app/cdn-data`).
- Gleicher Server: Volume bleibt erhalten – nichts zu tun.
- Server-/Setup-Wechsel: die Dateien aus dem alten `cdn-data` ins neue Volume kopieren.

## 6. Datenbank migrieren (Backup → Restore + CDN-Link-Migration)
Avatare sind **relativ** gespeichert (`/cdn/...`) und funktionieren nach dem Umzug automatisch. Nur **absolute**
Alt-Links (v.a. alte Skill-Tree-Icons `https://api.vicar.cloud/cdn/...`) müssen umgeschrieben werden – das macht der
Restore optional mit.

**Backup (altes System):**
```bash
cd backend
MONGO_URI="<alte-mongo-uri>" bun run src/scripts/backup.ts ./backup.json
```
Die `backup.json` irgendwo hochladen (oder ins neue Backend-Volume legen).

**Restore (neues System, in den backend-Container):**
```bash
# Datei lokal:
MONGO_URI="mongodb://mongo:27017/vicar" bun run src/scripts/restore.ts ./backup.json api.vicar.cloud vicar.cloud/api
# oder per URL:
MONGO_URI="mongodb://mongo:27017/vicar" bun run src/scripts/restore.ts https://example.com/backup.json api.vicar.cloud vicar.cloud/api
```
Der Restore ist **idempotent** (upsert je `_id`) und löscht nichts Bestehendes. `oldBase`/`newBase` weglassen, wenn
keine Link-Migration nötig ist.

## 7. Check nach Deploy
- `https://vicar.cloud` lädt, Login funktioniert.
- Avatare laden von `https://vicar.cloud/api/cdn/...` (same-origin, **kein** `ERR_FAILED`, keine Workbox-Fehler).
- Regeldaten laden (`/api/data/bundle`), Admin-Panel erreichbar (`/admin`).
