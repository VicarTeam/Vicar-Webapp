import { chromium, type Browser, type BrowserContext, type Page } from "playwright";

export interface AgentAction {
  agent: string;
  kind: string;
  label: string;
  disabled: boolean;
  value?: string;
}

export interface AgentState {
  agentMode: true;
  view: string;
  path: string;
  gameline: string | null;
  character: Record<string, unknown> | null;
  actions: AgentAction[];
  canProceed: boolean;
  isFinishStep: boolean;
}

export interface VicarAgentOptions {
  frontendUrl?: string;
  backendUrl?: string;
  headless?: boolean;
}

/**
 * Thin client that drives the real Vicar UI through the in-app agent bridge
 * (window.__vicarAgent). getState observes, act drives - every action runs the
 * real Vue handlers, so editor rules and all gamelines apply unchanged.
 */
export class VicarAgent {
  readonly frontendUrl: string;
  readonly backendUrl: string;
  private readonly headless: boolean;
  private browser!: Browser;
  private context!: BrowserContext;
  private page!: Page;

  constructor(opts: VicarAgentOptions = {}) {
    this.frontendUrl = opts.frontendUrl ?? "http://localhost:5173";
    this.backendUrl = opts.backendUrl ?? "http://localhost:6660";
    this.headless = opts.headless ?? true;
  }

  async open() {
    this.browser = await chromium.launch({ headless: this.headless });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();

    await this.page.goto(`${this.backendUrl}/auth/login/dev`, { waitUntil: "networkidle" });
    await this.page.waitForTimeout(1200);
    await this.page.goto(`${this.frontendUrl}/?agent=1`, { waitUntil: "networkidle" });
    await this.page.waitForFunction(() => !!window.__vicarAgent, undefined, { timeout: 30000 });
  }

  async state(): Promise<AgentState> {
    return this.page.evaluate(() => window.__vicarAgent!.getState());
  }

  async act(agent: string, params?: { value?: string }) {
    const result = await this.page.evaluate(
      ({ a, p }) => window.__vicarAgent!.act(a, p),
      { a: agent, p: params },
    );
    if (!result.ok) throw new Error(`act("${agent}") failed: ${result.error}`);
    await this.page.waitForTimeout(150);
    return result;
  }

  async waitFor(predicate: (s: AgentState) => boolean, timeoutMs = 15000): Promise<AgentState> {
    const start = Date.now();
    let last: AgentState = await this.state();
    while (!predicate(last)) {
      if (Date.now() - start > timeoutMs) {
        throw new Error(`waitFor timed out (view=${last.view}, canProceed=${last.canProceed})`);
      }
      await this.page.waitForTimeout(200);
      last = await this.state();
    }
    return last;
  }

  async hasAction(agent: string): Promise<boolean> {
    const s = await this.state();
    return s.actions.some((a) => a.agent === agent);
  }

  /** Fresh access token (for server-side verification), via dev-login. */
  async token(): Promise<string> {
    const res = await fetch(`${this.backendUrl}/auth/login/dev`, { redirect: "manual" });
    const location = res.headers.get("location") ?? "";
    const match = location.match(/s_atk=([^&]+)/);
    if (!match) throw new Error("dev-login gave no token");
    return decodeURIComponent(match[1]);
  }

  async close() {
    await this.context?.close();
    await this.browser?.close();
  }
}
