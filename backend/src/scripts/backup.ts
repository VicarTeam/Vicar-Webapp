import mongoose from "mongoose";
import { EJSON } from "bson";

async function main() {
  const out = Bun.argv.slice(2).find((a) => !a.startsWith("--"));
  if (!out) {
    console.error("Usage: bun run src/scripts/backup.ts <outfile.json>");
    process.exit(1);
  }

  const uri = Bun.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI ist nicht gesetzt.");
    process.exit(1);
  }

  await mongoose.connect(uri);
  const db = mongoose.connection.getClient().db();
  const collections = await db.collections();

  const dump: Record<string, any[]> = {};
  let total = 0;
  for (const c of collections) {
    const docs = await c.find({}).toArray();
    dump[c.collectionName] = docs;
    total += docs.length;
    console.log(`  ${c.collectionName}: ${docs.length}`);
  }

  await Bun.write(out, EJSON.stringify(dump, { relaxed: false }));
  console.log(`\nBackup geschrieben: ${out} (${collections.length} Collections, ${total} Dokumente).`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(async (e) => {
  console.error("Backup-Fehler:", e);
  await mongoose.disconnect().catch(() => void 0);
  process.exit(1);
});
