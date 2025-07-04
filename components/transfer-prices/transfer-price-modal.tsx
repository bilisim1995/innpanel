"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { saveTransferPrice, updateTransferPrice, TransferPriceData, VehiclePrice } from "@/lib/transfer-prices";
import { VehicleData } from "@/lib/vehicles";
import { 
  Car,
  MapPin,
  Clock,
  CreditCard,
  AlertCircle,
  PlusCircle,
  Edit3,
  Route,
  Plus,
  Trash2,
  Users
} from "lucide-react";

interface TransferPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTransferPrice?: TransferPriceData | null;
  vehicles: VehicleData[];
}

export function TransferPriceModal({ isOpen, onClose, editingTransferPrice, vehicles }: TransferPriceModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [routeData, setRouteData] = useState({
    departurePoint: "",
    arrivalPoint: "",
    transferDuration: 60, // Default 60 minutes
  });
  const [vehiclePrices, setVehiclePrices] = useState<VehiclePrice[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Load editing transfer price data when modal opens
  useEffect(() => {
    if (editingTransferPrice && isOpen) {
      setRouteData({
        departurePoint: editingTransferPrice.departurePoint,
        arrivalPoint: editingTransferPrice.arrivalPoint,
        transferDuration: editingTransferPrice.transferDuration,
      });
      
      setVehiclePrices(editingTransferPrice.vehiclePrices || []);
      setIsActive(editingTransferPrice.isActive);
    } else if (!editingTransferPrice && isOpen) {
      // Reset form for new transfer price
      resetForm();
    }
  }, [editingTransferPrice, isOpen, vehicles]);

  const resetForm = () => {
    setRouteData({
      departurePoint: "",
      arrivalPoint: "",
      transferDuration: 60,
    });
    setVehiclePrices([]);
    setIsActive(true);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!routeData.departurePoint.trim()) {
      newErrors.departurePoint = "Kalkış noktası zorunludur";
    }

    if (!routeData.arrivalPoint.trim()) {
      newErrors.arrivalPoint = "Varış noktası zorunludur";
    }

    if (routeData.departurePoint.trim().toLowerCase() === routeData.arrivalPoint.trim().toLowerCase()) {
      newErrors.arrivalPoint = "Varış noktası kalkış noktasından farklı olmalıdır";
    }

    if (routeData.transferDuration < 1) {
      newErrors.transferDuration = "Transfer süresi en az 1 dakika olmalıdır";
    }

    if (vehiclePrices.length === 0) {
      newErrors.vehicles = "En az bir araç ve fiyat eklemelisiniz";
    }

    const hasInvalidPrice = vehiclePrices.some(vp => vp.price < 0);
    if (hasInvalidPrice) {
      newErrors.prices = "Fiyatlar negatif olamaz";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addVehiclePrice = () => {
    // Find vehicles that haven't been added yet
    const availableVehicles = vehicles.filter(v => 
      !vehiclePrices.some(vp => vp.vehicleId === v.id)
    );

    if (availableVehicles.length === 0) {
      toast({
        title: "Bilgi",
        description: "Tüm araçlar zaten eklenmiş",
      });
      return;
    }

    // Add the first available vehicle
    const vehicle = availableVehicles[0];
    const newVehiclePrice: VehiclePrice = {
      vehicleId: vehicle.id!,
      vehicleTypeName: vehicle.vehicleTypeName,
      maxPassengerCapacity: vehicle.maxPassengerCapacity,
      price: 0
    };
    
    setVehiclePrices(prev => [...prev, newVehiclePrice]);
  };

  const removeVehiclePrice = (vehicleId: string) => {
    setVehiclePrices(prev => prev.filter(vp => vp.vehicleId !== vehicleId));
  };

  const updateVehiclePrice = (vehicleId: string, price: number) => {
    setVehiclePrices(prev => prev.map(vp => 
      vp.vehicleId === vehicleId ? { ...vp, price } : vp
    ));
  };

  const changeVehicle = (oldVehicleId: string, newVehicleId: string) => {
    const newVehicle = vehicles.find(v => v.id === newVehicleId);
    if (!newVehicle) {
      toast({
        title: "Hata",
        description: "Seçilen araç bulunamadı",
        variant: "destructive",
      });
      return;
    }

    setVehiclePrices(prev => prev.map(vp => 
      vp.vehicleId === oldVehicleId ? {
        vehicleId: newVehicleId,
        vehicleTypeName: newVehicle.vehicleTypeName,
        maxPassengerCapacity: newVehicle.maxPassengerCapacity,
        price: vp.price // Keep the existing price
      } : vp
    ));
  };

  const getAvailableVehicles = (currentVehicleId?: string) => {
    return vehicles.filter(v => 
      v.id === currentVehicleId || !vehiclePrices.some(vp => vp.vehicleId === v.id)
    );
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const transferPriceData = {
        departurePoint: routeData.departurePoint.trim(),
        arrivalPoint: routeData.arrivalPoint.trim(),
        transferDuration: routeData.transferDuration,
        vehiclePrices: vehiclePrices,
        isActive: isActive,
      };

      if (editingTransferPrice?.id) {
        await updateTransferPrice(editingTransferPrice.id, transferPriceData);
        toast({
          title: "Başarılı",
          description: "Transfer fiyatı başarıyla güncellendi",
        });
      } else {
        await saveTransferPrice(transferPriceData);
        toast({
          title: "Başarılı",
          description: `${vehiclePrices.length} araç ile transfer fiyatı başarıyla eklendi`,
        });
      }

      onClose();
    } catch (error) {
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "İşlem sırasında bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="flex items-center gap-2">
          {editingTransferPrice ? <Edit3 className="h-5 w-5" /> : <PlusCircle className="h-5 w-5" />}
          {editingTransferPrice ? "Transfer Fiyatını Düzenle" : "Yeni Transfer Fiyatı Ekle"}
        </DialogTitle>

        <div className="space-y-6">
          {/* Route Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="h-5 w-5" />
                Güzergah Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departurePoint" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Kalkış Noktası *
                  </Label>
                  <Input
                    id="departurePoint"
                    value={routeData.departurePoint}
                    onChange={(e) => setRouteData(prev => ({ ...prev, departurePoint: e.target.value }))}
                    placeholder="Örn: Nevşehir Havalimanı"
                    className={errors.departurePoint ? "border-red-500" : ""}
                  />
                  {errors.departurePoint && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.departurePoint}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="arrivalPoint" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Varış Noktası *
                  </Label>
                  <Input
                    id="arrivalPoint"
                    value={routeData.arrivalPoint}
                    onChange={(e) => setRouteData(prev => ({ ...prev, arrivalPoint: e.target.value }))}
                    placeholder="Örn: Göreme"
                    className={errors.arrivalPoint ? "border-red-500" : ""}
                  />
                  {errors.arrivalPoint && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.arrivalPoint}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transferDuration" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Transfer Süresi (Dakika) *
                </Label>
                <Input
                  id="transferDuration"
                  type="number"
                  min="1"
                  max="1440"
                  value={routeData.transferDuration}
                  onChange={(e) => setRouteData(prev => ({ 
                    ...prev, 
                    transferDuration: parseInt(e.target.value) || 1 
                  }))}
                  className={errors.transferDuration ? "border-red-500" : ""}
                />
                {errors.transferDuration && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.transferDuration}
                  </p>
                )}
              </div>

              {/* Route Summary */}
              {routeData.departurePoint && routeData.arrivalPoint && (
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Route className="h-4 w-4 text-primary" />
                        <span className="font-medium">{routeData.departurePoint}</span>
                        <span>→</span>
                        <span className="font-medium">{routeData.arrivalPoint}</span>
                      </div>
                      <Badge variant="outline">
                        {routeData.transferDuration} dakika
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Vehicle Prices */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Araç ve Fiyatlar
                </div>
                <Button 
                  onClick={addVehiclePrice}
                  size="sm"
                  disabled={vehiclePrices.length >= vehicles.length}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Araç Ekle
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {errors.vehicles && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.vehicles}
                </p>
              )}
              {errors.prices && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.prices}
                </p>
              )}
              
              {vehiclePrices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Henüz araç eklenmemiş</p>
                  <p className="text-sm">Araç eklemek için yukarıdaki butonu kullanın</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {vehiclePrices.map((vehiclePrice, index) => (
                    <Card key={`${vehiclePrice.vehicleId}-${index}`} className="border-2">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                          <div className="space-y-2">
                            <Label>Araç Tipi</Label>
                            <Select 
                              value={vehiclePrice.vehicleId}
                              onValueChange={(value) => changeVehicle(vehiclePrice.vehicleId, value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {getAvailableVehicles(vehiclePrice.vehicleId).map((vehicle) => (
                                  <SelectItem key={vehicle.id} value={vehicle.id!}>
                                    <div className="flex items-center gap-2">
                                      <Car className="h-4 w-4" />
                                      <span>{vehicle.vehicleTypeName}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Kapasite</Label>
                            <div className="flex items-center gap-2 p-2 border rounded">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{vehiclePrice.maxPassengerCapacity} kişi</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Fiyat (₺)</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={vehiclePrice.price}
                              onChange={(e) => updateVehiclePrice(
                                vehiclePrice.vehicleId, 
                                parseFloat(e.target.value) || 0
                              )}
                              placeholder="0.00"
                            />
                          </div>

                          <div className="flex justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeVehiclePrice(vehiclePrice.vehicleId)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Status */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Aktif Durum</Label>
                  <div className="text-sm text-muted-foreground">
                    Transfer fiyatının aktif olup olmadığını belirler
                  </div>
                </div>
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              İptal
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? (editingTransferPrice ? "Güncelleniyor..." : "Kaydediliyor...") : (editingTransferPrice ? "Güncelle" : "Kaydet")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}