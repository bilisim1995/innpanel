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

  // 3. Eğer dil öneki yoksa ve /services/ ile başlayan bir sayfa ise, varsayılan dil ile yönlendir
  if (!pathnameHasLocale) {
    // Sadece /services/[locationSlug] gibi rotalar için dil ekle
    const isServicePage = pathname.startsWith('/services/');
    
    if (isServicePage) {
      const acceptLanguage = request.headers.get('accept-language');
      const preferredLocale = acceptLanguage?.includes('tr') ? 'tr' : defaultLocale;

      request.nextUrl.pathname = `/${preferredLocale}${pathname}`;
      return NextResponse.redirect(request.nextUrl);
    }
  }

  // 4. Eğer dil öneki varsa (örneğin /en/services/...) ve bu bir hizmet sayfası ise, dil önekini kaldırarak path rewrite et
  // Örneğin, /en/services/istanbul -> /services/istanbul olarak rewrite edilir
  if (pathnameHasLocale) {
    const locale = pathname.split('/')[1];
    const newPathname = pathname.replace(`/${locale}`, '');
    
    // Yalnızca '/services' ile başlayan sayfalar için rewrite yap (ve ana sayfa hariç)
    if (newPathname.startsWith('/services/')) {
      request.nextUrl.pathname = newPathname;
      return NextResponse.rewrite(request.nextUrl);
    }
  }

  // Varsayılan olarak isteği olduğu gibi devam ettir
  return NextResponse.next();
}

// Hangi yolların middleware tarafından işleneceğini belirler
export const config = {
  matcher: [
    // Next.js'in dahili dosyalarını (/_next ile başlayanlar) ve API rotalarını (/api ile başlayanlar) hariç tutar.
    // favicon.ico da hariç tutulur. Diğer tüm detaylı hariç tutmalar middleware fonksiyonu içinde yapılır.
    '/((?!_next|api|favicon.ico).*)',
  ],
};