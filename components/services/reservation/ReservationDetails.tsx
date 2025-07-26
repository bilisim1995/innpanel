
"use client";

import { ReservationCustomerInfo } from "./ReservationCustomerInfo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Users, 
  Car, 
  CreditCard, 
  Calendar,
  Plus,
  Minus,
  X
} from "lucide-react";

interface ReservationDetailsProps {
  assignment: any;
  selectedDate: Date | undefined;
  availableTimeSlots: any[];
  selectedTimeSlot: any;
  personCount: number;
  vehicleCount: number;
  displayPrices: {[key: string]: number};
  filteredVehicles: any[];
  personCountForTransfer: number;
  selectedVehicle: any;
  selectedVehicles: any[];
  paymentMethod: string;
  availablePaymentMethods: string[];
  isPaymentSettingsOpen: boolean;
  prepaymentAmount: number;
  assignedVehicles: any[];
  themeColor: string;
  buttonStyle: any;
  selectedCurrency: 'TL' | 'USD' | 'EUR';
  onCurrencyChange: (currency: 'TL' | 'USD' | 'EUR') => void;
  handleTimeSlotSelect: (timeSlot: any) => void;
  handlePersonCountChange: (value: string) => void;
  handlePersonCountForTransferChange: (value: string) => void;
  handleVehicleCountChange: (value: string) => void;
  handleVehicleSelect: (vehicleId: string) => void;
  handleVehicleCountChangeForTransfer: (vehicleId: string, count: number) => void;
  removeVehicleFromSelection: (vehicleId: string) => void;
  getTotalCapacityForTransfer: () => number;
  getTotalVehicleCountForTransfer: () => number;
  getTotalAmount: () => number;
  getPaymentBreakdown: () => any;
  handleReservation: () => Promise<void>;
  setPaymentMethod: (method: string) => void;
  setIsPaymentSettingsOpen: (open: boolean) => void;
  setPrepaymentAmount: (amount: number) => void;
  isSubmitting?: boolean;
  customerName: string;
  customerSurname: string;
  customerEmail: string; // Added for email functionality
  customerPhone: string;
  visitorNote: string;
  customerErrors: {[key: string]: string};
  onCustomerNameChange: (value: string) => void;
  onCustomerSurnameChange: (value: string) => void;
  onCustomerEmailChange: (value: string) => void; // Added for email functionality
  onCustomerPhoneChange: (value: string) => void;
  onVisitorNoteChange: (value: string) => void;
}

