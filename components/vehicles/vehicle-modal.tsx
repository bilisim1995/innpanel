"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";
import { useToast } from "@/hooks/use-toast";
import { saveVehicle, updateVehicle, VehicleData } from "@/lib/vehicles";
import { 
  Car,
  Users,
  Camera,
  AlertCircle,
  PlusCircle,
  Edit3
} from "lucide-react";

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingVehicle?: VehicleData | null;
}

export function VehicleModal({ isOpen, onClose, editingVehicle }: VehicleModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    vehicleTypeName: "",
    maxPassengerCapacity: 1,
    isActive: true,
  });
  const [vehicleImages, setVehicleImages] = useState<Array<string | null>>([null, null, null]);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Load editing vehicle data when modal opens
  useEffect(() => {
    if (editingVehicle && isOpen) {
      setFormData({
        vehicleTypeName: editingVehicle.vehicleTypeName,
        maxPassengerCapacity: editingVehicle.maxPassengerCapacity,
        isActive: editingVehicle.isActive,
      });
      setVehicleImages(editingVehicle.vehicleImages || [null, null, null]);
    } else if (!editingVehicle && isOpen) {
      // Reset form for new vehicle
      resetForm();
    }
  }, [editingVehicle, isOpen]);

  const resetForm = () => {
    setFormData({
      vehicleTypeName: "",
      maxPassengerCapacity: 1,
      isActive: true,
    });
    setVehicleImages([null, null, null]);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.vehicleTypeName.trim()) {
      newErrors.vehicleTypeName = "Araç tipi adı zorunludur";
    }

    if (formData.maxPassengerCapacity < 1) {
      newErrors.maxPassengerCapacity = "Maksimum yolcu kapasitesi en az 1 olmalıdır";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const vehicleData = {
        vehicleTypeName: formData.vehicleTypeName.trim(),
        maxPassengerCapacity: formData.maxPassengerCapacity,
        vehicleImages: vehicleImages.filter(img => img !== null) as string[],
        isActive: formData.isActive,
      };

      if (editingVehicle?.id) {
        await updateVehicle(editingVehicle.id, vehicleData);
        toast({
          title: "Başarılı",
          description: "Araç başarıyla güncellendi",
        });
      } else {
        await saveVehicle(vehicleData);
        toast({
          title: "Başarılı",
          description: "Araç başarıyla eklendi",
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

  const handleImageChange = (index: number, value: string | null) => {
    const newImages = [...vehicleImages];
    newImages[index] = value;
    setVehicleImages(newImages);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="flex items-center gap-2">
          {editingVehicle ? <Edit3 className="h-5 w-5" /> : <PlusCircle className="h-5 w-5" />}
          {editingVehicle ? "Araç Düzenle" : "Yeni Araç Ekle"}
        </DialogTitle>

        <div className="space-y-6">
          {/* Temel Bilgiler */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Araç Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleTypeName" className="flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Araç Tipi Adı *
                </Label>
                <Input
                  id="vehicleTypeName"
                  value={formData.vehicleTypeName}
                  onChange={(e) => setFormData(prev => ({ ...prev, vehicleTypeName: e.target.value }))}
                  placeholder="Örn: Mercedes Sprinter, Volkswagen Crafter"
                  className={errors.vehicleTypeName ? "border-red-500" : ""}
                />
                {errors.vehicleTypeName && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.vehicleTypeName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxPassengerCapacity" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Maksimum Yolcu Kapasitesi *
                </Label>
                <Input
                  id="maxPassengerCapacity"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.maxPassengerCapacity}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    maxPassengerCapacity: parseInt(e.target.value) || 1 
                  }))}
                  className={errors.maxPassengerCapacity ? "border-red-500" : ""}
                />
                {errors.maxPassengerCapacity && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.maxPassengerCapacity}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label>Aktif Durum</Label>
                  <div className="text-sm text-muted-foreground">
                    Aracın aktif olup olmadığını belirler
                  </div>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Araç Resimleri */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Araç Resimleri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {vehicleImages.map((image, index) => (
                  <div key={index} className="space-y-2">
                    <Label className="text-sm font-medium">
                      Resim {index + 1}
                    </Label>
                    <ImageUpload
                      value={image}
                      onChange={(value) => handleImageChange(index, value)}
                      folder="arac"
                      aspectRatio="video"
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Araç resimlerini yükleyin. Resimler otomatik olarak &quot;arac&quot; klasörüne kaydedilecektir.
              </p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              İptal
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? (editingVehicle ? "Güncelleniyor..." : "Ekleniyor...") : (editingVehicle ? "Güncelle" : "Ekle")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}