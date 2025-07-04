"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Camera,
} from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";

interface OtherProps {
  selectedPayments: Array<{id: string, amount: string}>;
  onPaymentChange: (id: string, checked: boolean) => void;
  onPaymentAmountChange: (id: string, amount: string) => void;
  categoryDetails: any;
  onCategoryDetailsChange: (details: any) => void;
}

const PAYMENT_OPTIONS = [
  { id: "cash", label: "Tur başlangıcında ödeme (nakit/kart)" },
  { id: "online", label: "Sanal POS ile ödeme" },
  { id: "partial", label: "Ön ödeme" },
];

export function Other({ selectedPayments, onPaymentChange, onPaymentAmountChange, categoryDetails, onCategoryDetailsChange }: OtherProps) {
  const [serviceTitle, setServiceTitle] = useState(categoryDetails?.serviceTitle || "");
  const [serviceDescription, setServiceDescription] = useState(categoryDetails?.serviceDescription || "");
  const [serviceDuration, setServiceDuration] = useState(categoryDetails?.serviceDuration || {
    value: "",
    unit: "",
  });
  const [photos, setPhotos] = useState<Array<string | null>>(categoryDetails?.photos || [null, null, null]);

  // Update local state when categoryDetails changes
  useEffect(() => {
    if (categoryDetails) {
      setServiceTitle(categoryDetails.serviceTitle || "");
      setServiceDescription(categoryDetails.serviceDescription || "");
      setServiceDuration(categoryDetails.serviceDuration || {
        value: "",
        unit: "",
      });
      setPhotos(categoryDetails.photos || [null, null, null]);
    }
  }, [categoryDetails]);

  // Update category details when data changes
  useEffect(() => {
    onCategoryDetailsChange({
      serviceTitle,
      serviceDescription,
      serviceDuration,
      photos,
    });
  }, [serviceTitle, serviceDescription, serviceDuration, photos, onCategoryDetailsChange]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Diğer Hizmet Detayları</h3>

      <div>
        <Label>Hizmet Başlığı</Label>
        <Input 
          placeholder="Örn: Özel Rehberlik Hizmeti" 
          className="mt-1.5"
          value={serviceTitle}
          onChange={(e) => setServiceTitle(e.target.value)}
        />
      </div>

      <div>
        <Label>Hizmet Açıklaması</Label>
        <Textarea 
          placeholder="Hizmet detayları hakkında bilgi..."
          className="mt-1.5"
          value={serviceDescription}
          onChange={(e) => setServiceDescription(e.target.value)}
        />
      </div>

      <div>
        <Label>Hizmet Süresi</Label>
        <div className="grid grid-cols-2 gap-4 mt-1.5">
          <Input 
            type="number" 
            placeholder="Süre"
            value={serviceDuration.value}
            onChange={(e) => setServiceDuration({...serviceDuration, value: e.target.value})}
          />
          <Select value={serviceDuration.unit} onValueChange={(value) => setServiceDuration({...serviceDuration, unit: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Birim" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hour">Saat</SelectItem>
              <SelectItem value="day">Gün</SelectItem>
              <SelectItem value="week">Hafta</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="flex items-center gap-2">
          <Camera className="h-4 w-4" />
          Fotoğraf Galerisi
        </Label>
        <div className="grid grid-cols-3 gap-4 mt-1.5">
          {photos.map((photo, index) => (
            <ImageUpload
              key={index}
              value={photo}
              onChange={(value) => {
                const newPhotos = [...photos];
                newPhotos[index] = value;
                setPhotos(newPhotos);
              }}
              folder="hizmetler"
              aspectRatio="square"
            />
          ))}
        </div>
      </div>
    </div>
  );
}