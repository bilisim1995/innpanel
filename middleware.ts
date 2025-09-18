import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

  // Eğer ana dizin ise, yönlendirme yapmadan devam et
  if (pathname === '/') {
    const response = NextResponse.next();
    // Ana dizinde de defaultLocale'yi set et
    response.headers.set('x-current-locale', defaultLocale);
    console.log('Middleware - Root path, setting x-current-locale:', defaultLocale);
    return response;
  }

  // Pathname'in zaten bir locale içerip içermediğini kontrol et
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  let localeToUse: string;

  if (pathnameHasLocale) {
    // Eğer pathname zaten bir locale içeriyorsa, o locale'yi kullan
    localeToUse = pathname.split('/')[1];
    const response = NextResponse.next();
    response.headers.set('x-current-locale', localeToUse);
    console.log('Middleware - Path has locale, setting x-current-locale:', localeToUse);
    return response;
  } else {
    // Eğer pathname bir locale içermiyorsa, varsayılan locale'yi belirle ve yönlendir
    localeToUse = getLocale(request);
    request.nextUrl.pathname = `/${localeToUse}${pathname}`;
    const response = NextResponse.redirect(request.nextUrl);
    response.headers.set('x-current-locale', localeToUse);
    console.log('Middleware - Path without locale, redirecting and setting x-current-locale:', localeToUse);
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!_next|api|favicon.ico|dashboard|login|[\w-]+\.\w+$).*)',
  ],
};
