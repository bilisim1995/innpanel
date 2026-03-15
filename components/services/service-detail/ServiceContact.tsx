"use client";

import { Phone, User, Building2 } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface ServiceContactProps {
  service: any;
  theme: any;
}

export function ServiceContact({ service, theme }: ServiceContactProps) {
  const { t } = useTranslation();
  const accentColor = theme.customStyle?.backgroundColor || '#dc2626';

  return (
    <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 space-y-3">
      <p className="text-xs text-gray-500">{t('contact_reservation_description')}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {service.contactNumber && (
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${accentColor}15` }}
            >
              <Phone className="w-4 h-4" style={{ color: accentColor }} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500">{t('phone_label')}</p>
              <p className="text-sm font-semibold text-gray-800 truncate">{service.contactNumber}</p>
            </div>
          </div>
        )}
        {service.manager && (
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${accentColor}15` }}
            >
              <User className="w-4 h-4" style={{ color: accentColor }} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500">{t('responsible_label')}</p>
              <p className="text-sm font-semibold text-gray-800 truncate">{service.manager}</p>
            </div>
          </div>
        )}
        {service.companyName && (
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${accentColor}15` }}
            >
              <Building2 className="w-4 h-4" style={{ color: accentColor }} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500">{t('company_label')}</p>
              <p className="text-sm font-semibold text-gray-800 truncate">{service.companyName}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
