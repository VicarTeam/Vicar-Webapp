import { VicarAgent } from "./agent.js";

/**
 * Phase-2 demo: drive the real UI through the agent bridge (getState/act).
 * Creates a folder, starts a V5 character, fills the clan step semantically and
 * advances - verifying that getState always reflects the real editor state.
 */

function show(label: string, state: { view: string; canProceed: boolean; character: unknown }) {
  console.log(`[drive] ${label}: view=${state.view} canProceed=${state.canProceed}`);
  console.log(`         character=${JSON.stringify(state.character)}`);
}

async function listFolderNames(agent: VicarAgent): Promise<string[]> {
  const token = await agent.token();
  const res = await fetch(`${agent.backendUrl}/folders`, { headers: { Authorization: `Bearer ${token}` } });
  const folders = (await res.json()) as { id: string; name: string }[];
  return folders.map((f) => f.name);
}

async function deleteFolder(agent: VicarAgent, name: string) {
  const token = await agent.token();
  const res = await fetch(`${agent.backendUrl}/folders`, { headers: { Authorization: `Bearer ${token}` } });
  const folders = (await res.json()) as { id: string; name: string }[];
  for (const f of folders.filter((x) => x.name === name)) {
    await fetch(`${agent.backendUrl}/folders/${f.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
  }
}

async function main() {
  const agent = new VicarAgent({ headless: process.env.HEADLESS !== "false" });
  await agent.open();
  console.log("[drive] bridge ready");

  const folderName = `Agent-Bridge-${Date.now()}`;
  console.log(`[drive] creating folder "${folderName}" via bridge`);
  await agent.act("folder:new");
  await agent.waitFor((s) => s.actions.some((a) => a.agent === "folder:submit"));
  await agent.act("input:folder-name", { value: folderName });
  await agent.act("folder:submit");
  await agent.waitFor(async () => true, 1000).catch(() => {});
  const names = await listFolderNames(agent);
  if (!names.includes(folderName)) throw new Error(`folder not persisted (have: ${names.join(", ")})`);
  console.log(`[drive] OK folder persisted server-side`);

  console.log("[drive] starting a V5 character via bridge");
  await agent.act("char:new");
  await agent.waitFor((s) => s.actions.some((a) => a.agent === "char:start"));
  await agent.act("char:gameline:V5");
  await agent.act("input:char-name", { value: "Bridge Vampire" });
  await agent.act("char:start");

  const clanState = await agent.waitFor((s) => s.view === "editor-clan");
  show("clan step reached", clanState);

  const clanOptions = clanState.actions.filter((a) => a.agent.startsWith("option:clan:")).map((a) => a.label);
  console.log(`[drive] clan options visible to agent: ${clanOptions.join(", ")}`);

  console.log("[drive] filling sire + selecting Brujah via bridge");
  await agent.act("input:sire", { value: "Der namenlose Erzeuger" });
  await agent.act("option:clan:Brujah");

  const ready = await agent.waitFor((s) => s.canProceed && (s.character as any)?.clan === "Brujah");
  show("clan chosen, can proceed", ready);

  console.log("[drive] advancing to the next step");
  await agent.act("control:next");
  const next = await agent.waitFor((s) => s.view === "editor-predator-type");
  show("advanced", next);

  await deleteFolder(agent, folderName);
  await agent.close();
  console.log("\n[drive] SUCCESS - bridge getState/act drives the real editor; state reflects reality");
}

main().catch(async (err) => {
  console.error("\n[drive] FAILED:", err?.message ?? err);
  process.exit(1);
});
