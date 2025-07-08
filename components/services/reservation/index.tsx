"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReservationHeader } from "./ReservationHeader";
import { ReservationCalendar } from "./ReservationCalendar";
import { ReservationDetails } from "./ReservationDetails";
import { ReservationSuccess } from "./ReservationSuccess";
import { useReservationState } from "./hooks/useReservationState";

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: any;
}

export function ReservationModal({ isOpen, onClose, assignment }: ReservationModalProps) {
  const {
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
    vehicles,
    assignedVehicles,
    filteredVehicles,
    personCountForTransfer,
    selectedVehicles,
    customerName,
    customerSurname,
    customerPhone,
    visitorNote,
    isSuccessModalOpen,
    successData,
    customerErrors,
    isSubmitting,
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
    setCustomerPhone,
    setVisitorNote
  } = useReservationState(isOpen, assignment);

  // Get theme color for styling
  const getThemeColor = () => {
    if (categoryTheme?.customStyle?.backgroundColor) {
      return categoryTheme.customStyle.backgroundColor;
    }
    
    if (categoryTheme?.customStyle?.background) {
      // If it's a gradient, extract the first color
      if (typeof categoryTheme.customStyle.background === 'string' && 
          categoryTheme.customStyle.background.includes('gradient')) {
        const match = categoryTheme.customStyle.background.match(/\(([^)]+)\)/);
        if (match && match[1]) {
          const colors = match[1].split(',');
          return colors[0].trim();
        }
      }
      return categoryTheme.customStyle.background;
    }
    
    return '#dc2626'; // Default red color
  };
  
  const themeColor = getThemeColor();

  // Get button style based on theme
  const getButtonStyle = () => {
    if (categoryTheme?.customStyle?.background) {
      return { background: categoryTheme.customStyle.background, border: 'none' };
    }
    return { backgroundColor: themeColor, border: 'none' };
  };

  if (!assignment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
        
        <div className="sticky top-0 z-50 flex items-center justify-between p-4 bg-white border-b">
           <h2 className="text-lg font-bold text-red-600" style={{ fontFamily: 'inherit' }}>
            Rezervasyon Yap
          </h2>
          <Button 
            onClick={onClose}
            variant="outline"
            size="icon"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-6 p-6">
          {/* Header */}
          <ReservationHeader assignment={assignment} themeColor={themeColor} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Takvim */}
            <ReservationCalendar 
              selectedDate={selectedDate}
              availableDates={availableDates}
              isCalendarExpanded={isCalendarExpanded}
              handleCalendarToggle={handleCalendarToggle}
              handleDateSelect={handleDateSelect}
              themeColor={themeColor}
            />

            {/* Rezervasyon Detayları */}
            <ReservationDetails 
              assignment={assignment}
              selectedDate={selectedDate}
              availableTimeSlots={availableTimeSlots}
              selectedTimeSlot={selectedTimeSlot}
              personCount={personCount}
              vehicleCount={vehicleCount}
              displayPrices={displayPrices}
              filteredVehicles={filteredVehicles}
              personCountForTransfer={personCountForTransfer}
              selectedVehicle={selectedVehicle}
              selectedVehicles={selectedVehicles}
              availablePaymentMethods={availablePaymentMethods}
              paymentMethod={paymentMethod}
              isPaymentSettingsOpen={isPaymentSettingsOpen}
              prepaymentAmount={prepaymentAmount}
              assignedVehicles={assignedVehicles}
              themeColor={themeColor}
              buttonStyle={getButtonStyle()}
              handleTimeSlotSelect={handleTimeSlotSelect}
              handlePersonCountChange={handlePersonCountChange}
              handlePersonCountForTransferChange={handlePersonCountForTransferChange}
              handleVehicleCountChange={handleVehicleCountChange}
              handleVehicleSelect={handleVehicleSelect}
              handleVehicleCountChangeForTransfer={handleVehicleCountChangeForTransfer}
              removeVehicleFromSelection={removeVehicleFromSelection}
              getTotalCapacityForTransfer={getTotalCapacityForTransfer}
              getTotalVehicleCountForTransfer={getTotalVehicleCountForTransfer}
              getTotalAmount={getTotalAmount}
              getPaymentBreakdown={getPaymentBreakdown}
              handleReservation={handleReservation}
              setPaymentMethod={setPaymentMethod}
              setIsPaymentSettingsOpen={setIsPaymentSettingsOpen}
              setPrepaymentAmount={setPrepaymentAmount}
              customerName={customerName}
              customerSurname={customerSurname}
              customerPhone={customerPhone}
              visitorNote={visitorNote}
              customerErrors={customerErrors}
              onCustomerNameChange={setCustomerName}
              onCustomerSurnameChange={setCustomerSurname}
              onCustomerPhoneChange={setCustomerPhone}
              onVisitorNoteChange={setVisitorNote}
            />
          </div>
        </div>
        
        {/* Success Modal with Confetti */}
        <ReservationSuccess 
          isOpen={isSuccessModalOpen}
          onClose={() => {
            setIsSuccessModalOpen(false);
            onClose(); // Close the reservation modal too
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