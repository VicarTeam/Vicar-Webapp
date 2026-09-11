import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

/**
 * End-to-end smoke test of the MCP chain:
 *   MCP client -> MCP server -> browser (agent-token login) -> real Vicar UI -> backend
 * Mints an agent token via dev-login, starts the server as a subprocess with that
 * token, then exercises a few tools.
 */

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

function text(res: any): string {
  return res.content?.[0]?.text ?? "";
}

async function main() {
  const token = await mintAgentToken();
  console.log(`[test] minted agent token (len ${token.length})`);

  const transport = new StdioClientTransport({
    command: "npx",
    args: ["tsx", "src/mcp-server.ts"],
    env: { ...process.env, VICAR_AGENT_TOKEN: token } as Record<string, string>,
  });
  const client = new Client({ name: "vicar-mcp-test", version: "0.0.1" });
  await client.connect(transport);

  const tools = await client.listTools();
  console.log("[test] tools:", tools.tools.map((t) => t.name).join(", "));

  const folderName = `MCP-${Date.now()}`;
  await client.callTool({ name: "create_folder", arguments: { name: folderName } });
  const lf = text(await client.callTool({ name: "list_folders", arguments: {} }));
  const folderOk = lf.includes(folderName);
  console.log(`[test] create_folder + list_folders -> contains "${folderName}": ${folderOk}`);

  const st = text(await client.callTool({ name: "start_character", arguments: { gameline: "V5", name: "MCP Vampire" } }));
  const view = JSON.parse(st).view;
  console.log(`[test] start_character -> view=${view}`);

  const gs = text(await client.callTool({ name: "get_state", arguments: {} }));
  const gsState = JSON.parse(gs);
  const clanOptions = gsState.actions.filter((a: any) => a.agent.startsWith("option:clan:")).length;
  console.log(`[test] get_state -> ${clanOptions} clan options visible; step="${gsState.step}"`);

  const am = text(await client.callTool({
    name: "act_many",
    arguments: {
      actions: [
        { action: "input:sire", value: "MCP Erzeuger" },
        { action: "option:clan:Brujah" },
      ],
    },
  }));
  const amState = JSON.parse(am);
  const amOk = amState.state?.character?.clan === "Brujah" && amState.results?.length === 2 && amState.results.every((r: any) => r.ok);
  console.log(`[test] act_many (2 actions, 1 call) -> clan=${amState.state?.character?.clan}, canProceed=${amState.state?.canProceed}, results ok: ${amOk}`);

  const stepOk = typeof gsState.step === "string" && gsState.step.length > 0;

  await client.callTool({ name: "close_session", arguments: {} });
  await client.close();

  // cleanup the folder we created
  const atk = await accessToken();
  const folders = (await (await fetch(`${BACKEND}/folders`, { headers: { Authorization: `Bearer ${atk}` } })).json()) as { id: string; name: string }[];
  for (const f of folders.filter((x) => x.name === folderName)) {
    await fetch(`${BACKEND}/folders/${f.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${atk}` } });
  }

  if (!folderOk || view !== "editor-clan" || clanOptions <= 0 || !amOk || !stepOk) {
    throw new Error("MCP smoke test assertions failed");
  }
  console.log("\n[test] SUCCESS - MCP client drove the real UI via the server (agent-token login, act_many, step)");
}

main().catch((e) => { console.error("\n[test] FAILED:", e?.message ?? e); process.exit(1); });
