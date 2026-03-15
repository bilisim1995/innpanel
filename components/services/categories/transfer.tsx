"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Car,
  Route,
  Info,
  Camera,
  Clock,
  MapPin,
  DollarSign
} from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import { getVehicles, VehicleData } from "@/lib/vehicles";
import { getTransferPrices, TransferPriceData } from "@/lib/transfer-prices";
import dynamic from "next/dynamic";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface TransferProps {
  categoryDetails: any;
  onCategoryDetailsChange: (details: any) => void;
}

export function Transfer({ categoryDetails, onCategoryDetailsChange }: TransferProps) {
  const [transferPrices, setTransferPrices] = useState<TransferPriceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [routeDetails, setRouteDetails] = useState(categoryDetails?.routeDetails || {
    startPoint: "",
    endPoint: "",
    distance: "",
    duration: "",
  });
  const [vehicleDetails, setVehicleDetails] = useState(categoryDetails?.vehicleDetails || {
    baggageCapacity: "",
    features: "",
  });
  const [currency, setCurrency] = useState(categoryDetails?.currency || 'TRY'); // Para birimi alanı eklendi
  
  const initializePhotos = useCallback(() => {
    const existingPhotos = categoryDetails?.photos || [];
    const photoArray = [...existingPhotos];
    while (photoArray.length < 6) {
      photoArray.push(null);
    }
    return photoArray.slice(0, 6);
  }, [categoryDetails?.photos]);

  const [photos, setPhotos] = useState<Array<string | null>>(initializePhotos());
  const [selectedTransferPrice, setSelectedTransferPrice] = useState<string>(categoryDetails?.selectedTransferPrice || "");
  const [selectedTransferPriceData, setSelectedTransferPriceData] = useState<TransferPriceData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const transferPricesData = await getTransferPrices();
        setTransferPrices(transferPricesData.filter(tp => tp.isActive));
        
        if (categoryDetails?.selectedTransferPrice) {
          const selectedPrice = transferPricesData.find(tp => tp.id === categoryDetails.selectedTransferPrice);
          if (selectedPrice) {
            setSelectedTransferPriceData(selectedPrice);
            setRouteDetails({
              startPoint: selectedPrice.departurePoint,
              endPoint: selectedPrice.arrivalPoint,
              duration: selectedPrice.transferDuration.toString(),
              distance: categoryDetails.routeDetails?.distance || "",
            });
            // Para birimini buradan çek
            setCurrency(categoryDetails.currency || 'TRY'); 
          }
        }
      } catch (error) {
        console.error("Error loading transfer data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [categoryDetails]);

  useEffect(() => {
    if (selectedTransferPrice) {
      const selected = transferPrices.find(tp => tp.id === selectedTransferPrice);
      if (selected) {
        setSelectedTransferPriceData(selected);
        setRouteDetails((prev: any) => ({
          ...prev,
          startPoint: selected.departurePoint,
          endPoint: selected.arrivalPoint,
          duration: selected.transferDuration.toString(),
        }));
      }
    }
  }, [selectedTransferPrice, transferPrices]);

  useEffect(() => {
    onCategoryDetailsChange({
      selectedTransferPrice,
      routeDetails,
      vehicleDetails,
      photos: photos.filter(p => p !== null),
      currency, // Para birimini categoryDetails içine ekle
    });
  }, [selectedTransferPrice, routeDetails, vehicleDetails, photos, currency, onCategoryDetailsChange]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium flex items-center gap-2">
        <Car className="h-5 w-5" />
        Transfer Detayları
      </h3>

      <div>
        <Label className="flex items-center gap-2">
          <Route className="h-4 w-4" />
          Güzergah Seçimi
        </Label>
        <div className="space-y-2 mt-2">
          <Label>Kayıtlı Güzergah Seçin</Label>
          <Select value={selectedTransferPrice} onValueChange={setSelectedTransferPrice}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Güzergah seçin" />
            </SelectTrigger>
            <SelectContent>
              {transferPrices.map((tp) => (
                <SelectItem key={tp.id} value={tp.id!}>
                  {tp.departurePoint} → {tp.arrivalPoint} ({tp.transferDuration} dk)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Kayıtlı güzergah seçerseniz, kalkış ve varış noktaları otomatik doldurulur.
          </p>
          
          {selectedTransferPriceData && (
            <Card className="mt-4 bg-muted/30">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{routeDetails.startPoint}</span>
                    <span>→</span>
                    <span className="font-medium">{routeDetails.endPoint}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Süre: {routeDetails.duration} dakika</span>
                </div>
                
                {selectedTransferPriceData.vehiclePrices && (
                  <div className="space-y-1 pt-2 border-t">
                    <p className="text-sm font-medium">Araç Fiyatları:</p>
                    {selectedTransferPriceData.vehiclePrices.map((vp, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span>{vp.vehicleTypeName} ({vp.maxPassengerCapacity} kişi)</span>
                        <span className="font-medium">{vp.price} ₺</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div>
        <Label className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" /> {/* Icon eklendi */}
          Para Birimi
        </Label>
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

      <div>
        <Label className="flex items-center gap-2">
          <Info className="h-4 w-4" />
          Araç Özellikleri
        </Label>
        <div className="grid grid-cols-1 gap-4 mt-2">
          <div>
            <Label>Bagaj Kapasitesi</Label>
            <Input 
              type="number" 
              min="0" 
              placeholder="Bagaj sayısı" 
              className="mt-1.5"
              value={vehicleDetails.baggageCapacity}
              onChange={(e) => setVehicleDetails({...vehicleDetails, baggageCapacity: e.target.value})}
            />
          </div>
        </div>
        <div className="mt-4" data-color-mode="light">
          <MDEditor
            value={vehicleDetails.features || ""}
            onChange={(val) => setVehicleDetails({...vehicleDetails, features: val || ""})}
            preview="edit"
            height={250}
            textareaProps={{
              placeholder: "Araç özellikleri hakkında detaylı bilgi... (Markdown destekli)"
            }}
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
