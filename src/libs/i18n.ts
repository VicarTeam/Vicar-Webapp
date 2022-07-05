import VueI18n, {LocaleMessages} from "vue-i18n";
import Vue from "vue";

Vue.use(VueI18n);

export const AVAILABLE_LOCALES = [{name: "Deutsch", code: "de-DE"}, {name: "English", code: "en-US"}];

const loadedLocales: LocaleMessages = {};

export const DEFAULT_LOCALE = "en-US";

import enUS from '@/assets/langs/en-US.json';
loadedLocales["en-US"] = enUS;

import deDE from '@/assets/langs/de-DE.json';
import {SettingsData} from "@/libs/io/settings";
loadedLocales["de-DE"] = deDE;

export const i18n = new VueI18n({
    locale: SettingsData.getLanguage(),
    fallbackLocale: DEFAULT_LOCALE,
    messages: loadedLocales
});

export async function setLocale(locale: string) {
    if (!AVAILABLE_LOCALES.find(l => l.code === locale)) {
        throw new Error(`Locale ${locale} is not available`);
    }

    if (i18n.locale === locale) {
        return;
    }

    i18n.locale = locale;
    SettingsData.setLanguage(locale);
}
