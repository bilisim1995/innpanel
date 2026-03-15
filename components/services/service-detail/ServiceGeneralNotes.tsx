"use client";

import { FileText } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface ServiceGeneralNotesProps {
  service: any;
  theme: any;
}

export function ServiceGeneralNotes({ service, theme }: ServiceGeneralNotesProps) {
  const { t } = useTranslation();

  if (!service.notes) return null;

  const accentColor = theme.customStyle?.backgroundColor || '#dc2626';

  return (
    <div
      className="bg-gray-50/80 rounded-r-xl py-4 px-5 border-l-4"
      style={{ borderLeftColor: accentColor }}
    >
      <div className="flex items-center gap-2 mb-2">
        <FileText className="w-4 h-4" style={{ color: accentColor }} />
        <span className="text-sm font-semibold text-gray-800">{t('service_notes_title')}</span>
      </div>
      <p className="text-gray-700 leading-relaxed text-sm">
        {service.notes}
      </p>
    </div>
  );
}
