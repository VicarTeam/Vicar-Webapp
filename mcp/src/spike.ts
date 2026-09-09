import { chromium, type Browser } from "playwright";
import { mkdirSync } from "node:fs";

/**
 * Phase-1 spike: prove the full chain
 *   agent script -> headless browser -> the REAL Vicar web UI -> backend
 * without any rule engine of our own. It drives the actual UI to create a
 * folder (one of the two target operations, single step) and to enter the V5
 * character-creation wizard, then verifies server-side.
 *
 * Prerequisites (run against the local dev stack):
 *   - backend up on BACKEND_URL (docker compose in ../backend-go), DEV_MODE=true
 *   - frontend dev server on FRONTEND_URL (cd ../frontend && npm run dev)
 */

const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:6660";
const ARTIFACTS = new URL("../spike-artifacts/", import.meta.url).pathname;

function log(step: string) {
  console.log(`[spike] ${step}`);
}

/** Dev-login on the backend, returning a fresh access token (for verification). */
async function devLoginToken(): Promise<string> {
  const res = await fetch(`${BACKEND_URL}/auth/login/dev`, { redirect: "manual" });
  const location = res.headers.get("location") ?? "";
  const match = location.match(/s_atk=([^&]+)/);
  if (!match) {
    throw new Error(`dev-login gave no token (status ${res.status}, location: ${location})`);
  }
  return decodeURIComponent(match[1]);
}

async function listFolderNames(token: string): Promise<string[]> {
  const res = await fetch(`${BACKEND_URL}/folders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`GET /folders failed: ${res.status}`);
  const folders = (await res.json()) as { name: string }[];
  return folders.map((f) => f.name);
}

async function run(browser: Browser) {
  const context = await browser.newContext();
  const page = await context.newPage();

  log("logging in via dev-login (browser session)");
  await page.goto(`${BACKEND_URL}/auth/login/dev`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.goto(`${FRONTEND_URL}/`, { waitUntil: "networkidle" });

  const newFolderBtn = page.getByRole("button", { name: "NEUER ORDNER" });
  await newFolderBtn.waitFor({ timeout: 30000 });
  log("logged in, character list is visible");

  const folderName = `Agent-Spike-${Date.now()}`;
  log(`creating folder "${folderName}" through the real UI`);
  await newFolderBtn.click();
  await page.locator(".cdm input").waitFor({ timeout: 10000 });
  await page.locator(".cdm input").fill(folderName);
  await page.locator(".cdm__cta").click();
  await page.waitForTimeout(1500);

  log("verifying folder server-side");
  const token = await devLoginToken();
  const names = await listFolderNames(token);
  if (!names.includes(folderName)) {
    throw new Error(`folder "${folderName}" not found in backend (${names.join(", ")})`);
  }
  log(`OK: backend has the folder (${names.length} folder(s) total)`);

  log("entering the V5 character-creation wizard through the real UI");
  const newCharBtn = page.getByRole("button", { name: "NEUER CHARAKTER" });
  await newCharBtn.click();
  await page.locator(".ccm").waitFor({ timeout: 10000 });
  await page.locator(".ccm").getByText("V5", { exact: true }).click();
  await page.locator('.ccm input[placeholder="Name des Charakters"]').fill("Spike Vampire");
  await page.getByRole("button", { name: "Erstellung starten" }).click();
  await newCharBtn.waitFor({ state: "detached", timeout: 15000 });
  log(`OK: wizard reached, now at ${page.url()}`);

  await context.close();
}

async function main() {
  mkdirSync(ARTIFACTS, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    await run(browser);
    console.log("\n[spike] SUCCESS - chain proven: script -> browser -> real UI -> backend");
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("\n[spike] FAILED:", err.message ?? err);
  process.exit(1);
});
