// app/layout.tsx - DOĞRU VE TAM HALİ
import './globals.css';
import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { I18nProvider } from '@/components/i18n-provider';
import { headers } from 'next/headers';

// 1. ADIM: Node.js'in 'fs' ve 'path' modüllerini siliyoruz.
// Artık diskten manuel dosya okumayacağız.

// 2. ADIM: Çeviri dosyalarını doğrudan import ediyoruz.
// Bu, Next.js'e bu dosyaların projenin bir parçası olduğunu ve
// build işlemine dahil edilmesi gerektiğini söyler.
import enTranslations from '@/public/locales/en/common.json';
import trTranslations from '@/public/locales/tr/common.json';

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = headers();
  const currentLocale = headersList.get('x-current-locale') || 'en';

  // 3. ADIM: 'resources' objesini, import ettiğimiz verileri kullanarak oluşturuyoruz.
  // Dinamik olarak dosya okumaya çalışan döngüyü tamamen kaldırıyoruz.
  const resources = {
    en: { common: enTranslations },
    tr: { common: trTranslations },
  };

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