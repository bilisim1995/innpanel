"use client";

import { Info } from "lucide-react";
import { AssignmentData } from "@/lib/assignments";
import { ServiceData } from "@/lib/services";
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';

interface ServiceTourInformationProps {
  assignment: AssignmentData;
  service: ServiceData;
  theme: any;
}

const getTourInfoForCategory = (category: string, details: any): string | null => {
  if (!details) return null;

  switch (category) {
    case "region-tours":
      return null;
    case "motor-tours":
      return details.routeDetails?.description || details.tourDetails || null;
    case "balloon":
      return details.flightInfo?.flightArea || null;
    case "transfer":
      return details.routeDetails?.notes || null;
    case "other":
      return details.tourDetails || null;
    default:
      return null;
  }
};

export function ServiceTourInformation({ assignment, service, theme }: ServiceTourInformationProps) {
  const { t } = useTranslation();
  const accentColor = theme.customStyle?.backgroundColor || '#dc2626';

  const tourInfoText = getTourInfoForCategory(assignment.serviceCategory, service.categoryDetails);

  if (!tourInfoText) return null;

  return (
    <div
      className="bg-gray-50/80 rounded-r-xl py-4 px-5 border-l-4"
      style={{ borderLeftColor: accentColor }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Info className="w-4 h-4" style={{ color: accentColor }} />
        <span className="text-sm font-semibold text-gray-800">{t('tour_information_title')}</span>
      </div>
      <div className="text-gray-700 leading-relaxed text-sm prose prose-sm max-w-none prose-headings:text-gray-800 prose-headings:font-semibold prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-800 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5">
        <ReactMarkdown>
          {tourInfoText}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export default ServiceTourInformation;
