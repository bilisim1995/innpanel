"use client";

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
import { User, Lock, Mail, Shield, Palette, Plus, Edit, Trash2, Car, Phone, CreditCard, Bell } from "lucide-react";
import { DEFAULT_CATEGORIES, getCategoryColors, deleteCategoryColor, CategoryColorSettings, getColorPreview } from "@/lib/categories";
import {
  saveWhatsAppNumber,
  getWhatsAppNumber,
  saveNotificationEmail,
  getNotificationEmail,
  saveWhatsAppNotificationNumber,
  getWhatsAppNotificationNumber
} from "@/lib/settings";
import { CategoryColorModal } from "@/components/categories/category-color-modal";
import { getVehicles, deleteVehicle, VehicleData } from "@/lib/vehicles";
import { VehicleModal } from "@/components/vehicles/vehicle-modal";
import { getTransferPrices, deleteTransferPrice, TransferPriceData } from "@/lib/transfer-prices";
import { TransferPriceModal } from "@/components/transfer-prices/transfer-price-modal";

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
  const [categoryColors, setCategoryColors] = useState<CategoryColorSettings[]>([]);
  const [loadingColors, setLoadingColors] = useState(true);
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [editingColor, setEditingColor] = useState<CategoryColorSettings | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<{ id: string, name: string } | null>(null);

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

  useEffect(() => {
    loadCategoryColors();
    loadWhatsAppNumber();
    loadNotificationEmail();
    loadWhatsAppNotificationNumber();
    loadVehicles();
    loadTransferPrices();
  }, []);

  const loadCategoryColors = async () => {
    try {
      setLoadingColors(true);
      const colors = await getCategoryColors();
      setCategoryColors(colors);
    } catch (error) {
      toast({ title: "Hata", description: "Kategori renkleri yüklenirken bir hata oluştu", variant: "destructive" });
    } finally {
      setLoadingColors(false);
    }
  };

  const loadWhatsAppNumber = async () => {
    try {
      const number = await getWhatsAppNumber();
      if (number) setWhatsappNumber(number);
    } catch (error) {
      console.error('Error loading WhatsApp number:', error);
    }
  };

  const loadNotificationEmail = async () => {
    try {
      const email = await getNotificationEmail();
      if (email) setNotificationEmail(email);
    } catch (error) {
      console.error('Error loading notification email:', error);
    }
  };

  const loadWhatsAppNotificationNumber = async () => {
    try {
      const number = await getWhatsAppNotificationNumber();
      if (number) setWhatsappNotificationNumber(number);
    } catch (error) {
      console.error('Error loading WhatsApp notification number:', error);
    }
  };

  const loadVehicles = async () => {
    try {
      setLoadingVehicles(true);
      const vehiclesData = await getVehicles();
      setVehicles(vehiclesData);
    } catch (error) {
      toast({ title: "Hata", description: "Araçlar yüklenirken bir hata oluştu", variant: "destructive" });
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
      toast({ title: "Hata", description: "Transfer fiyatları yüklenirken bir hata oluştu", variant: "destructive" });
    } finally {
      setLoadingTransferPrices(false);
    }
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
      toast({ title: "Başarılı", description: "Kategori rengi silindi" });
      loadCategoryColors();
    } catch (error) {
      toast({ title: "Hata", description: "Kategori rengi silinirken bir hata oluştu", variant: "destructive" });
    }
  };

  const handleColorModalClose = () => {
    setIsColorModalOpen(false);
    setEditingColor(null);
    setSelectedCategory(null);
    loadCategoryColors();
  };
  
  // Omitted for brevity: vehicle and transfer price modal handlers...

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ayarlar</h1>
        <p className="text-muted-foreground">Hesap ve sistem ayarlarınızı yönetin</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {/* Tabs Triggers */}
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Profil Fotoğrafı</CardTitle>
                <CardDescription>Profil fotoğrafınızı buradan güncelleyebilirsiniz</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-w-[200px] mx-auto">
                  <ImageUpload value={profileImage} onChange={(value) => setProfileImage(value)} folder="profile" aspectRatio="square" />
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Bildirim Ayarları</CardTitle>
                <CardDescription>Yeni rezervasyon bildirimlerinin gönderileceği kanalları yönetin.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-2">
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
                  <p className="text-xs text-muted-foreground">Yeni rezervasyon bildirimleri bu WhatsApp numarasına gönderilir ( ülke koduyla birlikte).</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
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
                  <p className="text-xs text-muted-foreground">Bu numara, hizmet sayfalarındaki "Bilgi Al" butonunda kullanılır.</p>
                </div>
              </CardContent>
            </Card>

          <form onSubmit={handleProfileSubmit}>
            {/* Personal info form remains the same */}
          </form>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          {/* Security content remains the same */}
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-6">
          {/* Categories content remains the same */}
        </TabsContent>
        
        <TabsContent value="vehicles" className="space-y-6">
          {/* Vehicles content remains the same */}
        </TabsContent>

        <TabsContent value="transfer-pricing" className="space-y-6">
          {/* Transfer pricing content remains the same */}
        </TabsContent>
      </Tabs>

      {/* Modals remain the same */}
    </div>
  );
}
