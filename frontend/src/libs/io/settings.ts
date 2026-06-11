export class SettingsData {

  public static isDevMode() {
    return localStorage.getItem("settings:devMode") === "true";
  }

  public static setDevMode(value: boolean) {
    localStorage.setItem("settings:devMode", value ? "true" : "false");
  }

  // Atmosphäre-Effekte (Animationen). Standard an.
  public static isFxEnabled() {
    return localStorage.getItem("settings:fx") !== "false";
  }

  public static setFxEnabled(value: boolean) {
    localStorage.setItem("settings:fx", value ? "true" : "false");
  }

  // Sound-Effekte. Standard an.
  public static isSoundEnabled() {
    return localStorage.getItem("settings:sound") !== "false";
  }

  public static setSoundEnabled(value: boolean) {
    localStorage.setItem("settings:sound", value ? "true" : "false");
  }

  public static getVicarNetUrl() {
    return localStorage.getItem("settings:vicarNet") || "https://vicar.nauri.io";
  }

  public static setVicarNetUrl(value: string) {
    localStorage.setItem("settings:vicarNet", value.endsWith("/") ? value.slice(0, -1) : value);
  }
}
