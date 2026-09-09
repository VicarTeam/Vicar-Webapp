import { io, type Socket } from "socket.io-client";
import type { AgentState } from "./agent.js";

export interface RemoteAgentOptions {
  backendUrl?: string;
  agentToken?: string;
}

/**
 * Live driver: instead of a headless browser, it talks to the backend socket.io
 * relay as the "controller" and sends commands to the user's visible tab (the
 * "bridge", a page opened with ?agent=live). Same interface as VicarAgent, so the
 * MCP tools work with either. Pairing is automatic via the logged-in user.
 */
export class RemoteAgent {
  readonly backendUrl: string;
  private readonly agentToken?: string;
  private socket!: Socket;
  private nextId = 1;
  private pending = new Map<string, (result: any) => void>();

  constructor(opts: RemoteAgentOptions = {}) {
    this.backendUrl = opts.backendUrl ?? "http://localhost:6660";
    this.agentToken = opts.agentToken;
  }

  private loginUrl(): string {
    if (this.agentToken) {
      return `${this.backendUrl}/auth/login/agent?token=${encodeURIComponent(this.agentToken)}`;
    }
    return `${this.backendUrl}/auth/login/dev`;
  }

  async token(): Promise<string> {
    const res = await fetch(this.loginUrl(), { redirect: "manual" });
    const loc = res.headers.get("location") ?? "";
    const m = loc.match(/s_atk=([^&]+)/);
    if (!m) throw new Error("login gave no token");
    return decodeURIComponent(m[1]!);
  }

  async open() {
    const token = await this.token();
    this.socket = io(this.backendUrl, { path: "/socket.io", transports: ["websocket", "polling"] });
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("agent-authenticate timeout")), 15000);
      this.socket.on("connect", () => this.socket.emit("agent-authenticate", { token, role: "controller" }));
      this.socket.on("agent-authenticated", () => { clearTimeout(timer); resolve(); });
      this.socket.on("connect_error", (e) => { clearTimeout(timer); reject(e); });
    });
    this.socket.on("agent-result", (msg: { id: string; result: any }) => {
      const cb = this.pending.get(msg.id);
      if (cb) { this.pending.delete(msg.id); cb(msg.result); }
    });
  }

  private command(kind: string, action?: string, params?: unknown): Promise<any> {
    const id = String(this.nextId++);
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error(`command '${kind}' timed out (is a live tab connected?)`)); }, 15000);
      this.pending.set(id, (result) => { clearTimeout(timer); resolve(result); });
      this.socket.emit("agent-command", { id, kind, action, params });
    });
  }

  async state(): Promise<AgentState> {
    const r = await this.command("getState");
    if (!r?.ok) throw new Error(r?.error ?? "getState failed");
    return r.state as AgentState;
  }

  async act(agent: string, params?: { value?: string; first?: boolean; index?: number }) {
    const r = await this.command("act", agent, params);
    if (!r?.ok) throw new Error(`act("${agent}") failed: ${r?.error}`);
    await new Promise((res) => setTimeout(res, 150));
    return r;
  }

  async waitFor(predicate: (s: AgentState) => boolean, timeoutMs = 15000): Promise<AgentState> {
    const start = Date.now();
    let last = await this.state();
    while (!predicate(last)) {
      if (Date.now() - start > timeoutMs) {
        throw new Error(`waitFor timed out (view=${last.view}, canProceed=${last.canProceed})`);
      }
      await new Promise((res) => setTimeout(res, 200));
      last = await this.state();
    }
    return last;
  }

  async close() {
    this.socket?.close();
  }
}
