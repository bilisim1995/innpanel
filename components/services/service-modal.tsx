"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { 
  Building2, 
  MapPin, 
  Phone, 
  User, 
  Camera,
  AlertCircle,
  PlusCircle,
  Map,
  Bike,
  Wind,
  Car,
  MoreHorizontal,
  Languages
} from "lucide-react";
import { PhoneInput } from "@/components/ui/phone-input";
import { ImageUpload } from "@/components/ui/image-upload";
import { useToast } from "@/hooks/use-toast";
import { saveService, updateService, ServiceData } from "@/lib/services";
import { bunnyStorage } from "@/lib/bunny-storage";
import dynamic from "next/dynamic";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

// Import category components
import { RegionTours } from "./categories/region-tours";
import { MotorTours } from "./categories/motor-tours";
import { Balloon } from "./categories/balloon";
import { Transfer } from "./categories/transfer";
import { Other } from "./categories/other";

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingService?: ServiceData | null;
}

const STEPS = [
  { id: "general", label: "Genel Bilgiler" },
  { id: "details", label: "Kategori Detayları" },
  { id: "extras", label: "Ekstra Özellikler" },
];

const SERVICE_CATEGORIES = [
  { id: "region-tours", label: "Bölge Turları", icon: Map },
  { id: "motor-tours", label: "Aktiviteler", icon: Bike },
  { id: "balloon", label: "Sıcak Balon", icon: Wind },
  { id: "transfer", label: "Transfer", icon: Car },
  { id: "other", label: "Diğer", icon: MoreHorizontal },
];

