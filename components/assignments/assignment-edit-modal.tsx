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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { updateAssignment, AssignmentData } from "@/lib/assignments";
import { getVehicles, VehicleData } from "@/lib/vehicles";
import { getTransferPrices, TransferPriceData } from "@/lib/transfer-prices";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Edit3,
  Building2,
  MapPin,
  Settings,
  CreditCard,
  Calendar,
  Clock,
  Users,
  Car,
  Plus,
  Minus,
  Trash2,
  AlertCircle
} from "lucide-react";

interface AssignmentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: AssignmentData | null;
}

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  price: number;
  quota?: number;
  vehicleId?: string | null;
  vehicleCount?: number | null;
  routeId?: string | null;
  vehicles?: { vehicleId: string | null; count: number }[]; // Added vehicles property
}

interface DateRange {
  id: string;
  startDate: Date;
  endDate: Date;
  timeSlots: TimeSlot[];
}

export function AssignmentEditModal({ isOpen, onClose, assignment }: AssignmentEditModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
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

  const [pricingSettings, setPricingSettings] = useState({
    prepaymentEnabled: false,
    prepaymentAmount: 0,
    displayPrice: 0,
    commissionAmount: 0,
    paymentMethods: {
      fullPayment: true,
      prePayment: false,
      fullAtLocation: false
    },
    dateRanges: [] as DateRange[],
  });

  // Load vehicles and transfer prices
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
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // Load assignment data when modal opens
  useEffect(() => {
    if (assignment && isOpen) {
      setBasicData({
        isActive: assignment.isActive,
        notes: assignment.notes || "",
        paymentMethods: assignment.pricingSettings?.paymentMethods || {
          fullPayment: true,
          prePayment: false,
          fullAtLocation: false
        }
      });

      if (assignment.pricingSettings) {
        const paymentMethods = assignment.pricingSettings.paymentMethods || {
          fullPayment: true,
          prePayment: false,
          fullAtLocation: false
        };
        
        setPricingSettings({
          prepaymentEnabled: assignment.pricingSettings.prepaymentEnabled || false,
          prepaymentAmount: assignment.pricingSettings.prepaymentAmount || 0,
          displayPrice: assignment.pricingSettings.displayPrice || 0,
          commissionAmount: assignment.pricingSettings.commissionAmount || 0,
          paymentMethods,
          dateRanges: assignment.pricingSettings.dateRanges || [],
        });
      } else {
        setPricingSettings({
          prepaymentEnabled: false,
          prepaymentAmount: 0,
          displayPrice: 0,
          commissionAmount: 0,
          paymentMethods: {
            fullPayment: true,
            prePayment: false,
            fullAtLocation: false
          },
          dateRanges: [],
        });
      }
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
          ...(assignment.pricingSettings || {}),
          paymentMethods: basicData.paymentMethods,
          prepaymentEnabled: pricingSettings.prepaymentEnabled,
          prepaymentAmount: pricingSettings.prepaymentAmount,
          displayPrice: pricingSettings.displayPrice,
          commissionAmount: pricingSettings.commissionAmount,
          dateRanges: pricingSettings.dateRanges,
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

    setPricingSettings(prev => ({
      ...prev,
      dateRanges: [...prev.dateRanges, newDateRange],
    }));
  };

  const removeDateRange = (rangeId: string) => {
    setPricingSettings(prev => ({
      ...prev,
      dateRanges: prev.dateRanges.filter(range => range.id !== rangeId),
    }));
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
      quota: 10,
    };

    setPricingSettings(prev => ({
      ...prev,
      dateRanges: prev.dateRanges.map(range =>
        range.id === rangeId 
          ? { ...range, timeSlots: [...range.timeSlots, newTimeSlot] }
          : range
      ),
    }));
  };

  const removeTimeSlot = (rangeId: string, slotId: string) => {
    setPricingSettings(prev => ({
      ...prev,
      dateRanges: prev.dateRanges.map(range =>
        range.id === rangeId 
          ? { ...range, timeSlots: range.timeSlots.filter(slot => slot.id !== slotId) }
          : range
      ),
    }));
  };

  const updateTimeSlot = (rangeId: string, slotId: string, field: keyof TimeSlot, value: any) => {
    setPricingSettings(prev => ({
      ...prev,
      dateRanges: prev.dateRanges.map(range =>
        range.id === rangeId 
          ? {
              ...range,
              timeSlots: range.timeSlots.map(slot =>
                slot.id === slotId ? { ...slot, [field]: value } : slot
              )
            }
          : range
      ),
    }));
  };

  if (!assignment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="flex items-center gap-2">
          <Edit3 className="h-5 w-5" />
          Atama Düzenle
        </DialogTitle>

        <div className="space-y-6">
          {/* Assignment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
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

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Temel Ayarlar
              </TabsTrigger>
              <TabsTrigger value="pricing" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Fiyatlandırma
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Tarih & Saat
              </TabsTrigger>
            </TabsList>

            {/* Basic Settings */}
            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Temel Ayarlar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label>Atama Durumu</Label>
                      <div className="text-sm text-muted-foreground">
                        Atamanın aktif olup olmadığını belirler
                      </div>
                    </div>
                    <Switch
                      checked={basicData.isActive}
                      onCheckedChange={(checked) => setBasicData(prev => ({ ...prev, isActive: checked }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Ödeme Yöntemleri</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-0.5">
                          <Label>Başlangıçta Tam Ödeme</Label>
                          <div className="text-sm text-muted-foreground">
                            Rezervasyon sırasında tam ödeme alınır
                          </div>
                        </div>
                        <Switch
                          checked={basicData.paymentMethods.fullPayment}
                          onCheckedChange={(checked) => setBasicData(prev => ({ 
                            ...prev, 
                            paymentMethods: {
                              ...prev.paymentMethods,
                              fullPayment: checked
                            }
                          }))}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-0.5">
                          <Label>Ön Ödeme ile Rezervasyon</Label>
                          <div className="text-sm text-muted-foreground">
                            Rezervasyon sırasında kısmi ödeme alınır
                          </div>
                        </div>
                        <Switch
                          checked={basicData.paymentMethods.prePayment}
                          onCheckedChange={(checked) => setBasicData(prev => ({ 
                            ...prev, 
                            paymentMethods: {
                              ...prev.paymentMethods,
                              prePayment: checked
                            }
                          }))}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-0.5">
                          <Label>Tamamını Yerinde Ödeme</Label>
                          <div className="text-sm text-muted-foreground">
                            Ödeme hizmet başlangıcında yerinde alınır
                          </div>
                        </div>
                        <Switch
                          checked={basicData.paymentMethods.fullAtLocation}
                          onCheckedChange={(checked) => setBasicData(prev => ({ 
                            ...prev, 
                            paymentMethods: {
                              ...prev.paymentMethods,
                              fullAtLocation: checked
                            }
                          }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notlar</Label>
                    <Textarea
                      id="notes"
                      value={basicData.notes}
                      onChange={(e) => setBasicData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Atama ile ilgili özel notlar..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pricing Settings */}
            <TabsContent value="pricing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Fiyatlandırma Ayarları</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="displayPrice">Görünen Fiyat (₺)</Label>
                      <Input
                        id="displayPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={pricingSettings.displayPrice}
                        onChange={(e) => setPricingSettings(prev => ({ 
                          ...prev, 
                          displayPrice: parseFloat(e.target.value) || 0 
                        }))}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="commissionAmount">Komisyon Tutarı (₺)</Label>
                      <Input
                        id="commissionAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={pricingSettings.commissionAmount}
                        onChange={(e) => setPricingSettings(prev => ({ 
                          ...prev, 
                          commissionAmount: parseFloat(e.target.value) || 0 
                        }))}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Ödeme Yöntemleri</Label>
                    </div>
                    
                    <div className="space-y-3 p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-3">
                        Rezervasyon sayfasında hangi ödeme yöntemlerinin görüneceğini seçin:
                      </p>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-0.5">
                          <Label>Başlangıçta Tam Ödeme</Label>
                          <div className="text-sm text-muted-foreground">
                            Rezervasyon sırasında tam ödeme alınır
                          </div>
                        </div>
                        <Switch
                          checked={pricingSettings.paymentMethods.fullPayment}
                          onCheckedChange={(checked) => setPricingSettings(prev => ({ 
                            ...prev, 
                            paymentMethods: {
                              ...prev.paymentMethods,
                              fullPayment: checked
                            }
                          }))}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-0.5">
                          <Label>Ön Ödeme</Label>
                          <div className="text-sm text-muted-foreground">
                            Rezervasyon sırasında kısmi ön ödeme alınır
                          </div>
                        </div>
                        <Switch
                          checked={pricingSettings.paymentMethods.prePayment}
                          onCheckedChange={(checked) => setPricingSettings(prev => ({ 
                            ...prev, 
                            paymentMethods: {
                              ...prev.paymentMethods,
                              prePayment: checked
                            }
                          }))}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-0.5">
                          <Label>Tamamını Yerinde Ödeme</Label>
                          <div className="text-sm text-muted-foreground">
                            Ödeme hizmet başlangıcında yerinde yapılır
                          </div>
                        </div>
                        <Switch
                          checked={pricingSettings.paymentMethods.fullAtLocation}
                          onCheckedChange={(checked) => setPricingSettings(prev => ({ 
                            ...prev, 
                            paymentMethods: {
                              ...prev.paymentMethods,
                              fullAtLocation: checked
                            }
                          }))}
                        />
                      </div>
                      
                      {!pricingSettings.paymentMethods.fullPayment && 
                       !pricingSettings.paymentMethods.prePayment && 
                       !pricingSettings.paymentMethods.fullAtLocation && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            <span className="font-medium">Uyarı</span>
                          </div>
                          <p className="mt-1">
                            En az bir ödeme yöntemi seçmelisiniz, aksi halde rezervasyon yapılamaz.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Ön Ödeme Ayarları</Label>
                      <Switch
                        checked={pricingSettings.prepaymentEnabled}
                        onCheckedChange={(checked) => setPricingSettings(prev => ({ 
                          ...prev, 
                          prepaymentEnabled: checked 
                        }))}
                      />
                    </div>

                    {pricingSettings.prepaymentEnabled && (
                      <div className="space-y-2">
                        <Label htmlFor="prepaymentAmount">Ön Ödeme Tutarı (₺)</Label>
                        <Input
                          id="prepaymentAmount"
                          type="number"
                          min="0"
                          step="0.01"
                          value={pricingSettings.prepaymentAmount}
                          onChange={(e) => setPricingSettings(prev => ({ 
                            ...prev, 
                            prepaymentAmount: parseFloat(e.target.value) || 0 
                          }))}
                          placeholder="0.00"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Schedule Settings */}
            <TabsContent value="schedule" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Tarih Aralıkları ve Saat Dilimleri</span>
                    <Button onClick={addDateRange} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Tarih Aralığı Ekle
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pricingSettings.dateRanges.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Henüz tarih aralığı eklenmemiş</p>
                      <p className="text-sm">Tarih aralığı eklemek için yukarıdaki butonu kullanın</p>
                    </div>
                  ) : (
                    pricingSettings.dateRanges.map((range, rangeIndex) => (
                      <Card key={range.id} className="border-2">
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between text-base">
                            <span>Tarih Aralığı {rangeIndex + 1}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDateRange(range.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Date Range */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Başlangıç Tarihi</Label>
                              <Input
                                type="date"
                                value={range.startDate.toISOString().split('T')[0]}
                                onChange={(e) => updateDateRange(range.id, 'startDate', new Date(e.target.value))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Bitiş Tarihi</Label>
                              <Input
                                type="date"
                                value={range.endDate.toISOString().split('T')[0]}
                                onChange={(e) => updateDateRange(range.id, 'endDate', new Date(e.target.value))}
                              />
                            </div>
                          </div>

                          {/* Time Slots */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>Saat Dilimleri</Label>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addTimeSlot(range.id)}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Saat Ekle
                              </Button>
                            </div>

                            {range.timeSlots.length === 0 ? (
                              <div className="text-center py-4 text-muted-foreground border rounded-lg">
                                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Henüz saat dilimi eklenmemiş</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {range.timeSlots.map((slot) => (
                                  <div key={slot.id} className="p-3 border rounded-lg bg-muted/30">
                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                                      <div className="space-y-1">
                                        <Label className="text-xs">Başlangıç</Label>
                                        <Input
                                          type="time"
                                          value={slot.startTime}
                                          onChange={(e) => updateTimeSlot(range.id, slot.id, 'startTime', e.target.value)}
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <Label className="text-xs">Bitiş</Label>
                                        <Input
                                          type="time"
                                          value={slot.endTime}
                                          onChange={(e) => updateTimeSlot(range.id, slot.id, 'endTime', e.target.value)}
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <Label className="text-xs">Fiyat (₺)</Label>
                                        <Input
                                          type="number"
                                          min="0"
                                          step="0.01"
                                          value={slot.price}
                                          onChange={(e) => updateTimeSlot(range.id, slot.id, 'price', parseFloat(e.target.value) || 0)}
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <Label className="text-xs">Kontenjan</Label>
                                        <Input
                                          type="number"
                                          min="1"
                                          value={slot.quota || ''}
                                          onChange={(e) => updateTimeSlot(range.id, slot.id, 'quota', parseInt(e.target.value) || undefined)}
                                        />
                                      </div>
                                      
                                      {/* Motor Tours - Vehicle Selection */}
                                      {assignment.serviceCategory === "motor-tours" && (
                                        <div className="space-y-1">
                                          <Label className="text-xs">Araç</Label>
                                          <Select
                                            value={slot.vehicleId || ''}
                                            onValueChange={(value) => updateTimeSlot(range.id, slot.id, 'vehicleId', value || null)}
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="Araç seç" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="none">Araç seçilmedi</SelectItem>
                                              {vehicles.map((vehicle) => (
                                                <SelectItem key={vehicle.id} value={vehicle.id!}>
                                                  {vehicle.vehicleTypeName} ({vehicle.maxPassengerCapacity} kişi)
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      )}

                                      {/* Motor Tours - Vehicle Count */}
                                      {assignment.serviceCategory === "motor-tours" && (
                                        <div className="space-y-1">
                                          <Label className="text-xs">Araç Sayısı</Label>
                                          <Input
                                            type="number"
                                            min="1"
                                            value={slot.vehicleCount || ''}
                                            onChange={(e) => updateTimeSlot(range.id, slot.id, 'vehicleCount', parseInt(e.target.value) || null)}
                                            placeholder="1"
                                          />
                                        </div>
                                      )}

                                      {/* Transfer - Route Selection */}
                                      {assignment.serviceCategory === "transfer" && (
                                        <div className="space-y-1">
                                          <Label className="text-xs">Güzergah</Label>
                                          <Select
                                            value={slot.routeId || ''}
                                            onValueChange={(value) => updateTimeSlot(range.id, slot.id, 'routeId', value || null)}
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="Güzergah seç" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="none">Güzergah seçilmedi</SelectItem>
                                              {transferPrices.map((tp) => (
                                                <SelectItem key={tp.id} value={tp.id!}>
                                                  {tp.departurePoint} → {tp.arrivalPoint} ({tp.transferDuration} dk)
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      )}
                                      <div className="flex justify-end">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => removeTimeSlot(range.id, slot.id)}
                                          className="text-red-600 hover:text-red-700"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>

                                      {/* Transfer - Vehicle Management */}
                                      {assignment.serviceCategory === "transfer" && (
                                        <div className="col-span-full">
                                          <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                              <Label className="text-sm font-medium flex items-center gap-2">
                                                <Car className="h-4 w-4" />
                                                Transfer Araçları
                                              </Label>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                  const newVehicle = { vehicleId: null, count: 1 };
                                                  const updatedVehicles = [...(slot.vehicles || []), newVehicle];
                                                  updateTimeSlot(range.id, slot.id, 'vehicles', updatedVehicles);
                                                }}
                                                className="h-8"
                                              >
                                                <Plus className="h-3 w-3 mr-1" />
                                                Araç Ekle
                                              </Button>
                                            </div>
                                            
                                            {slot.vehicles && slot.vehicles.length > 0 ? (
                                              <div className="space-y-3">
                                                {slot.vehicles.map((vehicle: any, vIndex: number) => {
                                                  const selectedVehicle = vehicles.find(v => v.id === vehicle.vehicleId);
                                                  return (
                                                    <Card key={vIndex} className="border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors">
                                                      <CardContent className="p-4">
                                                        <div className="flex items-center gap-3">
                                                          {/* Vehicle Icon */}
                                                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <Car className="w-5 h-5 text-blue-600" />
                                                          </div>
                                                          
                                                          {/* Vehicle Selection */}
                                                          <div className="flex-1 space-y-2">
                                                            <Select
                                                              value={vehicle.vehicleId || 'none'}
                                                              onValueChange={(value) => {
                                                                const updatedVehicles = [...(slot.vehicles || [])];
                                                                updatedVehicles[vIndex] = { 
                                                                  ...vehicle, 
                                                                  vehicleId: value === "none" ? null : value 
                                                                };
                                                                updateTimeSlot(range.id, slot.id, 'vehicles', updatedVehicles);
                                                              }}
                                                            >
                                                              <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Araç tipi seçin" />
                                                              </SelectTrigger>
                                                              <SelectContent>
                                                                <SelectItem value="none">
                                                                  <div className="flex items-center gap-2">
                                                                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                                                                    <span>Araç seçilmedi</span>
                                                                  </div>
                                                                </SelectItem>
                                                                {vehicles.map((v) => (
                                                                  <SelectItem key={v.id} value={v.id!}>
                                                                    <div className="flex items-center gap-2">
                                                                      <Car className="w-4 h-4 text-blue-600" />
                                                                      <div className="flex flex-col">
                                                                        <span className="font-medium">{v.vehicleTypeName}</span>
                                                                        <span className="text-xs text-muted-foreground">
                                                                          Max {v.maxPassengerCapacity} kişi
                                                                        </span>
                                                                      </div>
                                                                    </div>
                                                                  </SelectItem>
                                                                ))}
                                                              </SelectContent>
                                                            </Select>
                                                            
                                                            {/* Vehicle Info */}
                                                            {selectedVehicle && (
                                                              <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded border">
                                                                <div className="flex items-center justify-between">
                                                                  <span>Maksimum Kapasite:</span>
                                                                  <span className="font-medium">{selectedVehicle.maxPassengerCapacity} kişi</span>
                                                                </div>
                                                              </div>
                                                            )}
                                                          </div>
                                                          
                                                          {/* Count Controls */}
                                                          <div className="flex items-center gap-2">
                                                            <div className="flex items-center border rounded-lg">
                                                              <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                  const updatedVehicles = [...(slot.vehicles || [])];
                                                                  const newCount = Math.max(1, (vehicle.count || 1) - 1);
                                                                  updatedVehicles[vIndex] = { ...vehicle, count: newCount };
                                                                  updateTimeSlot(range.id, slot.id, 'vehicles', updatedVehicles);
                                                                }}
                                                                disabled={(vehicle.count || 1) <= 1}
                                                                className="h-8 w-8 p-0 rounded-r-none"
                                                              >
                                                                <Minus className="h-3 w-3" />
                                                              </Button>
                                                              <div className="w-12 h-8 flex items-center justify-center border-x text-sm font-medium">
                                                                {vehicle.count || 1}
                                                              </div>
                                                              <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                  const updatedVehicles = [...(slot.vehicles || [])];
                                                                  const newCount = (vehicle.count || 1) + 1;
                                                                  updatedVehicles[vIndex] = { ...vehicle, count: newCount };
                                                                  updateTimeSlot(range.id, slot.id, 'vehicles', updatedVehicles);
                                                                }}
                                                                className="h-8 w-8 p-0 rounded-l-none"
                                                              >
                                                                <Plus className="h-3 w-3" />
                                                              </Button>
                                                            </div>
                                                            <span className="text-xs text-muted-foreground">adet</span>
                                                          </div>
                                                          
                                                          {/* Remove Button */}
                                                          <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                              const updatedVehicles = (slot.vehicles || []).filter((_, i) => i !== vIndex);
                                                              updateTimeSlot(range.id, slot.id, 'vehicles', updatedVehicles);
                                                            }}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 flex-shrink-0"
                                                          >
                                                            <Trash2 className="h-4 w-4" />
                                                          </Button>
                                                        </div>
                                                        
                                                        {/* Total Capacity Display */}
                                                        {selectedVehicle && (
                                                          <div className="mt-3 pt-3 border-t border-gray-100">
                                                            <div className="flex items-center justify-between text-xs">
                                                              <span className="text-muted-foreground">Toplam Kapasite:</span>
                                                              <span className="font-medium text-green-600">
                                                                {selectedVehicle.maxPassengerCapacity * (vehicle.count || 1)} kişi
                                                              </span>
                                                            </div>
                                                          </div>
                                                        )}
                                                      </CardContent>
                                                    </Card>
                                                  );
                                                })}
                                                
                                                {/* Summary */}
                                                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                  <div className="flex items-center gap-2 mb-2">
                                                    <Users className="h-4 w-4 text-green-600" />
                                                    <span className="text-sm font-medium text-green-800">Transfer Özeti</span>
                                                  </div>
                                                  <div className="grid grid-cols-2 gap-4 text-xs">
                                                    <div className="flex justify-between">
                                                      <span className="text-green-700">Toplam Araç:</span>
                                                      <span className="font-medium text-green-800">
                                                        {(slot.vehicles || []).reduce((sum: number, v: any) => sum + (v.count || 1), 0)} adet
                                                      </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                      <span className="text-green-700">Toplam Kapasite:</span>
                                                      <span className="font-medium text-green-800">
                                                        {(slot.vehicles || []).reduce((sum: number, v: any) => {
                                                          const vehicle = vehicles.find(veh => veh.id === v.vehicleId);
                                                          return sum + (vehicle ? vehicle.maxPassengerCapacity * (v.count || 1) : 0);
                                                        }, 0)} kişi
                                                      </span>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            ) : (
                                              <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                                                <Car className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                                <p className="text-sm text-muted-foreground mb-2">Henüz araç eklenmemiş</p>
                                                <p className="text-xs text-muted-foreground">Transfer için araç eklemek üstteki butonu kullanın</p>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* Show selected route details */}
                                      {slot.routeId && (
                                        <div className="col-span-full mt-2">
                                          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                            {(() => {
                                              const selectedRoute = transferPrices.find(tp => tp.id === slot.routeId);
                                              if (!selectedRoute) return null;
                                              
                                              return (
                                                <div className="space-y-2">
                                                  <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-blue-700">
                                                      {selectedRoute.departurePoint} → {selectedRoute.arrivalPoint}
                                                    </span>
                                                    <span className="text-xs text-blue-600">
                                                      {selectedRoute.transferDuration} dk
                                                    </span>
                                                  </div>
                                                  
                                                  {selectedRoute.vehiclePrices && selectedRoute.vehiclePrices.length > 0 && (
                                                    <div className="space-y-1 pt-2 border-t border-blue-200">
                                                      <p className="text-xs font-medium text-blue-700">Araç Fiyatları:</p>
                                                      <div className="grid grid-cols-2 gap-2">
                                                        {selectedRoute.vehiclePrices.map((vp, i) => (
                                                          <div key={i} className="flex justify-between text-xs">
                                                            <span>{vp.vehicleTypeName}</span>
                                                            <span className="font-medium">{vp.price} ₺</span>
                                                          </div>
                                                        ))}
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>
                                              );
                                            })()}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Category-specific information */}
                            {assignment.serviceCategory === "motor-tours" && (
                              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <Car className="h-4 w-4 text-blue-600" />
                                  <span className="text-sm font-medium text-blue-800">Motorlu Tur Ayarları</span>
                                </div>
                                <p className="text-xs text-blue-700">
                                  Her saat dilimi için araç seçimi ve araç sayısı belirleyebilirsiniz. 
                                  Araç seçimi zorunlu değildir ancak rezervasyon sırasında kullanılacaktır.
                                </p>
                              </div>
                            )}

                            {assignment.serviceCategory === "transfer" && (
                              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <Car className="h-4 w-4 text-green-600" />
                                  <span className="text-sm font-medium text-green-800">Transfer Ayarları</span>
                                </div>
                                <p className="text-xs text-green-700">
                                  Transfer hizmetleri için güzergah seçimi ve araç ataması yapın. Her saat dilimi için birden fazla araç tipi ekleyebilir ve adetlerini belirleyebilirsiniz. Araç kapasiteleri otomatik hesaplanır.
                                </p>
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


          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              İptal
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}