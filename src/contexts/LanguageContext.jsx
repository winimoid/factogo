
import React, { createContext, useState, useCallback } from 'react';
import * as RNLocalize from 'react-native-localize';
import { I18n } from 'i18n-js';
import en from '../i18n/locales/en.json';
import fr from '../i18n/locales/fr.json';
import { registerTranslation, en as enPaperDates, fr as frPaperDates } from 'react-native-paper-dates';

registerTranslation('en', enPaperDates);
registerTranslation('fr', frPaperDates);

export const LanguageContext = createContext();

const translations = { en, fr };

const i18n = new I18n(translations);

const { languageCode } = RNLocalize.getLocales()[0] || { languageCode: 'en' };
i18n.locale = languageCode;
i18n.fallbacks = true;

export const LanguageProvider = ({ children }) => {
  const [locale, setLocale] = useState(languageCode);

  const setLanguage = useCallback(
    (lang) => {
      i18n.locale = lang;
      setLocale(lang);
    },
    []
  );

  const t = useCallback(
    (scope, options) => {
      return i18n.t(scope, { ...options, locale });
    },
    [locale]
  );

  return (
    <LanguageContext.Provider value={{ t, setLanguage, locale }}>
      {children}
    </LanguageContext.Provider>
  );
};
