"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Wind,
  Clock,
  Users,
  Mountain,
  Camera,
} from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";

interface BalloonProps {
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

export function Balloon({ selectedPayments, onPaymentChange, onPaymentAmountChange, categoryDetails, onCategoryDetailsChange }: BalloonProps) {
  const [flightInfo, setFlightInfo] = useState(categoryDetails?.flightInfo || {
    departurePoint: "",
    duration: "",
    minPassengers: "",
    maxPassengers: "",
    flightArea: "",
  });
  const [photos, setPhotos] = useState<Array<string | null>>(categoryDetails?.photos || [null, null, null]);

  // Update local state when categoryDetails changes
  useEffect(() => {
    if (categoryDetails?.flightInfo) {
      setFlightInfo(categoryDetails.flightInfo);
    }
    if (categoryDetails?.photos) {
      setPhotos(categoryDetails.photos);
    }
  }, [categoryDetails]);

  // Update category details when data changes
  useEffect(() => {
    onCategoryDetailsChange({
      flightInfo,
      photos,
    });
  }, [flightInfo, photos, onCategoryDetailsChange]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium flex items-center gap-2">
        <Wind className="h-5 w-5" />
        Sıcak Balon Detayları
      </h3>

      <div>
        <Label className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Uçuş Bilgileri
        </Label>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <Label>Kalkış Noktası</Label>
            <Input 
              placeholder="Örn: Balon Limanı" 
              className="mt-1.5"
              value={flightInfo.departurePoint}
              onChange={(e) => setFlightInfo({...flightInfo, departurePoint: e.target.value})}
            />
          </div>
          <div>
            <Label>Uçuş Süresi (dakika)</Label>
            <Input 
              type="number" 
              min="1" 
              className="mt-1.5"
              value={flightInfo.duration}
              onChange={(e) => setFlightInfo({...flightInfo, duration: e.target.value})}
              placeholder="Örn: 60"
            />
          </div>
        </div>
      </div>

      <div>
        <Label className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Sepet Kapasitesi
        </Label>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <Label>Minimum Yolcu</Label>
            <Input 
              type="number" 
              min="1" 
              className="mt-1.5"
              value={flightInfo.minPassengers}
              onChange={(e) => setFlightInfo({...flightInfo, minPassengers: e.target.value})}
            />
          </div>
          <div>
            <Label>Maksimum Yolcu</Label>
            <Input 
              type="number" 
              min="1" 
              className="mt-1.5"
              value={flightInfo.maxPassengers}
              onChange={(e) => setFlightInfo({...flightInfo, maxPassengers: e.target.value})}
            />
          </div>
        </div>
      </div>

      <div>
        <Label className="flex items-center gap-2">
          <Mountain className="h-4 w-4" />
          Uçuş Bölgesi
        </Label>
        <Textarea 
          placeholder="Uçuş rotası ve görülecek yerler hakkında bilgi..."
          className="mt-1.5"
          value={flightInfo.flightArea}
          onChange={(e) => setFlightInfo({...flightInfo, flightArea: e.target.value})}
        />
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