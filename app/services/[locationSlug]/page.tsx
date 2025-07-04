import { ServicesDisplay } from "@/components/services-display";
import { ErrorState } from "@/components/services-display/ErrorState";

// This is a public page that doesn't require authentication
export default function ServicesPage({ 
  params,
  searchParams
}: { 
  params: { locationSlug: string },
  searchParams: { qr_scan?: string }
}) {
  const { locationSlug } = params;
  const isQrScan = searchParams.qr_scan === 'true';

  // QR kod ile erişim kontrolü
  if (!isQrScan) {
    return (
      <ErrorState error="Bu sayfaya doğrudan erişim izni yoktur. Lütfen QR kodu ile tarayarak erişin." />
    );
  }

  return (
    <ServicesDisplay locationSlug={locationSlug} />
  );
}