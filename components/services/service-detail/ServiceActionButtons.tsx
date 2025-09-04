"use client";

import { Button } from "@/components/ui/button";
import { Calendar, XCircle } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface ServiceActionButtonsProps {
  service: any;
  theme: any;
  onReservationClick: () => void;
}

export function ServiceActionButtons({ service, theme, onReservationClick }: ServiceActionButtonsProps) {
  const { t } = useTranslation();
  // Get the background color from theme
  const backgroundStyle = theme.customStyle?.background ? 
    { background: theme.customStyle.background, border: 'none' } : 
    { backgroundColor: theme.customStyle?.backgroundColor || '#dc2626' };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 p-6 z-50">
      <Button 
        onClick={onReservationClick}
        disabled={!service.isActive}
        className="w-full hover:opacity-90 text-white font-bold py-8 px-8 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 text-xl" 
        style={{ ...backgroundStyle, fontFamily: 'Helvetica, Arial, sans-serif' }}
      >
        <Calendar className="w-6 h-6 mr-3" />
        {t('book_now_button')}
      </Button>
      
      {!service.isActive && (
        <div className="text-center mt-4 p-3 bg-red-50 border border-red-200 rounded-xl shadow-sm animate-pulse">
          <p className="text-red-700 font-bold flex items-center justify-center gap-2" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
            <XCircle className="w-5 h-5" />
            {t('service_closed_message')}
          </p>
        </div>
      )}
    </div>
  );
}