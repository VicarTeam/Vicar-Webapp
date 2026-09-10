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

  console.log("[drive] --- viewer instrumentation ---");
  await agent.waitFor((s) => s.view.startsWith("viewer"));

  await agent.act("tab:profile");
  await agent.waitFor((s) => s.activeTab === "tab:profile" && s.actions.some((a) => a.agent === "input:concept"));
  await agent.act("input:concept", { value: "Nachtwandler" });
  console.log(`[drive] profile concept -> "${(await agent.state()).actions.find((a) => a.agent === "input:concept")?.value}"`);

  await agent.act("level:toggle");
  await agent.waitFor((s) => s.levelMode === true);

  console.log("[drive] adding 300 XP");
  await agent.act("exp:open");
  await agent.waitFor((s) => s.actions.some((a) => a.agent === "exp:apply"));
  await agent.act("input:exp-amount", { value: "300" });
  await agent.act("exp:apply");
  const afterXp = await agent.waitFor((s) => Number((s.character as any)?.exp) >= 300);
  console.log(`[drive] exp now ${(afterXp.character as any).exp}`);

  console.log("[drive] spending XP on an attribute");
  await agent.act("tab:attributes");
  await agent.waitFor((s) => s.activeTab === "tab:attributes");
  const attrUp = (await agent.state()).actions.find((a) => a.agent.startsWith("level:attr:"));
  if (!attrUp) throw new Error("no attribute level button visible");
  await agent.act(attrUp.agent);
  await agent.waitFor((s) => { const c = s.actions.find((a) => a.agent === "level:confirm"); return !!c && !c.disabled; });
  await agent.act("level:confirm");
  await agent.waitFor((s) => !s.actions.some((a) => a.agent === "level:confirm"));
  console.log(`[drive] leveled ${attrUp.agent}; exp now ${((await agent.state()).character as any).exp}`);

  console.log("[drive] profile: setting humanity, hunger, blood potency, anchors, avatar");
  await agent.act("tab:profile");
  await agent.waitFor((s) => s.activeTab === "tab:profile");

  await agent.act("set:humanity:7");
  const humState = await agent.waitFor((s) => Number((s.character as any)?.humanity) === 7);
  console.log(`[drive] humanity -> ${(humState.character as any).humanity}`);

  await agent.act("set:hunger:2");
  const hungerState = await agent.waitFor((s) => Number((s.character as any)?.hunger) === 2);
  console.log(`[drive] hunger -> ${(hungerState.character as any).hunger}`);

  const bpBefore = Number((await agent.state()).character?.bloodPotency ?? 0);
  await agent.act("level:blood-potency");
  await agent.waitFor((s) => { const c = s.actions.find((a) => a.agent === "level:confirm"); return !!c && !c.disabled; });
  await agent.act("level:confirm");
  const bpState = await agent.waitFor((s) => Number((s.character as any)?.bloodPotency) === bpBefore + 1);
  console.log(`[drive] blood potency ${bpBefore} -> ${(bpState.character as any).bloodPotency}`);

  await agent.act("input:anchors", { value: "Familie ueber alles - niemals ein Kind toeten." });
  const anchorsVal = (await agent.state()).actions.find((a) => a.agent === "input:anchors")?.value;
  console.log(`[drive] anchors richtext -> "${anchorsVal}"`);

  await agent.act("input:avatar-url", { value: "https://example.com/avatar.png" });
  const avatarVal = (await agent.state()).character?.avatar;
  console.log(`[drive] avatar -> "${avatarVal}"`);

  console.log("[drive] learning a new discipline");
  await agent.act("tab:disciplines");
  await agent.waitFor((s) => s.activeTab === "tab:disciplines");
  const discCountBefore = Number((await agent.state()).character?.disciplines ?? 0);
  await agent.act("disc:new");
  await agent.waitFor((s) => s.actions.some((a) => a.agent === "select:new-discipline"));
  await pickFirstSelectable(agent, "select:new-discipline");
  await agent.waitFor((s) => s.actions.some((a) => a.agent === "select:disc-ability"));
  await pickFirstSelectable(agent, "select:disc-ability");
  await agent.waitFor((s) => { const c = s.actions.find((a) => a.agent === "disc-ability:confirm"); return !!c && !c.disabled; });
  await agent.act("disc-ability:confirm");
  await agent.waitFor((s) => { const c = s.actions.find((a) => a.agent === "level:confirm"); return !!c && !c.disabled; });
  await agent.act("level:confirm");
  const discState = await agent.waitFor((s) => Number((s.character as any)?.disciplines) === discCountBefore + 1);
  console.log(`[drive] disciplines ${discCountBefore} -> ${(discState.character as any).disciplines}`);

  console.log("[drive] viewer: adding a Vorzug via trait:add");
  await agent.act("tab:traits");
  await agent.waitFor((s) => s.activeTab === "tab:traits" && s.actions.some((a) => a.agent === "trait:add"));
  await addCustomTrait(agent, "trait:add", "1", "Viewer Vorzug");
  console.log("[drive] viewer trait added");

  console.log("[drive] adding an inventory item");
  await agent.act("tab:inventory");
  await agent.waitFor((s) => s.activeTab === "tab:inventory");
  await agent.act("inventory:add-carried");
  await agent.waitFor((s) => s.actions.some((a) => a.agent === "select:item"));
  await agent.act("select:item-category", { first: true });
  await agent.act("select:item", { first: true });
  await agent.act("input:item-amount", { value: "1" });
  await agent.act("inventory:add-submit");
  console.log("[drive] inventory item added");

  console.log("[drive] toggling info flags + avatar orientation");
  await agent.act("info:open");
  await agent.waitFor((s) => s.actions.some((a) => a.agent === "toggle:advanced-disciplines"));
  const before = (await agent.state()).actions.find((a) => a.agent === "toggle:advanced-disciplines")?.value;
  await agent.act("toggle:advanced-disciplines");
  const after = (await agent.state()).actions.find((a) => a.agent === "toggle:advanced-disciplines")?.value;
  await agent.act("select:avatar-orientation", { value: "Oben" });
  console.log(`[drive] info: advanced-disciplines ${before} -> ${after}, avatar-orientation -> "${(await agent.state()).actions.find((a) => a.agent === "select:avatar-orientation")?.value}"`);

  console.log("[drive] closing the info modal via modal:close");
  await agent.act("modal:close");
  await agent.waitFor((s) => !s.actions.some((a) => a.agent === "toggle:advanced-disciplines"));
  console.log("[drive] modal closed");

  await deleteCharacter(agent, full.id);
  await deleteFolder(agent, folderName);
  await agent.close();
  console.log("\n[drive] SUCCESS - a full V5 character was built entirely through the real UI and persisted");
}

main().catch(async (err) => {
  console.error("\n[drive] FAILED:", err?.message ?? err);
  process.exit(1);
});
