'use client';

import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const locales = ['en', 'tr'];
const defaultLocale = 'en';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const pathSegments = pathname.split('/').filter(Boolean);
    let currentLocale = defaultLocale;

    if (pathSegments.length > 0 && locales.includes(pathSegments[0])) {
      currentLocale = pathSegments[0];
    }

    if (i18n.language !== currentLocale) {
      i18n.changeLanguage(currentLocale);
    }
  }, [pathname]);

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}