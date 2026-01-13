import * as Localization from "expo-localization";
import { I18n } from "i18n-js";
import en from "./en.json";
import es from "./es.json";

const i18n = new I18n();

i18n.translations = {
  en: en,
  es: es,
};

// Handle deprecated Localization.locale and new getLocales() API
let userLocale = 'en';
try {
  if (Localization.locale) {
    userLocale = Localization.locale.slice(0, 2);
  } else if (Localization.getLocales && Localization.getLocales()[0]) {
    userLocale = Localization.getLocales()[0].languageCode;
  }
} catch (error) {
  console.warn('Error getting locale:', error);
}

i18n.locale = userLocale;

i18n.enableFallback = true;

export default i18n;
