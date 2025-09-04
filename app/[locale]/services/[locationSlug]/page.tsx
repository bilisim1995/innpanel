'use client';

import { ServicesDisplay } from "@/components/services-display";
import { ErrorState } from "@/components/services-display/ErrorState";
import { useTranslation } from 'react-i18next';

// This is a public page that doesn't require authentication
export default function ServicesPage({
  params,
  searchParams
}: {
  params: { locale: string, locationSlug: string }, // locale eklendi
  searchParams: { qr_scan?: string }
}) {
  const { t } = useTranslation();
  const { locale, locationSlug } = params; // locale buradan alınacak
  const isQrScan = searchParams.qr_scan === 'true';

  // QR kod ile erişim kontrolü
  if (!isQrScan) {
    return (
      <ErrorState error={t('qr_code_access_error_message')} />
    );
  }

  return (
    <ServicesDisplay locationSlug={locationSlug} />
  );
}
