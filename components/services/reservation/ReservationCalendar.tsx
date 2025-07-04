"use client";

import { Calendar } from "@/components/ui/calendar";
import { CardContent, CardHeader, CardTitle, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronUp, ChevronDown } from "lucide-react";
import { tr } from "date-fns/locale";

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
  const isDateAvailable = (date: Date) => {
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
          Müsait Tarihler
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
                  Küçült
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" style={{ color: themeColor }} />
                  Takvimi Göster
                </>
              )}
            </Button>
          )}
        </CardTitle>
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
            locale={tr}
            disabled={(date) => {
              // Geçmiş tarihler ve müsait olmayan tarihler
              return date < new Date() || !isDateAvailable(date);
            }}
            modifiers={{
              available: availableDates,
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
              <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>Müsait tarihler</span>
            </div>
            <div className="flex items-center gap-2 text-base">
              <div 
                className="w-4 h-4 rounded border"
                style={{ backgroundColor: themeColor }}
              ></div>
              <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>Seçili tarih</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}