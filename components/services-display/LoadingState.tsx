"use client";

import { Loader2 } from "lucide-react";
import { useTranslation } from 'react-i18next';

export function LoadingState() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-gray-600 mx-auto" />
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">{t('services_loading_title')}</h3>
          <p className="text-gray-600">{t('please_wait_message')}</p>
        </div>
      </div>
    </div>
  );
}