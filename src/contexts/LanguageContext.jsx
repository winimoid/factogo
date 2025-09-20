import React, { createContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import i18next from '../i18n/i18n';
import { registerTranslation, en as enPaperDates, fr as frPaperDates } from 'react-native-paper-dates';

registerTranslation('en', enPaperDates);
registerTranslation('fr', frPaperDates);

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const { t } = useTranslation();

  const setLanguage = useCallback(
    (lang) => {
      i18next.changeLanguage(lang);
    },
    []
  );

  return (
    <LanguageContext.Provider value={{ t, setLanguage, locale: i18next.language }}>
      {children}
    </LanguageContext.Provider>
  );
};
