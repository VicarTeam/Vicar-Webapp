import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { VicarAgent } from "./agent.js";
import { RemoteAgent } from "./remote-agent.js";

/**
 * MCP server that lets an agent drive the real Vicar web UI (see
 * ../AGENT_MCP_PLAN.md). It owns one browser session, logged in via the agent
 * token, and exposes the in-app bridge (getState/act) plus a few convenience
 * tools. Every action runs the real editor logic, so rules and all gamelines
 * apply unchanged.
 *
 * Env: VICAR_AGENT_TOKEN (per-user, from POST /users/@me/agent-token; omit for
 * local dev-login), VICAR_FRONTEND_URL, VICAR_BACKEND_URL, VICAR_HEADLESS=false,
 * VICAR_LIVE=true (drive the user's visible tab via the socket.io relay instead
 * of a headless browser; the user opens the app with ?agent=live).
 */

type AgentDriver = VicarAgent | RemoteAgent;

const server = new McpServer({ name: "vicar-mcp", version: "0.1.0" });

let agentInstance: AgentDriver | null = null;
let opening: Promise<AgentDriver> | null = null;

async function ensureAgent(): Promise<AgentDriver> {
  if (agentInstance) return agentInstance;
  if (!opening) {
    const a: AgentDriver = process.env.VICAR_LIVE === "true"
      ? new RemoteAgent({
          backendUrl: process.env.VICAR_BACKEND_URL,
          agentToken: process.env.VICAR_AGENT_TOKEN,
        })
      : new VicarAgent({
          frontendUrl: process.env.VICAR_FRONTEND_URL,
          backendUrl: process.env.VICAR_BACKEND_URL,
          agentToken: process.env.VICAR_AGENT_TOKEN,
          headless: process.env.VICAR_HEADLESS !== "false",
        });
    opening = a.open().then(() => (agentInstance = a));
  }
  return opening;
}

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

server.registerTool(
  "get_state",
  {
    title: "Get editor state",
    description: "Return the current UI state: view/step, the character summary, the available actions (their data-agent ids, labels, disabled/options) and whether the step can proceed.",
    inputSchema: {},
  },
  async () => {
    const a = await ensureAgent();
    return json(await a.state());
  },
);

server.registerTool(
  "act",
  {
    title: "Perform an action",
    description: "Click a data-agent element or set a field/select. `action` is a data-agent id from get_state. For inputs pass `value`; for selects pass `value` (option text), `first` (first selectable option) or `index`. Returns the result and the new state.",
    inputSchema: {
      action: z.string().describe("data-agent id, e.g. 'option:clan:Brujah', 'control:next'"),
      value: z.string().optional(),
      first: z.boolean().optional(),
      index: z.number().optional(),
    },
  },
  async ({ action, value, first, index }) => {
    const a = await ensureAgent();
    const result = await a
      .act(action, { value, first, index })
      .then(() => ({ ok: true }))
      .catch((e) => ({ ok: false, error: String(e?.message ?? e) }));
    return json({ result, state: await a.state() });
  },
);

server.registerTool(
  "start_character",
  {
    title: "Start a new character",
    description: "Open the create-character modal, pick a gameline and name, and enter the creation wizard. Must be on the character list.",
    inputSchema: {
      gameline: z.enum(["V5", "W5", "M20", "H5", "VDZ"]),
      name: z.string(),
    },
  },
  async ({ gameline, name }) => {
    const a = await ensureAgent();
    await a.act("char:new");
    await a.waitFor((s) => s.actions.some((x) => x.agent === "char:start"));
    await a.act(`char:gameline:${gameline}`);
    await a.act("input:char-name", { value: name });
    await a.act("char:start");
    const state = await a.waitFor((s) => s.view.startsWith("editor-"));
    return json(state);
  },
);

server.registerTool(
  "create_folder",
  {
    title: "Create a folder",
    description: "Create a root character folder through the UI. Must be on the character list.",
    inputSchema: { name: z.string() },
  },
  async ({ name }) => {
    const a = await ensureAgent();
    await a.act("folder:new");
    await a.waitFor((s) => s.actions.some((x) => x.agent === "folder:submit"));
    await a.act("input:folder-name", { value: name });
    await a.act("folder:submit");
    return json({ ok: true, name });
  },
);

server.registerTool(
  "list_characters",
  {
    title: "List characters",
    description: "List the user's characters (name, id, gameline) from the backend.",
    inputSchema: {},
  },
  async () => {
    const a = await ensureAgent();
    const token = await a.token();
    const res = await fetch(`${a.backendUrl}/characters`, { headers: { Authorization: `Bearer ${token}` } });
    const body = (await res.json()) as { characters: any[] };
    return json(body.characters.map((c) => ({ id: c.id, name: c.name, game: c.game })));
  },
);

server.registerTool(
  "list_folders",
  {
    title: "List folders",
    description: "List the user's folders from the backend.",
    inputSchema: {},
  },
  async () => {
    const a = await ensureAgent();
    const token = await a.token();
    const res = await fetch(`${a.backendUrl}/folders`, { headers: { Authorization: `Bearer ${token}` } });
    return json(await res.json());
  },
);

server.registerTool(
  "close_session",
  {
    title: "Close the browser session",
    description: "Close the automation browser. A later tool call opens a fresh session.",
    inputSchema: {},
  },
  async () => {
    if (agentInstance) {
      await agentInstance.close();
      agentInstance = null;
      opening = null;
    }
    return json({ ok: true });
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
