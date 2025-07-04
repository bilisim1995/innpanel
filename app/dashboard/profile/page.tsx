"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ImageUpload } from "@/components/ui/image-upload";
import { useToast } from "@/hooks/use-toast";
import { User, Lock, Mail, Shield, Palette, Plus, Edit, Trash2, Car, Phone } from "lucide-react";
import { DEFAULT_CATEGORIES, getCategoryColors, deleteCategoryColor, CategoryColorSettings, getColorPreview } from "@/lib/categories";
import { saveWhatsAppNumber, getWhatsAppNumber } from "@/lib/settings";
import { CategoryColorModal } from "@/components/categories/category-color-modal";
import { getVehicles, deleteVehicle, VehicleData } from "@/lib/vehicles";
import { VehicleModal } from "@/components/vehicles/vehicle-modal";
import { getTransferPrices, deleteTransferPrice, TransferPriceData } from "@/lib/transfer-prices";
import { TransferPriceModal } from "@/components/transfer-prices/transfer-price-modal";
import { CreditCard } from "lucide-react";

export default function ProfilePage() {
  const { user, updateUserProfile, changePassword } = useAuth();
  const { toast } = useToast();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [isUpdatingWhatsApp, setIsUpdatingWhatsApp] = useState(false);
  const [categoryColors, setCategoryColors] = useState<CategoryColorSettings[]>([]);
  const [loadingColors, setLoadingColors] = useState(true);
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [editingColor, setEditingColor] = useState<CategoryColorSettings | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<{id: string, name: string} | null>(null);
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleData | null>(null);
  const [transferPrices, setTransferPrices] = useState<TransferPriceData[]>([]);
  const [loadingTransferPrices, setLoadingTransferPrices] = useState(true);
  const [isTransferPriceModalOpen, setIsTransferPriceModalOpen] = useState(false);
  const [editingTransferPrice, setEditingTransferPrice] = useState<TransferPriceData | null>(null);
  
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Load user data when component mounts
  useEffect(() => {
    if (user?.displayName) {
      const nameParts = user.displayName.split(' ');
      setProfileData({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(' ') || "",
      });
    }
    // Load WhatsApp number from localStorage
    setWhatsappNumber(localStorage.getItem('whatsappNumber') || "");
  }, [user]);

  // Load category colors
  useEffect(() => {
    loadCategoryColors();
    loadWhatsAppNumber();
    loadVehicles();
    loadTransferPrices();
  }, []);

  const loadCategoryColors = async () => {
    try {
      setLoadingColors(true);
      const colors = await getCategoryColors();
      setCategoryColors(colors);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Kategori renkleri yüklenirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoadingColors(false);
    }
  };

  const loadWhatsAppNumber = async () => {
    try {
      const number = await getWhatsAppNumber();
      if (number) {
        setWhatsappNumber(number);
      }
    } catch (error) {
      console.error('Error loading WhatsApp number:', error);
    }
  };

  const loadVehicles = async () => {
    try {
      setLoadingVehicles(true);
      const vehiclesData = await getVehicles();
      setVehicles(vehiclesData);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Araçlar yüklenirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoadingVehicles(false);
    }
  };

  const loadTransferPrices = async () => {
    try {
      setLoadingTransferPrices(true);
      const transferPricesData = await getTransferPrices();
      setTransferPrices(transferPricesData);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Transfer fiyatları yüklenirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoadingTransferPrices(false);
    }
  };
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileData.firstName.trim()) {
      toast({
        title: "Hata",
        description: "Ad alanı boş bırakılamaz",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const fullName = `${profileData.firstName.trim()} ${profileData.lastName.trim()}`.trim();
      await updateUserProfile(fullName);

      toast({
        title: "Başarılı",
        description: "Profil bilgileriniz güncellendi",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Profil güncellenirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleWhatsAppSave = async () => {
    if (!whatsappNumber.trim()) {
      toast({
        title: "Hata",
        description: "WhatsApp numarası boş bırakılamaz",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingWhatsApp(true);
    try {
      await saveWhatsAppNumber(whatsappNumber.trim());
      toast({
        title: "Başarılı",
        description: "WhatsApp numarası başarıyla kaydedildi",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "WhatsApp numarası kaydedilirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingWhatsApp(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "Hata",
        description: "Tüm şifre alanları doldurulmalıdır",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Hata",
        description: "Yeni şifreler eşleşmiyor",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Hata",
        description: "Yeni şifre en az 6 karakter olmalıdır",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      // Clear password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      
      toast({
        title: "Başarılı",
        description: "Şifreniz başarıyla değiştirildi",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Şifre değiştirilirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };
  const handleAddColor = (categoryId: string, categoryName: string) => {
    setSelectedCategory({ id: categoryId, name: categoryName });
    setEditingColor(null);
    setIsColorModalOpen(true);
  };

  const handleEditColor = (color: CategoryColorSettings) => {
    setSelectedCategory({ id: color.categoryId, name: color.categoryName });
    setEditingColor(color);
    setIsColorModalOpen(true);
  };

  const handleDeleteColor = async (id: string) => {
    try {
      await deleteCategoryColor(id);
      toast({
        title: "Başarılı",
        description: "Kategori rengi silindi",
      });
      loadCategoryColors();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Kategori rengi silinirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  const handleColorModalClose = () => {
    setIsColorModalOpen(false);
    setEditingColor(null);
    setSelectedCategory(null);
    loadCategoryColors();
  };

  const handleAddVehicle = () => {
    setEditingVehicle(null);
    setIsVehicleModalOpen(true);
  };

  const handleEditVehicle = (vehicle: VehicleData) => {
    setEditingVehicle(vehicle);
    setIsVehicleModalOpen(true);
  };

  const handleDeleteVehicle = async (id: string) => {
    try {
      await deleteVehicle(id);
      toast({
        title: "Başarılı",
        description: "Araç silindi",
      });
      loadVehicles();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Araç silinirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  const handleVehicleModalClose = () => {
    setIsVehicleModalOpen(false);
    setEditingVehicle(null);
    loadVehicles();
  };

  const handleAddTransferPrice = () => {
    setEditingTransferPrice(null);
    setIsTransferPriceModalOpen(true);
  };

  const handleEditTransferPrice = (transferPrice: TransferPriceData) => {
    setEditingTransferPrice(transferPrice);
    setIsTransferPriceModalOpen(true);
  };

  const handleDeleteTransferPrice = async (id: string) => {
    try {
      await deleteTransferPrice(id);
      toast({
        title: "Başarılı",
        description: "Transfer fiyatı silindi",
      });
      loadTransferPrices();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Transfer fiyatı silinirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  const handleTransferPriceModalClose = () => {
    setIsTransferPriceModalOpen(false);
    setEditingTransferPrice(null);
    loadTransferPrices();
  };
  const getCategoryColorSettings = (categoryId: string) => {
    return categoryColors.find(color => color.categoryId === categoryId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ayarlar</h1>
        <p className="text-muted-foreground">Hesap ve sistem ayarlarınızı yönetin</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Güvenlik
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Kategori
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            Araç Yönetimi
          </TabsTrigger>
          <TabsTrigger value="transfer-pricing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Transfer-Fiyat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profil Fotoğrafı</CardTitle>
              <CardDescription>
                Profil fotoğrafınızı buradan güncelleyebilirsiniz
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-[200px]">
                <ImageUpload
                  value={profileImage}
                  onChange={(value) => setProfileImage(value)}
                  folder="profile"
                  aspectRatio="square"
                />
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleProfileSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Kişisel Bilgiler</CardTitle>
                <CardDescription>
                  Profil bilgilerinizi buradan güncelleyebilirsiniz
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Ad
                    </Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      placeholder="Adınızı girin"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Soyad
                    </Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      placeholder="Soyadınızı girin"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    E-posta
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    E-posta adresi değiştirilemez
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsappNumber" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    WhatsApp Telefon Numarası
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="whatsappNumber"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="WhatsApp numaranızı girin (örn: 5551234567)"
                      className="flex-1"
                    />
                    <Button onClick={handleWhatsAppSave} variant="outline">
                      {isUpdatingWhatsApp ? "Kaydediliyor..." : "Kaydet"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Bu numara, hizmet sayfalarındaki Bilgi Al WhatsApp butonunda kullanılacaktır
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isUpdatingProfile}>
                    {isUpdatingProfile ? "Güncelleniyor..." : "Profil Bilgilerini Güncelle"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <form onSubmit={handlePasswordSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Şifre Değiştir</CardTitle>
                <CardDescription>
                  Hesap güvenliğiniz için şifrenizi düzenli olarak değiştirmenizi öneririz
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Mevcut Şifre
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="Mevcut şifrenizi girin"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Yeni Şifre
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Yeni şifrenizi girin"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Yeni Şifre (Tekrar)
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Yeni şifrenizi tekrar girin"
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isChangingPassword}>
                    {isChangingPassword ? "Değiştiriliyor..." : "Şifreyi Değiştir"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>

          <Card>
            <CardHeader>
              <CardTitle>İki Faktörlü Doğrulama</CardTitle>
              <CardDescription>
                Hesabınızın güvenliğini artırmak için iki faktörlü doğrulamayı etkinleştirin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">İki Faktörlü Doğrulama</p>
                  <p className="text-sm text-muted-foreground">Şu anda devre dışı</p>
                </div>
                <Button variant="outline" disabled>
                  Yakında
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Kategori Renk Ayarları
              </CardTitle>
              <CardDescription>
                Hizmet kategorileri için renk tanımlamaları yapın. Bu renkler kategori kartlarında ve badgelerde kullanılacak.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Available Categories */}
                <div>
                  <h4 className="font-medium mb-4">Mevcut Kategoriler</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {DEFAULT_CATEGORIES.map((category) => {
                      const colorSettings = getCategoryColorSettings(category.id);
                      return (
                        <Card key={category.id} className="relative">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-medium">{category.label}</h5>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAddColor(category.id, category.label)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            {colorSettings ? (
                              <div className="space-y-2">
                                <div 
                                  className="w-full h-8 rounded border"
                                  style={
                                    colorSettings.colorType === "gradient" 
                                      ? { background: getColorPreview(colorSettings) }
                                      : { backgroundColor: getColorPreview(colorSettings) }
                                  }
                                />
                                <div className="flex items-center justify-between">
                                  <Badge variant="outline" className="text-xs">
                                    {colorSettings.colorType === "solid" ? "Düz" :
                                     colorSettings.colorType === "gradient" ? "Gradyan" :
                                     colorSettings.colorType === "rgb" ? "RGB" : "Hex"}
                                  </Badge>
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleEditColor(colorSettings)}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button size="sm" variant="ghost">
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Renk Ayarını Sil</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Bu kategori için renk ayarını silmek istediğinizden emin misiniz?
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>İptal</AlertDialogCancel>
                                          <AlertDialogAction 
                                            onClick={() => colorSettings.id && handleDeleteColor(colorSettings.id)}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                          >
                                            Sil
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <span className="font-medium">Tip:</span>
                                      <span className="ml-2">{colorSettings.useImage ? "Resim" : "Renk"}</span>
                                    </div>
                                    <div>
                                      <span className="font-medium">Durum:</span>
                                      <span className="ml-2">{colorSettings.useImage && colorSettings.categoryImage ? "Aktif" : "Varsayılan"}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-4">
                                <p className="text-sm text-muted-foreground mb-2">Renk tanımlanmamış</p>
                                <div className="w-full h-8 bg-gray-200 rounded border" />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* Color Settings Table */}
                {categoryColors.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-4">Renk Ayarları</h4>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Kategori</TableHead>
                            <TableHead>Renk Tipi</TableHead>
                            <TableHead>Görünüm</TableHead>
                            <TableHead>Detay</TableHead>
                            <TableHead>Önizleme</TableHead>
                            <TableHead className="text-right">İşlemler</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loadingColors ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8">
                                Yükleniyor...
                              </TableCell>
                            </TableRow>
                          ) : (
                            categoryColors.map((color) => (
                              <TableRow key={color.id}>
                                <TableCell className="font-medium">{color.categoryName}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {color.useImage ? "Resim" :
                                     color.colorType === "solid" ? "Düz" :
                                     color.colorType === "gradient" ? "Gradyan" :
                                     color.colorType === "rgb" ? "RGB" : "Hex"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {color.useImage && color.categoryImage ? (
                                    <div className="flex items-center gap-2">
                                      <div 
                                        className="w-6 h-6 rounded border bg-cover bg-center"
                                        style={{ backgroundImage: `url(${color.categoryImage})` }}
                                      />
                                      <span className="text-xs">Resim</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <div 
                                        className="w-6 h-6 rounded border"
                                        style={{ backgroundColor: color.primaryColor }}
                                      />
                                      <code className="text-xs">{color.primaryColor}</code>
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {color.useImage ? (
                                    <span className="text-xs text-muted-foreground">
                                      {color.categoryImage ? "Yüklendi" : "Seçilmedi"}
                                    </span>
                                  ) : color.secondaryColor ? (
                                    <div className="flex items-center gap-2">
                                      <div 
                                        className="w-6 h-6 rounded border"
                                        style={{ backgroundColor: color.secondaryColor }}
                                      />
                                      <code className="text-xs">{color.secondaryColor}</code>
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div 
                                    className="w-16 h-6 rounded border"
                                    style={color.useImage && color.categoryImage ? {
                                      backgroundImage: `url(${color.categoryImage})`,
                                      backgroundSize: 'cover',
                                      backgroundPosition: 'center'
                                    } : (
                                      color.colorType === "gradient" 
                                        ? { background: getColorPreview(color) }
                                        : { backgroundColor: getColorPreview(color) }
                                    )}
                                  />
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleEditColor(color)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Renk Ayarını Sil</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Bu renk ayarını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>İptal</AlertDialogCancel>
                                          <AlertDialogAction 
                                            onClick={() => color.id && handleDeleteColor(color.id)}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                          >
                                            Sil
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Araç Yönetimi
                </div>
                <Button onClick={handleAddVehicle}>
                  <Plus className="mr-2 h-4 w-4" />
                  Yeni Araç Ekle
                </Button>
              </CardTitle>
              <CardDescription>
                Transfer hizmetleri için araç tiplerini yönetin. Araç resimleri otomatik olarak arac klasörüne yüklenir.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Araç Tipi</TableHead>
                      <TableHead>Max. Yolcu</TableHead>
                      <TableHead>Resimler</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingVehicles ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          Yükleniyor...
                        </TableCell>
                      </TableRow>
                    ) : vehicles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          Henüz araç eklenmemiş
                        </TableCell>
                      </TableRow>
                    ) : (
                      vehicles.map((vehicle) => (
                        <TableRow key={vehicle.id}>
                          <TableCell className="font-medium">{vehicle.vehicleTypeName}</TableCell>
                          <TableCell>{vehicle.maxPassengerCapacity} kişi</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {vehicle.vehicleImages.slice(0, 3).map((image, index) => (
                                <div key={index} className="w-8 h-8 rounded border overflow-hidden">
                                  {image ? (
                                    <img 
                                      src={image} 
                                      alt={`${vehicle.vehicleTypeName} - ${index + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                      <Car className="w-3 h-3 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                              ))}
                              {vehicle.vehicleImages.length > 3 && (
                                <div className="w-8 h-8 rounded border bg-gray-100 flex items-center justify-center text-xs">
                                  +{vehicle.vehicleImages.length - 3}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={vehicle.isActive ? "default" : "secondary"}>
                              {vehicle.isActive ? "Aktif" : "Pasif"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditVehicle(vehicle)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Aracı Sil</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Bu aracı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>İptal</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => vehicle.id && handleDeleteVehicle(vehicle.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Sil
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfer-pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Transfer Fiyat Yönetimi
                </div>
                <Button onClick={handleAddTransferPrice}>
                  <Plus className="mr-2 h-4 w-4" />
                  Yeni Transfer Fiyatı Ekle
                </Button>
              </CardTitle>
              <CardDescription>
                Transfer hizmetleri için araç seçimi, güzergah ve fiyat tanımlamaları yapın.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kalkış Noktası</TableHead>
                      <TableHead>Varış Noktası</TableHead>
                      <TableHead>Süre</TableHead>
                      <TableHead>Araç ve Fiyatlar</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingTransferPrices ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Yükleniyor...
                        </TableCell>
                      </TableRow>
                    ) : transferPrices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Henüz transfer fiyatı eklenmemiş
                        </TableCell>
                      </TableRow>
                    ) : (
                      transferPrices.map((transferPrice) => (
                        <TableRow key={transferPrice.id}>
                          <TableCell>{transferPrice.departurePoint}</TableCell>
                          <TableCell>{transferPrice.arrivalPoint}</TableCell>
                          <TableCell>{transferPrice.transferDuration} dakika</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {transferPrice.vehiclePrices?.map((vp, index) => (
                                <div key={index} className="text-sm">
                                  <span className="font-medium">{vp.vehicleTypeName}</span>
                                  <span className="text-muted-foreground"> - {vp.price} ₺</span>
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={transferPrice.isActive ? "default" : "secondary"}>
                              {transferPrice.isActive ? "Aktif" : "Pasif"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditTransferPrice(transferPrice)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Transfer Fiyatını Sil</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Bu transfer fiyatını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>İptal</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => transferPrice.id && handleDeleteTransferPrice(transferPrice.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Sil
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {isColorModalOpen && selectedCategory && (
        <CategoryColorModal
          isOpen={isColorModalOpen}
          onClose={handleColorModalClose}
          category={selectedCategory}
          editingColor={editingColor}
        />
      )}

      {isVehicleModalOpen && (
        <VehicleModal
          isOpen={isVehicleModalOpen}
          onClose={handleVehicleModalClose}
          editingVehicle={editingVehicle}
        />
      )}

      {isTransferPriceModalOpen && (
        <TransferPriceModal
          isOpen={isTransferPriceModalOpen}
          onClose={handleTransferPriceModalClose}
          editingTransferPrice={editingTransferPrice}
          vehicles={vehicles.filter(v => v.isActive)}
        />
      )}
    </div>
  );
}