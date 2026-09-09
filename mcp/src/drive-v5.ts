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

async function pickFirstSelectable(agent: VicarAgent, selectAgent: string) {
  const sel = (await agent.state()).actions.find((a) => a.agent === selectAgent);
  const opts = sel?.options ?? [];
  const idx = opts.findIndex((o) => !o.disabled && !o.blocked && o.text.trim() !== "");
  if (idx < 0) throw new Error(`no selectable option for ${selectAgent}`);
  await agent.act(selectAgent, { index: idx });
}

async function fetchCharacter(agent: VicarAgent, name: string): Promise<any> {
  const token = await agent.token();
  const res = await fetch(`${agent.backendUrl}/characters`, { headers: { Authorization: `Bearer ${token}` } });
  const body = (await res.json()) as { characters: any[] };
  const summary = body.characters.find((c) => c.name === name);
  if (!summary) throw new Error(`character "${name}" not found in backend`);
  const full = await fetch(`${agent.backendUrl}/characters/${summary.id}`, { headers: { Authorization: `Bearer ${token}` } });
  return full.json();
}

async function deleteCharacter(agent: VicarAgent, id: string) {
  const token = await agent.token();
  await fetch(`${agent.backendUrl}/characters/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
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
  await agent.waitFor((s) => s.view === "editor-skills");

  console.log("[drive] choosing skill spread 'Spezialist' + distributing");
  await agent.act("select:skill-spread", { value: "Spezialist" });
  await agent.act("skills:confirm");
  await agent.waitFor((s) => s.actions.some((a) => a.agent.startsWith("select:skill:")));
  const skillSelects = (await agent.state()).actions.filter((a) => a.agent.startsWith("select:skill:")).map((a) => a.agent);
  const skillTargets = ["4", "3", "3", "3", "2", "2", "2", "1", "1", "1"];
  for (let i = 0; i < skillTargets.length && i < skillSelects.length; i++) {
    await agent.act(skillSelects[i]!, { value: skillTargets[i]! });
  }
  console.log("[drive] filling specializations");
  for (let i = 0; i < 4; i++) {
    await agent.act(`input:spec-defined:${i}`, { value: "Allgemein" });
  }
  await agent.act("select:free-spec", { first: true });
  await agent.act("input:free-spec-name", { value: "Fokus" });
  const skillsReady = await agent.waitFor((s) => s.canProceed);
  show("skills done", skillsReady);

  console.log("[drive] advancing to disciplines (finish step)");
  await agent.act("control:next");
  await agent.waitFor((s) => s.view === "editor-disciplines");

  console.log("[drive] picking two clan disciplines + confirming");
  await agent.act("select:disc-2", { value: "Geschwindigkeit" });
  await agent.act("select:disc-1", { value: "Stärke" });
  await agent.act("disc:confirm");
  await agent.waitFor((s) => s.actions.some((a) => a.agent.startsWith("disc:add:")));

  console.log("[drive] filling discipline abilities until all dots are spent");
  for (let guard = 0; guard < 12; guard++) {
    const add = (await agent.state()).actions.find((a) => a.agent.startsWith("disc:add:"));
    if (!add) break;
    await agent.act(add.agent);
    await agent.waitFor((s) => s.actions.some((a) => a.agent === "select:disc-ability"));
    await pickFirstSelectable(agent, "select:disc-ability");
    await agent.waitFor((s) => {
      const c = s.actions.find((a) => a.agent === "disc-ability:confirm");
      return !!c && !c.disabled;
    });
    await agent.act("disc-ability:confirm");
    await agent.waitFor((s) => !s.actions.some((a) => a.agent === "select:disc-ability"));
  }
  const finishReady = await agent.waitFor((s) => s.canProceed);
  show("disciplines done, ready to finish", finishReady);

  console.log("[drive] finishing the character (persists to backend)");
  await agent.act("control:finish");
  await agent.waitFor((s) => s.view !== "editor-disciplines", 20000);

  console.log("[drive] verifying the persisted character server-side");
  const full = await fetchCharacter(agent, "Bridge Vampire");
  console.log(`[drive] persisted: name=${full.name} clan=${full.clan?.name} predator=${full.predatorType?.name} disciplines=${JSON.stringify((full.disciplines ?? []).map((d: any) => `${d.discipline.name}:${d.points}/${d.abilities.length}`))}`);
  const attrCount = (full.categories ?? []).flatMap((c: any) => c.attributes).filter((a: any) => a.value > 0).length;
  console.log(`[drive] attributes with value>0: ${attrCount}`);

  await deleteCharacter(agent, full.id);
  await deleteFolder(agent, folderName);
  await agent.close();
  console.log("\n[drive] SUCCESS - a full V5 character was built entirely through the real UI and persisted");
}

main().catch(async (err) => {
  console.error("\n[drive] FAILED:", err?.message ?? err);
  process.exit(1);
});
