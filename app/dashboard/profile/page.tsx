"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
import { User, Lock, Mail, Shield, Palette, Plus, Edit, Trash2, Car, Phone, CreditCard, Bell } from "lucide-react";
import {
  CategoryDefinition,
  CategoryColorSettings,
  getCategories,
  getCategoryColors,
  getColorPreview,
  deleteCategory,
} from "@/lib/categories";
import {
  saveWhatsAppNumber,
  getWhatsAppNumber,
  saveNotificationEmail,
  getNotificationEmail,
  saveWhatsAppNotificationNumber,
  getWhatsAppNotificationNumber
} from "@/lib/settings";
import { getVehicles, deleteVehicle, VehicleData } from "@/lib/vehicles";
import { VehicleModal } from "@/components/vehicles/vehicle-modal";
import { getTransferPrices, deleteTransferPrice, TransferPriceData } from "@/lib/transfer-prices";
import { TransferPriceModal } from "@/components/transfer-prices/transfer-price-modal";
import { CategoryModal } from "@/components/categories/category-modal";
import { getCategoryIcon } from "@/lib/category-icons";

export default function ProfilePage() {
  const { user, updateUserProfile, changePassword } = useAuth();
  const { toast } = useToast();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // System Settings State
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [isUpdatingWhatsApp, setIsUpdatingWhatsApp] = useState(false);
  const [notificationEmail, setNotificationEmail] = useState("");
  const [isUpdatingNotificationEmail, setIsUpdatingNotificationEmail] = useState(false);
  const [whatsappNotificationNumber, setWhatsappNotificationNumber] = useState("");
  const [isUpdatingWhatsAppNotification, setIsUpdatingWhatsAppNotification] = useState(false);

  // Category Colors State
  const [categories, setCategories] = useState<CategoryDefinition[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDefinition | null>(null);
  const [categoryDesigns, setCategoryDesigns] = useState<Record<string, CategoryColorSettings>>({});
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Vehicle Management State
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleData | null>(null);

  // Transfer Pricing State
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

  useEffect(() => {
    if (user?.displayName) {
      const nameParts = user.displayName.split(' ');
      setProfileData({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(' ') || "",
      });
    }
  }, [user]);

  const loadCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      const fetchedCategories = await getCategories();
      const sorted = [...fetchedCategories].sort((a, b) => a.sortOrder - b.sortOrder);
      setCategories(sorted);
    } catch (error) {
      toast({ title: "Hata", description: "Kategoriler yuklenirken bir hata olustu", variant: "destructive" });
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  }, [toast]);

  const loadCategoryDesigns = useCallback(async () => {
    try {
      const colorRows = await getCategoryColors();
      const designMap: Record<string, CategoryColorSettings> = {};
      colorRows.forEach((row) => {
        if (!row.categoryId) return;
        if (!designMap[row.categoryId]) {
          designMap[row.categoryId] = row;
        }
      });
      setCategoryDesigns(designMap);
    } catch (error) {
      setCategoryDesigns({});
    }
  }, []);

  const loadWhatsAppNumber = useCallback(async () => {
    try {
      const number = await getWhatsAppNumber();
      if (number) setWhatsappNumber(number);
    } catch (error) {
      console.error('Error loading WhatsApp number:', error);
    }
  },[]);
  
  const loadNotificationEmail = useCallback(async () => {
    try {
      const email = await getNotificationEmail();
      if (email) setNotificationEmail(email);
    } catch (error) {
      console.error('Error loading notification email:', error);
    }
  },[]);

  const loadWhatsAppNotificationNumber = useCallback(async () => {
    try {
      const number = await getWhatsAppNotificationNumber();
      if (number) setWhatsappNotificationNumber(number);
    } catch (error) {
      console.error('Error loading WhatsApp notification number:', error);
    }
  },[]);

  const loadVehicles = useCallback(async () => {
    try {
      setLoadingVehicles(true);
      const vehiclesData = await getVehicles();
      setVehicles(vehiclesData);
    } catch (error) {
      toast({ title: "Hata", description: "Araçlar yüklenirken bir hata oluştu", variant: "destructive" });
    } finally {
      setLoadingVehicles(false);
    }
  },[toast]);
  
  const loadTransferPrices = useCallback(async () => {
    try {
      setLoadingTransferPrices(true);
      const transferPricesData = await getTransferPrices();
      setTransferPrices(transferPricesData);
    } catch (error) {
      toast({ title: "Hata", description: "Transfer fiyatları yüklenirken bir hata oluştu", variant: "destructive" });
    } finally {
      setLoadingTransferPrices(false);
    }
  },[toast]);

  useEffect(() => {
    loadCategories();
    loadCategoryDesigns();
    loadWhatsAppNumber();
    loadNotificationEmail();
    loadWhatsAppNotificationNumber();
    loadVehicles();
    loadTransferPrices();
  }, [loadCategories, loadCategoryDesigns, loadWhatsAppNumber, loadNotificationEmail, loadWhatsAppNotificationNumber, loadVehicles, loadTransferPrices]);

  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (category: CategoryDefinition) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      toast({ title: "Basarili", description: "Kategori silindi" });
      loadCategories();
    } catch (error) {
      toast({ title: "Hata", description: "Kategori silinirken bir hata olustu", variant: "destructive" });
    }
  };

  const handleCategoryModalClose = () => {
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
    loadCategories();
    loadCategoryDesigns();
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData.firstName.trim()) {
      toast({ title: "Hata", description: "Ad alanı boş bırakılamaz", variant: "destructive" });
      return;
    }
    setIsUpdatingProfile(true);
    try {
      const fullName = `${profileData.firstName.trim()} ${profileData.lastName.trim()}`.trim();
      await updateUserProfile(fullName);
      toast({ title: "Başarılı", description: "Profil bilgileriniz güncellendi" });
    } catch (error) {
      toast({ title: "Hata", description: error instanceof Error ? error.message : "Profil güncellenirken bir hata oluştu", variant: "destructive" });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleWhatsAppSave = async () => {
    if (!whatsappNumber.trim()) {
      toast({ title: "Hata", description: "WhatsApp numarası boş bırakılamaz", variant: "destructive" });
      return;
    }
    setIsUpdatingWhatsApp(true);
    try {
      await saveWhatsAppNumber(whatsappNumber.trim());
      toast({ title: "Başarılı", description: "WhatsApp numarası başarıyla kaydedildi" });
    } catch (error) {
      toast({ title: "Hata", description: error instanceof Error ? error.message : "WhatsApp numarası kaydedilirken bir hata oluştu", variant: "destructive" });
    } finally {
      setIsUpdatingWhatsApp(false);
    }
  };

  const handleNotificationEmailSave = async () => {
    if (!notificationEmail.trim() || !/\S+@\S+\.\S+/.test(notificationEmail)) {
      toast({ title: "Hata", description: "Lütfen geçerli bir e-posta adresi girin", variant: "destructive" });
      return;
    }
    setIsUpdatingNotificationEmail(true);
    try {
      await saveNotificationEmail(notificationEmail.trim());
      toast({ title: "Başarılı", description: "Bildirim e-postası başarıyla kaydedildi" });
    } catch (error) {
      toast({ title: "Hata", description: error instanceof Error ? error.message : "Bildirim e-postası kaydedilirken bir hata oluştu", variant: "destructive" });
    } finally {
      setIsUpdatingNotificationEmail(false);
    }
  };

  const handleWhatsAppNotificationSave = async () => {
    if (!whatsappNotificationNumber.trim()) {
      toast({ title: "Hata", description: "WhatsApp bildirim numarası boş bırakılamaz", variant: "destructive" });
      return;
    }
    setIsUpdatingWhatsAppNotification(true);
    try {
      await saveWhatsAppNotificationNumber(whatsappNotificationNumber.trim());
      toast({ title: "Başarılı", description: "WhatsApp bildirim numarası başarıyla kaydedildi" });
    } catch (error) {
      toast({ title: "Hata", description: error instanceof Error ? error.message : "WhatsApp bildirim numarası kaydedilirken bir hata oluştu", variant: "destructive" });
    } finally {
      setIsUpdatingWhatsAppNotification(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({ title: "Hata", description: "Tüm şifre alanları doldurulmalıdır", variant: "destructive" });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: "Hata", description: "Yeni şifreler eşleşmiyor", variant: "destructive" });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast({ title: "Hata", description: "Yeni şifre en az 6 karakter olmalıdır", variant: "destructive" });
      return;
    }
    setIsChangingPassword(true);
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast({ title: "Başarılı", description: "Şifreniz başarıyla değiştirildi" });
    } catch (error) {
      toast({ title: "Hata", description: error instanceof Error ? error.message : "Şifre değiştirilirken bir hata oluştu", variant: "destructive" });
    } finally {
      setIsChangingPassword(false);
    }
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
      toast({ title: "Başarılı", description: "Araç silindi" });
      loadVehicles();
    } catch (error) {
      toast({ title: "Hata", description: "Araç silinirken bir hata oluştu", variant: "destructive" });
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
      toast({ title: "Başarılı", description: "Transfer fiyatı silindi" });
      loadTransferPrices();
    } catch (error) {
      toast({ title: "Hata", description: "Transfer fiyatı silinirken bir hata oluştu", variant: "destructive" });
    }
  };

  const handleTransferPriceModalClose = () => {
    setIsTransferPriceModalOpen(false);
    setEditingTransferPrice(null);
    loadTransferPrices();
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Genel Ayarlar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="whatsappNumber" className="flex items-center gap-2"><Phone className="h-4 w-4" /> Müşteri WhatsApp Numarası</Label>
                    <div className="flex gap-2">
                      <Input id="whatsappNumber" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="İletişim butonu için WhatsApp No"/>
                      <Button onClick={handleWhatsAppSave} variant="outline" disabled={isUpdatingWhatsApp}>{isUpdatingWhatsApp ? "Kaydediliyor..." : "Kaydet"}</Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Bu numara, hizmet sayfalarındaki Bilgi Al butonunda kullanılır.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-2 space-y-6">
              <form onSubmit={handleProfileSubmit}>
                <Card>
                  <CardHeader>
                    <CardTitle>Kişisel Bilgiler</CardTitle>
                    <CardDescription>Profil bilgilerinizi buradan güncelleyebilirsiniz</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="flex items-center gap-2"><User className="h-4 w-4" />Ad</Label>
                        <Input id="firstName" value={profileData.firstName} onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })} placeholder="Adınızı girin" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="flex items-center gap-2"><User className="h-4 w-4" />Soyad</Label>
                        <Input id="lastName" value={profileData.lastName} onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })} placeholder="Soyadınızı girin" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2"><Mail className="h-4 w-4" />E-posta</Label>
                      <Input id="email" type="email" value={user?.email || ""} disabled className="bg-muted" />
                      <p className="text-xs text-muted-foreground">E-posta adresi değiştirilemez</p>
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit" disabled={isUpdatingProfile}>{isUpdatingProfile ? "Güncelleniyor..." : "Profil Bilgilerini Güncelle"}</Button>
                    </div>
                  </CardContent>
                </Card>
              </form>

              <Card>
                <CardHeader>
                  <CardTitle>Bildirim Ayarları</CardTitle>
                  <CardDescription>Yeni rezervasyon bildirimlerinin gönderileceği kanalları yönetin.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="notificationEmail" className="flex items-center gap-2"><Mail className="h-4 w-4" /> E-posta Adresi</Label>
                    <div className="flex gap-2">
                      <Input id="notificationEmail" type="email" value={notificationEmail} onChange={(e) => setNotificationEmail(e.target.value)} placeholder="bildirimler@ornek.com" />
                      <Button onClick={handleNotificationEmailSave} variant="outline" disabled={isUpdatingNotificationEmail}>{isUpdatingNotificationEmail ? "Kaydediliyor..." : "Kaydet"}</Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Yeni rezervasyon bildirimleri bu e-posta adresine gönderilir.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsappNotificationNumber" className="flex items-center gap-2"><Bell className="h-4 w-4" /> WhatsApp Bildirim Numarası</Label>
                    <div className="flex gap-2">
                      <Input id="whatsappNotificationNumber" value={whatsappNotificationNumber} onChange={(e) => setWhatsappNotificationNumber(e.target.value)} placeholder="Alıcı WhatsApp No (örn: 905551234567)" />
                      <Button onClick={handleWhatsAppNotificationSave} variant="outline" disabled={isUpdatingWhatsAppNotification}>{isUpdatingWhatsAppNotification ? "Kaydediliyor..." : "Kaydet"}</Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Yeni rezervasyon bildirimleri bu WhatsApp numarasına gönderilir (ülke koduyla birlikte).</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <form onSubmit={handlePasswordSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Şifre Değiştir</CardTitle>
                <CardDescription>Hesap güvenliğiniz için şifrenizi düzenli olarak değiştirmenizi öneririz</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="flex items-center gap-2"><Lock className="h-4 w-4" />Mevcut Şifre</Label>
                  <Input id="currentPassword" type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} placeholder="Mevcut şifrenizi girin" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="flex items-center gap-2"><Lock className="h-4 w-4" />Yeni Şifre</Label>
                  <Input id="newPassword" type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} placeholder="Yeni şifrenizi girin" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="flex items-center gap-2"><Lock className="h-4 w-4" />Yeni Şifre (Tekrar)</Label>
                  <Input id="confirmPassword" type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} placeholder="Yeni şifrenizi tekrar girin" />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isChangingPassword}>{isChangingPassword ? "Değiştiriliyor..." : "Şifreyi Değiştir"}</Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5" />Kategori Yönetimi</CardTitle>
              <CardDescription>Kategorileri, ikonlarini ve gorunum ayarlarini tek bir modaldan yonetin.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Kategori Yonetimi</h4>
                    <Button size="sm" onClick={handleAddCategory}>
                      <Plus className="h-4 w-4 mr-1" />
                      Yeni Kategori
                    </Button>
                  </div>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ikon</TableHead>
                          <TableHead>Slug</TableHead>
                          <TableHead>Ad (TR)</TableHead>
                          <TableHead>Ad (EN)</TableHead>
                          <TableHead>Tasarim Tipi</TableHead>
                          <TableHead>Siralama</TableHead>
                          <TableHead>Durum</TableHead>
                          <TableHead className="text-right">Islemler</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loadingCategories ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8">Yukleniyor...</TableCell>
                          </TableRow>
                        ) : categories.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8">Kategori bulunamadi</TableCell>
                          </TableRow>
                        ) : (
                          categories.map((category) => {
                            const Icon = getCategoryIcon(category.iconKey);
                            const design = categoryDesigns[category.slug];
                            return (
                              <TableRow key={category.id || category.slug}>
                                <TableCell><Icon className="h-4 w-4" /></TableCell>
                                <TableCell className="font-medium">{category.slug}</TableCell>
                                <TableCell>{category.labels?.tr || "-"}</TableCell>
                                <TableCell>{category.labels?.en || "-"}</TableCell>
                                <TableCell>
                                  {!design ? (
                                    <Badge variant="secondary">Yok</Badge>
                                  ) : design.useImage && design.categoryImage ? (
                                    <div className="flex items-center gap-2">
                                      <Badge>Resim</Badge>
                                      <button
                                        type="button"
                                        onClick={() => setPreviewImageUrl(design.categoryImage || null)}
                                        className="w-9 h-9 rounded border overflow-hidden hover:opacity-90"
                                      >
                                        <img
                                          src={design.categoryImage}
                                          alt={`${category.labels?.tr || category.slug} tasarim resmi`}
                                          className="w-full h-full object-cover"
                                        />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline">Renk</Badge>
                                      <div
                                        className="w-9 h-9 rounded border"
                                        style={
                                          design.colorType === "gradient"
                                            ? { background: getColorPreview(design) }
                                            : { backgroundColor: getColorPreview(design) }
                                        }
                                      />
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell>{category.sortOrder}</TableCell>
                                <TableCell>
                                  <Badge variant={category.isActive ? "default" : "secondary"}>
                                    {category.isActive ? "Aktif" : "Pasif"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => handleEditCategory(category)}>
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    {category.id && (
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button variant="ghost" size="sm">
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>Kategoriyi Sil</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              Bu kategoriyi silmek istediginizden emin misiniz? Bu islem geri alinamaz.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>Iptal</AlertDialogCancel>
                                            <AlertDialogAction
                                              onClick={() => handleDeleteCategory(category.id!)}
                                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                              Sil
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="vehicles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Car className="h-5 w-5" />Araç Yönetimi</div>
                <Button onClick={handleAddVehicle}><Plus className="mr-2 h-4 w-4" />Yeni Araç Ekle</Button>
              </CardTitle>
              <CardDescription>Transfer hizmetleri için araç tiplerini yönetin. Araç resimleri otomatik olarak arac klasörüne yüklenir.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Araç Tipi</TableHead><TableHead>Max. Yolcu</TableHead><TableHead>Resimler</TableHead><TableHead>Durum</TableHead><TableHead className="text-right">İşlemler</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingVehicles ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8">Yükleniyor...</TableCell></TableRow>
                    ) : vehicles.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8">Henüz araç eklenmemiş</TableCell></TableRow>
                    ) : (
                      vehicles.map((vehicle) => (
                        <TableRow key={vehicle.id}>
                          <TableCell className="font-medium">{vehicle.vehicleTypeName}</TableCell>
                          <TableCell>{vehicle.maxPassengerCapacity} kişi</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {vehicle.vehicleImages.slice(0, 3).map((image, index) => (<div key={index} className="w-8 h-8 rounded border overflow-hidden">{image ? (<img src={image} alt={`${vehicle.vehicleTypeName} - ${index + 1}`} className="w-full h-full object-cover"/>) : (<div className="w-full h-full bg-gray-200 flex items-center justify-center"><Car className="w-3 h-3 text-gray-400" /></div>)}</div>))}
                              {vehicle.vehicleImages.length > 3 && (<div className="w-8 h-8 rounded border bg-gray-100 flex items-center justify-center text-xs">+{vehicle.vehicleImages.length - 3}</div>)}
                            </div>
                          </TableCell>
                          <TableCell><Badge variant={vehicle.isActive ? "default" : "secondary"}>{vehicle.isActive ? "Aktif" : "Pasif"}</Badge></TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEditVehicle(vehicle)}><Edit className="h-4 w-4" /></Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild><Button variant="ghost" size="sm"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader><AlertDialogTitle>Aracı Sil</AlertDialogTitle><AlertDialogDescription>Bu aracı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</AlertDialogDescription></AlertDialogHeader>
                                  <AlertDialogFooter><AlertDialogCancel>İptal</AlertDialogCancel><AlertDialogAction onClick={() => vehicle.id && handleDeleteVehicle(vehicle.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Sil</AlertDialogAction></AlertDialogFooter>
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
                <div className="flex items-center gap-2"><CreditCard className="h-5 w-5" />Transfer Fiyat Yönetimi</div>
                <Button onClick={handleAddTransferPrice}><Plus className="mr-2 h-4 w-4" />Yeni Transfer Fiyatı Ekle</Button>
              </CardTitle>
              <CardDescription>Transfer hizmetleri için araç seçimi, güzergah ve fiyat tanımlamaları yapın.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Kalkış Noktası</TableHead><TableHead>Varış Noktası</TableHead><TableHead>Süre</TableHead><TableHead>Araç ve Fiyatlar</TableHead><TableHead>Durum</TableHead><TableHead className="text-right">İşlemler</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingTransferPrices ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8">Yükleniyor...</TableCell></TableRow>
                    ) : transferPrices.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8">Henüz transfer fiyatı eklenmemiş</TableCell></TableRow>
                    ) : (
                      transferPrices.map((transferPrice) => (
                        <TableRow key={transferPrice.id}>
                          <TableCell>{transferPrice.departurePoint}</TableCell>
                          <TableCell>{transferPrice.arrivalPoint}</TableCell>
                          <TableCell>{transferPrice.transferDuration} dakika</TableCell>
                          <TableCell><div className="space-y-1">{transferPrice.vehiclePrices?.map((vp, index) => (<div key={index} className="text-sm"><span className="font-medium">{vp.vehicleTypeName}</span><span className="text-muted-foreground"> - {vp.price} ₺</span></div>))}</div></TableCell>
                          <TableCell><Badge variant={transferPrice.isActive ? "default" : "secondary"}>{transferPrice.isActive ? "Aktif" : "Pasif"}</Badge></TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEditTransferPrice(transferPrice)}><Edit className="h-4 w-4" /></Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild><Button variant="ghost" size="sm"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader><AlertDialogTitle>Transfer Fiyatını Sil</AlertDialogTitle><AlertDialogDescription>Bu transfer fiyatını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</AlertDialogDescription></AlertDialogHeader>
                                  <AlertDialogFooter><AlertDialogCancel>İptal</AlertDialogCancel><AlertDialogAction onClick={() => transferPrice.id && handleDeleteTransferPrice(transferPrice.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Sil</AlertDialogAction></AlertDialogFooter>
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
      {isCategoryModalOpen && (
        <CategoryModal
          isOpen={isCategoryModalOpen}
          onClose={handleCategoryModalClose}
          editingCategory={editingCategory}
        />
      )}
      {isVehicleModalOpen && (<VehicleModal isOpen={isVehicleModalOpen} onClose={handleVehicleModalClose} editingVehicle={editingVehicle} />)}
      {isTransferPriceModalOpen && (<TransferPriceModal isOpen={isTransferPriceModalOpen} onClose={handleTransferPriceModalClose} editingTransferPrice={editingTransferPrice} vehicles={vehicles.filter(v => v.isActive)} />)}
      <Dialog open={!!previewImageUrl} onOpenChange={(open) => !open && setPreviewImageUrl(null)}>
        <DialogContent className="max-w-5xl w-[95vw]">
          <DialogTitle>Kategori Tasarim Resmi</DialogTitle>
          <div className="w-full h-[70vh] rounded-md border bg-muted/20 flex items-center justify-center">
            {previewImageUrl ? (
              <img src={previewImageUrl} alt="Kategori tasarim resmi" className="max-w-full max-h-full object-contain" />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}