export function ReservationDetails({
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
  themeColor,
  buttonStyle,
  selectedCurrency,
  onCurrencyChange,
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
  isSubmitting = false,
  customerName,
  customerSurname,
  customerEmail,
  customerPhone,
  visitorNote,
  customerErrors,
  onCustomerNameChange,
  onCustomerSurnameChange,
  onCustomerEmailChange,
  onCustomerPhoneChange,
  onVisitorNoteChange
}: ReservationDetailsProps) {
  
  const isBalloonCategory = assignment.serviceCategory.includes("balloon");

  const getCurrencySymbol = (currency: 'TL' | 'USD' | 'EUR') => {
    switch (currency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'TL': default: return '₺';
    }
  };

  return (
    <>
      {!selectedDate ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Rezervasyon yapmak için önce bir tarih seçin</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg" style={{ color: themeColor }}>
                {["motor-tours", "transfer"].includes(assignment.serviceCategory) ? <Car className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                {assignment.serviceCategory === "motor-tours" ? "Araç Seçimi" :
                 assignment.serviceCategory === "transfer" ? "Transfer Detayları" :
                 "Kişi Sayısı & Kur Seçimi"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {assignment.serviceCategory === "motor-tours" && (
                <div className="space-y-4">
                  {/* ... Motor Tours content ... */}
                </div>
              )}
              {assignment.serviceCategory === "transfer" && (
                <div className="space-y-4">
                  {/* ... Transfer content ... */}
                </div>
              )}
              { !["motor-tours", "transfer"].includes(assignment.serviceCategory) && (
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="sm" onClick={() => handlePersonCountChange((personCount - 1).toString())} disabled={personCount <= 1}>
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="font-bold text-lg w-12 text-center">{personCount}</span>
                      <Button variant="outline" size="sm" onClick={() => handlePersonCountChange((personCount + 1).toString())} disabled={!selectedTimeSlot || personCount >= (selectedTimeSlot.quota || 999)}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {isBalloonCategory && (
                       <div className="flex items-center gap-2">
                         <Select value={selectedCurrency} onValueChange={onCurrencyChange}>
                           <SelectTrigger className="w-[120px]">
                             <SelectValue />
                           </SelectTrigger>
                           <SelectContent>
                             <SelectItem value="TL">₺ Türk Lirası</SelectItem>
                             <SelectItem value="USD">$ Dolar</SelectItem>
                             <SelectItem value="EUR">€ Euro</SelectItem>
                           </SelectContent>
                         </Select>
                       </div>
                    )}
                  </div>
                  {selectedTimeSlot && <p className="text-sm text-gray-600 mt-2">Maksimum {selectedTimeSlot.quota || 999} kişi</p>}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg" style={{ color: themeColor }}>
                <Clock className="h-5 w-5" />
                Saat Seçimi ({availableTimeSlots.length} Adet)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {availableTimeSlots.length === 0 ? (
                <p className="text-center text-gray-600 py-4">Bu tarih için müsait saat bulunmuyor</p>
              ) : (
                <div className="grid gap-2 max-h-[15rem] overflow-y-auto pr-2">
                  {availableTimeSlots.map((slot) => (
                    <div
                      key={slot.id}
                      onClick={() => handleTimeSlotSelect(slot)}
                      className={`p-3 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-md ${selectedTimeSlot?.id === slot.id ? 'border-current shadow-lg' : 'border-gray-200 hover:border-gray-300'}`}
                      style={{ borderColor: selectedTimeSlot?.id === slot.id ? themeColor : undefined, backgroundColor: selectedTimeSlot?.id === slot.id ? `${themeColor}10` : undefined }}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-md flex items-center justify-center text-white" style={{ backgroundColor: themeColor }}>
                            <Clock className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-md">{slot.startTime} - {slot.endTime}</p>
                            {slot.quota && <p className="text-xs text-gray-600">Kalan kontenjan: {slot.quota}</p>}
                          </div>
                        </div>
                         <div className="text-right">
                           <p className="font-bold text-lg" style={{ color: themeColor }}>{`${displayPrices[slot.id] || slot.price} ${getCurrencySymbol(slot.currency || 'TL')}`}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {selectedTimeSlot && (
             <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg" style={{ color: themeColor }}>
                  <CreditCard className="h-5 w-5" />
                  Ödeme Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="space-y-3">
                   <div className="flex justify-between items-center text-lg">
                    <span className="font-bold">Toplam:</span>
                    <span className="font-bold text-xl" style={{ color: themeColor }}>
                      {getTotalAmount()} {getCurrencySymbol(selectedCurrency)}
                    </span>
                  </div>
                </div>
                 <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                   <div className="space-y-2">
                    <Label>Ödeme Yöntemi</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {availablePaymentMethods.includes("full_start") && <SelectItem value="full_start">Başlangıçta Tam Ödeme</SelectItem>}
                        {availablePaymentMethods.includes("prepayment") && <SelectItem value="prepayment">Ön Ödeme ile Rezervasyon</SelectItem>}
                        {availablePaymentMethods.includes("full_location") && <SelectItem value="full_location">Tamamını Yerinde Ödeme</SelectItem>}
                      </SelectContent>
                    </Select>
                  </div>
                   {paymentMethod === "prepayment" && (
                    <div className="space-y-2">
                      <Label>Ön Ödeme Tutarı ({getCurrencySymbol(selectedCurrency)})</Label>
                      <Input type="number" min="0" max={getTotalAmount()} value={prepaymentAmount} onChange={(e) => setPrepaymentAmount(parseFloat(e.target.value) || 0)} />
                      <div className="text-sm text-gray-600">
                        <p>Kalan tutar: {getTotalAmount() - Math.min(prepaymentAmount, getTotalAmount())} {getCurrencySymbol(selectedCurrency)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {selectedTimeSlot && (
            <ReservationCustomerInfo
              customerName={customerName}
              customerSurname={customerSurname}
              customerEmail={customerEmail}
              customerPhone={customerPhone}
              visitorNote={visitorNote}
              onCustomerNameChange={onCustomerNameChange}
              onCustomerSurnameChange={onCustomerSurnameChange}
              onCustomerEmailChange={onCustomerEmailChange}
              onCustomerPhoneChange={onCustomerPhoneChange}
              onVisitorNoteChange={onVisitorNoteChange}
              themeColor={themeColor}
              errors={customerErrors}
            />
          )}

          {selectedTimeSlot && (
            <Card>
              <CardContent className="p-6">
                <Button onClick={handleReservation} className="w-full py-6 text-lg font-bold" style={buttonStyle} disabled={isSubmitting}>
                  <Calendar className="w-5 h-5 mr-2" />
                  {isSubmitting ? "Rezervasyon Yapılıyor..." : `Rezervasyonu Tamamla - ${getTotalAmount()} ${getCurrencySymbol(selectedCurrency)}`}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </>
  );
}
