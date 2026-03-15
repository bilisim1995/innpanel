"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Image as ImageIcon, Layers, Paintbrush, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getCategoryIcon, getCategoryIconOption } from "@/lib/category-icons";
import {
  CategoryColorSettings,
  CategoryDefinition,
  getCategoryColors,
  saveCategory,
  saveCategoryColor,
  updateCategory,
  updateCategoryColor,
  validateColor,
} from "@/lib/categories";
import { IconSetModal } from "./icon-set-modal";
import { ImageUpload } from "@/components/ui/image-upload";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCategory?: CategoryDefinition | null;
}

export function CategoryModal({ isOpen, onClose, editingCategory }: CategoryModalProps) {
  const COLOR_TYPES = [
    { id: "solid", label: "Duz Renk" },
    { id: "gradient", label: "Gradyan Renk" },
    { id: "rgb", label: "RGB Renk" },
    { id: "hex", label: "Hex Renk (#)" },
  ] as const;

  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isIconModalOpen, setIsIconModalOpen] = useState(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    slug: "",
    labelTr: "",
    labelEn: "",
    iconKey: "route",
    isActive: true,
    sortOrder: 1,
    colorType: "solid" as "solid" | "gradient" | "rgb" | "hex",
    primaryColor: "#dc2626",
    secondaryColor: "#ef4444",
    useImage: false,
    categoryImage: null as string | null,
  });

  useEffect(() => {
    const loadCategoryColor = async () => {
      const categoryKey = editingCategory?.slug || "";
      if (!categoryKey) return;
      try {
        const allColors = await getCategoryColors();
        const color = allColors.find((item) => item.categoryId === categoryKey);
        if (!color) return;
        setFormData((prev) => ({
          ...prev,
          colorType: color.colorType,
          primaryColor: color.primaryColor,
          secondaryColor: color.secondaryColor || "#ef4444",
          useImage: color.useImage || false,
          categoryImage: color.categoryImage || null,
        }));
      } catch (error) {
        console.error("Kategori rengi yuklenemedi:", error);
      }
    };

    if (!isOpen) return;

    if (editingCategory) {
      setFormData({
        slug: editingCategory.slug,
        labelTr: editingCategory.labels?.tr || "",
        labelEn: editingCategory.labels?.en || "",
        iconKey: editingCategory.iconKey || "route",
        isActive: editingCategory.isActive ?? true,
        sortOrder: editingCategory.sortOrder ?? 1,
        colorType: "solid",
        primaryColor: "#dc2626",
        secondaryColor: "#ef4444",
        useImage: false,
        categoryImage: null,
      });
      setErrors({});
      setActiveTab("general");
      loadCategoryColor();
      return;
    }

    setFormData({
      slug: "",
      labelTr: "",
      labelEn: "",
      iconKey: "route",
      isActive: true,
      sortOrder: 1,
      colorType: "solid",
      primaryColor: "#dc2626",
      secondaryColor: "#ef4444",
      useImage: false,
      categoryImage: null,
    });
    setErrors({});
    setActiveTab("general");
  }, [editingCategory, isOpen]);

  const IconPreview = useMemo(() => getCategoryIcon(formData.iconKey), [formData.iconKey]);
  const selectedIcon = useMemo(() => getCategoryIconOption(formData.iconKey), [formData.iconKey]);

  const normalizeSlug = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.slug.trim()) {
      nextErrors.slug = "Kategori ID zorunludur";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug.trim())) {
      nextErrors.slug = "Kategori ID sadece kucuk harf, rakam ve tire icerebilir";
    }

    if (!formData.labelTr.trim()) {
      nextErrors.labelTr = "Turkce ad zorunludur";
    }

    if (!formData.labelEn.trim()) {
      nextErrors.labelEn = "Ingilizce ad zorunludur";
    }

    if (!Number.isFinite(formData.sortOrder) || formData.sortOrder < 0) {
      nextErrors.sortOrder = "Siralama 0 veya buyuk olmali";
    }

    if (!formData.useImage && !validateColor(formData.primaryColor, formData.colorType)) {
      nextErrors.primaryColor = "Gecersiz renk formati";
    }

    if (!formData.useImage && formData.colorType === "gradient" && !validateColor(formData.secondaryColor, "solid")) {
      nextErrors.secondaryColor = "Gecersiz ikinci renk formati";
    }

    if (formData.useImage && !formData.categoryImage) {
      nextErrors.categoryImage = "Kategori resmi zorunludur";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const payload = {
        slug: formData.slug.trim(),
        labels: {
          tr: formData.labelTr.trim(),
          en: formData.labelEn.trim(),
        },
        iconKey: formData.iconKey,
        isActive: formData.isActive,
        sortOrder: Number(formData.sortOrder) || 0,
      };

      if (editingCategory?.id) {
        await updateCategory(editingCategory.id, payload);
      } else {
        await saveCategory(payload);
      }

      const allColors = await getCategoryColors();
      const existingColor = allColors.find((item) => item.categoryId === payload.slug);

      const colorPayload: Omit<CategoryColorSettings, "id" | "createdAt" | "updatedAt"> = {
        categoryId: payload.slug,
        categoryName: payload.labels.tr,
        colorType: formData.useImage ? "solid" : formData.colorType,
        primaryColor: formData.useImage ? "#dc2626" : formData.primaryColor,
        secondaryColor: formData.useImage ? undefined : formData.colorType === "gradient" ? formData.secondaryColor : undefined,
        useImage: formData.useImage,
        categoryImage: formData.useImage ? formData.categoryImage || undefined : undefined,
      };

      if (existingColor?.id) {
        await updateCategoryColor(existingColor.id, colorPayload);
      } else {
        await saveCategoryColor(colorPayload);
      }

      toast({
        title: "Basarili",
        description: editingCategory ? "Kategori guncellendi" : "Kategori olusturuldu",
      });

      onClose();
    } catch (error) {
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Kategori kaydedilemedi",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] p-0 gap-0">
        <div className="px-6 pt-6 pb-4 border-b">
        <DialogTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5" />
          {editingCategory ? "Kategori Duzenle" : "Yeni Kategori"}
        </DialogTitle>
        </div>

        <ScrollArea className="max-h-[calc(90vh-140px)] px-6 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">Genel Bilgiler</TabsTrigger>
            <TabsTrigger value="color">Tasarim Yonetimi</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="slug">Kategori ID (slug)</Label>
              <Input
                id="slug"
                placeholder="ornek: airport-transfer"
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: normalizeSlug(e.target.value) }))}
                disabled={!!editingCategory}
              />
              {errors.slug && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.slug}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="labelTr">Ad (TR)</Label>
                <Input
                  id="labelTr"
                  value={formData.labelTr}
                  onChange={(e) => setFormData((prev) => ({ ...prev, labelTr: e.target.value }))}
                />
                {errors.labelTr && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.labelTr}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="labelEn">Ad (EN)</Label>
                <Input
                  id="labelEn"
                  value={formData.labelEn}
                  onChange={(e) => setFormData((prev) => ({ ...prev, labelEn: e.target.value }))}
                />
                {errors.labelEn && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.labelEn}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ikon</Label>
                <button
                  type="button"
                  onClick={() => setIsIconModalOpen(true)}
                  className="w-full rounded-md border px-3 py-2 flex items-center justify-between hover:border-primary/50 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded border bg-background inline-flex items-center justify-center">
                      <IconPreview className="h-4 w-4" />
                    </span>
                    <span className="text-sm text-left">
                      <span className="block font-medium">{selectedIcon?.label || "Ikon secin"}</span>
                      <span className="block text-xs text-muted-foreground">{formData.iconKey}</span>
                    </span>
                  </span>
                  <Search className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sortOrder">Siralama</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  min={0}
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, sortOrder: Number(e.target.value || 0) }))
                  }
                />
                {errors.sortOrder && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.sortOrder}
                  </p>
                )}
              </div>
            </div>

            <div className="p-3 rounded-md border bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <IconPreview className="h-4 w-4" />
                Ikon onizleme
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm">Aktif</Label>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="color" className="space-y-4 mt-4">
            <div className="space-y-4 border rounded-lg p-4">
            <div>
              <h4 className="font-medium">Kategori Renk Ayari</h4>
              <p className="text-sm text-muted-foreground">
                Bu kategori icin gorunum ayarlarini yapilandirin
              </p>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">Gorunum Tipi</Label>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {formData.useImage ? (
                    <ImageIcon className="h-5 w-5 text-primary" />
                  ) : (
                    <Paintbrush className="h-5 w-5 text-primary" />
                  )}
                  <div>
                    <p className="font-medium">{formData.useImage ? "Resim Kullan" : "Renk Kullan"}</p>
                    <p className="text-sm text-muted-foreground">
                      {formData.useImage ? "Kategori icin resim kullanilacak" : "Kategori icin renk kullanilacak"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.useImage}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, useImage: checked }))}
                />
              </div>
            </div>

            {formData.useImage ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Kategori Resmi *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsImageViewerOpen(true)}
                    disabled={!formData.categoryImage}
                    className="flex items-center gap-1"
                  >
                    <Search className="h-4 w-4" />
                    Resmi Büyüt
                  </Button>
                </div>
                <ImageUpload
                  value={formData.categoryImage}
                  onChange={(value) => setFormData((prev) => ({ ...prev, categoryImage: value }))}
                  folder="hizmetler"
                  aspectRatio="video"
                  className="w-full"
                />
                {errors.categoryImage && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.categoryImage}
                  </p>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Renk Tipi</Label>
                  <Select
                    value={formData.colorType}
                    onValueChange={(value: "solid" | "gradient" | "rgb" | "hex") =>
                      setFormData((prev) => ({ ...prev, colorType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Renk tipi secin" />
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
                  <Label>{formData.colorType === "gradient" ? "Birinci Renk" : "Renk"}</Label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.primaryColor}
                      onChange={(e) => setFormData((prev) => ({ ...prev, primaryColor: e.target.value }))}
                    />
                    <input
                      type="color"
                      value={formData.primaryColor.startsWith("#") ? formData.primaryColor : "#dc2626"}
                      onChange={(e) => setFormData((prev) => ({ ...prev, primaryColor: e.target.value }))}
                      className="w-12 h-10 rounded border border-input cursor-pointer"
                    />
                  </div>
                  {errors.primaryColor && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.primaryColor}
                    </p>
                  )}
                </div>

                {formData.colorType === "gradient" && (
                  <div className="space-y-2">
                    <Label>Ikinci Renk</Label>
                    <div className="flex gap-2">
                      <Input
                        value={formData.secondaryColor}
                        onChange={(e) => setFormData((prev) => ({ ...prev, secondaryColor: e.target.value }))}
                      />
                      <input
                        type="color"
                        value={formData.secondaryColor.startsWith("#") ? formData.secondaryColor : "#ef4444"}
                        onChange={(e) => setFormData((prev) => ({ ...prev, secondaryColor: e.target.value }))}
                        className="w-12 h-10 rounded border border-input cursor-pointer"
                      />
                    </div>
                    {errors.secondaryColor && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.secondaryColor}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
          </TabsContent>
        </Tabs>
        </ScrollArea>

        <div className="flex justify-end gap-2 px-6 py-4 border-t bg-background">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Iptal
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Kaydediliyor..." : editingCategory ? "Guncelle" : "Kaydet"}
          </Button>
        </div>

        <IconSetModal
          isOpen={isIconModalOpen}
          onClose={() => setIsIconModalOpen(false)}
          selectedIconKey={formData.iconKey}
          onSelect={(iconKey) => {
            setFormData((prev) => ({ ...prev, iconKey }));
            setIsIconModalOpen(false);
          }}
        />
        <Dialog open={isImageViewerOpen} onOpenChange={setIsImageViewerOpen}>
          <DialogContent className="max-w-5xl w-[95vw]">
            <DialogTitle>Kategori Resmi</DialogTitle>
            <div className="w-full h-[70vh] rounded-md border bg-muted/20 flex items-center justify-center">
              {formData.categoryImage ? (
                <img
                  src={formData.categoryImage}
                  alt="Kategori resmi"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <p className="text-sm text-muted-foreground">Gosterilecek resim bulunamadi.</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}

