import {get, patch, post, put, del} from "@/libs/io/rest";
import {IHomebrewClan, IHomebrewDiscipline} from "@/types/data";
import {ICharacter} from "@/types/models";

export interface VicarNetAccount {
  id: number;
  email: string;
  alias: string;
}

export type ClanResponse = { clan: IHomebrewClan, neededHomebrewDisciplines: IHomebrewDiscipline[] };
type FromInviteResponse = { type: "clan" | "discipline", content: IHomebrewDiscipline | ClanResponse };

export class VicarNet {

  public static get isLoggedIn(): boolean {
    return !!localStorage.getItem("vicar-net:account") && !!localStorage.getItem("vicar-net:passkey");
  }

  public static get account(): VicarNetAccount {
    return JSON.parse(localStorage.getItem("vicar-net:account")!);
  }

  public static logout() {
    localStorage.removeItem("vicar-net:account");
    localStorage.removeItem("vicar-net:passkey");
  }

  public static async beginRegister(email: string, alias: string): Promise<boolean> {
    try {
      const [status, data] = await post<{ message: string }>("/auth/register", {email, alias});
      return status === 202 && data.message === "await activation";
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  public static async finishRegister(activationCode: string): Promise<boolean> {
    try {
      const [status, data] = await put<{
        message: string,
        user: VicarNetAccount & { passkey: string }
      }>("/auth/activate/" + activationCode);
      if (status === 201 && data.message === "activated") {
        const {passkey, ...user} = data.user;
        localStorage.setItem("vicar-net:account", JSON.stringify(user));
        localStorage.setItem("vicar-net:passkey", passkey);
        return true;
      }

      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  public static async checkLogin(): Promise<boolean> {
    try {
      const [status, data] = await post<{ message: string }>("/auth/login", undefined, this.buildHeaders());
      return status === 200 && data.message === "logged in";
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  public static async beginRecover(email: string): Promise<boolean> {
    try {
      const [status, data] = await patch<{ message: string }>(`/auth/recover/${email}/begin`);
      return status === 202 && data.message === "await recover";
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  public static async finishRecover(recoveryCode: string): Promise<boolean> {
    try {
      const [status, data] = await put<{
        message: string,
        user: VicarNetAccount & { passkey: string }
      }>(`/auth/recover/${recoveryCode}/finish`);
      if (status === 200 && data.message === "recovered") {
        const {passkey, ...user} = data.user;
        localStorage.setItem("vicar-net:account", JSON.stringify(user));
        localStorage.setItem("vicar-net:passkey", passkey);
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  public static async bindVicarShareIdToAlias(vicarShareId: string): Promise<boolean> {
    try {
      const [status, data] = await post<{ message: string }>(`/share/id`, {
        shareId: vicarShareId
      }, this.buildHeaders());
      return status === 200 && data.message === "ok";
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  public static async unbindVicarShareIdFromAlias(): Promise<boolean> {
    try {
      const [status, data] = await del<{ message: string }>(`/share/id`, this.buildHeaders());
      return status === 200 && data.message === "ok";
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  public static async resolveVicarShareId(idOrAlias: string): Promise<string> {
    const uuidRegex = new RegExp("^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$");
    if (uuidRegex.test(idOrAlias)) {
      return idOrAlias;
    }

    try {
      const [status, data] = await get<{ id: string }>(`/share/${idOrAlias}/id`);
      if (status === 200) {
        return data.id;
      }
      return idOrAlias;
    } catch (e) {
      console.error(e);
      return idOrAlias;
    }
  }

  private static async ping(): Promise<boolean> {
    try {
      const [status, data] = await get<{ message: string }>("/ping");
      return status === 200 && data.message === "pong";
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  private static buildHeaders(): { [key: string]: string } {
    if (!this.isLoggedIn) {
      return {};
    }

    const account = this.account;
    return {"X-User-ID": account.id.toString(), "X-User-Passkey": localStorage.getItem("vicar-net:passkey")!};
  }

  public static async getClans(search: string = "", page: number = 1, limit: number = 20): Promise<{
    total: number,
    items: IHomebrewClan[]
  }> {
    try {
      const [status, data] = await get<{
        total: number,
        items: IHomebrewClan[]
      }>(`/homebrew/clans?search=${search}&page=${page}&limit=${limit}`);
      if (status === 200) {
        return data;
      }
      return {total: 0, items: []};
    } catch (e) {
      console.error(e);
      return {total: 0, items: []};
    }
  }

  public static async getClan(id: number): Promise<{
    clan: IHomebrewClan,
    neededHomebrewDisciplines: IHomebrewDiscipline[]
  } | null> {
    try {
      const [status, data] = await get<{
        clan: IHomebrewClan,
        neededHomebrewDisciplines: IHomebrewDiscipline[]
      }>(`/homebrew/clans/${id}`, this.buildHeaders());
      if (status === 200) {
        return data;
      }
      return null;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  public static async getDisciplines(search: string = "", page: number = 1, limit: number = 20): Promise<{
    total: number,
    items: IHomebrewDiscipline[]
  }> {
    try {
      const [status, data] = await get<{
        total: number,
        items: IHomebrewDiscipline[]
      }>(`/homebrew/disciplines?search=${search}&page=${page}&limit=${limit}`);
      if (status === 200) {
        return data;
      }
      return {total: 0, items: []};
    } catch (e) {
      console.error(e);
      return {total: 0, items: []};
    }
  }

  public static async getDiscipline(id: number): Promise<IHomebrewDiscipline | null> {
    try {
      const [status, data] = await get<IHomebrewDiscipline>(`/homebrew/disciplines/${id}`, this.buildHeaders());
      if (status === 200) {
        return data;
      }
      return null;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  public static async generateAccessCodeForClan(clan: IHomebrewClan): Promise<string | null> {
    if (!this.isLoggedIn || clan.creator !== this.account.alias) {
      return null;
    }

    try {
      const [_, data] = await post<{
        inviteCode: string
      }>(`/homebrew/clans/${clan.id}/invite`, undefined, this.buildHeaders());
      return data.inviteCode;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  public static async generateAccessCodeForDiscipline(discipline: IHomebrewDiscipline): Promise<string | null> {
    if (!this.isLoggedIn || discipline.creator !== this.account.alias) {
      return null;
    }

    try {
      const [_, data] = await post<{
        inviteCode: string
      }>(`/homebrew/disciplines/${discipline.id}/invite`, undefined, this.buildHeaders());
      return data.inviteCode;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  public static async createClan(clan: IHomebrewClan): Promise<IHomebrewClan | undefined> {
    if (!this.isLoggedIn) {
      return undefined;
    }

    try {
      const [status, data] = await post<IHomebrewClan>(`/homebrew/clans`, clan, this.buildHeaders());
      if (status === 200) {
        return data;
      }
      return undefined;
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }

  public static async updateClan(clan: IHomebrewClan): Promise<IHomebrewClan | undefined> {
    if (!this.isLoggedIn || clan.creator !== this.account.alias) {
      return undefined;
    }

    try {
      const [status, data] = await patch<IHomebrewClan>(`/homebrew/clans/${clan.id}`, clan, this.buildHeaders());
      if (status === 200) {
        return data;
      }
      return undefined;
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }

  public static async deleteClan(clan: IHomebrewClan): Promise<boolean> {
    if (!this.isLoggedIn || clan.creator !== this.account.alias) {
      return false;
    }

    try {
      const [status, data] = await del<{ message: string }>(`/homebrew/clans/${clan.id}`, this.buildHeaders());
      return status === 200;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  public static async createDiscipline(discipline: IHomebrewDiscipline): Promise<IHomebrewDiscipline | undefined> {
    if (!this.isLoggedIn) {
      return undefined;
    }

    try {
      const [status, data] = await post<IHomebrewDiscipline>(`/homebrew/disciplines`, discipline, this.buildHeaders());
      if (status === 200) {
        return data;
      }
      return undefined;
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }

  public static async updateDiscipline(discipline: IHomebrewDiscipline): Promise<IHomebrewDiscipline | undefined> {
    if (!this.isLoggedIn || discipline.creator !== this.account.alias) {
      return undefined;
    }

    try {
      const [status, data] = await patch<IHomebrewDiscipline>(`/homebrew/disciplines/${discipline.id}`, discipline, this.buildHeaders());
      if (status === 200) {
        return data;
      }
      return undefined;
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }

  public static async deleteDiscipline(discipline: IHomebrewDiscipline): Promise<boolean> {
    if (!this.isLoggedIn || discipline.creator !== this.account.alias) {
      return false;
    }

    try {
      const [status, data] = await del<{
        message: string
      }>(`/homebrew/disciplines/${discipline.id}`, this.buildHeaders());
      return status === 200;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  public static async getMyContent(): Promise<{ clans: IHomebrewClan[], disciplines: IHomebrewDiscipline[] }> {
    if (!this.isLoggedIn) {
      return {clans: [], disciplines: []};
    }

    try {
      const [status, data] = await get<{
        clans: IHomebrewClan[],
        disciplines: IHomebrewDiscipline[]
      }>(`/homebrew/my-content`, this.buildHeaders());
      if (status === 200) {
        return data;
      }
      return {clans: [], disciplines: []};
    } catch (e) {
      console.error(e);
      return {clans: [], disciplines: []};
    }
  }

  public static async getContentFromInvite(inviteCode: string): Promise<FromInviteResponse | undefined> {
    try {
      const [_, data] = await get<FromInviteResponse>(`/homebrew/from-invite/${inviteCode}`);
      return data;
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }

  public static async postCharSync(roomId: string, charData: string): Promise<void> {
    try {
      await post(`/sync/characters/${roomId}`, {
        data: charData
      }, this.buildHeaders());
    } catch (e) {
      // ignore
    }
  }

  public static async postCharLevelSync(roomId: string, charData: string): Promise<void> {
    try {
      await post(`/sync/characters/${roomId}/level`, {
        data: charData
      }, this.buildHeaders());
    } catch (e) {
      // ignore
    }
  }

  public static async retrieveCharSyncs(ids: string[]): Promise<{[key: string]: {c: string, l: string}}> {
    try {
      const [_, data] = await post<{[key: string]: {c: string, l: string}}>(`/sync/characters`, {
        ids
      });
      return data;
    } catch (e) {
      console.error(e);
      return {};
    }
  }
}