"use client";

import { ServiceData } from "@/lib/services";
import { CarFront } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';

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
      <div className="text-gray-700 leading-relaxed text-sm prose prose-sm max-w-none prose-headings:text-gray-800 prose-headings:font-semibold prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-800 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5">
        <ReactMarkdown>
          {service.categoryDetails.vehicleDetails.features}
        </ReactMarkdown>
      </div>
    </div>
  );
}
