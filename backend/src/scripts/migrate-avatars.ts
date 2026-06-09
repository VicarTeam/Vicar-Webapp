import * as mongoose from "mongoose";
import {Character} from "../schema";
import {CDN_DIR, MAX_BYTES, MIME_EXT} from "../api/cdn";

/**
 * Einmalige, idempotente Migration: wandelt base64-Avatare, die bislang direkt im
 * Charakter-`data`-Blob liegen, in CDN-Dateien um und ersetzt sie durch einen
 * relativen `/cdn/<file>`-Pfad. Bereits ausgelagerte (URL/leer) Avatare werden
 * übersprungen, ein erneuter Lauf migriert also 0.
 *
 * Lauf:  cd backend && bun run src/scripts/migrate-avatars.ts
 * Hinweis: Vorher ein Mongo-Backup anlegen.
 */

const DATA_URL_RE = /^data:([^;]+);base64,(.+)$/;

async function main() {
  const uri = Bun.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI ist nicht gesetzt.");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Mit MongoDB verbunden. Starte Avatar-Migration ...");

  const characters = await Character.find();

  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const character of characters) {
    const data: any = character.data;
    const avatar: unknown = data?.avatar;

    if (typeof avatar !== "string" || avatar.length === 0) {
      skipped++;
      continue;
    }

    const match = avatar.match(DATA_URL_RE);
    if (!match) {
      // Bereits eine URL (/cdn/... oder http...) -> nichts zu tun.
      skipped++;
      continue;
    }

    const mime = match[1]!;
    const ext = MIME_EXT[mime];
    if (!ext) {
      console.warn(`[${character.id}] Übersprungen: nicht unterstützter Typ ${mime}`);
      failed++;
      continue;
    }

    const buffer = Buffer.from(match[2]!, "base64");
    if (buffer.length === 0 || buffer.length > MAX_BYTES) {
      console.warn(`[${character.id}] Übersprungen: ungültige Größe (${buffer.length} Bytes)`);
      failed++;
      continue;
    }

    try {
      const filename = `${crypto.randomUUID()}.${ext}`;
      await Bun.write(`${CDN_DIR}/${filename}`, buffer);

      data.avatar = `/cdn/${filename}`;
      character.markModified("data");
      await character.save();

      migrated++;
      console.log(`[${character.id}] migriert -> /cdn/${filename} (${buffer.length} Bytes)`);
    } catch (e) {
      failed++;
      console.error(`[${character.id}] Fehler beim Migrieren:`, e);
    }
  }

  console.log(
    `\nFertig. ${characters.length} Charaktere geprüft: ${migrated} migriert, ${skipped} übersprungen, ${failed} fehlgeschlagen.`,
  );

  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(async (e) => {
  console.error("Migration abgebrochen:", e);
  await mongoose.disconnect().catch(() => void 0);
  process.exit(1);
});
