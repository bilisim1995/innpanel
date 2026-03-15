"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Wind,
  Clock,
  Users,
  Mountain,
  Camera,
} from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import dynamic from "next/dynamic";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface BalloonProps {
  selectedPayments: Array<{id: string, amount: string}>;
  onPaymentChange: (id: string, checked: boolean) => void;
  onPaymentAmountChange: (id: string, amount: string) => void;
  categoryDetails: any;
  onCategoryDetailsChange: (details: any) => void;
}

export function Balloon({ onCategoryDetailsChange, categoryDetails }: BalloonProps) {
  const [flightInfo, setFlightInfo] = useState(categoryDetails?.flightInfo || {
    departurePoint: "",
    duration: "",
    minPassengers: "",
    maxPassengers: "",
    flightArea: "",
  });

  const initializePhotos = useCallback(() => {
    const existingPhotos = categoryDetails?.photos || [];
    const photoArray = [...existingPhotos];
    while (photoArray.length < 6) {
      photoArray.push(null);
    }
    return photoArray.slice(0, 6);
  }, [categoryDetails?.photos]);

  const [photos, setPhotos] = useState<Array<string | null>>(initializePhotos());

  useEffect(() => {
    if (categoryDetails?.flightInfo) {
      setFlightInfo(categoryDetails.flightInfo);
    }
    setPhotos(initializePhotos());
  }, [categoryDetails, initializePhotos]);

  useEffect(() => {
    const newCategoryDetails = {
      flightInfo,
      photos: photos.filter(p => p !== null),
    };
    
    // Check if the new categoryDetails are different from the existing ones
    // before calling onCategoryDetailsChange to prevent infinite loop.
    const areFlightInfoEqual = JSON.stringify(newCategoryDetails.flightInfo) === JSON.stringify(categoryDetails?.flightInfo);
    const arePhotosEqual = JSON.stringify(newCategoryDetails.photos) === JSON.stringify(categoryDetails?.photos);

    if (!areFlightInfoEqual || !arePhotosEqual) {
      onCategoryDetailsChange(newCategoryDetails);
    }
  }, [flightInfo, photos, onCategoryDetailsChange, categoryDetails]);

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
        <div className="mt-1.5" data-color-mode="light">
          <MDEditor
            value={flightInfo.flightArea || ""}
            onChange={(val) => setFlightInfo({...flightInfo, flightArea: val || ""})}
            preview="edit"
            height={200}
            textareaProps={{ placeholder: "Uçuş rotası ve görülecek yerler hakkında bilgi... (Markdown destekli)" }}
          />
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