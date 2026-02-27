import React, { createContext, useContext, useState, useEffect } from 'react';
import { LanguageCode } from '../types';
import { getTranslation } from '../services/i18n';
import * as DB from '../services/db';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>('id');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initLang = async () => {
      const saved = await DB.getSetting('app_language');
      if (saved) {
        setLanguageState(saved as LanguageCode);
      }
      setIsLoading(false);
    };
    initLang();
  }, []);

  const setLanguage = async (lang: LanguageCode) => {
    setLanguageState(lang);
    await DB.setSetting('app_language', lang);
  };

  const t = (key: string) => {
      return getTranslation(language, key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
