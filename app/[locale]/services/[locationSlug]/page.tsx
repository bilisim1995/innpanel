'use client';

import { useEffect, useState } from 'react';
import { ServicesDisplay } from "@/components/services-display";
import { ErrorState } from "@/components/services-display/ErrorState";
import { useTranslation } from 'react-i18next';
import { useRouter, useSearchParams } from 'next/navigation';

// This is a public page that doesn't require authentication
export default function ServicesPage({
  params,
}: {
  params: { locale: string, locationSlug: string }, // locale eklendi
}) {
  const { t } = useTranslation();
  const { locale, locationSlug } = params; // locale buradan alınacak
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // QR kodu kontrolü - Geçici olarak kaldırıldı.
  // Bu kısım, sayfanın QR kodu ile erişilip erişilmediğini kontrol ediyordu.
  // const initialIsQrScan = searchParams.get('qr_code') === 'true';
  // const [hasAccessedViaQr, setHasAccessedViaQr] = useState(initialIsQrScan);

  useEffect(() => {
    // QR kodu parametresi temizleme - Geçici olarak kaldırıldı.
    // Eğer ilk yüklemede qr_code=true varsa ve henüz URL'den kaldırılmadıysa,
    // URL'yi temizleyip erişimin QR ile sağlandığını işaretliyordu.
    // if (initialIsQrScan && searchParams.has('qr_code')) {
    //   const newSearchParams = new URLSearchParams(searchParams.toString());
    //   newSearchParams.delete('qr_code');
    //   router.replace(`/${locale}/services/${locationSlug}${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ''}`);
    //   setHasAccessedViaQr(true);
    // }
    // [initialIsQrScan, locale, locationSlug, searchParams, router]
  }, []);

  // QR kod ile erişim kontrolü - Geçici olarak kaldırıldı.
  // Eğer başlangıçta QR ile erişilmediyse (veya hiç QR koduyla erişilmediyse), hata gösteriyordu.
  // Aksi takdirde (yani QR koduyla erişildiyse ve parametre kaldırılmış olsa bile) hizmetleri gösteriyordu.
  // if (!hasAccessedViaQr) {
  //   return (
  //     <ErrorState error={t('qr_code_access_error_message')} />
  //   );
  // }

  // QR kodu kontrolü artık devre dışı bırakıldığı için doğrudan hizmetleri gösteriyoruz.
  return (
    <ServicesDisplay locationSlug={locationSlug} locale={locale} />
  );
}
