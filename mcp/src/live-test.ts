import { chromium } from "playwright";
import { RemoteAgent } from "./remote-agent.js";

/**
 * End-to-end test of the live relay:
 *   controller (RemoteAgent) -> backend socket.io relay -> visible bridge tab -> real UI
 * Opens a browser tab in ?agent=live (the "user's tab"), then drives it remotely
 * through the relay and verifies a folder is created + persisted.
 */

const FRONTEND = process.env.VICAR_FRONTEND_URL ?? "http://localhost:5173";
const BACKEND = process.env.VICAR_BACKEND_URL ?? "http://localhost:6660";

async function accessToken(): Promise<string> {
  const loc = (await fetch(`${BACKEND}/auth/login/dev`, { redirect: "manual" })).headers.get("location") ?? "";
  const m = loc.match(/s_atk=([^&]+)/);
  if (!m) throw new Error("dev-login gave no token");
  return decodeURIComponent(m[1]!);
}

async function mintAgentToken(): Promise<string> {
  const atk = await accessToken();
  const res = await fetch(`${BACKEND}/users/@me/agent-token`, { method: "POST", headers: { Authorization: `Bearer ${atk}` } });
  return (await res.json()).token as string;
}

async function main() {
  const token = await mintAgentToken();

  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext()).newPage();
  await page.goto(`${BACKEND}/auth/login/agent?token=${encodeURIComponent(token)}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.goto(`${FRONTEND}/?agent=live`, { waitUntil: "networkidle" });
  await page.locator("#vicar-agent-live").waitFor({ timeout: 15000 });
  console.log("[live-test] bridge tab connected + authenticated");

  const controller = new RemoteAgent({ backendUrl: BACKEND, agentToken: token });
  await controller.open();
  console.log("[live-test] controller connected via relay");

  const state = await controller.state();
  console.log(`[live-test] remote get_state -> view=${state.view}, ${state.actions.length} actions`);

  const folderName = `Live-${Date.now()}`;
  console.log(`[live-test] driving the visible tab remotely to create folder "${folderName}"`);
  await controller.act("folder:new");
  await controller.waitFor((s) => s.actions.some((a) => a.agent === "folder:submit"));
  await controller.act("input:folder-name", { value: folderName });
  await controller.act("folder:submit");
  await new Promise((r) => setTimeout(r, 800));

  const atk = await accessToken();
  const folders = (await (await fetch(`${BACKEND}/folders`, { headers: { Authorization: `Bearer ${atk}` } })).json()) as { id: string; name: string }[];
  const ok = folders.some((f) => f.name === folderName);
  console.log(`[live-test] folder persisted via live relay: ${ok}`);
  for (const f of folders.filter((x) => x.name === folderName)) {
    await fetch(`${BACKEND}/folders/${f.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${atk}` } });
  }

  await controller.close();
  await browser.close();
  if (!ok || state.view !== "main") throw new Error(`live relay assertions failed (view=${state.view}, ok=${ok})`);
  console.log("\n[live-test] SUCCESS - MCP controller drove the visible tab through the socket.io relay");
}

main().catch((e) => { console.error("\n[live-test] FAILED:", e?.message ?? e); process.exit(1); });
