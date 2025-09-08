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
  
  // Sayfa ilk yüklendiğinde qr_code parametresini kontrol et
  const initialIsQrScan = searchParams.get('qr_code') === 'true';

  // QR kodu ile erişim sağlanıp sağlanmadığını tutan state
  const [hasAccessedViaQr, setHasAccessedViaQr] = useState(initialIsQrScan);

  useEffect(() => {
    // Eğer ilk yüklemede qr_code=true varsa ve henüz URL'den kaldırılmadıysa
    if (initialIsQrScan && searchParams.has('qr_code')) {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete('qr_code');
      
      // URL'yi güncelle (qr_code parametresi olmadan)
      router.replace(`/${locale}/services/${locationSlug}${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ''}`);
      
      // Erişimin QR kodu ile sağlandığını işaretle
      setHasAccessedViaQr(true);
    }
  }, [initialIsQrScan, locale, locationSlug, searchParams, router]);

  // QR kod ile erişim kontrolü
  // Eğer başlangıçta QR ile erişilmediyse (veya hiç QR koduyla erişilmediyse), hata göster.
  // Aksi takdirde (yani QR koduyla erişildiyse ve parametre kaldırılmış olsa bile) hizmetleri göster.
  if (!hasAccessedViaQr) {
    return (
      <ErrorState error={t('qr_code_access_error_message')} />
    );
  }

  // QR kodu kontrolü başarılıysa hizmetleri göster
  return (
    <ServicesDisplay locationSlug={locationSlug} />
  );
}
