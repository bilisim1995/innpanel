
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { updateAssignment, AssignmentData } from "@/lib/assignments";
import { getVehicles, VehicleData } from "@/lib/vehicles";
import { getTransferPrices, TransferPriceData } from "@/lib/transfer-prices";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Edit3,
  Building2,
  Settings,
  CreditCard,
  Calendar,
  Clock,
  Users,
  Car,
  Plus,
  Minus,
  Trash2,
  AlertCircle,
  Package,
  Wallet
} from "lucide-react";

interface AssignmentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: AssignmentData | null;
}

interface VehicleInSlot {
  vehicleId: string | null;
  count: number;
  price: number;
  currency: 'TL' | 'USD' | 'EUR';
  quota: number;
}


interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  price: number; // For non-transfer services
  currency: 'TL' | 'USD' | 'EUR'; // For non-transfer services
  quota?: number; // For non-transfer services
  vehicleId?: string | null; // For motor-tours
  vehicleCount?: number | null; // For motor-tours
  routeId?: string | null; // For transfer
  vehicles?: VehicleInSlot[]; // For transfer
}

interface DateRange {
  id: string;
  startDate: Date;
  endDate: Date;
  timeSlots: TimeSlot[];
}

export function AssignmentEditModal({ isOpen, onClose, assignment }: AssignmentEditModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("schedule");
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [transferPrices, setTransferPrices] = useState<TransferPriceData[]>([]);
  const { toast } = useToast();

  const [basicData, setBasicData] = useState({
    isActive: true,
    notes: "",
    paymentMethods: {
      fullPayment: true,
      prePayment: false,
      fullAtLocation: false
    }
  });

  const [pricingSettings, setPricingSettings] = useState<{
    prepaymentEnabled: boolean;
    prepaymentAmount: number;
    displayPrice: number;
    displayPriceCurrency: 'TL' | 'USD' | 'EUR'; // Added currency for display price
    commissionAmount: number;
    paymentMethods: {
        fullPayment: boolean;
        prePayment: boolean;
        fullAtLocation: boolean;
    };
    dateRanges: DateRange[];
  }>({
    prepaymentEnabled: false,
    prepaymentAmount: 0,
    displayPrice: 0,
    displayPriceCurrency: 'TL', // Default currency
    commissionAmount: 0,
    paymentMethods: {
      fullPayment: true,
      prePayment: false,
      fullAtLocation: false
    },
    dateRanges: [],
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [vehiclesData, transferPricesData] = await Promise.all([
          getVehicles(),
          getTransferPrices()
        ]);
        setVehicles(vehiclesData.filter(v => v.isActive));
        setTransferPrices(transferPricesData.filter(tp => tp.isActive));
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
            title: "Veri Yükleme Hatası",
            description: "Araç veya güzergah verileri yüklenemedi.",
            variant: "destructive",
        });
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen, toast]);

  useEffect(() => {
    if (assignment && isOpen) {
      const transformedDateRanges = (assignment.pricingSettings?.dateRanges || []).map(range => ({
        ...range,
        startDate: new Date(range.startDate),
        endDate: new Date(range.endDate),
        timeSlots: (range.timeSlots || []).map(slot => ({
          ...slot,
          currency: slot.currency || 'TL',
          vehicles: (slot.vehicles || []).map(v => ({
            ...v,
            currency: v.currency || 'TL'
          }))
        }))
      }));

      setBasicData({
        isActive: assignment.isActive,
        notes: assignment.notes || "",
        paymentMethods: assignment.pricingSettings?.paymentMethods || {
          fullPayment: true,
          prePayment: false,
          fullAtLocation: false
        }
      });

      setPricingSettings({
        prepaymentEnabled: assignment.pricingSettings?.prepaymentEnabled || false,
        prepaymentAmount: assignment.pricingSettings?.prepaymentAmount || 0,
        displayPrice: assignment.pricingSettings?.displayPrice || 0,
        displayPriceCurrency: assignment.pricingSettings?.displayPriceCurrency || 'TL', // Set from assignment
        commissionAmount: assignment.pricingSettings?.commissionAmount || 0,
        paymentMethods: assignment.pricingSettings?.paymentMethods || {
          fullPayment: true,
          prePayment: false,
          fullAtLocation: false
        },
        dateRanges: transformedDateRanges,
      });
    }
  }, [assignment, isOpen]);

  const handleSave = async () => {
    if (!assignment?.id) return;

    setIsLoading(true);
    try {
      const updateData: Partial<AssignmentData> = {
        isActive: basicData.isActive,
        notes: basicData.notes,
        pricingSettings: {
          ...pricingSettings,
          paymentMethods: basicData.paymentMethods,
        },
      };

      await updateAssignment(assignment.id, updateData);

      toast({
        title: "Başarılı",
        description: "Atama başarıyla güncellendi",
      });

      onClose();
    } catch (error) {
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Atama güncellenirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addDateRange = () => {
    const newDateRange: DateRange = {
      id: `range-${Date.now()}`,
      startDate: new Date(),
      endDate: new Date(),
      timeSlots: [],
    };
    setPricingSettings(prev => ({ ...prev, dateRanges: [...prev.dateRanges, newDateRange] }));
  };

  const removeDateRange = (rangeId: string) => {
    setPricingSettings(prev => ({ ...prev, dateRanges: prev.dateRanges.filter(range => range.id !== rangeId) }));
  };

  const updateDateRange = (rangeId: string, field: 'startDate' | 'endDate', value: Date) => {
    setPricingSettings(prev => ({
      ...prev,
      dateRanges: prev.dateRanges.map(range =>
        range.id === rangeId ? { ...range, [field]: value } : range
      ),
    }));
  };

  const addTimeSlot = (rangeId: string) => {
    const newTimeSlot: TimeSlot = {
      id: `slot-${Date.now()}`,
      startTime: "09:00",
      endTime: "10:00",
      price: 0,
      currency: 'TL',
      quota: 10,
      vehicles: [],
    };
    setPricingSettings(prev => ({
      ...prev,
      dateRanges: prev.dateRanges.map(range =>
        range.id === rangeId ? { ...range, timeSlots: [...range.timeSlots, newTimeSlot] } : range
      ),
    }));
  };

  const removeTimeSlot = (rangeId: string, slotId: string) => {
    setPricingSettings(prev => ({
      ...prev,
      dateRanges: prev.dateRanges.map(range =>
        range.id === rangeId ? { ...range, timeSlots: range.timeSlots.filter(slot => slot.id !== slotId) } : range
      ),
    }));
  };

  const updateTimeSlot = (rangeId: string, slotId: string, field: keyof TimeSlot, value: any) => {
    setPricingSettings(prev => ({
      ...prev,
      dateRanges: prev.dateRanges.map(range =>
        range.id === rangeId
          ? { ...range, timeSlots: range.timeSlots.map(slot => slot.id === slotId ? { ...slot, [field]: value } : slot) }
          : range
      ),
    }));
  };

  const updateVehicleInSlot = (rangeId: string, slotId: string, vIndex: number, field: keyof VehicleInSlot, value: any) => {
    setPricingSettings(prev => ({
      ...prev,
      dateRanges: prev.dateRanges.map(range =>
        range.id === rangeId ? {
          ...range,
          timeSlots: range.timeSlots.map(slot =>
            slot.id === slotId ? {
              ...slot,
              vehicles: (slot.vehicles || []).map((v, index) =>
                index === vIndex ? { ...v, [field]: value } : v
              )
            } : slot
          )
        } : range
      )
    }));
  };

  if (!assignment) return null;

  const isTransferCategory = assignment.serviceCategory === "transfer";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="flex items-center gap-2">
          <Edit3 className="h-5 w-5" />
          Atama Düzenle
        </DialogTitle>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5" />
                Atama Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Hizmet</Label>
                  <div className="p-3 border rounded-lg bg-muted/50">
                    <p className="font-medium">{assignment.serviceName}</p>
                    <p className="text-sm text-muted-foreground">{assignment.companyName}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Hizmet Noktası</Label>
                  <div className="p-3 border rounded-lg bg-muted/50">
                    <p className="font-medium">{assignment.locationName}</p>
                    <p className="text-sm text-muted-foreground">{assignment.managerName}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic"><Settings className="h-4 w-4 mr-2" />Temel Ayarlar</TabsTrigger>
              <TabsTrigger value="pricing"><CreditCard className="h-4 w-4 mr-2" />Fiyatlandırma</TabsTrigger>
              <TabsTrigger value="schedule"><Calendar className="h-4 w-4 mr-2" />Tarih & Saat</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Genel Ayarlar</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label>Atama Durumu</Label>
                      <p className="text-sm text-muted-foreground">Atamanın aktif olup olmadığını belirler.</p>
                    </div>
                    <Switch checked={basicData.isActive} onCheckedChange={(c) => setBasicData(p => ({ ...p, isActive: c }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notlar</Label>
                    <Textarea id="notes" value={basicData.notes} onChange={(e) => setBasicData(p => ({ ...p, notes: e.target.value }))} placeholder="Atama ile ilgili özel notlar..." />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Fiyatlandırma Ayarları</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="displayPrice">Görünen Fiyat</Label>
                      <div className="grid grid-cols-5 gap-2">
                        <Input 
                          id="displayPrice" 
                          type="number" 
                          value={pricingSettings.displayPrice} 
                          onChange={(e) => setPricingSettings(p => ({ ...p, displayPrice: parseFloat(e.target.value) || 0 }))}
                          className="col-span-3"
                        />
                        <div className="col-span-2">
                          <Select
                            value={pricingSettings.displayPriceCurrency}
                            onValueChange={(v) => setPricingSettings(p => ({ ...p, displayPriceCurrency: v as 'TL' | 'USD' | 'EUR' }))}
                          >
                            <SelectTrigger className="h-9 w-full">
                              <SelectValue placeholder="Birim" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="TL">TL</SelectItem>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="commissionAmount">Komisyon Tutarı (₺)</Label>
                      <Input id="commissionAmount" type="number" value={pricingSettings.commissionAmount} onChange={(e) => setPricingSettings(p => ({ ...p, commissionAmount: parseFloat(e.target.value) || 0 }))} />
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2"><Wallet className="h-4 w-4" /> Ödeme Yöntemleri</Label>
                    </div>
                    <div className="p-4 border rounded-lg space-y-3">
                      {['fullPayment', 'prePayment', 'fullAtLocation'].map(method => (
                        <div key={method} className="flex items-center justify-between">
                          <Label htmlFor={method} className="text-sm font-normal">
                            {method === 'fullPayment' && 'Başlangıçta Tam Ödeme'}
                            {method === 'prePayment' && 'Resepsiyon Ödeme'}
                            {method === 'fullAtLocation' && 'Araçta Ödeme'}
                          </Label>
                          <Switch id={method} checked={basicData.paymentMethods[method as keyof typeof basicData.paymentMethods]} onCheckedChange={(c) => setBasicData(p => ({...p, paymentMethods: {...p.paymentMethods, [method]: c}}))} />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Tarih Aralıkları ve Saat Dilimleri</span>
                    <Button onClick={addDateRange} size="sm"><Plus className="h-4 w-4 mr-2" />Tarih Aralığı Ekle</Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pricingSettings.dateRanges.length === 0 ? (
                    <div className="text-center py-8"><Calendar className="mx-auto h-12 w-12 text-muted-foreground" /><p>Henüz tarih aralığı eklenmemiş.</p></div>
                  ) : (
                    pricingSettings.dateRanges.map((range, rangeIndex) => (
                      <Card key={range.id} className="border-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                          <CardTitle className="text-base">Tarih Aralığı {rangeIndex + 1}</CardTitle>
                          <Button variant="ghost" size="icon" onClick={() => removeDateRange(range.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input type="date" value={range.startDate.toISOString().split('T')[0]} onChange={(e) => updateDateRange(range.id, 'startDate', new Date(e.target.value))} />
                            <Input type="date" value={range.endDate.toISOString().split('T')[0]} onChange={(e) => updateDateRange(range.id, 'endDate', new Date(e.target.value))} />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>Saat Dilimleri</Label>
                              <Button variant="outline" size="sm" onClick={() => addTimeSlot(range.id)}><Plus className="h-4 w-4 mr-2" />Saat Ekle</Button>
                            </div>
                            {range.timeSlots.length > 0 && (
                              <div className="space-y-2">
                                {range.timeSlots.map((slot) => (
                                  <div key={slot.id} className="p-3 border rounded-lg bg-muted/30 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                                      <div className="space-y-1">
                                        <Label className="text-xs">{isTransferCategory ? "Kalkış" : "Başlangıç"}</Label>
                                        <Input className="h-9" type="time" value={slot.startTime} onChange={(e) => updateTimeSlot(range.id, slot.id, 'startTime', e.target.value)} />
                                      </div>
                                      <div className="space-y-1">
                                        <Label className="text-xs">{isTransferCategory ? "Varış" : "Bitiş"}</Label>
                                        <Input className="h-9" type="time" value={slot.endTime} onChange={(e) => updateTimeSlot(range.id, slot.id, 'endTime', e.target.value)} />
                                      </div>
                                      
                                      {assignment.serviceCategory !== "transfer" && (
                                        <>
                                          <div className="col-span-2 space-y-1">
                                            <Label className="text-xs">Fiyat</Label>
                                            <div className="grid grid-cols-5 gap-2">
                                              <Input
                                                className="h-9 col-span-3"
                                                type="number"
                                                min="0"
                                                value={slot.price}
                                                onChange={(e) =>
                                                  updateTimeSlot(range.id, slot.id, "price", parseFloat(e.target.value) || 0)
                                                }
                                              />
                                              <div className="col-span-2">
                                                <Select
                                                  value={slot.currency}
                                                  onValueChange={(v) =>
                                                    updateTimeSlot(range.id, slot.id, "currency", v)
                                                  }
                                                >
                                                  <SelectTrigger className="h-9 w-full">
                                                    <SelectValue placeholder="Birim" />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    <SelectItem value="TL">TL</SelectItem>
                                                    <SelectItem value="USD">USD</SelectItem>
                                                    <SelectItem value="EUR">EUR</SelectItem>
                                                  </SelectContent>
                                                </Select>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="space-y-1">
                                            <Label className="text-xs">Kontenjan</Label>
                                            <Input
                                              className="h-9"
                                              type="number"
                                              min="0"
                                              value={slot.quota || ""}
                                              onChange={(e) =>
                                                updateTimeSlot(range.id, slot.id, "quota", parseInt(e.target.value) || undefined)
                                              }
                                            />
                                          </div>
                                        </>
                                      )}
                                      
                                      {assignment.serviceCategory === "transfer" && <div className="col-span-3"></div>}
                                      
                                      <div className="flex justify-end"><Button variant="ghost" size="icon" onClick={() => removeTimeSlot(range.id, slot.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></div>
                                    </div>
                                    
                                    {assignment.serviceCategory === "transfer" && (
                                      <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                          <Label className="text-sm font-medium flex items-center gap-2"><Car className="h-4 w-4" />Transfer Araçları</Label>
                                          <Button variant="outline" size="sm" onClick={() => updateTimeSlot(range.id, slot.id, 'vehicles', [...(slot.vehicles || []), { vehicleId: null, count: 1, price: 0, currency: 'TL', quota: 10 }])}><Plus className="h-3 w-3 mr-1" />Araç Ekle</Button>
                                        </div>
                                        {(slot.vehicles || []).length > 0 ? (
                                          <div className="space-y-3">
                                            {(slot.vehicles || []).map((vehicle, vIndex) => (
                                              <Card key={vIndex} className="border-2 border-dashed">
                                                <CardContent className="p-3">
                                                  <div className="grid grid-cols-12 gap-x-3 items-end">
                                                      <div className="col-span-4 space-y-1">
                                                          <Label className="text-xs">Araç Tipi</Label>
                                                          <Select value={vehicle.vehicleId || 'none'} onValueChange={(val) => updateVehicleInSlot(range.id, slot.id, vIndex, 'vehicleId', val === 'none' ? null : val)}>
                                                              <SelectTrigger className="h-9"><SelectValue placeholder="Araç tipi seçin" /></SelectTrigger>
                                                              <SelectContent>{vehicles.map(v => <SelectItem key={v.id} value={v.id!}>{v.vehicleTypeName} (Max: {v.maxPassengerCapacity})</SelectItem>)}</SelectContent>
                                                          </Select>
                                                      </div>
                                                      <div className="col-span-3 space-y-1">
                                                        <Label className="text-xs">Fiyat</Label>
                                                        <div className="grid grid-cols-5 gap-2">
                                                          <Input
                                                            className="h-9 col-span-3"
                                                            type="number"
                                                            min="0"
                                                            value={vehicle.price}
                                                            onChange={(e) =>
                                                              updateVehicleInSlot(range.id, slot.id, vIndex, "price", parseFloat(e.target.value) || 0)
                                                            }
                                                          />
                                                          <div className="col-span-2">
                                                            <Select
                                                              value={vehicle.currency}
                                                              onValueChange={(v) =>
                                                                updateVehicleInSlot(range.id, slot.id, vIndex, "currency", v)
                                                              }
                                                            >
                                                              <SelectTrigger className="h-9 w-full">
                                                                <SelectValue placeholder="Birim" />
                                                              </SelectTrigger>
                                                              <SelectContent>
                                                                <SelectItem value="TL">TL</SelectItem>
                                                                <SelectItem value="USD">USD</SelectItem>
                                                                <SelectItem value="EUR">EUR</SelectItem>
                                                              </SelectContent>
                                                            </Select>
                                                          </div>
                                                        </div>
                                                      </div>
                                                      <div className="col-span-2 space-y-1">
                                                          <Label className="text-xs">Kontenjan</Label>
                                                          <Input type="number" min="0" value={vehicle.quota} onChange={(e) => updateVehicleInSlot(range.id, slot.id, vIndex, 'quota', parseInt(e.target.value) || 0)} className="h-9"/>
                                                      </div>
                                                       <div className="col-span-2 space-y-1">
                                                          <Label className="text-xs">Adet</Label>
                                                          <Input type="number" min="1" value={vehicle.count} onChange={(e) => updateVehicleInSlot(range.id, slot.id, vIndex, 'count', parseInt(e.target.value) || 1)} className="h-9"/>
                                                      </div>
                                                      <div className="col-span-1">
                                                          <Button variant="ghost" size="icon" onClick={() => updateTimeSlot(range.id, slot.id, 'vehicles', (slot.vehicles || []).filter((_, i) => i !== vIndex))}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                                                      </div>
                                                  </div>
                                                </CardContent>
                                              </Card>
                                            ))}
                                          </div>
                                        ) : <div className="text-center py-6 border-2 border-dashed rounded-lg"><Car className="h-8 w-8 mx-auto mb-2 text-gray-400" /><p className="text-sm text-muted-foreground">Henüz araç eklenmemiş.</p></div>}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>İptal</Button>
            <Button onClick={handleSave} disabled={isLoading}>{isLoading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
