"use client";

import { useState, useEffect, useRef } from "react";
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
  X,
  Globe,
  Plane,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useTranslation } from 'react-i18next';

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
  customerEmail: string;
  customerPhone: string;
  visitorNote: string;
  flightCode: string; // Yeni eklendi
  customerErrors: {[key: string]: string};
  onCustomerNameChange: (value: string) => void;
  onCustomerSurnameChange: (value: string) => void;
  onCustomerEmailChange: (value: string) => void;
  onCustomerPhoneChange: (value: string) => void;
  onVisitorNoteChange: (value: string) => void;
  setFlightCode: (value: string) => void; // Yeni eklendi
  selectedCurrency: 'TRY' | 'USD' | 'EUR';
  setSelectedCurrency: (currency: 'TRY' | 'USD' | 'EUR') => void;
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
  flightCode, // Yeni eklendi
  customerErrors,
  onCustomerNameChange,
  onCustomerSurnameChange,
  onCustomerEmailChange,
  onCustomerPhoneChange,
  onVisitorNoteChange,
  setFlightCode, // Yeni eklendi
  selectedCurrency,
  setSelectedCurrency,
}: ReservationDetailsProps) {
    const { t } = useTranslation();
  const [isTimeExpanded, setIsTimeExpanded] = useState(true);
  const nextSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (selectedTimeSlot) {
      setIsTimeExpanded(false);
      // Saat listesi daraldıktan sonra bir alt bölüme kaydır.
      setTimeout(() => {
        nextSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 350);
    }
  }, [selectedTimeSlot]);

  useEffect(() => {
    setIsTimeExpanded(true);
  }, [selectedDate]);

  const formatCurrency = (amount: number) => {
    if (isNaN(amount) || amount === null) {
      amount = 0;
    }
    // Runtime safety check: handle cases where 'TL' might be passed
    // despite the stricter type, which can happen with old data from Firestore.
    const validCurrencyCode = (selectedCurrency as string) === 'TL' ? 'TRY' : selectedCurrency;
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: validCurrencyCode }).format(amount);
  }

  return (
    <>
      {!selectedDate ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
              {t('select_date_for_reservation')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle 
                className="flex items-center gap-2 text-lg"
                style={{ color: themeColor, fontFamily: 'Helvetica, Arial, sans-serif' }}
              >
                {t('time_selection_title', {count: availableTimeSlots.length})}
                {selectedTimeSlot && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsTimeExpanded(!isTimeExpanded)}
                    className="text-base"
                  >
                    {isTimeExpanded ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-1" />
                        {t('collapse_button')}
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-1" style={{ color: themeColor }} />
                        {t('show_time_button')}
                      </>
                    )}
                  </Button>
                )}
              </CardTitle>
              {selectedTimeSlot && !isTimeExpanded && (
                <div className="flex items-center gap-3 mt-2 p-3 rounded-xl border-2" style={{ borderColor: themeColor, backgroundColor: `${themeColor}10` }}>
                  <div className="w-8 h-8 rounded-md flex items-center justify-center text-white" style={{ backgroundColor: themeColor }}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <p className="font-bold text-md">{selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}</p>
                </div>
              )}
              {isTimeExpanded && (
                <div className="flex justify-start items-center text-sm text-gray-500 mt-2 px-1 gap-4">
                  <Clock className="h-5 w-5" />
                  {assignment.serviceCategory === 'transfer' ? (
                    <>
                      <span className="font-medium">{t('pickup_label')}</span>
                      <span className="font-medium">-</span>
                      <span className="font-medium">{t('dropoff_label')}</span>
                    </>
                  ) : (
                    <>
                      <span className="font-medium">{t('start_label')}</span>
                      <span className="font-medium">-</span>
                      <span className="font-medium">{t('end_label')}</span>
                    </>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent className={isTimeExpanded ? "pb-6" : "pb-0"}>
              <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isTimeExpanded ? 'max-h-[20rem] opacity-100' : 'max-h-0 opacity-0'}`}>
                {availableTimeSlots.length === 0 ? (
                  <p className="text-center text-gray-600 py-4" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
                    {t('no_available_time_slots')}
                  </p>
                ) : (
                  <div className="grid gap-2 max-h-[15rem] overflow-y-auto pr-2">
                    {availableTimeSlots.map((slot) => (
                      <div
                        key={slot.id}
                        onClick={() => handleTimeSlotSelect(slot)}
                        className={`p-3 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-md ${
                          selectedTimeSlot?.id === slot.id
                            ? 'border-current shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{
                          borderColor: selectedTimeSlot?.id === slot.id ? themeColor : undefined,
                          backgroundColor: selectedTimeSlot?.id === slot.id ? `${themeColor}10` : undefined
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-8 h-8 rounded-md flex items-center justify-center text-white"
                              style={{ backgroundColor: themeColor }}
                            >
                              <Clock className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-md" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
                                {slot.startTime} - {slot.endTime}
                              </p>
                              {slot.quota && (
                                <p className="text-xs text-gray-600">
                                  {t('remaining_quota', {quota: slot.quota})}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg" style={{ color: themeColor, fontFamily: 'Helvetica, Arial, sans-serif' }}>
                              {assignment.serviceCategory === 'transfer' ? t('select_vehicle_label') : formatCurrency(displayPrices[slot.id] || 0)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {selectedTimeSlot && (
            <div ref={nextSectionRef}>
            <Card>
              <CardHeader>
                <CardTitle 
                  className="flex items-center gap-2 text-lg"
                  style={{ color: themeColor, fontFamily: 'Helvetica, Arial, sans-serif' }}
                >
                  {assignment.serviceCategory === "motor-tours" || assignment.serviceCategory === "transfer" ? (
                    <Car className="h-5 w-5" />
                  ) : (
                    <Users className="h-5 w-5" />
                  )}
                  {assignment.serviceCategory === "motor-tours" ? t('vehicle_selection_title') :
                   assignment.serviceCategory === "transfer" ? t('transfer_details_title') :
                   t('number_of_people_title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Motor Tours - Araç Seçimi */}
                {assignment.serviceCategory === "motor-tours" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t('number_of_vehicles_label')}</Label>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVehicleCountChange((vehicleCount - 1).toString())}
                          disabled={vehicleCount <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="font-bold text-lg w-12 text-center">{vehicleCount}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVehicleCountChange((vehicleCount + 1).toString())}
                          disabled={vehicleCount >= (selectedTimeSlot.vehicleCount || 10)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600">
                        {t('max_vehicle_selection_message', {count: selectedTimeSlot.vehicleCount || 10})}
                      </p>
                    </div>
                  </div>
                )}

                {/* Transfer - Kişi Sayısı ve Araç Seçimi */}
                {assignment.serviceCategory === "transfer" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t('number_of_people_label')}</Label>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePersonCountForTransferChange((personCountForTransfer - 1).toString())}
                          disabled={personCountForTransfer <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="font-bold text-lg w-12 text-center">{personCountForTransfer}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePersonCountForTransferChange((personCountForTransfer + 1).toString())}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>{t('available_vehicles_for_people', {count: personCountForTransfer})}</Label>
                      <div className="space-y-2">
                        {filteredVehicles.length > 0 ? (
                          filteredVehicles.map((vehicle: any) => {
                            const vehicleSlot = selectedTimeSlot.vehicles.find((v: any) => v.vehicleId === vehicle.id);
                            if (!vehicleSlot) return null;
                            const isSelected = selectedVehicles.some(sv => sv.vehicleId === vehicle.id);
                            const isDisabled = personCountForTransfer > vehicle.maxPassengerCapacity; // Yeni kontrol

                            return (
                              <div
                                key={vehicle.id}
                                className={`p-3 border rounded-lg transition-colors ${
                                  isDisabled
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' // Disabled stili
                                    : isSelected
                                    ? 'bg-blue-50 border-blue-300 cursor-pointer hover:bg-gray-50'
                                    : 'cursor-pointer hover:bg-gray-50'
                                }`}
                                onClick={() => !isDisabled && !isSelected && handleVehicleSelect(vehicle.id!)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <Car className="w-5 h-5 text-gray-600" />
                                    <div>
                                      <p className="font-medium">{vehicle.vehicleTypeName}</p>
                                      <p className="text-sm text-gray-600">
                                        {t('max_passenger_capacity', {capacity: vehicle.maxPassengerCapacity})}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold" style={{ color: themeColor }}>{formatCurrency(vehicleSlot.price)}</p>
                                    {!isSelected && (
                                      <Button size="sm" variant="outline" disabled={isDisabled}> 
                                        {t('select_button')}
                                      </Button>
                                    )}
                                    {isSelected && <Badge variant="secondary">{t('selected_badge')}</Badge>}
                                  </div>
                                </div>
                                {isDisabled && (
                                  <p className="text-red-500 text-xs mt-1">{t('vehicle_too_small_message', {count: personCountForTransfer})}</p>
                                )}
                              </div>
                            );
                          })
                        ) : (
                           <p className="text-gray-600 text-sm">{t('no_available_vehicles_for_timeslot')}</p>
                        )}
                      </div>
                    </div>

                    {selectedVehicles.length > 0 && (
                      <div className="space-y-2">
                        <Label>{t('selected_vehicles_title')}</Label>
                        <div className="space-y-2">
                          {selectedVehicles.map((sv) => (
                            <div key={sv.vehicleId} className="p-3 border rounded-lg bg-blue-50">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Car className="w-5 h-5 text-blue-600" />
                                  <div>
                                    <p className="font-medium">{sv.vehicle.vehicleTypeName}</p>
                                    <p className="text-sm text-gray-600">
                                      {formatCurrency(sv.price)} / {t('per_unit_label')}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleVehicleCountChangeForTransfer(sv.vehicleId!, sv.count - 1)}
                                      disabled={sv.count <= 1}
                                    >
                                      <Minus className="w-3 h-3" />
                                    </Button>
                                    <span className="w-8 text-center font-medium">{sv.count}</span>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleVehicleCountChangeForTransfer(sv.vehicleId!, sv.count + 1)}
                                    >
                                      <Plus className="w-3 h-3" />
                                    </Button>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeVehicleFromSelection(sv.vehicleId!)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-800">
                            <strong>{t('total_capacity_label')}:</strong> {getTotalCapacityForTransfer()} {t('person_suffix')}
                            <br />
                            <strong>{t('total_vehicle_label')}:</strong> {getTotalVehicleCountForTransfer()} {t('unit_suffix')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Diğer Kategoriler - Kişi Sayısı */}
                {assignment.serviceCategory !== "motor-tours" && assignment.serviceCategory !== "transfer" && (
                  <div className="space-y-2">
                    <Label>{t('number_of_people_label')}</Label>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePersonCountChange((personCount - 1).toString())}
                        disabled={personCount <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="font-bold text-lg w-12 text-center">{personCount}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePersonCountChange((personCount + 1).toString())}
                        disabled={personCount >= (selectedTimeSlot.quota || 999)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                     <p className="text-sm text-gray-600">
                      {t('max_person_count_message', {count: selectedTimeSlot.quota || assignment.serviceDetails?.quota || 999})}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            </div>
          )}

          {selectedTimeSlot && assignment.serviceCategory === "transfer" && (
            <Card>
              <CardHeader>
                <CardTitle 
                  className="flex items-center gap-2 text-lg"
                  style={{ color: themeColor, fontFamily: 'Helvetica, Arial, sans-serif' }}
                >
                  <Plane className="h-5 w-5" />
                  {t('flight_info_title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Label htmlFor="flight-code">{t('flight_code_label')}</Label>
                <Input 
                  id="flight-code" 
                  placeholder={t('flight_code_placeholder')}
                  className="mt-1.5"
                  value={flightCode}
                  onChange={(e) => setFlightCode(e.target.value)}
                />
              </CardContent>
            </Card>
          )}

          {selectedTimeSlot && (
            <Card>
              <CardHeader>
                <CardTitle 
                  className="flex items-center gap-2 text-lg"
                  style={{ color: themeColor, fontFamily: 'Helvetica, Arial, sans-serif' }}
                >
                  <CreditCard className="h-5 w-5" />
                  {t('payment_info_title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="currency-select" className="flex items-center gap-2"><Globe className="h-4 w-4" /> {t('currency_label')}</Label>
                    <Select value={selectedCurrency} onValueChange={(value) => setSelectedCurrency(value as any)}>
                        <SelectTrigger id="currency-select">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="TRY">{t('currency_try')}</SelectItem>
                            <SelectItem value="USD">{t('currency_usd')}</SelectItem>
                            <SelectItem value="EUR">{t('currency_eur')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-bold" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>{t('total_label')}:</span>
                    <span className="font-bold text-xl" style={{ color: themeColor }}>
                      {formatCurrency(getTotalAmount())}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                  <div className="space-y-2">
                    <Label>{t('payment_method_label')}</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePaymentMethods.includes("full_start") && (
                          <SelectItem value="full_start">{t('payment_full_start')}</SelectItem>
                        )}
                        {availablePaymentMethods.includes("prepayment") && (
                          <SelectItem value="prepayment">{t('payment_prepayment')}</SelectItem>
                        )}
                        {availablePaymentMethods.includes("full_location") && (
                          <SelectItem value="full_location">{t('payment_full_location')}</SelectItem>
                        )}
                        {availablePaymentMethods.includes("prepaid_payment") && (
                          <SelectItem value="prepaid_payment">{t('payment_prepaid_payment')}</SelectItem>
                        )}
                        {availablePaymentMethods.includes("link_payment") && (
                          <SelectItem value="link_payment">{t('payment_link_payment')}</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {paymentMethod === "prepayment" && (
                    <div className="space-y-2">
                      <Label>{t('prepayment_amount_label', {currency: selectedCurrency})}</Label>
                      <Input
                        type="number"
                        min="0"
                        max={getTotalAmount()}
                        value={prepaymentAmount}
                        onChange={(e) => setPrepaymentAmount(parseFloat(e.target.value) || 0)}
                      />
                      <div className="text-sm text-gray-600">
                        <p>{t('amount_to_pay', {amount: formatCurrency(Math.min(prepaymentAmount, getTotalAmount()))})}</p>
                        <p>{t('remaining_amount', {amount: formatCurrency(getTotalAmount() - Math.min(prepaymentAmount, getTotalAmount()))})}</p>
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
                <Button
                  onClick={handleReservation}
                  className="w-full py-6 text-base font-bold"
                  style={buttonStyle}
                  disabled={isSubmitting}
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  {isSubmitting ? t('submitting_reservation_button') : t('complete_reservation_button', {amount: formatCurrency(getTotalAmount())})}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </>
  );
}