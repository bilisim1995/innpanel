"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CreditCard,
  Camera,
  CalendarDays,
  DollarSign // Eklenen icon
} from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";

interface RegionToursProps {
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

export function RegionTours({ selectedPayments, onPaymentChange, onPaymentAmountChange, categoryDetails, onCategoryDetailsChange }: RegionToursProps) {
  const [isVIP, setIsVIP] = useState(categoryDetails?.isVIP || false);
  
  // Ensure photo array is always 6 elements long
  const initializePhotos = () => {
    const existingPhotos = categoryDetails?.photos || [];
    const photoArray = [...existingPhotos];
    while (photoArray.length < 6) {
      photoArray.push(null);
    }
    return photoArray.slice(0, 6); // Ensure it's not more than 6
  };
  const [photos, setPhotos] = useState<Array<string | null>>(initializePhotos());

  const [tourInfo, setTourInfo] = useState(categoryDetails?.tourInfo || "");
  const [included, setIncluded] = useState(categoryDetails?.included || "");
  const [excluded, setExcluded] = useState(categoryDetails?.excluded || "");
  const [price, setPrice] = useState(categoryDetails?.price || ""); // Fiyat alanı eklendi
  const [currency, setCurrency] = useState(categoryDetails?.currency || 'TRY'); // Para birimi alanı eklendi

  // Update category details when data changes
  useEffect(() => {
    onCategoryDetailsChange({
      isVIP,
      photos: photos.filter(p => p !== null), // Save only non-null photos
      tourInfo,
      included,
      excluded,
      price, // Fiyatı categoryDetails içine ekle
      currency, // Para birimini categoryDetails içine ekle
    });
  }, [isVIP, photos, tourInfo, included, excluded, price, currency, onCategoryDetailsChange]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Bölge Turu Detayları</h3>
      
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="space-y-0.5">
          <Label>VIP Tur</Label>
          <div className="text-sm text-muted-foreground">
            VIP hizmetler ve özel araç tahsis edilir
          </div>
        </div>
        <Switch
          checked={isVIP}
          onCheckedChange={(checked) => setIsVIP(checked)}
        />
      </div>

      <div>
        <Label>Tur Bilgisi Açıklaması</Label>
        <Textarea 
          className="mt-1.5" 
          placeholder="Tur hakkında genel bilgiler..."
          value={tourInfo}
          onChange={(e) => setTourInfo(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Tura Dahil Olanlar</Label>
          <Textarea 
            className="mt-1.5" 
            placeholder="Tura dahil olan hizmetler..."
            value={included}
            onChange={(e) => setIncluded(e.target.value)}
          />
        </div>
        <div>
          <Label>Turda Hariç Olanlar</Label>
          <Textarea 
            className="mt-1.5" 
            placeholder="Tura dahil olmayan hizmetler..."
            value={excluded}
            onChange={(e) => setExcluded(e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" /> {/* Icon eklendi */}
          Fiyat
        </Label>
        <div className="grid grid-cols-2 gap-4 mt-1.5">
          <Input 
            type="number" 
            min="0" 
            placeholder="Fiyat girin"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <Select value={currency} onValueChange={(value: 'TRY' | 'USD' | 'EUR') => setCurrency(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Para birimi seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TRY">TRY</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="flex items-center gap-2">
          <Camera className="h-4 w-4" />
          Fotoğraf Galerisi (En fazla 6 adet)
        </Label>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-1.5">
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
