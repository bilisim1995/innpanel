import { useState, useEffect } from "react";
import { VehicleData, getVehicles } from "@/lib/vehicles";
import { getDisplayCategoryColors } from "../../../services-display/utils/categoryUtils";
import { saveReservation } from "@/lib/reservations";
import { useToast } from "@/hooks/use-toast";

interface VehicleInSlot {
  vehicleId: string | null;
  price: number;
  quota: number;
  count: number;
}

interface SelectedVehicle extends VehicleInSlot {
    vehicle: VehicleData;
}


export function useReservationState(isOpen: boolean, assignment: any) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<Array<{id: string, startTime: string, endTime: string, price: number, quota: number, vehicleId?: string, vehicleCount?: number, vehicles?: VehicleInSlot[]}>>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{id: string, startTime: string, endTime: string, price: number, quota: number, vehicleId?: string, vehicleCount?: number, vehicles?: VehicleInSlot[]} | null>(null);
  const [personCount, setPersonCount] = useState<number>(1);
  const [vehicleCount, setVehicleCount] = useState<number>(1);
  const [routeId, setRouteId] = useState<string | null>(null);
  const [displayPrices, setDisplayPrices] = useState<{[key: string]: number}>({});
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("full_start"); 
  const [isPaymentSettingsOpen, setIsPaymentSettingsOpen] = useState(false);
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<string[]>(["full_start"]);
  const [prepaymentAmount, setPrepaymentAmount] = useState<number>(0); 
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
  const [visitorNote, setVisitorNote] = useState<string>("");
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
    timeSlot: {
      startTime: "",
      endTime: ""
    },
    locationSlug: ""
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();

  // Reset state when modal opens/closes
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
      setVisitorNote("");
      setCustomerErrors({});
      setIsSuccessModalOpen(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Load assigned vehicles for motor tours
  useEffect(() => {
    const loadAssignedVehicles = async () => {
      if (assignment?.serviceCategory === "motor-tours" || assignment?.serviceCategory === "transfer") {
        // Get assigned vehicles from time slots
        const assignedVehicleIds = new Set<string>();
        
        if (assignment?.pricingSettings?.dateRanges) {
          assignment.pricingSettings.dateRanges.forEach((range: any) => {
            range.timeSlots?.forEach((slot: any) => {
              // For motor-tours, check vehicleId field
              if (assignment.serviceCategory === "motor-tours" && slot.vehicleId) {
                assignedVehicleIds.add(slot.vehicleId);
              }
              // For transfer, check vehicles array
              if (assignment.serviceCategory === "transfer" && slot.vehicles) {
                slot.vehicles.forEach((vehicle: any) => {
                  if (vehicle.vehicleId) {
                    assignedVehicleIds.add(vehicle.vehicleId);
                  }
                });
              }
            });
          });
        }
        
        // Load all vehicles and filter to only assigned ones
        const allVehicles = await getVehicles();
        const filteredVehicles = allVehicles.filter(v => 
          v.isActive && assignedVehicleIds.has(v.id!)
        );
        
        setAssignedVehicles(filteredVehicles);
      }
    };
    
    if (isOpen && assignment) {
      loadAssignedVehicles();
    }
  }, [isOpen, assignment?.serviceCategory, assignment?.pricingSettings?.dateRanges]);

  // Filter vehicles based on person count for transfer category
  useEffect(() => {
    if (assignment?.serviceCategory === "transfer" && assignedVehicles.length > 0) {
      const filtered = assignedVehicles.filter(vehicle => 
        vehicle.maxPassengerCapacity >= personCountForTransfer
      );
      setFilteredVehicles(filtered);
      
      // If currently selected vehicle is no longer valid, clear selection
      if (selectedVehicle && selectedVehicle.maxPassengerCapacity < personCountForTransfer) {
        setSelectedVehicle(null);
      }
    } else {
      setFilteredVehicles(assignedVehicles);
    }
  }, [assignedVehicles, personCountForTransfer, assignment?.serviceCategory, selectedVehicle]);

  // Load category colors
  useEffect(() => {
    const loadColors = async () => {
      if (assignment?.serviceCategory) {
        try {
          const theme = await getDisplayCategoryColors(assignment.serviceCategory);
          setCategoryTheme(theme);
        } catch (error) {
          console.error('Error loading category colors:', error);
          // Keep default red color
        }
      }
    };
    
    if (isOpen && assignment) {
      loadColors();
    }
  }, [isOpen, assignment?.serviceCategory]);

  // Calculate display prices with commission
  useEffect(() => {
    if (availableTimeSlots.length > 0 && assignment?.pricingSettings?.commissionAmount) {
      // Use original prices without commission for display
      const displayPriceMap: {[key: string]: number} = {};
      
      availableTimeSlots.forEach(slot => {
        // Show only the base price without commission
        displayPriceMap[slot.id] = slot.price;
      });
      
      setDisplayPrices(displayPriceMap);
    } else {
      // If no commission, use original prices
      const priceMap: {[key: string]: number} = {};
      availableTimeSlots.forEach(slot => {
        priceMap[slot.id] = slot.price;
      });
      setDisplayPrices(priceMap);
    }
  }, [availableTimeSlots, assignment?.pricingSettings?.commissionAmount]);

  // Initialize prepayment amount from assignment settings when modal opens
  useEffect(() => {
    if (isOpen && assignment?.pricingSettings) {
      // Set prepayment amount if available
      if (assignment.pricingSettings.prepaymentEnabled && 
          assignment.pricingSettings.prepaymentAmount > 0) {
        setPrepaymentAmount(assignment.pricingSettings.prepaymentAmount);
      } else {
        setPrepaymentAmount(0);
      }
      
      // Set available payment methods based on assignment settings
      const methods: string[] = [];
      
      if (assignment.pricingSettings.paymentMethods) {
        if (assignment.pricingSettings.paymentMethods.fullPayment) {
          methods.push("full_start");
        }
        if (assignment.pricingSettings.paymentMethods.prePayment && 
            assignment.pricingSettings.prepaymentEnabled) {
          methods.push("prepayment");
        }
        if (assignment.pricingSettings.paymentMethods.fullAtLocation) {
          methods.push("full_location");
        }
      } else {
        // Default to full payment if no settings
        methods.push("full_start");
      }
      
      setAvailablePaymentMethods(methods);
      
      // Set default payment method to the first available one
      if (methods.length > 0) {
        setPaymentMethod(methods[0]);
      }
    }
  }, [isOpen, assignment?.pricingSettings]);

  // Load available dates from assignment pricing settings
  useEffect(() => {
    if (assignment?.pricingSettings?.dateRanges) {
      const dates: Date[] = [];
      assignment.pricingSettings.dateRanges.forEach((range: any) => {
        const start = new Date(range.startDate);
        const end = new Date(range.endDate);
        const current = new Date(start);
        
        while (current <= end) {
          dates.push(new Date(current));
          current.setDate(current.getDate() + 1);
        }
      });
      setAvailableDates(dates);
    }
  }, [assignment]);

  // Get available time slots for selected date
  const getTimeSlotsForDate = (date: Date) => {
    if (!assignment?.pricingSettings?.dateRanges) return [];
    
    for (const range of assignment.pricingSettings.dateRanges) {
      const start = new Date(range.startDate);
      const end = new Date(range.endDate);
      
      if (date >= start && date <= end) {
        // Sort the time slots by start time before returning
        return (range.timeSlots || []).sort((a: {startTime: string}, b: {startTime: string}) => 
          a.startTime.localeCompare(b.startTime)
        );
      }
    }
    return [];
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date && availableDates.some(d => d.toDateString() === date.toDateString())) {
      setSelectedDate(date);
      
      // Load and sort available time slots for this date
      const timeSlots = getTimeSlotsForDate(date);
      setAvailableTimeSlots(timeSlots);
      
      // Reset selected time slot
      setSelectedTimeSlot(null);
      // Reset vehicle selection for motor tours
      if (assignment?.serviceCategory === "motor-tours" || assignment?.serviceCategory === "transfer") {
        setSelectedVehicle(null);
        setVehicleCount(1);
        setRouteId(null);
      }
      
      // Tarih seçildiğinde takvimi yavaşça küçült
      setTimeout(() => {
        setIsCalendarExpanded(false);
      }, 300);
    }
  };

  const handleTimeSlotSelect = (timeSlot: {id: string, startTime: string, endTime: string, price: number, quota: number, vehicleId?: string, vehicleCount?: number, vehicles?: VehicleInSlot[]}) => {
    setSelectedTimeSlot(timeSlot);
    
    // Reset person count when time slot changes
    if (assignment?.serviceCategory === "motor-tours") {
      setVehicleCount(1);
      setSelectedVehicle(null);
      
      // If this time slot has a vehicle ID, select it
      if (timeSlot.vehicleId) {
        const vehicle = assignedVehicles.find(v => v.id === timeSlot.vehicleId);
        if (vehicle) {
          setSelectedVehicle(vehicle);
        }
      }
    } else if (assignment?.serviceCategory === "transfer") {
      setPersonCountForTransfer(1);
      setSelectedVehicle(null);
      
      // Reset selected vehicles
      setSelectedVehicles([]);
      
      // If this time slot has vehicle prices, update the filtered vehicles
      if (timeSlot.vehicles && timeSlot.vehicles.length > 0) {
        // Filter assigned vehicles to only include those in the time slot's vehiclePrices
        const vehicleIds = timeSlot.vehicles.map(vp => vp.vehicleId);
        const filtered = assignedVehicles.filter(v => vehicleIds.includes(v.id!));
        setFilteredVehicles(filtered);
      }
      
      // Reset vehicle selection for transfer
      setVehicleCount(1);
    } else {
      setPersonCount(1);
    }
  };

  const handlePersonCountChange = (value: string) => {
    const count = parseInt(value);
    const maxCapacity = selectedTimeSlot?.quota || assignment?.serviceDetails?.quota || 999;
    
    if (count >= 1 && count <= maxCapacity) {
      setPersonCount(count);
    }
  };

  const handlePersonCountForTransferChange = (value: string) => {
    const count = parseInt(value);
    if (count >= 1) {
      setPersonCountForTransfer(count);
    }
  };

  const handleVehicleCountChange = (value: string) => {
    const count = parseInt(value);
    const maxVehicles = selectedTimeSlot?.vehicleCount || 10;
    
    if (count >= 1 && count <= maxVehicles) {
      setVehicleCount(count);
    }
  };

  const handleVehicleSelect = (vehicleId: string) => {
    const vehicle = filteredVehicles.find(v => v.id === vehicleId);
    
    // For transfer category, add to selected vehicles array
    if (assignment?.serviceCategory === "transfer" && vehicle && selectedTimeSlot?.vehicles) {
        const vehicleDataInSlot = selectedTimeSlot.vehicles.find(v => v.vehicleId === vehicleId);
        if (!vehicleDataInSlot) return;

        const existingIndex = selectedVehicles.findIndex(sv => sv.vehicleId === vehicleId);
        if (existingIndex === -1) {
            setSelectedVehicles(prev => [...prev, { ...vehicleDataInSlot, vehicle, count: 1 }]);
        }
    } else {
        setSelectedVehicle(vehicle || null);
    }
  };

  const handleVehicleCountChangeForTransfer = (vehicleId: string, count: number) => {
    if (count <= 0) {
      // Remove vehicle if count is 0 or less
      setSelectedVehicles(prev => prev.filter(sv => sv.vehicleId !== vehicleId));
    } else {
      setSelectedVehicles(prev => prev.map(sv => 
        sv.vehicleId === vehicleId ? { ...sv, count } : sv
      ));
    }
  };

  const removeVehicleFromSelection = (vehicleId: string) => {
    setSelectedVehicles(prev => prev.filter(sv => sv.vehicleId !== vehicleId));
  };

  const getTotalCapacityForTransfer = () => {
    return selectedVehicles.reduce((total, sv) => total + (sv.vehicle.maxPassengerCapacity * sv.count), 0);
  };

  const getTotalVehicleCountForTransfer = () => {
    return selectedVehicles.reduce((total, sv) => total + sv.count, 0);
  };

  const getTotalAmount = () => {
    if (!selectedTimeSlot) return 0;
    
    if (assignment?.serviceCategory === "motor-tours") {
      // Get base price without commission
      const basePrice = displayPrices[selectedTimeSlot.id] || selectedTimeSlot.price;
      return basePrice * vehicleCount;
    } else if (assignment?.serviceCategory === "transfer") {
      // For transfer, calculate based on selected vehicles and their prices
      return selectedVehicles.reduce((total, sv) => total + (sv.price * sv.count), 0);
    } else {
      // Get base price without commission
      const basePrice = displayPrices[selectedTimeSlot.id] || selectedTimeSlot.price;
      return basePrice * personCount;
    }
  };

  const getPaymentBreakdown = () => {
    const total = getTotalAmount();
    const prepayment = Math.min(prepaymentAmount, total); // Toplam tutarı geçmesin
    const remaining = total - prepayment;
    
    return {
      total,
      prepayment,
      remaining
    };
  };

  const validateCustomerInfo = () => {
    const errors: {[key: string]: string} = {};
    
    if (!customerName.trim()) {
      errors.customerName = "Ad alanı zorunludur";
    }
    
    if (!customerSurname.trim()) {
      errors.customerSurname = "Soyad alanı zorunludur";
    }
    
    if (!customerPhone.trim()) {
      errors.customerPhone = "Telefon numarası zorunludur";
    } else if (!/^[0-9+\s]{5,20}$/.test(customerPhone)) {
      errors.customerPhone = "Geçerli bir telefon numarası girin (sadece rakam, + ve boşluk)";
    }
    
    setCustomerErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleReservation = async () => {
    // Validate customer info
    if (!validateCustomerInfo()) {
      toast({
        title: "Hata",
        description: "Lütfen tüm zorunlu alanları doldurun",
        variant: "destructive",
      });
      return;
    }
    
    // Check if all required data is available
    if (!selectedDate || !selectedTimeSlot || !assignment) {
      toast({
        title: "Hata",
        description: "Lütfen tarih ve saat seçin",
        variant: "destructive",
      });
      return;
    }
    
    // For transfer, check if vehicles are selected
    if (assignment.serviceCategory === "transfer" && selectedVehicles.length === 0) {
      toast({
        title: "Hata",
        description: "Lütfen en az bir araç seçin",
        variant: "destructive",
      });
      return;
    }
    
    // For transfer, check if vehicle capacity is sufficient
    if (assignment.serviceCategory === "transfer" && getTotalCapacityForTransfer() < personCountForTransfer) {
      toast({
        title: "Hata",
        description: "Seçili araçların kapasitesi yetersiz",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare payment data
      const paymentBreakdown = getPaymentBreakdown();
      
      // Prepare reservation data
      const reservationData: any = {
        // Service and Assignment Info
        serviceId: assignment.serviceId,
        serviceName: assignment.serviceName,
        serviceCategory: assignment.serviceCategory,
        companyName: assignment.companyName,
        assignmentId: assignment.id,
        locationId: assignment.locationId,
        locationName: assignment.locationName,
        
        // Customer Info
        customerName: customerName.trim(),
        customerSurname: customerSurname.trim(),
        customerPhone: customerPhone.trim(),
        visitorNote: visitorNote.trim(),
        
        // Reservation Details
        reservationDate: selectedDate,
        timeSlot: {
          id: selectedTimeSlot.id,
          startTime: selectedTimeSlot.startTime,
          endTime: selectedTimeSlot.endTime,
          price: selectedTimeSlot.price,
        },
        
        // Pricing
        unitPrice: selectedTimeSlot.price, // Base price without commission
        totalAmount: paymentBreakdown.total,
        commissionAmount: assignment.pricingSettings?.commissionAmount || 0,
        
        // Payment
        paymentMethod: paymentMethod,
        prepaymentAmount: paymentMethod === 'prepayment' ? paymentBreakdown.prepayment : 0,
        remainingAmount: paymentMethod === 'prepayment' ? paymentBreakdown.remaining : 0,
      };
      
      // Add category-specific details
      if (assignment.serviceCategory === "motor-tours") {
        reservationData.vehicleCount = vehicleCount;
        if (selectedVehicle) {
          reservationData.selectedVehicle = {
            vehicleId: selectedVehicle.id,
            vehicleTypeName: selectedVehicle.vehicleTypeName,
            maxPassengerCapacity: selectedVehicle.maxPassengerCapacity,
          };
        }
      } else if (assignment.serviceCategory === "transfer") {
        reservationData.personCountForTransfer = personCountForTransfer;
        reservationData.vehicleCount = getTotalVehicleCountForTransfer();
        reservationData.selectedVehicles = selectedVehicles.map(sv => ({
          vehicleId: sv.vehicleId,
          vehicleTypeName: sv.vehicle.vehicleTypeName,
          maxPassengerCapacity: sv.vehicle.maxPassengerCapacity,
          count: sv.count,
          price: sv.price
        }));
      } else {
        reservationData.personCount = personCount;
      }
      
      // Save reservation
      const reservationId = await saveReservation(reservationData);
      
      // Show success message
      setSuccessData({
        reservationId,
        serviceName: assignment.serviceName,
        reservationDate: selectedDate,
        timeSlot: {
          startTime: selectedTimeSlot.startTime,
          endTime: selectedTimeSlot.endTime
        },
        locationSlug: assignment.locationSlug || ""
      });
      
      setIsSuccessModalOpen(true);
      
    } catch (error) {
      console.error('Reservation error:', error);
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Rezervasyon yapılırken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCalendarToggle = () => {
    setIsCalendarExpanded(!isCalendarExpanded);
  };

  return {
    selectedDate,
    availableDates,
    availableTimeSlots,
    selectedTimeSlot,
    personCount,
    vehicleCount,
    routeId,
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
    customerErrors,
    isSuccessModalOpen,
    successData,
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
    setCustomerName,
    setCustomerSurname,
    setCustomerPhone,
    setVisitorNote,
    setIsSuccessModalOpen
  };
}
