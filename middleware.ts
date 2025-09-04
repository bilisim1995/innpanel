import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Doğrudan tanımla, i18n dosyasından çekme
let locales = ['en', 'tr'];
let defaultLocale = 'en';

function getLocale(request: NextRequest) {
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const languages = acceptLanguage.split(',').map(lang => lang.split(';')[0].trim());
    for (const lang of languages) {
      if (locales.includes(lang)) {
        return lang;
      }
    }
  }
  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if there is any locale in the pathname
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // If no locale in pathname, redirect to default locale
  if (!pathnameHasLocale) {
    const locale = getLocale(request);
    request.nextUrl.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(request.nextUrl);
  }

  return NextResponse.next();
}

// Hangi yolların middleware tarafından işleneceğini belirler
export const config = {
  matcher: [
    '/((?!_next|api|favicon.ico|dashboard|login|[\w-]+\.\w+$).*)'
  ],
};
