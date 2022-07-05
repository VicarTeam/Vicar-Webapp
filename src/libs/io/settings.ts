import {AVAILABLE_LOCALES, DEFAULT_LOCALE} from "@/libs/i18n";

export class SettingsData {

    public static isDevMode() {
        return localStorage.getItem("settings:devMode") === "true";
    }

    public static setDevMode(value: boolean) {
        localStorage.setItem("settings:devMode", value ? "true" : "false");
    }

    public static getVicarPlayServer() {
        return localStorage.getItem("settings:vicarplayServer") || "http://localhost:19987";
    }

    public static setVicarPlayServer(value: string) {
        localStorage.setItem("settings:vicarplayServer", value);
    }

    public static getLanguage() {
        return localStorage.getItem("settings:language") || this.getSystemLocale();
    }

    public static setLanguage(value: string) {
        localStorage.setItem("settings:language", value);
    }

    private static getSystemLocale() {
        const langCode = navigator.language;
        const lang = AVAILABLE_LOCALES.find(l => l.code === langCode || l.code.startsWith(langCode.split('-')[0].toLowerCase()));

        return lang ? lang.code : DEFAULT_LOCALE;
    }
}
