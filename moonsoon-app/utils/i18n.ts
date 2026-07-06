import * as Localization from 'expo-localization';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en.json';
import fr from '../locales/fr.json';

const deviceLang = Localization.getLocales()[0]?.languageCode ?? 'en';
const supportedLangs = ['en', 'fr'] as const;
type Lang = (typeof supportedLangs)[number];
const lng: Lang = (supportedLangs as readonly string[]).includes(deviceLang)
  ? (deviceLang as Lang)
  : 'en';

i18next.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
});

export default i18next;
