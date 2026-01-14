export class SettingsData {

  public static isDevMode() {
    return localStorage.getItem("settings:devMode") === "true";
  }

  public static setDevMode(value: boolean) {
    localStorage.setItem("settings:devMode", value ? "true" : "false");
  }

  public static getVicarNetUrl() {
    return localStorage.getItem("settings:vicarNet") || "https://vicar.nauri.io";
  }

  public static setVicarNetUrl(value: string) {
    localStorage.setItem("settings:vicarNet", value.endsWith("/") ? value.slice(0, -1) : value);
  }
}
