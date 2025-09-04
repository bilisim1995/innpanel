import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/; // Assets, favicons, etc.
const locales = ['en', 'tr'];
const defaultLocale = 'en';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Yönetici paneli, API rotaları, Next.js iç rotaları ve public dosyaları i18n'den hariç tut
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') || 
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 2. Dil öneki zaten var mı kontrol et (örneğin /tr/services/...) veya ana sayfa mı?
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  let localeToUse = defaultLocale;

  // Eğer URL'de bir dil öneki varsa, onu kullan
  if (pathnameHasLocale) {
    localeToUse = pathname.split('/')[1];
  } else {
    // Eğer URL'de dil öneki yoksa, Accept-Language başlığını kontrol et
    const acceptLanguage = request.headers.get('accept-language');
    localeToUse = acceptLanguage?.includes('tr') ? 'tr' : defaultLocale;

    // Varsayılan dil ile yönlendirme yap (URL'e dil önekini ekle)
    request.nextUrl.pathname = `/${localeToUse}${pathname}`;
    return NextResponse.redirect(request.nextUrl);
  }

  // x-current-locale başlığını ayarla
  const response = NextResponse.next();
  response.headers.set('x-current-locale', localeToUse);
  return response;
}

// Hangi yolların middleware tarafından işleneceğini belirler
export const config = {
  matcher: [
    // Next.js'in dahili dosyalarını (/_next ile başlayanlar) ve API rotalarını (/api ile başlayanlar) hariç tutar.
    // favicon.ico da hariç tutulur. Diğer tüm detaylı hariç tutmalar middleware fonksiyonu içinde yapılır.
    '/((?!_next|api|favicon.ico).*)',
  ],
};