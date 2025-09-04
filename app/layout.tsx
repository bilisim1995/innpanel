import './globals.css';
import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { I18nProvider } from '@/components/i18n-provider';
import { headers } from 'next/headers';
import { promises as fs } from 'fs';
import path from 'path';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
});

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'INN Panel - Tatil Ajansı Yönetim Paneli',
  description: 'Tatil Ajansı için özel olarak tasarlanmış yönetim paneli',
};

const supportedLocales = ['en', 'tr'];

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = headers();
  const currentLocale = headersList.get('x-current-locale') || 'en';

  // Load all translations for all supported locales on the server
  const resources: { [key: string]: { common: any } } = {};
  for (const locale of supportedLocales) {
    const commonTranslationsPath = path.join(process.cwd(), `public/locales/${locale}/common.json`);
    const commonTranslations = JSON.parse(await fs.readFile(commonTranslationsPath, 'utf8'));
    resources[locale] = { common: commonTranslations };
  }

  return (
    <html lang={currentLocale} suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} font-poppins`}>
        <I18nProvider locale={currentLocale} resources={resources}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={true}
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}