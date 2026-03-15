
"use client";

import { ReservationDetails } from "./ReservationDetails";
import { ReservationCalendar } from "./ReservationCalendar";
import { ReservationHeader } from "./ReservationHeader";
import { ReservationSuccess } from "./ReservationSuccess";
import { useReservationState } from "./hooks/useReservationState";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: any;
  locale: string; // locale prop'u eklendi
}

export function ReservationModal({ isOpen, onClose, assignment, locale }: ReservationModalProps) {
  const { t } = useTranslation();
  const reservationState = useReservationState(isOpen, assignment, locale); // locale useReservationState hook'una iletildi

  const getThemeColor = () => {
    return assignment?.theme?.primaryColor || '#dc2626';
  };
  
  const getButtonStyle = () => {
    return { backgroundColor: getThemeColor(), color: '#ffffff', border: 'none' };
  };

  if (!assignment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-white">
        <DialogHeader className="sticky top-0 z-50 flex items-center justify-between p-4 bg-white border-b flex-row">
           <DialogTitle className="text-lg font-bold" style={{ color: getThemeColor() }}>
            {t('make_reservation_title')}
          </DialogTitle>
          <DialogDescription className="sr-only">{t('make_reservation_description')}</DialogDescription>
          <Button onClick={onClose} variant="outline" size="icon">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="space-y-6 p-6">
          <ReservationHeader assignment={assignment} themeColor={getThemeColor()} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ReservationCalendar 
              selectedDate={reservationState.selectedDate}
              availableDates={reservationState.availableDates}
              isCalendarExpanded={reservationState.isCalendarExpanded}
              handleCalendarToggle={reservationState.handleCalendarToggle}
              handleDateSelect={reservationState.handleDateSelect}
              themeColor={getThemeColor()}
            />
            <ReservationDetails 
              assignment={assignment}
              {...reservationState}
              themeColor={getThemeColor()}
              buttonStyle={getButtonStyle()}
              // Explicitly pass all required customer info handlers
              onCustomerNameChange={reservationState.setCustomerName}
              onCustomerSurnameChange={reservationState.setCustomerSurname}
              onCustomerEmailChange={reservationState.setCustomerEmail}
              onCustomerPhoneChange={reservationState.setCustomerPhone}
              onVisitorNoteChange={reservationState.setVisitorNote}
            />
          </div>
        </div>
        
        {reservationState.isSuccessModalOpen && reservationState.successData && (
          <ReservationSuccess 
            isOpen={reservationState.isSuccessModalOpen}
            onClose={() => {
              reservationState.setIsSuccessModalOpen(false);
              onClose();
            }} 
            reservationId={reservationState.successData.reservationId}
            serviceName={reservationState.successData.serviceName}
            reservationDate={reservationState.successData.reservationDate}
            timeSlot={reservationState.successData.timeSlot}
            locationSlug={reservationState.successData.locationSlug}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
