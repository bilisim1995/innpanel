
"use client";

import { Calendar } from "@/components/ui/calendar";
import { CardContent, CardHeader, CardTitle, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronUp, ChevronDown } from "lucide-react";
import { tr, enUS } from "date-fns/locale";
import { format } from "date-fns";
import { useTranslation } from 'react-i18next';

interface ReservationCalendarProps {
  selectedDate: Date | undefined;
  availableDates: Date[];
  isCalendarExpanded: boolean;
  handleCalendarToggle: () => void;
  handleDateSelect: (date: Date | undefined) => void;
  themeColor: string;
}

export function ReservationCalendar({ 
  selectedDate, 
  availableDates, 
  isCalendarExpanded, 
  handleCalendarToggle, 
  handleDateSelect,
  themeColor
}: ReservationCalendarProps) {
  const { t, i18n } = useTranslation(); // i18n nesnesi de çözümlendi
  
  // Hata düzeltmesi: availableDates'in bir dizi olduğundan emin ol
  const isDateAvailable = (date: Date) => {
    // Eğer availableDates tanımsız veya null ise, false döndür.
    if (!availableDates) {
      return false;
    }
    // Dizi ise .some() metodunu güvenle çağır.
    return availableDates.some(d => d.toDateString() === date.toDateString());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle 
          className="flex items-center justify-center gap-1 text-xl"
          style={{ color: themeColor, fontFamily: 'Helvetica, Arial, sans-serif' }}
        >
          <CalendarIcon className="h-5 w-5" />
          {t('available_dates_title')}
          {selectedDate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCalendarToggle}
              className="text-base"
            >
              {isCalendarExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  {t('collapse_button')}
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" style={{ color: themeColor }} />
                  {t('show_calendar_button')}
                </>
              )}
            </Button>
          )}
        </CardTitle>
        {selectedDate && !isCalendarExpanded && (
          <div className="flex items-center gap-3 mt-2 p-3 rounded-xl border-2" style={{ borderColor: themeColor, backgroundColor: `${themeColor}10` }}>
            <div className="w-8 h-8 rounded-md flex items-center justify-center text-white" style={{ backgroundColor: themeColor }}>
              <CalendarIcon className="w-4 h-4" />
            </div>
            <p className="font-bold text-md">
              {format(selectedDate, 'd MMMM yyyy, EEEE', { locale: i18n.language === 'tr' ? tr : enUS })}
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent className={isCalendarExpanded ? "pb-6" : "pb-0"}>
        {/* Takvim - Koşullu Görünüm */}
        <div 
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            isCalendarExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            locale={i18n.language === 'tr' ? tr : undefined} // Dil'e göre locale ayarla
            disabled={(date) => {
              // Geçmiş tarihler ve müsait olmayan tarihler
              return date < new Date() || !isDateAvailable(date);
            }}
            modifiers={{
              available: availableDates || [], // Burada da availableDates'in undefined olmamasını sağla
              selected: selectedDate ? [selectedDate] : []
            }}
            modifiersStyles={{
              available: {
                backgroundColor: `${themeColor}20`, color: themeColor, fontWeight: 'bold'
              },
              selected: {
                backgroundColor: themeColor, color: 'white', fontWeight: 'bold',
                border: `2px solid ${themeColor}`
              }
            }}
            className="rounded-md border"
          />
        </div>
        {/* Tarih açıklamaları - koşullu görünüm */}
        <div 
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            isCalendarExpanded ? 'max-h-24 opacity-100 mt-4 pt-3 border-t border-gray-200' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-base">
              <div 
                className="w-4 h-4 rounded border"
                style={{ backgroundColor: `${themeColor}30` }}
              ></div>
              <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>{t('available_dates_label')}</span>
            </div>
            <div className="flex items-center gap-2 text-base">
              <div 
                className="w-4 h-4 rounded border"
                style={{ backgroundColor: themeColor }}
              ></div>
              <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>{t('selected_date_label')}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
