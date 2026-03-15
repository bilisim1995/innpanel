import { useState, useEffect, useCallback } from "react";
import { VehicleData, getVehicles } from "@/lib/vehicles";
import { getDisplayCategoryColors } from "../../../services-display/utils/categoryUtils";
import { saveReservation } from "@/lib/reservations";
import { useToast } from "@/hooks/use-toast";

interface VehicleInSlot {
  vehicleId: string | null;
  price: number;
  quota: number;
  count: number;
  currency: 'TRY' | 'USD' | 'EUR';
}

interface SelectedVehicle extends VehicleInSlot {
    vehicle: VehicleData;
}

const normalizeCurrency = (currency: string): 'TRY' | 'USD' | 'EUR' => {
    const upperCurrency = currency.toUpperCase();
    if (upperCurrency === 'TL') return 'TRY';
    return upperCurrency as 'TRY' | 'USD' | 'EUR';
};

export function useReservationState(isOpen: boolean, assignment: any, locale: string) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<Array<{id: string, startTime: string, endTime: string, price: number, quota: number, currency: 'TRY' | 'USD' | 'EUR', vehicleId?: string, vehicleCount?: number, vehicles?: VehicleInSlot[]}>>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{id: string, startTime: string, endTime: string, price: number, quota: number, currency: 'TRY' | 'USD' | 'EUR', vehicleId?: string, vehicleCount?: number, vehicles?: VehicleInSlot[]} | null>(null);
  const [personCount, setPersonCount] = useState<number>(1);
  const [vehicleCount, setVehicleCount] = useState<number>(1);
  const [routeId, setRouteId] = useState<string | null>(null);
  const [displayPrices, setDisplayPrices] = useState<{[key: string]: number}>({});
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("full_start"); 
  const [isPaymentSettingsOpen, setIsPaymentSettingsOpen] = useState(false);
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<string[]>(["full_start"]);
  const [prepaymentAmount, setPrepaymentAmount] = useState<number>(0);
  const [displayPrepaymentAmount, setDisplayPrepaymentAmount] = useState<number>(0);
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(true);
  const [categoryTheme, setCategoryTheme] = useState<any>(null);
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [assignedVehicles, setAssignedVehicles] = useState<VehicleData[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<VehicleData[]>([]);
  const [personCountForTransfer, setPersonCountForTransfer] = useState<number>(1);
  const [selectedVehicles, setSelectedVehicles] = useState<SelectedVehicle[]>([]);
  const [customerName, setCustomerName] = useState<string>("");
  const [customerSurname, setCustomerSurname] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [visitorNote, setVisitorNote] = useState<string>("");
  const [flightCode, setFlightCode] = useState<string>("");
  const [customerErrors, setCustomerErrors] = useState<{[key: string]: string}>({});
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [successData, setSuccessData] = useState<{
    reservationId: string;
    serviceName: string;
    reservationDate: Date;
    timeSlot: {
      startTime: string;
      endTime: string;
    };
    locationSlug: string;
  }>({
    reservationId: "",
    serviceName: "",
    reservationDate: new Date(),
    timeSlot: { startTime: "", endTime: "" },
    locationSlug: ""
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedCurrency, setSelectedCurrency] = useState<'TRY' | 'USD' | 'EUR'>('TRY');
  const [exchangeRates, setExchangeRates] = useState<{[key in 'TRY' | 'USD' | 'EUR']?: number} | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      const fetchRates = async () => {
        try {
          const response = await fetch('https://api.frankfurter.app/latest?from=EUR&to=TRY,USD');
          if (!response.ok) throw new Error('Network response was not ok');
          const data = await response.json();
          setExchangeRates({ ...data.rates, EUR: 1 });
        } catch (error) {
          console.error("Failed to fetch exchange rates:", error);
          toast({
            title: "Kur Bilgisi Alınamadı",
            description: "Fiyatlar varsayılan kur üzerinden gösterilecektir.",
            variant: "destructive",
          });
        }
      };
      fetchRates();
    }
  }, [isOpen, toast]);
  
  useEffect(() => {
    if (!isOpen) {
      setSelectedDate(undefined);
      setSelectedTimeSlot(null);
      setPersonCount(1);
      setVehicleCount(1);
      setRouteId(null);
      setAvailablePaymentMethods(["full_start"]);
      setSelectedVehicle(null);
      setIsCalendarExpanded(true);
      setPersonCountForTransfer(1);
      setFilteredVehicles([]);
      setSelectedVehicles([]);
      setCustomerName("");
      setCustomerSurname("");
      setCustomerPhone("");
      setCustomerEmail("");
      setVisitorNote("");
      setFlightCode("");
      setCustomerErrors({});
      setIsSuccessModalOpen(false);
      setIsSubmitting(false);
      setDisplayPrices({});
      setDisplayPrepaymentAmount(0);
    } else {
      const defaultCurrency = assignment?.serviceDetails?.categoryDetails?.currency || assignment?.pricingSettings?.dateRanges?.[0]?.timeSlots?.[0]?.currency || 'TRY';
      setSelectedCurrency(normalizeCurrency(defaultCurrency));
    }
  }, [isOpen, assignment]);

  const convertPrice = useCallback((amount: number, from: string, to: string): number => {
    const fromCurrency = normalizeCurrency(from);
    const toCurrency = normalizeCurrency(to);

    if (!exchangeRates || fromCurrency === toCurrency || !amount) {
        return amount;
    }

    const rateFrom = exchangeRates[fromCurrency];
    const rateTo = exchangeRates[toCurrency];

    if (typeof rateFrom === 'undefined' || typeof rateTo === 'undefined') {
        console.warn(`Currency conversion failed: rate for ${fromCurrency} or ${toCurrency} not found.`);
        return amount;
    }

    const amountInBaseCurrency = amount / rateFrom;
    return amountInBaseCurrency * rateTo;
  }, [exchangeRates]);

  useEffect(() => {
    if (availableTimeSlots.length > 0 && exchangeRates) {
      const newDisplayPrices: { [key: string]: number } = {};
      availableTimeSlots.forEach(slot => {
        const currencyForSlot = assignment?.serviceDetails?.categoryDetails?.currency || slot.currency;
        newDisplayPrices[slot.id] = convertPrice(slot.price, currencyForSlot, selectedCurrency);
      });
      setDisplayPrices(newDisplayPrices);
    }
     if (assignment?.pricingSettings?.prepaymentAmount && exchangeRates) {
        const originalCurrency = assignment?.serviceDetails?.categoryDetails?.currency || assignment?.pricingSettings?.dateRanges?.[0]?.timeSlots?.[0]?.currency || 'EUR';
        setDisplayPrepaymentAmount(convertPrice(assignment.pricingSettings.prepaymentAmount, originalCurrency, selectedCurrency));
    }
  }, [availableTimeSlots, selectedCurrency, exchangeRates, assignment, convertPrice]);
  
  useEffect(() => {
    const loadAssignedVehicles = async () => {
      if (!assignment?.serviceCategory) return;
      if (assignment.serviceCategory === "motor-tours" || assignment.serviceCategory === "transfer") {
        const assignedVehicleIds = new Set<string>();
        assignment.pricingSettings?.dateRanges?.forEach((range: any) => {
          range.timeSlots?.forEach((slot: any) => {
            if (assignment.serviceCategory === "motor-tours" && slot.vehicleId) {
              assignedVehicleIds.add(slot.vehicleId);
            }
            if (assignment.serviceCategory === "transfer" && slot.vehicles) {
              slot.vehicles.forEach((v: any) => v.vehicleId && assignedVehicleIds.add(v.vehicleId));
            }
          });
        });
        if (assignedVehicleIds.size > 0) {
          const allVehicles = await getVehicles();
          const filtered = allVehicles.filter(v => v.isActive && assignedVehicleIds.has(v.id!));
          setAssignedVehicles(filtered);
        }
      }
    };
    if (isOpen) loadAssignedVehicles();
  }, [isOpen, assignment]);

  useEffect(() => {
    const loadColors = async () => {
      if (assignment?.serviceCategory) {
        try {
          const theme = await getDisplayCategoryColors(assignment.serviceCategory);
          setCategoryTheme(theme);
        } catch (error) {
          console.error('Error loading category colors:', error);
        }
      }
    };
    if (isOpen) loadColors();
  }, [isOpen, assignment?.serviceCategory]);

  useEffect(() => {
    if (isOpen && assignment?.pricingSettings) {
      const { paymentMethods, prepaymentEnabled, prepaymentAmount } = assignment.pricingSettings;
      const methods: string[] = [];
      if (paymentMethods) {
        if (paymentMethods.fullPayment) methods.push("full_start");
        if (paymentMethods.prePayment && prepaymentEnabled) methods.push("prepayment");
        if (paymentMethods.fullAtLocation) methods.push("full_location");
      }
      setAvailablePaymentMethods(methods.length > 0 ? methods : ["full_start"]);
      if (methods.length > 0) setPaymentMethod(methods[0]);
      setPrepaymentAmount(prepaymentAmount || 0);
    }
  }, [isOpen, assignment?.pricingSettings]);

  useEffect(() => {
    if (assignment?.pricingSettings?.dateRanges) {
      const dates: Date[] = [];
      assignment.pricingSettings.dateRanges.forEach((range: any) => {
        const start = new Date(range.startDate);
        const end = new Date(range.endDate);
        for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
          dates.push(new Date(dt));
        }
      });
      setAvailableDates(dates);
    }
  }, [assignment]);
  
  const getTimeSlotsForDate = useCallback((date: Date) => {
    if (!assignment?.pricingSettings?.dateRanges) return [];
    const dateString = date.toISOString().split('T')[0];
    for (const range of assignment.pricingSettings.dateRanges) {
        const startDate = new Date(range.startDate).toISOString().split('T')[0];
        const endDate = new Date(range.endDate).toISOString().split('T')[0];
        if (dateString >= startDate && dateString <= endDate) {
            return (range.timeSlots || []).sort((a: {startTime: string}, b: {startTime: string}) =>
                a.startTime.localeCompare(b.startTime)
            );
        }
    }
    return [];
  }, [assignment]);

  const handleDateSelect = useCallback((date: Date | undefined) => {
    if (date && availableDates.some(d => d.toDateString() === date.toDateString())) {
      setSelectedDate(date);
      const timeSlots = getTimeSlotsForDate(date);
      setAvailableTimeSlots(timeSlots);
      setSelectedTimeSlot(null);
      if (["motor-tours", "transfer"].includes(assignment?.serviceCategory)) {
        setSelectedVehicle(null);
        setVehicleCount(1);
        setRouteId(null);
      }
      setTimeout(() => setIsCalendarExpanded(false), 300);
    }
  }, [availableDates, getTimeSlotsForDate, assignment?.serviceCategory]);

  const handleTimeSlotSelect = (timeSlot: any) => {
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
    const currency = assignment?.serviceDetails?.categoryDetails?.currency || timeSlot.currency || 'TRY';
    setSelectedCurrency(normalizeCurrency(currency));
  };
  
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
    
    const originalCategoryCurrency = assignment?.serviceDetails?.categoryDetails?.currency || selectedTimeSlot.currency;
    const unitPrice = convertPrice(selectedTimeSlot.price, originalCategoryCurrency, selectedCurrency) || 0; 

    if (assignment?.serviceCategory === "motor-tours") {
      return unitPrice * vehicleCount;
    }
    if (assignment?.serviceCategory === "transfer") {
      if (!exchangeRates) return 0;
      return selectedVehicles.reduce((total, sv) => {
          const convertedPrice = convertPrice(sv.price, sv.currency, selectedCurrency);
          return total + (convertedPrice * sv.count);
      }, 0);
    }
    return unitPrice * personCount;
  };
  
  const validateCustomerInfo = () => {
    const errors: {[key: string]: string} = {};
    if (!customerName.trim()) errors.customerName = "Ad alanı zorunludur";
    if (!customerSurname.trim()) errors.customerSurname = "Soyad alanı zorunludur";
    if (!customerPhone.trim()) {
      errors.customerPhone = "Telefon numarası zorunludur";
    } else if (customerPhone.length < 8) {
      errors.customerPhone = "Geçerli bir telefon numarası girin";
    }
    if (!customerEmail.trim()) {
        errors.customerEmail = "E-posta alanı zorunludur";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
        errors.customerEmail = "Geçerli bir e-posta adresi girin";
    }
    setCustomerErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleReservation = async () => {
    if (!validateCustomerInfo() || !selectedDate || !selectedTimeSlot || !exchangeRates) {
        toast({ title: "Hata", description: "Lütfen tüm zorunlu alanları doldurun.", variant: "destructive" });
        return;
    }
    setIsSubmitting(true);
    try {
        const totalAmountInSelectedCurrency = getTotalAmount();
        const originalTimeSlotCurrency = assignment?.serviceDetails?.categoryDetails?.currency || selectedTimeSlot.currency;

        const totalAmountInTRY = convertPrice(totalAmountInSelectedCurrency, selectedCurrency, 'TRY');
        const prepaymentAmountInTRY = paymentMethod === 'prepayment' ? convertPrice(displayPrepaymentAmount, selectedCurrency, 'TRY') : 0;
        const remainingAmountInTRY = paymentMethod === 'prepayment' ? totalAmountInTRY - prepaymentAmountInTRY : 0;
        const commissionInTRY = convertPrice(assignment.pricingSettings?.commissionAmount || 0, originalTimeSlotCurrency, 'TRY');

        const reservationData = {
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
            flightCode: flightCode.trim(),
            reservationDate: selectedDate,
            timeSlot: { id: selectedTimeSlot.id, startTime: selectedTimeSlot.startTime, endTime: selectedTimeSlot.endTime },
            
            totalAmount: totalAmountInTRY,
            prepaymentAmount: prepaymentAmountInTRY,
            remainingAmount: remainingAmountInTRY,
            currency: 'TRY',
            commissionAmount: commissionInTRY,

            originalAmount: totalAmountInSelectedCurrency,
            originalCurrency: selectedCurrency,
            originalUnitPrice: selectedTimeSlot.price,
            originalUnitCurrency: originalTimeSlotCurrency,

            paymentMethod: paymentMethod,
            adults: assignment.serviceCategory !== 'transfer' ? personCount : personCountForTransfer,
            children: 0,
            personCount: assignment.serviceCategory !== 'transfer' ? personCount : personCountForTransfer,
            vehicleCount: assignment.serviceCategory === 'motor-tours' ? vehicleCount : (assignment.serviceCategory === 'transfer' ? getTotalVehicleCountForTransfer() : undefined),
            selectedVehicles: assignment.serviceCategory === 'transfer' ? selectedVehicles.map(sv => ({ ...sv, vehicle: undefined })) : undefined,
            locale: locale,
        };

        const reservationId = await saveReservation(reservationData as any);
        setSuccessData({
            reservationId,
            serviceName: assignment.serviceName,
            reservationDate: selectedDate,
            timeSlot: { startTime: selectedTimeSlot.startTime, endTime: selectedTimeSlot.endTime },
            locationSlug: assignment.locationSlug || ""
        });
        setIsSuccessModalOpen(true);
    } catch (error) {
        toast({ title: "Hata", description: "Rezervasyon yapılırken bir hata oluştu.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
};

  const handleCalendarToggle = () => setIsCalendarExpanded(!isCalendarExpanded);

  return {
    selectedDate, availableDates, availableTimeSlots, selectedTimeSlot, personCount, vehicleCount, routeId,
    displayPrices, selectedVehicle, paymentMethod, isPaymentSettingsOpen, availablePaymentMethods,
    prepaymentAmount: displayPrepaymentAmount, isCalendarExpanded, categoryTheme, vehicles, assignedVehicles, filteredVehicles,
    personCountForTransfer, selectedVehicles, customerName, customerSurname, customerPhone, customerEmail,
    visitorNote, flightCode, customerErrors, isSuccessModalOpen, successData, isSubmitting, selectedCurrency,
    exchangeRates, 

    convertPrice,
    getTotalCapacityForTransfer,
    getTotalVehicleCountForTransfer, 
    getTotalAmount, 
    getPaymentBreakdown: () => {}, 

    setSelectedCurrency, 
    handleDateSelect, 
    handleTimeSlotSelect, 
    handlePersonCountChange,
    handlePersonCountForTransferChange, 
    handleVehicleCountChange, 
    handleVehicleSelect,
    handleVehicleCountChangeForTransfer, 
    removeVehicleFromSelection, 
    handleReservation, 
    handleCalendarToggle,
    setPaymentMethod, 
    setIsPaymentSettingsOpen, 
    setPrepaymentAmount, 
    setCustomerName,
    setCustomerSurname, 
    setCustomerPhone, 
    setCustomerEmail,
    setVisitorNote, 
    setFlightCode, 
    setIsSuccessModalOpen
  };
}