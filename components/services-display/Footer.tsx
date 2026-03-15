"use client";

import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <div className="bg-gray-900 text-white py-3 mt-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center">
          <p className="text-sm font-medium">
            © {currentYear} innget.com - {t('all_rights_reserved')}
          </p>
        </div>
      </div>
    </div>
  );
}