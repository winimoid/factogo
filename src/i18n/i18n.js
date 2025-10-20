import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import en from './locales/en.json';
import fr from './locales/fr.json';
import ee from './locales/ee.json';
import it from './locales/it.json';
import es from './locales/es.json';
import ja from './locales/ja.json';

const resources = {
  en: {
    translation: en,
  },
  fr: {
    translation: fr,
  },
  ee: {
    translation: ee,
  },
  it: {
    translation: it,
  },
  es: {
    translation: es,
  },
  ja: {
    translation: ja,
  },
};

const { languageCode } = RNLocalize.getLocales()[0] || { languageCode: 'en' };

i18next
  .use(initReactI18next)
  .init({
    resources,
    lng: languageCode,
    fallbackLng: 'en',
    compatibilityJSON: 'v3', // Important for i18next-react
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
  });

export default i18next;
