"use client";

import { useState, useEffect } from "react";
import { getVehicles, VehicleData } from "@/lib/vehicles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Clock,
  Route,
  Info,
  Car,
  Camera,
  DollarSign // Eklenen icon
} from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import dynamic from "next/dynamic";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface MotorToursProps {
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

export function MotorTours({ selectedPayments, onPaymentChange, onPaymentAmountChange, categoryDetails, onCategoryDetailsChange }: MotorToursProps) {
  const [routeDetails, setRouteDetails] = useState(categoryDetails?.routeDetails || {
    vehicleId: "",
    startPoint: "",
    endPoint: "",
    distance: "",
    duration: "",
  });
  const [tourDetails, setTourDetails] = useState(categoryDetails?.tourDetails || "");
  const [difficulty, setDifficulty] = useState(categoryDetails?.difficulty || "");
  const [minAge, setMinAge] = useState(categoryDetails?.minAge || "");
  const [price, setPrice] = useState(categoryDetails?.price || ""); // Fiyat alanı eklendi
  const [currency, setCurrency] = useState(categoryDetails?.currency || 'TRY'); // Para birimi alanı eklendi
  
  const initializePhotos = () => {
    const existingPhotos = categoryDetails?.photos || [];
    const photoArray = [...existingPhotos];
    while (photoArray.length < 6) {
      photoArray.push(null);
    }
    return photoArray.slice(0, 6);
  };
  const [photos, setPhotos] = useState<Array<string | null>>(initializePhotos());

  const [vehicles, setVehicles] = useState<VehicleData[]>([]);

  // Update category details when data changes
  useEffect(() => {
    onCategoryDetailsChange({
      routeDetails,
      tourDetails,
      difficulty,
      minAge,
      photos: photos.filter(p => p !== null),
      price, // Fiyatı categoryDetails içine ekle
      currency, // Para birimini categoryDetails içine ekle
    });
  }, [routeDetails, tourDetails, difficulty, minAge, photos, price, currency, onCategoryDetailsChange]);

  // Load vehicles
  useEffect(() => {
    const loadVehicles = async () => {
      const vehiclesData = await getVehicles();
      setVehicles(vehiclesData.filter(v => v.isActive));
    };
    
    loadVehicles();
  }, []);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium flex items-center gap-2">
        <Route className="h-5 w-5" />
        Aktivite Detayları
      </h3>

      <div>
        <Label className="flex items-center gap-2">
          <Route className="h-4 w-4" />
          Rota Bilgileri
        </Label>
        <div className="space-y-2 mt-2">
          <Label>Araç Tipi</Label>
          <Select 
            value={routeDetails.vehicleId} 
            onValueChange={(value) => {
              setRouteDetails({...routeDetails, vehicleId: value});
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Araç tipi seçin" />
            </SelectTrigger>
            <SelectContent>
              {vehicles.map((vehicle) => (
                <SelectItem key={vehicle.id} value={vehicle.id!}>
                  {vehicle.vehicleTypeName} ({vehicle.maxPassengerCapacity} kişi)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <Label>Başlangıç Noktası</Label>
            <Input 
              placeholder="Örn: Otel Önü"
              value={routeDetails.startPoint}
              onChange={(e) => {
                setRouteDetails({...routeDetails, startPoint: e.target.value});
              }}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Bitiş Noktası</Label>
            <Input 
              placeholder="Örn: Şehir Merkezi"
              value={routeDetails.endPoint}
              onChange={(e) => {
                setRouteDetails({...routeDetails, endPoint: e.target.value});
              }}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Mesafe (km)</Label>
            <Input 
              type="number"
              value={routeDetails.distance}
              onChange={(e) => {
                setRouteDetails({...routeDetails, distance: e.target.value});
              }}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Süre (dakika)</Label>
            <Input 
              type="number"
              min="1"
              value={routeDetails.duration}
              onChange={(e) => {
                setRouteDetails({...routeDetails, duration: e.target.value});
              }}
              className="mt-1.5"
              placeholder="Örn: 120"
            />
          </div>
        </div>
      </div>

      <div>
        <Label className="flex items-center gap-2">
          <Info className="h-4 w-4" />
          Tur Detayları
        </Label>
        <div className="space-y-4 mt-2">
          <div data-color-mode="light">
            <MDEditor
              value={tourDetails}
              onChange={(val) => setTourDetails(val || "")}
              preview="edit"
              height={200}
              textareaProps={{ placeholder: "Tur güzergahı ve duraklar hakkında bilgi... (Markdown destekli)" }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Zorluk Seviyesi</Label>
              <Select value={difficulty} onValueChange={(value) => setDifficulty(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Kolay</SelectItem>
                  <SelectItem value="medium">Orta</SelectItem>
                  <SelectItem value="hard">Zor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Minimum Katılımcı Yaşı</Label>
              <Input 
                type="number" 
                min="0" 
                className="mt-1.5"
                value={minAge}
                onChange={(e) => setMinAge(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <Label className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
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
