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

  // if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
  //   return NextResponse.next();
  // }

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

  // If pathname has a locale but it's not the default and not explicitly allowed, rewrite or handle as needed.
  // This part of the logic might need adjustment based on specific routing requirements.
  // For example, if you want '/tr' to be the canonical Turkish path, and prevent '/tr/tr' etc.

  return NextResponse.next();
}

// Hangi yolların middleware tarafından işleneceğini belirler
export const config = {
  matcher: [
    // Next.js'in dahili dosyalarını (/_next ile başlayanlar) ve API rotalarını (/api ile başlayanlar) hariç tutar.
    // favicon.ico da hariç tutulur. Ana sayfa, dashboard ve login de hariç tutulur.
    '/((?!_next|api|favicon.ico|dashboard|login|$).*)',
  ],
};
