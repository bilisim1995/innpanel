'use client';

import { I18nextProvider } from 'react-i18next';
import { getClientI18n } from '@/i18n';
import { useEffect, useState } from 'react';

interface I18nProviderProps {
  children: React.ReactNode;
  locale: string;
  resources: any;
}

export function I18nProvider({ children, locale, resources }: I18nProviderProps) {
  const [i18nInstance, setI18nInstance] = useState<any>(null);

  useEffect(() => {
    const initializeAndSetLanguage = async () => {
      const instance = await getClientI18n(locale, resources);
      setI18nInstance(instance);
    };

    initializeAndSetLanguage();
  }, [locale, resources]); // locale veya resources değiştiğinde yeniden çalıştır

  if (!i18nInstance) {
    return null; // Veya bir yükleme göstergesi
  }

  return (
    <I18nextProvider i18n={i18nInstance}>
      {children}
    </I18nextProvider>
  );
}
