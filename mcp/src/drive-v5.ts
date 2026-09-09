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

async function addCustomTrait(agent: VicarAgent, addAgent: string, level: string, name: string) {
  await agent.act(addAgent);
  await agent.waitFor((s) => s.actions.some((a) => a.agent === "select:trait-pack"));
  await agent.act("select:trait-pack", { value: "[GM] Benutzerdefiniert" });
  await agent.waitFor((s) => s.actions.some((a) => a.agent === "select:custom-level"));
  await agent.act("select:custom-type", { value: "merits" });
  await agent.act("select:custom-level", { value: level });
  await agent.act("input:custom-name", { value: name });
  await agent.act("input:custom-desc", { value: "Vom Agent gesetzt" });
  await agent.waitFor((s) => {
    const c = s.actions.find((a) => a.agent === "trait:confirm");
    return !!c && !c.disabled;
  });
  await agent.act("trait:confirm");
  await agent.waitFor((s) => !s.actions.some((a) => a.agent === "trait:confirm"));
}

function remainingFrom(headText: string): number {
  const m = headText.replace(/\s+/g, " ").match(/(\d+)\s*\/\s*(\d+)(?:\s*\(\+(\d+)\))?/);
  if (!m) return 0;
  const used = parseInt(m[1]!, 10);
  const base = parseInt(m[2]!, 10);
  const bonus = m[3] ? parseInt(m[3], 10) : 0;
  return Math.max(0, base + bonus - used);
}

async function spendPoints(agent: VicarAgent, addAgent: string, remaining: number) {
  let left = remaining;
  while (left > 0) {
    const lvl = Math.min(5, left);
    await addCustomTrait(agent, addAgent, String(lvl), `Auto ${addAgent} ${left}`);
    left -= lvl;
  }
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

  console.log("[drive] advancing to predator-type");
  await agent.act("control:next");
  await agent.waitFor((s) => s.view === "editor-predator-type");

  console.log("[drive] choosing predator 'Räuber' + confirming");
  await agent.act("select:predator", { value: "Räuber" });
  await agent.act("predator:confirm");
  const ptState = await agent.waitFor((s) => s.actions.some((a) => a.agent.startsWith("select:pt-action:")));
  const ptSelects = [...new Set(ptState.actions.filter((a) => a.agent.startsWith("select:pt-action:")).map((a) => a.agent))];
  console.log(`[drive] predator action selects: ${ptSelects.join(", ")}`);
  for (const sel of ptSelects) {
    await agent.act(sel, { first: true });
  }
  const ptReady = await agent.waitFor((s) => s.canProceed);
  show("predator done", ptReady);

  console.log("[drive] advancing to traits");
  await agent.act("control:next");
  await agent.waitFor((s) => s.view === "editor-traits");

  const heads = await agent.texts(".pack .head");
  const traitRemaining = remainingFrom(heads[0] ?? "");
  const flawRemaining = heads[1] ? remainingFrom(heads[1]) : 0;
  console.log(`[drive] spending trait points (${traitRemaining}) + flaw points (${flawRemaining}) via custom GM traits`);
  await spendPoints(agent, "trait:add", traitRemaining);
  await spendPoints(agent, "flaw:add", flawRemaining);
  const traitsReady = await agent.waitFor((s) => s.canProceed);
  show("traits done", traitsReady);

  console.log("[drive] advancing to attributes");
  await agent.act("control:next");
  await agent.waitFor((s) => s.view === "editor-attributes");

  console.log("[drive] distributing attributes (one 4, three 3, four 2, one 1)");
  const attrSelects = (await agent.state()).actions
    .filter((a) => a.agent.startsWith("select:attr:"))
    .map((a) => a.agent);
  const targets = ["4", "3", "3", "3", "2", "2", "2", "2"];
  for (let i = 0; i < targets.length && i < attrSelects.length; i++) {
    await agent.act(attrSelects[i]!, { value: targets[i]! });
  }
  if (!(await agent.state()).canProceed && attrSelects.length >= 9) {
    await agent.act(attrSelects[8]!, { value: "1" });
  }
  const attrReady = await agent.waitFor((s) => s.canProceed);
  show("attributes done", attrReady);

  console.log("[drive] advancing to skills");
  await agent.act("control:next");
  const skillsState = await agent.waitFor((s) => s.view === "editor-skills");
  show("skills step reached", skillsState);

  await deleteFolder(agent, folderName);
  await agent.close();
  console.log("\n[drive] SUCCESS - bridge getState/act drives the real editor; state reflects reality");
}

main().catch(async (err) => {
  console.error("\n[drive] FAILED:", err?.message ?? err);
  process.exit(1);
});
