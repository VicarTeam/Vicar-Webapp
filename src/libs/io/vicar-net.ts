import {get, patch, post, put, del} from "@/libs/io/rest";

export interface VicarNetAccount {
  id: number;
  email: string;
  alias: string;
}

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
      const [status, data] = await post<{message: string}>("/auth/register", {email, alias});
      return status === 202 && data.message === "await activation";
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  public static async finishRegister(activationCode: string): Promise<boolean> {
    try {
      const [status, data] = await put<{message: string, user: VicarNetAccount & {passkey: string}}>("/auth/activate/" + activationCode);
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
      const [status, data] = await post<{message: string}>("/auth/login", undefined, this.buildHeaders());
      return status === 200 && data.message === "logged in";
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  public static async beginRecover(email: string): Promise<boolean> {
    try {
      const [status, data] = await patch<{message: string}>(`/auth/recover/${email}/begin`);
      return status === 202 && data.message === "await recover";
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  public static async finishRecover(recoveryCode: string): Promise<boolean> {
    try {
      const [status, data] = await put<{message: string, user: VicarNetAccount & {passkey: string}}>(`/auth/recover/${recoveryCode}/finish`);
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
      const [status, data] = await post<{message: string}>(`/share/id`, {
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
      const [status, data] = await del<{message: string}>(`/share/id`, this.buildHeaders());
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
      const [status, data] = await get<{id: string}>(`/share/${idOrAlias}/id`);
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
      const [status, data] = await get<{message: string}>("/ping");
      return status === 200 && data.message === "pong";
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  private static buildHeaders(): {[key: string]: string} {
    if (!this.isLoggedIn) {
      return {};
    }

    const account = this.account;
    return {"X-User-ID": account.id.toString(), "X-User-Passkey": localStorage.getItem("vicar-net:passkey")!};
  }
}