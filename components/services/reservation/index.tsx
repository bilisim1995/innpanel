
"use client";

import { ReservationDetails } from "./ReservationDetails";
import { ReservationCalendar } from "./ReservationCalendar";
import { ReservationHeader } from "./ReservationHeader";
import { ReservationSuccess } from "./ReservationSuccess";
import { useReservationState } from "./hooks/useReservationState";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: any;
}

export function ReservationModal({ isOpen, onClose, assignment }: ReservationModalProps) {
  const {
    // ...all other state and handlers from the hook
    selectedDate,
    availableDates,
    availableTimeSlots,
    selectedTimeSlot,
    personCount,
    vehicleCount,
    displayPrices,
    selectedVehicle,
    paymentMethod,
    isPaymentSettingsOpen,
    availablePaymentMethods,
    prepaymentAmount,
    isCalendarExpanded,
    categoryTheme,
    assignedVehicles,
    filteredVehicles,
    personCountForTransfer,
    selectedVehicles,
    customerName,
    customerSurname,
    customerEmail, // Destructure the email state
    customerPhone,
    visitorNote,
    isSuccessModalOpen,
    successData,
    customerErrors,
    isSubmitting,
    selectedCurrency,
    setSelectedCurrency,
    handleDateSelect,
    handleTimeSlotSelect,
    handlePersonCountChange,
    handlePersonCountForTransferChange,
    handleVehicleCountChange,
    handleVehicleSelect,
    handleVehicleCountChangeForTransfer,
    removeVehicleFromSelection,
    getTotalCapacityForTransfer,
    getTotalVehicleCountForTransfer,
    getTotalAmount,
    getPaymentBreakdown,
    handleReservation,
    handleCalendarToggle,
    setPaymentMethod,
    setIsPaymentSettingsOpen,
    setPrepaymentAmount,
    setIsSuccessModalOpen,
    setCustomerName,
    setCustomerSurname,
    setCustomerEmail, // Destructure the email setter
    setCustomerPhone,
    setVisitorNote
  } = useReservationState(isOpen, assignment);

  const getThemeColor = () => {
    return categoryTheme?.customStyle?.backgroundColor || '#dc2626';
  };
  
  const getButtonStyle = () => {
    return { backgroundColor: getThemeColor(), border: 'none' };
  };

  if (!assignment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        
        <div className="sticky top-0 z-50 flex items-center justify-between p-4 bg-white border-b">
           <h2 className="text-lg font-bold" style={{ color: getThemeColor() }}>
            Rezervasyon Yap
          </h2>
          <Button onClick={onClose} variant="outline" size="icon">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-6 p-6">
          <ReservationHeader assignment={assignment} themeColor={getThemeColor()} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ReservationCalendar 
              selectedDate={selectedDate}
              availableDates={availableDates}
              isCalendarExpanded={isCalendarExpanded}
              handleCalendarToggle={handleCalendarToggle}
              handleDateSelect={handleDateSelect}
              themeColor={getThemeColor()}
            />
            <ReservationDetails 
              {...{
                assignment,
                selectedDate,
                availableTimeSlots,
                selectedTimeSlot,
                personCount,
                vehicleCount,
                displayPrices,
                filteredVehicles,
                personCountForTransfer,
                selectedVehicle,
                selectedVehicles,
                availablePaymentMethods,
                paymentMethod,
                isPaymentSettingsOpen,
                prepaymentAmount,
                assignedVehicles,
                themeColor: getThemeColor(),
                buttonStyle: getButtonStyle(),
                selectedCurrency,
                onCurrencyChange: setSelectedCurrency,
                handleTimeSlotSelect,
                handlePersonCountChange,
                handlePersonCountForTransferChange,
                handleVehicleCountChange,
                handleVehicleSelect,
                handleVehicleCountChangeForTransfer,
                removeVehicleFromSelection,
                getTotalCapacityForTransfer,
                getTotalVehicleCountForTransfer,
                getTotalAmount,
                getPaymentBreakdown,
                handleReservation,
                setPaymentMethod,
                setIsPaymentSettingsOpen,
                setPrepaymentAmount,
                isSubmitting,
                customerName,
                customerSurname,
                customerEmail, // Pass state
                customerPhone,
                visitorNote,
                customerErrors,
                onCustomerNameChange: setCustomerName,
                onCustomerSurnameChange: setCustomerSurname,
                onCustomerEmailChange: setCustomerEmail, // Pass setter function
                onCustomerPhoneChange: setCustomerPhone,
                onVisitorNoteChange: setVisitorNote
              }}
            />
          </div>
        </div>
        
        <ReservationSuccess 
          isOpen={isSuccessModalOpen}
          onClose={() => {
            setIsSuccessModalOpen(false);
            onClose();
          }} 
          reservationId={successData.reservationId}
          serviceName={successData.serviceName}
          reservationDate={successData.reservationDate}
          timeSlot={successData.timeSlot}
          locationSlug={successData.locationSlug}
        />
      </DialogContent>
    </Dialog>
  );
}
