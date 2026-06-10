import mongoose from "mongoose";
import { EJSON } from "bson";

function deepReplace(value: any, from: string, to: string): any {
  if (typeof value === "string") {
    return value.includes(from) ? value.split(from).join(to) : value;
  }
  if (Array.isArray(value)) {
    return value.map((v) => deepReplace(v, from, to));
  }
  if (value && typeof value === "object") {
    if (value._bsontype || value instanceof Date) return value;
    for (const k of Object.keys(value)) {
      value[k] = deepReplace(value[k], from, to);
    }
    return value;
  }
  return value;
}

async function main() {
  const args = Bun.argv.slice(2).filter((a) => !a.startsWith("--"));
  const [source, oldBase, newBase] = args;
  if (!source) {
    console.error("Usage: bun run src/scripts/restore.ts <file|url> [oldBase] [newBase]");
    process.exit(1);
  }

  const uri = Bun.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI ist nicht gesetzt.");
    process.exit(1);
  }

  let raw: string;
  if (/^https?:\/\//.test(source)) {
    const res = await fetch(source);
    if (!res.ok) {
      console.error(`Download fehlgeschlagen: HTTP ${res.status}`);
      process.exit(1);
    }
    raw = await res.text();
  } else {
    raw = await Bun.file(source).text();
  }

  let dump = EJSON.parse(raw, { relaxed: false }) as Record<string, any[]>;

  if (oldBase && newBase) {
    dump = deepReplace(dump, oldBase, newBase);
    console.log(`CDN-Link-Migration: "${oldBase}" -> "${newBase}"`);
  }

  await mongoose.connect(uri);
  const db = mongoose.connection.getClient().db();

  let total = 0;
  for (const [name, docs] of Object.entries(dump)) {
    if (!Array.isArray(docs)) continue;
    const coll = db.collection(name);
    let n = 0;
    for (const doc of docs) {
      await coll.replaceOne({ _id: doc._id }, doc, { upsert: true });
      n++;
    }
    total += n;
    console.log(`  ${name}: ${n} upserted`);
  }

  console.log(`\nRestore fertig: ${total} Dokumente.`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(async (e) => {
  console.error("Restore-Fehler:", e);
  await mongoose.disconnect().catch(() => void 0);
  process.exit(1);
});
