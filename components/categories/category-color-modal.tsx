"use client";

import React from "react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { saveCategoryColor, updateCategoryColor, CategoryColorSettings, validateColor, getColorPreview } from "@/lib/categories";
import { Palette, Eye, AlertCircle, Image as ImageIcon, Paintbrush } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import { Switch } from "@/components/ui/switch";

interface CategoryColorModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingColor?: CategoryColorSettings | null;
  category: {
    id: string;
    name: string;
  };
}

const COLOR_TYPES = [
  { id: "solid", label: "Düz Renk" },
  { id: "gradient", label: "Gradyan Renk" },
  { id: "rgb", label: "RGB Renk" },
  { id: "hex", label: "Hex Renk (#)" },
];

export function CategoryColorModal({ isOpen, onClose, editingColor, category }: CategoryColorModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    colorType: "solid" as "solid" | "gradient" | "rgb" | "hex",
    primaryColor: "#dc2626",
    secondaryColor: "#ef4444",
    useImage: false,
    categoryImage: null as string | null,
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (editingColor && isOpen) {
      setFormData({
        colorType: editingColor.colorType,
        primaryColor: editingColor.primaryColor,
        secondaryColor: editingColor.secondaryColor || "#ef4444",
        useImage: editingColor.useImage || false,
        categoryImage: editingColor.categoryImage || null,
      });
    } else if (!editingColor && isOpen) {
      setFormData({
        colorType: "solid",
        primaryColor: "#dc2626",
        secondaryColor: "#ef4444",
        useImage: false,
        categoryImage: null,
      });
    }
  }, [editingColor, isOpen]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.useImage && !validateColor(formData.primaryColor, formData.colorType)) {
      newErrors.primaryColor = "Geçersiz renk formatı";
    }

    if (!formData.useImage && formData.colorType === "gradient" && formData.secondaryColor && !validateColor(formData.secondaryColor, "solid")) {
      newErrors.secondaryColor = "Geçersiz ikinci renk formatı";
    }

    if (formData.useImage && !formData.categoryImage) {
      newErrors.categoryImage = "Resim seçimi zorunludur";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const colorData: any = {
        categoryId: category.id,
        categoryName: category.name,
        useImage: formData.useImage,
      };

      if (formData.useImage) {
        colorData.categoryImage = formData.categoryImage;
        // Set default color values when using image
        colorData.colorType = "solid";
        colorData.primaryColor = "#dc2626";
      } else {
        colorData.colorType = formData.colorType;
        colorData.primaryColor = formData.primaryColor;
        
        // Only include secondaryColor if it's a gradient type
        if (formData.colorType === "gradient") {
          colorData.secondaryColor = formData.secondaryColor;
        }
      }

      if (editingColor?.id) {
        await updateCategoryColor(editingColor.id, colorData);
        toast({
          title: "Başarılı",
          description: "Kategori rengi güncellendi",
        });
      } else {
        await saveCategoryColor(colorData);
        toast({
          title: "Başarılı",
          description: "Kategori rengi kaydedildi",
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

  const getPreviewStyle = () => {
    if (formData.useImage && formData.categoryImage) {
      return {
        backgroundImage: `url(${formData.categoryImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }

    const mockColorSettings: CategoryColorSettings = {
      categoryId: category.id,
      categoryName: category.name,
      colorType: formData.colorType,
      primaryColor: formData.primaryColor,
      secondaryColor: formData.secondaryColor,
      useImage: formData.useImage,
      categoryImage: formData.categoryImage ?? undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const preview = getColorPreview(mockColorSettings);
    
    if (formData.colorType === "gradient") {
      return { background: preview };
    } else {
      return { backgroundColor: preview };
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          {editingColor ? "Kategori Rengini Düzenle" : "Yeni Kategori Rengi"}
        </DialogTitle>

        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-medium">{category.name}</h3>
            <p className="text-sm text-muted-foreground">Bu kategori için görünüm ayarlarını yapılandırın</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Form */}
            <div className="space-y-4">
              {/* Image vs Color Toggle */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Görünüm Tipi</Label>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {formData.useImage ? (
                      <ImageIcon className="h-5 w-5 text-primary" />
                    ) : (
                      <Paintbrush className="h-5 w-5 text-primary" />
                    )}
                    <div>
                      <p className="font-medium">
                        {formData.useImage ? "Resim Kullan" : "Renk Kullan"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formData.useImage 
                          ? "Kategori için özel resim kullanılacak" 
                          : "Kategori için renk kullanılacak"
                        }
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.useImage}
                    onCheckedChange={(checked) => setFormData({ ...formData, useImage: checked })}
                  />
                </div>
              </div>
              {/* Image Upload */}
              {formData.useImage ? (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Kategori Resmi *
                  </Label>
                  <ImageUpload
                    value={formData.categoryImage}
                    onChange={(value) => setFormData({ ...formData, categoryImage: value })}
                    folder="hizmetler"
                    aspectRatio="video"
                    className="w-full"
                  />
                  {errors.categoryImage && (
                    <div className="flex items-center gap-1 text-sm text-red-500">
                      <AlertCircle className="h-4 w-4" />
                      {errors.categoryImage}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Bu resim kategori butonlarının arka planında görünecektir
                  </p>
                </div>
              ) : (
                <>
                  {/* Color Settings */}
                  <div className="space-y-2">
                    <Label>Renk Tipi</Label>
                    <Select 
                      value={formData.colorType} 
                      onValueChange={(value: any) => setFormData({ ...formData, colorType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COLOR_TYPES.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">
                      {formData.colorType === "gradient" ? "Birinci Renk" : "Renk"}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        placeholder={
                          formData.colorType === "hex" ? "#ff0000" :
                          formData.colorType === "rgb" ? "rgb(255, 0, 0)" :
                          "red"
                        }
                        className={errors.primaryColor ? "border-red-500" : ""}
                      />
                      <input
                        type="color"
                        value={formData.primaryColor.startsWith('#') ? formData.primaryColor : '#dc2626'}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="w-12 h-10 rounded border border-input cursor-pointer"
                      />
                    </div>
                    {errors.primaryColor && (
                      <div className="flex items-center gap-1 text-sm text-red-500">
                        <AlertCircle className="h-4 w-4" />
                        {errors.primaryColor}
                      </div>
                    )}
                  </div>

                  {formData.colorType === "gradient" && (
                    <div className="space-y-2">
                      <Label htmlFor="secondaryColor">İkinci Renk</Label>
                      <div className="flex gap-2">
                        <Input
                          id="secondaryColor"
                          value={formData.secondaryColor}
                          onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                          placeholder="#00ff00"
                          className={errors.secondaryColor ? "border-red-500" : ""}
                        />
                        <input
                          type="color"
                          value={formData.secondaryColor.startsWith('#') ? formData.secondaryColor : '#ef4444'}
                          onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                          className="w-12 h-10 rounded border border-input cursor-pointer"
                        />
                      </div>
                      {errors.secondaryColor && (
                        <div className="flex items-center gap-1 text-sm text-red-500">
                          <AlertCircle className="h-4 w-4" />
                          {errors.secondaryColor}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Preview */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Önizleme
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div
                      className="w-full h-24 rounded-lg border-2 border-dashed border-gray-300"
                      style={getPreviewStyle()}
                    >
                      {formData.useImage && formData.categoryImage && (
                        <div className="w-full h-full flex items-center justify-center bg-black/20 rounded-lg">
                          <span className="text-white text-sm font-medium drop-shadow-lg">
                            {category.name}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p><strong>Tip:</strong> {formData.useImage ? "Resim" : COLOR_TYPES.find(t => t.id === formData.colorType)?.label}</p>
                      {formData.useImage ? (
                        <p><strong>Resim:</strong> {formData.categoryImage ? "Yüklendi" : "Seçilmedi"}</p>
                      ) : (
                        <>
                          <p><strong>Birinci Renk:</strong> {formData.primaryColor}</p>
                          {formData.colorType === "gradient" && (
                            <p><strong>İkinci Renk:</strong> {formData.secondaryColor}</p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              İptal
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Kaydediliyor..." : editingColor ? "Güncelle" : "Kaydet"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}