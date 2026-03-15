"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ImageUpload } from "@/components/ui/image-upload";
import { PhoneInput } from "@/components/ui/phone-input";
import { useToast } from "@/hooks/use-toast";
import { saveLocation, updateLocation, LocationData } from "@/lib/locations";
import { bunnyStorage } from "@/lib/bunny-storage";
import { 
  Building2, 
  MapPin,
  Phone,
  Mail,
  User,
  Clock,
  Calendar,
  Globe,
  FileText,
  Camera,
  Users,
  AlertCircle,
  PlusCircle,
  Edit3
} from "lucide-react";
import { createSlug } from "@/lib/utils";

const Map = dynamic(() => import("@/components/ui/map").then(mod => ({ default: mod.Map })), {
  ssr: false
});

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingLocation?: LocationData | null | undefined;
}

const STEPS = [
  { id: "basic", label: "Temel Bilgiler" },
  { id: "location", label: "Konum Bilgileri" },
  { id: "contact", label: "İletişim Bilgileri" },
  { id: "details", label: "Tesis Özellikleri" },
];

const FACILITY_TYPES = [
  { id: "hotel", label: "Otel" },
  { id: "cafe", label: "Cafe" },
  { id: "restaurant", label: "Restoran" },
  { id: "agency", label: "Acenta" },
  { id: "activity", label: "Aktivite Merkezi" },
  { id: "other", label: "Diğer" },
];

const SEASONS = [
  { id: "all-year", label: "Tüm Yıl" },
  { id: "summer", label: "Yaz Sezonu (Haziran-Ağustos)" },
  { id: "winter", label: "Kış Sezonu (Aralık-Şubat)" },
  { id: "spring-autumn", label: "Bahar Sezonu (Mart-Mayıs, Eylül-Kasım)" },
];

