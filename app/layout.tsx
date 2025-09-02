import './globals.css';
import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { I18nProvider } from '@/components/i18n-provider';
import { headers } from 'next/headers';

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = headers();
  const acceptLanguage = headersList.get('accept-language');
  const currentLocale = acceptLanguage?.includes('tr') ? 'tr' : 'en'; // Basit bir algılama

  return (
    <html lang={currentLocale} suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} font-poppins`}>
        <I18nProvider>
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