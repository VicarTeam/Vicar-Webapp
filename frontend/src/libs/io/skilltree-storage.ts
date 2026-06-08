import {del, get, post, put} from "@/libs/io/rest";
import type {ISkillTree} from "@/@types/skilltree";

/**
 * Client für GM-erstellte Skill Trees gegen das eigene `backend/`
 * (Bearer-Auth wird in `rest.ts` automatisch injiziert).
 */
export type RedeemResult =
  | { status: 'ok'; tree: ISkillTree }
  | { status: 'not_found' }
  | { status: 'error' };

export default class SkillTreeStorage {

  /** Lokaler Cache der eigenen (vom eingeloggten Nutzer erstellten) Trees. */
  public static ownTrees: ISkillTree[] = [];
  private static loaded = false;

  public static async loadOwnTrees(force = false): Promise<ISkillTree[]> {
    if (this.loaded && !force) {
      return this.ownTrees;
    }

    const [status, data] = await get<ISkillTree[]>(`/skilltrees/mine`);
    if (status >= 400) {
      return this.ownTrees;
    }

    this.ownTrees = data;
    this.loaded = true;
    return this.ownTrees;
  }

  public static async createTree(tree: ISkillTree): Promise<ISkillTree | undefined> {
    const [status, data] = await post<ISkillTree>(`/skilltrees`, tree);
    if (status >= 400) {
      console.error("Failed to create skill tree", status);
      return undefined;
    }

    this.ownTrees.push(data);
    return data;
  }

  public static async updateTree(tree: ISkillTree): Promise<ISkillTree | undefined> {
    const [status, data] = await put<ISkillTree>(`/skilltrees/${tree.id}`, tree);
    if (status >= 400) {
      console.error("Failed to update skill tree", status);
      return undefined;
    }

    const index = this.ownTrees.findIndex(t => t.id === data.id);
    if (index >= 0) {
      this.ownTrees.splice(index, 1, data);
    }
    return data;
  }

  public static async deleteTree(tree: ISkillTree): Promise<boolean> {
    const [status] = await del(`/skilltrees/${tree.id}`);
    if (status >= 400) {
      return false;
    }

    const index = this.ownTrees.findIndex(t => t.id === tree.id);
    if (index >= 0) {
      this.ownTrees.splice(index, 1);
    }
    return true;
  }

  /** Holt einen Tree anhand seines Bonus Codes (zum Einlösen durch den Spieler). */
  public static async redeemByCode(code: string): Promise<RedeemResult> {
    const [status, data] = await get<ISkillTree>(`/skilltrees/redeem/${encodeURIComponent(code.trim())}`);
    if (status === 200) {
      return {status: 'ok', tree: data};
    }
    if (status === 404) {
      return {status: 'not_found'};
    }
    return {status: 'error'};
  }
}
