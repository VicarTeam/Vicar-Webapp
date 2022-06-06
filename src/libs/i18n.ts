import VueI18n, {LocaleMessages} from "vue-i18n";
import Vue from "vue";

Vue.use(VueI18n);

export const AVAILABLE_LOCALES = [{name: "Deutsch", code: "de-DE"}];

const loadedLocales: LocaleMessages = {};

const DEFAULT_LOCALE = "de-DE";
import deDE from '@/assets/langs/de-DE.json';

loadedLocales[DEFAULT_LOCALE] = deDE;

export const i18n = new VueI18n({
    locale: getLocaleFromDisk(),
    fallbackLocale: DEFAULT_LOCALE,
    messages: loadedLocales
});

function getLocaleFromDisk() {
    const locale = localStorage.getItem("locale");
    return locale ? locale : DEFAULT_LOCALE;
}

export async function setLocale(locale: string) {
    if (!AVAILABLE_LOCALES.find(l => l.code === locale)) {
        throw new Error(`Locale ${locale} is not available`);
    }
    
    if (i18n.locale === locale) {
        return;
    }
    
    if (loadedLocales[locale]) {
        i18n.locale = locale;
        localStorage.setItem("locale", locale);
        return;
    }
        
    loadedLocales[locale] = (await import(`@/assets/langs/${locale}.json`)).default;
    i18n.locale = locale;
    localStorage.setItem("locale", locale);
}