export function LocationModal({ isOpen, onClose, editingLocation }: LocationModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [customSlug, setCustomSlug] = useState("");
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    managerName: "",
    managerPhone: "",
    managerEmail: "",
    address: "",
    coordinates: [38.7436, 34.8478] as [number, number],
    phone: "",
    email: "",
    website: "",
    socialMedia: "",
    season: "",
    workingHours: { start: "", end: "" },
    shortDescription: "",
    fullDescription: "",
    isActive: true,
    maxCapacity: "",
    notes: "",
    facilityImage: null as string | null,
  });
  const [photos, setPhotos] = useState<Array<string | null>>([null, null, null, null, null]);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      type: "",
      managerName: "",
      managerPhone: "",
      managerEmail: "",
      address: "",
      coordinates: [38.7436, 34.8478],
      phone: "",
      email: "",
      website: "",
      socialMedia: "",
      season: "",
      workingHours: { start: "", end: "" },
      shortDescription: "",
      fullDescription: "",
      isActive: true,
      maxCapacity: "",
      notes: "",
      facilityImage: null,
    });
    setPhotos([null, null, null, null, null]);
    setCustomSlug("");
    setIsEditingSlug(false);
    setCurrentStep(0);
    setErrors({});
  }, []);

  useEffect(() => {
    if (editingLocation && isOpen) {
      setFormData({
        name: editingLocation.name,
        type: editingLocation.type,
        managerName: editingLocation.managerName,
        managerPhone: editingLocation.managerPhone,
        managerEmail: editingLocation.managerEmail,
        address: editingLocation.address,
        coordinates: editingLocation.coordinates,
        phone: editingLocation.phone,
        email: editingLocation.email,
        website: editingLocation.website,
        socialMedia: editingLocation.socialMedia,
        season: editingLocation.season,
        workingHours: editingLocation.workingHours,
        shortDescription: editingLocation.shortDescription,
        fullDescription: editingLocation.fullDescription,
        isActive: editingLocation.isActive,
        maxCapacity: editingLocation.maxCapacity,
        notes: editingLocation.notes,
        facilityImage: editingLocation.facilityImage || null,
      });
      setPhotos(editingLocation.photos || [null, null, null, null, null]);
      setCustomSlug(editingLocation.slug || "");
    } else if (!editingLocation && isOpen) {
      resetForm();
    }
  }, [editingLocation, isOpen, resetForm]);

  const getSlugPreview = useCallback(() => {
    if (isEditingSlug && customSlug) {
      return customSlug;
    }
    if (editingLocation?.slug) {
      return editingLocation.slug;
    }
    if (formData.name) {
      return createSlug(formData.name);
    }
    return "";
  }, [isEditingSlug, customSlug, editingLocation, formData.name]);

  const handleSlugEdit = () => {
    setIsEditingSlug(true);
    setCustomSlug(getSlugPreview());
  };

  const handleSlugSave = () => {
    if (customSlug.trim()) {
      setIsEditingSlug(false);
    }
  };

  const handleSlugCancel = () => {
    setIsEditingSlug(false);
    setCustomSlug(editingLocation?.slug || "");
  };

  const validateStep = () => {
    const newErrors: {[key: string]: string} = {};

    if (currentStep === 0) {
      if (!formData.name) newErrors.name = "Hizmet noktası adı zorunludur";
      if (!formData.type) newErrors.type = "Tesis türü seçimi zorunludur";
      if (!formData.managerName) newErrors.managerName = "Yetkili adı zorunludur";
      if (!formData.managerPhone) newErrors.managerPhone = "Yetkili telefonu zorunludur";
      if (!formData.managerEmail) newErrors.managerEmail = "Yetkili e-postası zorunludur";
    } else if (currentStep === 1) {
      if (!formData.address) newErrors.address = "Adres zorunludur";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep() && currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleLocationChange = (lat: number, lng: number, address: string) => {
    setFormData(prev => ({
      ...prev,
      coordinates: [lat, lng],
      address: address
    }));
  };

  const handlePhotoChange = async (index: number, value: string | null) => {
    try {
      const newPhotos = [...photos];
      newPhotos[index] = value;
      setPhotos(newPhotos);
    } catch (error) {
      console.error('Photo change error:', error);
      toast({
        title: "Hata",
        description: "Fotoğraf değiştirilirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsLoading(true);
    try {
      const finalSlug = isEditingSlug ? customSlug : getSlugPreview();
      
      const locationData: Omit<LocationData, 'id' | 'createdAt' | 'updatedAt'> = {
        ...formData,
        slug: finalSlug,
        photos: photos.filter(photo => photo !== null) as string[],
      };

      if (editingLocation && editingLocation.id) {
        await updateLocation(editingLocation.id, locationData);
        toast({
          title: "Başarılı",
          description: "Hizmet noktası güncellendi",
        });
      } else {
        await saveLocation(locationData);
        toast({
          title: "Başarılı",
          description: "Hizmet noktası eklendi",
        });
      }

      onClose();
    } catch (error) {
      toast({
        title: "Hata",
        description: "İşlem sırasında bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Hizmet Noktası Adı *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Örn: Göreme Balon Turu"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Tesis Türü *
                </Label>
                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                    <SelectValue placeholder="Tesis türünü seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {FACILITY_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="managerName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Yetkili Adı *
                </Label>
                <Input
                  id="managerName"
                  value={formData.managerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, managerName: e.target.value }))}
                  placeholder="Yetkili kişinin adı"
                  className={errors.managerName ? "border-red-500" : ""}
                />
                {errors.managerName && <p className="text-sm text-red-500">{errors.managerName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="managerPhone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Yetkili Telefonu *
                </Label>
                <PhoneInput
                  value={formData.managerPhone}
                  onChange={(value) => setFormData(prev => ({ ...prev, managerPhone: value }))}
                  className={errors.managerPhone ? "border-red-500" : ""}
                />
                {errors.managerPhone && <p className="text-sm text-red-500">{errors.managerPhone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="managerEmail" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Yetkili E-postası *
                </Label>
                <Input
                  id="managerEmail"
                  type="email"
                  value={formData.managerEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, managerEmail: e.target.value }))}
                  placeholder="yetkili@example.com"
                  className={errors.managerEmail ? "border-red-500" : ""}
                />
                {errors.managerEmail && <p className="text-sm text-red-500">{errors.managerEmail}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                URL Önizlemesi
              </Label>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">https://yoursite.com/services/</span>
                {isEditingSlug ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      value={customSlug}
                      onChange={(e) => setCustomSlug(e.target.value)}
                      placeholder="url-slug"
                    />
                    <Button size="sm" onClick={handleSlugSave} className="h-8">
                      Kaydet
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleSlugCancel} className="h-8">
                      İptal
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-sm font-medium">{getSlugPreview()}</span>
                    <Button size="sm" variant="outline" onClick={handleSlugEdit} className="h-8">
                      <Edit3 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Adres *
              </Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Tam adres bilgisi"
                className={errors.address ? "border-red-500" : ""}
                rows={3}
              />
              {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Harita Konumu
              </Label>
              <div className="h-64 rounded-lg overflow-hidden border">
                <Map
                  center={formData.coordinates}
                  zoom={13}
                  onLocationSelect={handleLocationChange}
                  markers={[{
                    position: formData.coordinates,
                    title: formData.name || "Konum"
                  }]}
                />
              </div>
              <p className="text-sm text-gray-600">
                Harita üzerinde doğru konumu işaretleyin
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Telefon
                </Label>
                <PhoneInput
                  value={formData.phone}
                  onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  E-posta
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="info@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Website
                </Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="socialMedia" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Sosyal Medya
                </Label>
                <Input
                  id="socialMedia"
                  value={formData.socialMedia}
                  onChange={(e) => setFormData(prev => ({ ...prev, socialMedia: e.target.value }))}
                  placeholder="Instagram, Facebook vb."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="season" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Sezon
                </Label>
                <Select value={formData.season} onValueChange={(value) => setFormData(prev => ({ ...prev, season: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Çalışma sezonu" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEASONS.map((season) => (
                      <SelectItem key={season.id} value={season.id}>
                        {season.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Çalışma Saatleri
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={formData.workingHours.start}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      workingHours: { ...prev.workingHours, start: e.target.value }
                    }))}
                    className="flex-1"
                  />
                  <span>-</span>
                  <Input
                    type="time"
                    value={formData.workingHours.end}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      workingHours: { ...prev.workingHours, end: e.target.value }
                    }))}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxCapacity" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Maksimum Kapasite
                </Label>
                <Input
                  id="maxCapacity"
                  value={formData.maxCapacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxCapacity: e.target.value }))}
                  placeholder="Örn: 50 kişi"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">Aktif</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Kısa Açıklama
              </Label>
              <Textarea
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                placeholder="Kısa tanıtım metni (1-2 cümle)"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullDescription" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Detaylı Açıklama
              </Label>
              <Textarea
                id="fullDescription"
                value={formData.fullDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, fullDescription: e.target.value }))}
                placeholder="Detaylı açıklama ve özellikler"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Notlar
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="İç notlar ve özel durumlar"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Tesis Fotoğrafı
              </Label>
              <div className="max-w-[120px]">
                <ImageUpload
                  value={formData.facilityImage}
                  onChange={(value) => setFormData(prev => ({ ...prev, facilityImage: value }))}
                  folder="hizmetnoktalari"
                  aspectRatio="square"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Bu fotoğraf hizmet sayfasında konum ikonu yerine görünecektir
              </p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Fotoğraflar
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {photos.map((photo, index) => (
                  <ImageUpload
                    key={index}
                    value={photo}
                    onChange={(value) => handlePhotoChange(index, value)}
                    folder="hizmetnoktalari"
                    className="aspect-square"
                  />
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="flex items-center gap-2">
          {editingLocation ? <Edit3 className="h-5 w-5" /> : <PlusCircle className="h-5 w-5" />}
          {editingLocation ? "Hizmet Noktası Düzenle" : "Yeni Hizmet Noktası"}
        </DialogTitle>

        <div className="flex items-center justify-between mb-6">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                index === currentStep
                  ? "bg-blue-100 text-blue-700"
                  : index < currentStep
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              )}
            >
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                  index === currentStep
                    ? "bg-blue-600 text-white"
                    : index < currentStep
                    ? "bg-green-600 text-white"
                    : "bg-gray-300 text-gray-600"
                )}
              >
                {index + 1}
              </div>
              {step.label}
            </div>
          ))}
        </div>

        <div className="min-h-[400px]">
          {renderStepContent()}
        </div>

        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            Geri
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              İptal
            </Button>
            
            {currentStep === STEPS.length - 1 ? (
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? "Kaydediliyor..." : editingLocation ? "Güncelle" : "Kaydet"}
              </Button>
            ) : (
              <Button onClick={handleNext}>
                İleri
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}