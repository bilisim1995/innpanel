"use client";

import { ServiceData } from "@/lib/services";
import { CarFront } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ServiceVehicleFeaturesProps {
  service: ServiceData;
  theme: any;
}

export function ServiceVehicleFeatures({ service, theme }: ServiceVehicleFeaturesProps) {
  const { t } = useTranslation();
  const accentColor = theme?.customStyle?.backgroundColor || '#dc2626';

  if (!service.categoryDetails?.vehicleDetails?.features) {
    return null;
  }

  return (
    <div
      className="bg-gray-50/80 rounded-r-xl py-4 px-5 border-l-4"
      style={{ borderLeftColor: accentColor }}
    >
      <div className="flex items-center gap-2 mb-2">
        <CarFront className="w-4 h-4" style={{ color: accentColor }} />
        <span className="text-sm font-semibold text-gray-800">{t('vehicle_features_title')}</span>
      </div>
      <p className="text-gray-700 leading-relaxed text-sm">
        {service.categoryDetails.vehicleDetails.features}
      </p>
    </div>
  );
}
