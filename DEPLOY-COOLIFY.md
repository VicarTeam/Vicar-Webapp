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
| `JWT_SECRET` | (langes Geheimnis) | Token-Signatur |
| `DISCORD_CLIENT_ID` | … | Discord-OAuth |
| `DISCORD_CLIENT_SECRET` | … | Discord-OAuth |

## 3. Domains pro Service (Coolify-UI)
- **frontend** → `https://vicar.cloud`
- **backend** → `https://vicar.cloud/api`

Coolify erzeugt daraus die Traefik-Router (inkl. TLS/Let's Encrypt) und – je nach Version – ein StripPrefix für `/api`.
Beides ist okay (Dual-Mount).

**Alternative (rohe Traefik-Labels)**, falls du das Routing selbst in der Compose machen willst – beim jeweiligen
Service unter `labels:` ergänzen:
```yaml
# frontend:
- traefik.enable=true
- "traefik.http.routers.vicar-web.rule=Host(`vicar.cloud`)"
- traefik.http.routers.vicar-web.priority=1
- traefik.http.services.vicar-web.loadbalancer.server.port=80
# backend:
- traefik.enable=true
- "traefik.http.routers.vicar-api.rule=Host(`vicar.cloud`) && PathPrefix(`/api`)"
- traefik.http.routers.vicar-api.priority=100
- traefik.http.services.vicar-api.loadbalancer.server.port=6660
```
(Kein StripPrefix nötig – Dual-Mount.)

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
