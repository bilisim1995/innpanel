
import { useState, useEffect, useCallback } from "react";
import { VehicleData, getVehicles } from "@/lib/vehicles";
import { getDisplayCategoryColors } from "../../../services-display/utils/categoryUtils";
import { saveReservation, ReservationData } from "@/lib/reservations";
import { useToast } from "@/hooks/use-toast";

interface VehicleInSlot {
  vehicleId: string | null;
  price: number;
  quota: number;
  count: number;
  currency: 'TL' | 'USD' | 'EUR';
}

interface SelectedVehicle extends VehicleInSlot {
    vehicle: VehicleData;
}

export function useReservationState(isOpen: boolean, assignment: any) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<any[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<any | null>(null);
  const [personCount, setPersonCount] = useState<number>(1);
  const [vehicleCount, setVehicleCount] = useState<number>(1);
  const [displayPrices, setDisplayPrices] = useState<{ [key: string]: number }>({});
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("full_start");
  const [isPaymentSettingsOpen, setIsPaymentSettingsOpen] = useState(false);
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<string[]>(["full_start"]);
  const [prepaymentAmount, setPrepaymentAmount] = useState<number>(0);
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(true);
  const [categoryTheme, setCategoryTheme] = useState<any>(null);
  const [assignedVehicles, setAssignedVehicles] = useState<VehicleData[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<VehicleData[]>([]);
  const [personCountForTransfer, setPersonCountForTransfer] = useState<number>(1);
  const [selectedVehicles, setSelectedVehicles] = useState<SelectedVehicle[]>([]);
  const [customerName, setCustomerName] = useState<string>("");
  const [customerSurname, setCustomerSurname] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [visitorNote, setVisitorNote] = useState<string>("");
  const [customerErrors, setCustomerErrors] = useState<{ [key: string]: string }>({});
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [successData, setSuccessData] = useState<any>({ reservationId: "", serviceName: "", reservationDate: new Date(), timeSlot: { startTime: "", endTime: "" }, locationSlug: "" });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedCurrency, setSelectedCurrency] = useState<'TL' | 'USD' | 'EUR'>('TL');
  const [exchangeRates, setExchangeRates] = useState<any>(null);
  const { toast } = useToast();

  const getTimeSlotsForDate = useCallback((date: Date) => {
    if (!assignment?.pricingSettings?.dateRanges) return [];
    const dateString = date.toISOString().split('T')[0];
    for (const range of assignment.pricingSettings.dateRanges) {
      const startDate = new Date(range.startDate).toISOString().split('T')[0];
      const endDate = new Date(range.endDate).toISOString().split('T')[0];
      if (dateString >= startDate && dateString <= endDate) {
        return (range.timeSlots || []).sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));
      }
    }
    return [];
  }, [assignment]);

  const handleTimeSlotSelect = useCallback((timeSlot: any) => {
    setSelectedTimeSlot(timeSlot);
    if (assignment?.serviceCategory === "motor-tours") {
      setVehicleCount(1);
      setSelectedVehicle(assignedVehicles.find(v => v.id === timeSlot.vehicleId) || null);
    } else if (assignment?.serviceCategory === "transfer") {
      setPersonCountForTransfer(1);
      setSelectedVehicles([]);
      if (timeSlot.vehicles?.length > 0) {
        const vehicleIds = timeSlot.vehicles.map((vp: any) => vp.vehicleId);
        setFilteredVehicles(assignedVehicles.filter(v => vehicleIds.includes(v.id!)));
      }
    } else {
      setPersonCount(1);
    }
    setSelectedCurrency(timeSlot.currency || 'TL');
  }, [assignment?.serviceCategory, assignedVehicles]);

  const handleDateSelect = useCallback((date: Date | undefined) => {
    if (date && availableDates.some(d => d.toDateString() === date.toDateString())) {
      setSelectedDate(date);
      const timeSlots = getTimeSlotsForDate(date);
      setAvailableTimeSlots(timeSlots);
      setSelectedTimeSlot(null);
      if (["motor-tours", "transfer"].includes(assignment?.serviceCategory)) {
        setSelectedVehicle(null);
        setVehicleCount(1);
      }
      setTimeout(() => setIsCalendarExpanded(false), 300);
    }
  }, [availableDates, getTimeSlotsForDate, assignment?.serviceCategory]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedDate(undefined);
      setSelectedTimeSlot(null);
      setPersonCount(1);
      setVehicleCount(1);
      setAvailablePaymentMethods(["full_start"]);
      setSelectedVehicle(null);
      setIsCalendarExpanded(true);
      setPersonCountForTransfer(1);
      setFilteredVehicles([]);
      setSelectedVehicles([]);
      setCustomerName("");
      setCustomerSurname("");
      setCustomerEmail("");
      setCustomerPhone("");
      setVisitorNote("");
      setCustomerErrors({});
      setIsSuccessModalOpen(false);
      setIsSubmitting(false);
      setDisplayPrices({});
    }
  }, [isOpen]);

  useEffect(() => {
    if (assignment?.pricingSettings?.dateRanges) {
      const dates: Date[] = [];
      assignment.pricingSettings.dateRanges.forEach((range: any) => {
        const start = range.startDate?.toDate ? range.startDate.toDate() : new Date(range.startDate);
        const end = range.endDate?.toDate ? range.endDate.toDate() : new Date(range.endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return;
        }
        let currentDate = new Date(start.setUTCHours(12, 0, 0, 0));
        const endDate = new Date(end.setUTCHours(12, 0, 0, 0));
        while (currentDate <= endDate) {
          dates.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
        }
      });
      setAvailableDates(dates);
    } else {
      setAvailableDates([]);
    }
  }, [assignment]);
  
  const handlePersonCountChange = (value: string) => {
    const count = parseInt(value, 10);
    const maxCapacity = selectedTimeSlot?.quota || 999;
    if (count >= 1 && count <= maxCapacity) setPersonCount(count);
  };
  
  const handlePersonCountForTransferChange = (value: string) => {
    const count = parseInt(value, 10);
    if (count >= 1) setPersonCountForTransfer(count);
  };

  const handleVehicleCountChange = (value: string) => {
    const count = parseInt(value, 10);
    const maxVehicles = selectedTimeSlot?.vehicleCount || 10;
    if (count >= 1 && count <= maxVehicles) setVehicleCount(count);
  };
  
  const handleVehicleSelect = (vehicleId: string) => {
    const vehicle = filteredVehicles.find(v => v.id === vehicleId);
    if (assignment?.serviceCategory === "transfer" && vehicle && selectedTimeSlot?.vehicles) {
      const vehicleDataInSlot = selectedTimeSlot.vehicles.find((v: any) => v.vehicleId === vehicleId);
      if (vehicleDataInSlot && !selectedVehicles.some(sv => sv.vehicleId === vehicleId)) {
        setSelectedVehicles(prev => [...prev, { ...vehicleDataInSlot, vehicle, count: 1 }]);
      }
    } else {
      setSelectedVehicle(vehicle || null);
    }
  };

  const handleVehicleCountChangeForTransfer = (vehicleId: string, count: number) => {
    if (count <= 0) {
      setSelectedVehicles(prev => prev.filter(sv => sv.vehicleId !== vehicleId));
    } else {
      setSelectedVehicles(prev => prev.map(sv => sv.vehicleId === vehicleId ? { ...sv, count } : sv));
    }
  };
  
  const removeVehicleFromSelection = (vehicleId: string) => {
    setSelectedVehicles(prev => prev.filter(sv => sv.vehicleId !== vehicleId));
  };
  
  const getTotalCapacityForTransfer = () => selectedVehicles.reduce((total, sv) => total + (sv.vehicle.maxPassengerCapacity * sv.count), 0);
  const getTotalVehicleCountForTransfer = () => selectedVehicles.reduce((total, sv) => total + sv.count, 0);

  const getTotalAmount = () => {
    if (!selectedTimeSlot) return 0;
    const unitPrice = displayPrices[selectedTimeSlot.id] || selectedTimeSlot.price;
    if (assignment?.serviceCategory === "motor-tours") return unitPrice * vehicleCount;
    if (assignment?.serviceCategory === "transfer") return selectedVehicles.reduce((total, sv) => total + (sv.price * sv.count), 0);
    return unitPrice * personCount;
  };
  
  const validateCustomerInfo = () => {
    const errors: {[key: string]: string} = {};
    if (!customerName.trim()) errors.customerName = "Ad alanı zorunludur";
    if (!customerSurname.trim()) errors.customerSurname = "Soyad alanı zorunludur";
    if (!customerPhone.trim()) errors.customerPhone = "Telefon numarası zorunludur";
    if (!customerEmail.trim()) {
      errors.customerEmail = "E-posta alanı zorunludur";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      errors.customerEmail = "Geçerli bir e-posta adresi girin";
    }
    setCustomerErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleReservation = async () => {
    if (!validateCustomerInfo() || !selectedDate || !selectedTimeSlot) {
        toast({ title: "Eksik Bilgi", description: "Lütfen tüm zorunlu alanları doldurun.", variant: "destructive" });
        return;
    }
    setIsSubmitting(true);
    try {
      const reservationPayload = {
        serviceId: assignment.serviceId,
        serviceName: assignment.serviceName,
        serviceCategory: assignment.serviceCategory,
        companyName: assignment.companyName,
        assignmentId: assignment.id,
        locationId: assignment.locationId,
        locationName: assignment.locationName,
        customerName: customerName.trim(),
        customerSurname: customerSurname.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        visitorNote: visitorNote.trim(),
        reservationDate: selectedDate,
        timeSlot: {
          id: selectedTimeSlot.id,
          startTime: selectedTimeSlot.startTime,
          endTime: selectedTimeSlot.endTime,
          price: selectedTimeSlot.price,
          currency: selectedTimeSlot.currency,
        },
        adults: assignment.serviceCategory === 'transfer' ? personCountForTransfer : personCount,
        children: 0,
        totalAmount: getTotalAmount(),
        paymentMethod: paymentMethod as any,
        currency: selectedCurrency,
        ...(assignment.serviceCategory === 'transfer' && { selectedVehicles: selectedVehicles.map(sv => ({ vehicleId: sv.vehicleId, vehicleTypeName: sv.vehicle.vehicleTypeName, count: sv.count })) }),
        ...(assignment.serviceCategory === 'motor-tours' && { vehicleCount: vehicleCount }),
      } as Omit<ReservationData, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { currency: string };

      const reservationId = await saveReservation(reservationPayload);
        
      setSuccessData({
        reservationId,
        serviceName: assignment.serviceName,
        reservationDate: selectedDate,
        timeSlot: { startTime: selectedTimeSlot.startTime, endTime: selectedTimeSlot.endTime },
        locationSlug: assignment.locationSlug || ""
      });
      setIsSuccessModalOpen(true);
    } catch (error) {
        toast({ title: "Rezervasyon Hatası", description: "Rezervasyon kaydedilirken bir sorun oluştu.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleCalendarToggle = () => setIsCalendarExpanded(!isCalendarExpanded);
  
  return {
    selectedDate, availableDates, availableTimeSlots, selectedTimeSlot, personCount, vehicleCount,
    displayPrices, selectedVehicle, paymentMethod, isPaymentSettingsOpen, availablePaymentMethods,
    prepaymentAmount, isCalendarExpanded, categoryTheme, assignedVehicles, filteredVehicles,
    personCountForTransfer, selectedVehicles, customerName, setCustomerName, customerSurname, setCustomerSurname,
    customerEmail, setCustomerEmail, customerPhone, setCustomerPhone, visitorNote, setVisitorNote,
    customerErrors, isSuccessModalOpen, successData, isSubmitting, selectedCurrency, setSelectedCurrency,
    handleDateSelect, handleTimeSlotSelect, handlePersonCountChange,
    handlePersonCountForTransferChange, handleVehicleCountChange, handleVehicleSelect,
    handleVehicleCountChangeForTransfer, removeVehicleFromSelection, getTotalCapacityForTransfer,
    getTotalVehicleCountForTransfer, getTotalAmount, getPaymentBreakdown: () => {}, handleReservation, handleCalendarToggle,
    setPaymentMethod, setIsPaymentSettingsOpen, setPrepaymentAmount, setIsSuccessModalOpen,
  };
}
