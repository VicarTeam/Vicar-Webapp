import * as mongoose from "mongoose";
import {User} from "../schema";

/**
 * Setzt (oder entfernt) die Admin-Flag eines Users – der Bootstrap-Weg, um den
 * ersten Admin anzulegen (danach kann man weitere im ACP togglen).
 *
 * Lauf:  cd backend && bun run src/scripts/set-admin.ts <username> [--remove]
 */

async function main() {
  const args = Bun.argv.slice(2);
  const remove = args.includes("--remove");
  const username = args.find((a) => !a.startsWith("--"));

  if (!username) {
    console.error("Usage: bun run src/scripts/set-admin.ts <username> [--remove]");
    process.exit(1);
  }

  const uri = Bun.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI ist nicht gesetzt.");
    process.exit(1);
  }

  await mongoose.connect(uri);

  // Username case-insensitiv abgleichen (wie authenticateByPassword).
  const user = await User.findOne({ username: { $regex: `^${username}$`, $options: "i" } });
  if (!user) {
    console.error(`Kein User mit Username "${username}" gefunden.`);
    await mongoose.disconnect();
    process.exit(1);
  }

  user.isAdmin = !remove;
  await user.save();

  console.log(`User "${user.username}" (${user.id}) ist jetzt ${user.isAdmin ? "ADMIN" : "kein Admin"}.`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(async (e) => {
  console.error("Fehler:", e);
  await mongoose.disconnect().catch(() => void 0);
  process.exit(1);
});
