'use client';

import { I18nextProvider } from 'react-i18next';
import { getClientI18n } from '@/i18n';
import { useEffect, useState } from 'react';

interface I18nProviderProps {
  children: React.ReactNode;
  locale: string;
  resources: { [key: string]: { common: any } }; 
}

export function I18nProvider({ children, locale, resources }: I18nProviderProps) {
  const [i18nInstance, setI18nInstance] = useState<any>(null);

  useEffect(() => {
    const initializeAndSetLanguage = async () => {
      const instance = await getClientI18n(locale, resources);
      setI18nInstance(instance);
    };

    initializeAndSetLanguage();
  }, [locale, resources]); 

  // Debugging: I18nProvider içinde algılanan locale ve i18n instance dili
  useEffect(() => {
    if (i18nInstance) {
      console.log('I18nProvider - prop locale:', locale);
      console.log('I18nProvider - i18nInstance.language:', i18nInstance.language);
    }
  }, [i18nInstance, locale]);

  if (!i18nInstance) {
    return null; 
  }

  return (
    <I18nextProvider i18n={i18nInstance}>
      {children}
    </I18nextProvider>
  );
}
