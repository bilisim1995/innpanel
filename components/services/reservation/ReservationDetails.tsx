"use client";

import { useState } from "react";
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
  customerPhone: string;
  visitorNote: string;
  customerErrors: {[key: string]: string};
  onCustomerNameChange: (value: string) => void;
  onCustomerSurnameChange: (value: string) => void;
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
  customerPhone,
  visitorNote,
  customerErrors,
  onCustomerNameChange,
  onCustomerSurnameChange,
  onCustomerPhoneChange,
  onVisitorNoteChange
}: ReservationDetailsProps) {

  return (
    <>
      {!selectedDate ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
              Rezervasyon yapmak için önce bir tarih seçin
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
                <Clock className="h-5 w-5" />
                Saat Seçimi ({availableTimeSlots.length} Adet)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {availableTimeSlots.length === 0 ? (
                <p className="text-center text-gray-600 py-4" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
                  Bu tarih için müsait saat bulunmuyor
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
                                Kalan kontenjan: {slot.quota}
                              </p>
                            )}
                          </div>
                        </div>
                         <div className="text-right">
                          <p className="font-bold text-lg" style={{ color: themeColor, fontFamily: 'Helvetica, Arial, sans-serif' }}>
                           {assignment.serviceCategory === 'transfer' ? 'Araç Seçin' : `${displayPrices[slot.id] || slot.price} ₺`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Kişi/Araç Sayısı Seçimi */}
          {selectedTimeSlot && (
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
                  {assignment.serviceCategory === "motor-tours" ? "Araç Seçimi" :
                   assignment.serviceCategory === "transfer" ? "Transfer Detayları" :
                   "Kişi Sayısı"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Motor Tours - Araç Seçimi */}
                {assignment.serviceCategory === "motor-tours" && (
                  <div className="space-y-4">
                    {selectedTimeSlot.vehicleId && (
                      <div className="space-y-2">
                        <Label>Atanmış Araç</Label>
                        <div className="p-3 border rounded-lg bg-gray-50">
                          {(() => {
                            const vehicle = assignedVehicles.find(v => v.id === selectedTimeSlot.vehicleId);
                            return vehicle ? (
                              <div className="flex items-center gap-3">
                                <Car className="w-5 h-5 text-gray-600" />
                                <div>
                                  <p className="font-medium">{vehicle.vehicleTypeName}</p>
                                  <p className="text-sm text-gray-600">
                                    Maksimum {vehicle.maxPassengerCapacity} kişi
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <p className="text-gray-600">Araç bilgisi bulunamadı</p>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label>Araç Sayısı</Label>
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
                        Maksimum {selectedTimeSlot.vehicleCount || 10} araç seçebilirsiniz
                      </p>
                    </div>
                  </div>
                )}

                {/* Transfer - Kişi Sayısı ve Araç Seçimi */}
                {assignment.serviceCategory === "transfer" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Kişi Sayısı</Label>
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

                    {/* Uygun Araçlar */}
                    <div className="space-y-2">
                      <Label>Uygun Araçlar ({personCountForTransfer} kişi için)</Label>
                      <div className="space-y-2">
                        {selectedTimeSlot.vehicles && selectedTimeSlot.vehicles.length > 0 ? (
                          selectedTimeSlot.vehicles.map((vehicleSlot: any) => {
                            const vehicle = assignedVehicles.find(v => v.id === vehicleSlot.vehicleId);
                            if (!vehicle) return null;
                            const isSelected = selectedVehicles.some(sv => sv.vehicleId === vehicle.id);

                            return (
                              <div
                                key={vehicle.id}
                                className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50 border-blue-300' : ''}`}
                                onClick={() => !isSelected && handleVehicleSelect(vehicle.id!)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <Car className="w-5 h-5 text-gray-600" />
                                    <div>
                                      <p className="font-medium">{vehicle.vehicleTypeName}</p>
                                      <p className="text-sm text-gray-600">
                                        Maksimum {vehicle.maxPassengerCapacity} kişi
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold" style={{ color: themeColor }}>{vehicleSlot.price} ₺</p>
                                    {!isSelected && <Button size="sm" variant="outline">Seç</Button>}
                                    {isSelected && <Badge variant="secondary">Seçildi</Badge>}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                           <p className="text-gray-600 text-sm">Bu saat dilimi için uygun araç bulunamadı.</p>
                        )}
                      </div>
                    </div>

                    {/* Seçili Araçlar */}
                    {selectedVehicles.length > 0 && (
                      <div className="space-y-2">
                        <Label>Seçili Araçlar</Label>
                        <div className="space-y-2">
                          {selectedVehicles.map((sv) => (
                            <div key={sv.vehicleId} className="p-3 border rounded-lg bg-blue-50">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Car className="w-5 h-5 text-blue-600" />
                                  <div>
                                    <p className="font-medium">{sv.vehicle.vehicleTypeName}</p>
                                    <p className="text-sm text-gray-600">
                                      {sv.price} ₺ / adet
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
                            <strong>Toplam Kapasite:</strong> {getTotalCapacityForTransfer()} kişi
                            <br />
                            <strong>Toplam Araç:</strong> {getTotalVehicleCountForTransfer()} adet
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Diğer Kategoriler - Kişi Sayısı */}
                {assignment.serviceCategory !== "motor-tours" && assignment.serviceCategory !== "transfer" && (
                  <div className="space-y-2">
                    <Label>Kişi Sayısı</Label>
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
                        disabled={personCount >= (selectedTimeSlot.quota || assignment.serviceDetails?.quota || 999)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">
                      Maksimum {selectedTimeSlot.quota || assignment.serviceDetails?.quota || 999} kişi
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Ödeme Ayarları */}
          {selectedTimeSlot && (
            <Card>
              <CardHeader>
                <CardTitle 
                  className="flex items-center gap-2 text-lg"
                  style={{ color: themeColor, fontFamily: 'Helvetica, Arial, sans-serif' }}
                >
                  <CreditCard className="h-5 w-5" />
                  Ödeme Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Fiyat Özeti */}
                <div className="space-y-3">
                   {assignment.serviceCategory === "transfer" && selectedVehicles.length > 0 && (
                        <div className="space-y-2">
                          {selectedVehicles.map(sv => (
                            <div key={sv.vehicleId} className="flex justify-between items-center text-sm">
                              <span>{sv.vehicle.vehicleTypeName} ({sv.count} adet)</span>
                              <span className="font-medium">{sv.price * sv.count} ₺</span>
                            </div>
                          ))}
                        </div>
                    )}
                  
                  {assignment.serviceCategory !== "transfer" && (
                    <div className="flex justify-between items-center">
                        <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>Birim Fiyat:</span>
                        <span className="font-bold">{`${selectedTimeSlot.price} ₺`}</span>
                    </div>
                  )}
                  
                  {assignment.serviceCategory === "motor-tours" && (
                    <div className="flex justify-between items-center">
                      <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>Araç Sayısı:</span>
                      <span className="font-bold">{vehicleCount} adet</span>
                    </div>
                  )}
                  
                  {assignment.serviceCategory === "transfer" && (
                    <div className="flex justify-between items-center">
                      <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>Toplam Araç:</span>
                      <span className="font-bold">{getTotalVehicleCountForTransfer()} adet</span>
                    </div>
                  )}
                  
                  {assignment.serviceCategory !== "motor-tours" && assignment.serviceCategory !== "transfer" && (
                    <div className="flex justify-between items-center">
                      <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>Kişi Sayısı:</span>
                      <span className="font-bold">{personCount} kişi</span>
                    </div>
                  )}

                  <Separator />
                  
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-bold" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>Toplam:</span>
                    <span className="font-bold text-xl" style={{ color: themeColor }}>
                      {getTotalAmount()} ₺
                    </span>
                  </div>
                </div>

                {/* Ödeme Yöntemi Seçimi - Her zaman görünür */}
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Ödeme Yöntemi</Label>
                      <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availablePaymentMethods.includes("full_start") && (
                            <SelectItem value="full_start">Başlangıçta Tam Ödeme</SelectItem>
                          )}
                          {availablePaymentMethods.includes("prepayment") && (
                            <SelectItem value="prepayment">Ön Ödeme ile Rezervasyon</SelectItem>
                          )}
                          {availablePaymentMethods.includes("full_location") && (
                            <SelectItem value="full_location">Tamamını Yerinde Ödeme</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {paymentMethod === "prepayment" && (
                      <div className="space-y-2">
                        <Label>Ön Ödeme Tutarı (₺)</Label>
                        <Input
                          type="number"
                          min="0"
                          max={getTotalAmount()}
                          value={prepaymentAmount}
                          onChange={(e) => setPrepaymentAmount(parseFloat(e.target.value) || 0)}
                        />
                        <div className="text-sm text-gray-600">
                          <p>Ön ödeme: {Math.min(prepaymentAmount, getTotalAmount())} ₺</p>
                          <p>Kalan tutar: {getTotalAmount() - Math.min(prepaymentAmount, getTotalAmount())} ₺</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Müşteri Bilgileri - Sadece tarih ve saat seçildiyse göster */}
          {selectedTimeSlot && (
            <ReservationCustomerInfo
              customerName={customerName}
              customerSurname={customerSurname}
              customerPhone={customerPhone}
              visitorNote={visitorNote}
              onCustomerNameChange={onCustomerNameChange}
              onCustomerSurnameChange={onCustomerSurnameChange}
              onCustomerPhoneChange={onCustomerPhoneChange}
              onVisitorNoteChange={onVisitorNoteChange}
              themeColor={themeColor}
              errors={customerErrors}
            />
          )}

          {/* Rezervasyon Butonu */}
          {selectedTimeSlot && (
            <Card>
              <CardContent className="p-6">
                <Button
                  onClick={handleReservation}
                  className="w-full py-6 text-lg font-bold"
                  style={buttonStyle}
                  disabled={
                    isSubmitting ||
                    (assignment.serviceCategory === "transfer" && selectedVehicles.length === 0) ||
                    (assignment.serviceCategory === "transfer" && getTotalCapacityForTransfer() < personCountForTransfer)
                  }
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  {isSubmitting ? "Rezervasyon Yapılıyor..." : `Rezervasyonu Tamamla - ${getTotalAmount()} ₺`}
                </Button>
                
                {assignment.serviceCategory === "transfer" && selectedVehicles.length === 0 && (
                  <p className="text-center text-red-600 text-sm mt-2">
                    Transfer için en az bir araç seçmelisiniz
                  </p>
                )}
                
                {assignment.serviceCategory === "transfer" && getTotalCapacityForTransfer() < personCountForTransfer && selectedVehicles.length > 0 && (
                  <p className="text-center text-red-600 text-sm mt-2">
                    Seçili araçların kapasitesi ({getTotalCapacityForTransfer()} kişi) yeterli değil ({personCountForTransfer} kişi için)
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </>
  );
}