export function ServiceModal({ isOpen, onClose, editingService }: ServiceModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    category: "",
    serviceName: "",
    companyName: "",
    companyAddress: "",
    contactNumber: "",
    manager: "",
    isActive: false,
    quota: "",
    coverImage: null as string | null,
    language: "tr", // Yeni dil alanı
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [categoryDetails, setCategoryDetails] = useState<any>({});
  const [notes, setNotes] = useState("");

  // Load editing service data when modal opens
  useEffect(() => {
    if (editingService && isOpen) {
      setFormData({
        category: editingService.category,
        serviceName: editingService.serviceName,
        companyName: editingService.companyName,
        companyAddress: editingService.companyAddress,
        contactNumber: editingService.contactNumber,
        manager: editingService.manager,
        isActive: editingService.isActive,
        quota: editingService.quota.toString(),
        coverImage: editingService.coverImage || null,
        language: editingService.language || "tr", // Dil alanını yükle
      });
      setCategoryDetails(editingService.categoryDetails || {});
      setNotes(editingService.notes || "");
    } else if (!editingService && isOpen) {
      // Reset form for new service
      resetForm();
    }
  }, [editingService, isOpen]);

  const resetForm = () => {
    setFormData({
      category: "",
      serviceName: "",
      companyName: "",
      companyAddress: "",
      contactNumber: "",
      manager: "",
      isActive: false,
      quota: "",
      coverImage: null,
      language: "tr", // Formu sıfırlarken dili de sıfırla
    });
    setCategoryDetails({});
    setNotes("");
    setCurrentStep(0);
    setErrors({});
  };

  const validateStep = () => {
    const newErrors: {[key: string]: string} = {};

    if (currentStep === 0) {
      if (!formData.language) newErrors.language = "Dil seçimi zorunludur"; // Dil alanı için doğrulama
      if (!formData.category) newErrors.category = "Kategori seçimi zorunludur";
      if (!formData.serviceName) newErrors.serviceName = "Hizmet adı zorunludur";
      if (!formData.companyName) newErrors.companyName = "Firma adı zorunludur";
      if (!formData.companyAddress) newErrors.companyAddress = "Firma adresi zorunludur";
      if (!formData.contactNumber) newErrors.contactNumber = "İletişim numarası zorunludur";
      if (!formData.manager) newErrors.manager = "Firma sorumlusu zorunludur";
      if (!formData.quota) {
        newErrors.quota = "Kontenjan sayısı zorunludur";
      } else if (parseInt(formData.quota) < 0) {
        newErrors.quota = "Kontenjan sayısı negatif olamaz";
      }
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

  const handleComplete = async () => {
    if (!validateStep()) {
      return;
    }

    setIsLoading(true);
    try {
      const serviceData = {
        category: formData.category,
        serviceName: formData.serviceName,
        companyName: formData.companyName,
        companyAddress: formData.companyAddress,
        contactNumber: formData.contactNumber,
        manager: formData.manager,
        isActive: formData.isActive,
        quota: parseInt(formData.quota) || 0,
        coverImage: formData.coverImage,
        paymentOptions: [],
        categoryDetails: categoryDetails,
        notes: notes,
        language: formData.language, // Dil alanını serviceData'ya ekle
      };

      if (editingService?.id) {
        await updateService(editingService.id, serviceData);
      } else {
        await saveService(serviceData);
      }
      
      toast({
        title: "Başarılı",
        description: editingService ? "Hizmet başarıyla güncellendi" : "Hizmet başarıyla kaydedildi",
      });

      // Reset form
      resetForm();
      
      onClose();
    } catch (error) {
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : editingService ? "Hizmet güncellenirken bir hata oluştu" : "Hizmet kaydedilirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuotaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || parseInt(value) >= 0) {
      setFormData({ ...formData, quota: value });
    }
  };

  const renderCategoryDetails = () => {
    const commonProps = {
      selectedPayments: [],
      onPaymentChange: () => {},
      onPaymentAmountChange: () => {},
      categoryDetails,
      onCategoryDetailsChange: setCategoryDetails,
    };

    switch (formData.category) {
      case "region-tours":
        return <RegionTours {...commonProps} />;
      case "motor-tours":
        return <MotorTours {...commonProps} />;
      case "balloon":
        return <Balloon {...commonProps} />;
      case "transfer":
        return <Transfer {...commonProps} />;
      case "other":
        return <Other {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0">
        <DialogTitle className="sr-only">Yeni Hizmet Oluştur</DialogTitle>
        <div className="flex h-[80vh]">
          {/* Sidebar */}
          <div className="w-64 bg-muted p-6 border-r">
            <div className="flex items-center gap-2 mb-6">
              <PlusCircle className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">{editingService ? "Hizmet Düzenle" : "Yeni Hizmet Oluştur"}</h2>
            </div>
            <div className="space-y-2">
              {STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-md transition-colors",
                    currentStep === index
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground",
                    index < currentStep && "text-primary"
                  )}
                >
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-sm border",
                      currentStep === index
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground",
                      index < currentStep && "bg-primary border-primary text-primary-foreground"
                    )}
                  >
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium">{step.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-6 overflow-y-auto">
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="language" className="flex items-center gap-2">
                      <Languages className="h-4 w-4" />
                      Dil
                    </Label>
                    <Select
                      value={formData.language}
                      onValueChange={(value) => setFormData({...formData, language: value})}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Dil seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tr">Türkçe</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.language && (
                      <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.language}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Hizmet Kategorisi</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({...formData, category: value})}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Kategori seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICE_CATEGORIES.map((category) => {
                          const Icon = category.icon;
                          return (
                            <SelectItem
                              key={category.id}
                              value={category.id}
                              className="flex items-center gap-2"
                            >
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                {category.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.category}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="service-name" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Hizmet Adı
                    </Label>
                    <Input 
                      id="service-name" 
                      placeholder="Örn: Kapadokya Balon Turu"
                      className="mt-1.5"
                      value={formData.serviceName}
                      onChange={(e) => setFormData({...formData, serviceName: e.target.value})}
                    />
                    {errors.serviceName && (
                      <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.serviceName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="company-name" className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Firma Adı
                      </Label>
                      <Input 
                        id="company-name" 
                        className="mt-1.5"
                        value={formData.companyName}
                        onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      />
                      {errors.companyName && (
                        <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.companyName}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="company-address" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Firma Adresi
                      </Label>
                      <Textarea 
                        id="company-address" 
                        className="mt-1.5"
                        value={formData.companyAddress}
                        onChange={(e) => setFormData({...formData, companyAddress: e.target.value})}
                      />
                      {errors.companyAddress && (
                        <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.companyAddress}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contact" className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          İletişim Numarası
                        </Label>
                        <div className="mt-1.5">
                          <PhoneInput
                            value={formData.contactNumber}
                            onChange={(value) => setFormData({...formData, contactNumber: value})}
                          />
                        </div>
                        {errors.contactNumber && (
                          <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.contactNumber}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="manager" className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Firma Sorumlusu
                        </Label>
                        <Input 
                          id="manager" 
                          className="mt-1.5"
                          value={formData.manager}
                          onChange={(e) => setFormData({...formData, manager: e.target.value})}
                        />
                        {errors.manager && (
                          <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.manager}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-0.5">
                          <Label>Satış Durumu</Label>
                          <div className="text-sm text-muted-foreground">
                            Hizmetin satışa açık olup olmadığını belirler
                          </div>
                        </div>
                        <Switch
                          checked={formData.isActive}
                          onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="quota">Kontenjan Sayısı</Label>
                        <Input 
                          type="number"
                          min="0"
                          id="quota" 
                          className="mt-1.5"
                          value={formData.quota}
                          onChange={handleQuotaChange}
                        />
                        {errors.quota && (
                          <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.quota}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        Kapak Fotoğrafı
                      </Label>
                      <ImageUpload
                        value={formData.coverImage}
                        onChange={(value) => setFormData({ ...formData, coverImage: value })}
                        folder="hizmetler"
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && renderCategoryDetails()}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Ekstra Özellikler</h3>
                  <div>
                    <Label htmlFor="notes">Özel Notlar</Label>
                    <div className="mt-1.5" data-color-mode="light">
                      <MDEditor
                        value={notes}
                        onChange={(val) => setNotes(val || "")}
                        preview="edit"
                        height={250}
                        textareaProps={{
                          placeholder: "Hizmet ile ilgili özel notlar... (Markdown destekli)"
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                Geri
              </Button>
              <Button
                onClick={currentStep === STEPS.length - 1 ? handleComplete : handleNext}
                disabled={isLoading}
              >
                {currentStep === STEPS.length - 1 
                  ? (isLoading ? (editingService ? "Güncelleniyor..." : "Kaydediliyor...") : "Tamamla") 
                  : "Devam Et"
                }
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}