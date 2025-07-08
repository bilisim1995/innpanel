"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { updateReservation, ReservationData } from "@/lib/reservations";
import { 
  Edit3,
  User,
  Phone,
  Calendar,
  CreditCard,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare
} from "lucide-react";

interface ReservationEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: ReservationData | null;
}

export function ReservationEditModal({ isOpen, onClose, reservation }: ReservationEditModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    customerName: "",
    customerSurname: "",
    customerPhone: "",
    status: "pending" as "pending" | "confirmed" | "cancelled" | "completed",
    visitorNote: "",
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Load reservation data when modal opens
  useEffect(() => {
    if (reservation && isOpen) {
      setFormData({
        customerName: reservation.customerName,
        customerSurname: reservation.customerSurname,
        customerPhone: reservation.customerPhone,
        status: reservation.status,
        visitorNote: reservation.visitorNote || "",
      });
      setErrors({});
    }
  }, [reservation, isOpen]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = "Ad alanı zorunludur";
    }

    if (!formData.customerSurname.trim()) {
      newErrors.customerSurname = "Soyad alanı zorunludur";
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = "Telefon numarası zorunludur";
    } else if (!/^[0-9]{10,11}$/.test(formData.customerPhone.replace(/\s/g, ''))) {
      newErrors.customerPhone = "Geçerli bir telefon numarası girin";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!reservation?.id || !validateForm()) return;

    setIsLoading(true);
    try {
      const updateData: Partial<ReservationData> = {
        customerName: formData.customerName.trim(),
        customerSurname: formData.customerSurname.trim(),
        customerPhone: formData.customerPhone.trim(),
        status: formData.status,
      };

      await updateReservation(reservation.id, updateData);
      
      toast({
        title: "Başarılı",
        description: "Rezervasyon başarıyla güncellendi",
      });

      onClose();
    } catch (error) {
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Rezervasyon güncellenirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const statuses = {
      "pending": "Beklemede",
      "confirmed": "Onaylandı",
      "cancelled": "İptal Edildi",
      "completed": "Tamamlandı",
    };
    return statuses[status as keyof typeof statuses] || status;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      "pending": Clock,
      "confirmed": CheckCircle,
      "cancelled": XCircle,
      "completed": CheckCircle,
    };
    return icons[status as keyof typeof icons] || AlertCircle;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      "pending": "text-yellow-600",
      "confirmed": "text-green-600",
      "cancelled": "text-red-600",
      "completed": "text-blue-600",
    };
    return colors[status as keyof typeof colors] || "text-gray-600";
  };

  const getCategoryLabel = (category: string) => {
    const categories = {
      "region-tours": "Bölge Turları",
      "motor-tours": "Motorlu Turlar",
      "balloon": "Sıcak Balon",
      "transfer": "Transfer",
      "other": "Diğer",
    };
    return categories[category as keyof typeof categories] || category;
  };

  if (!reservation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="flex items-center gap-2">
          <Edit3 className="h-5 w-5" />
          Rezervasyon Düzenle
        </DialogTitle>

        <div className="space-y-6">
          {/* Reservation Info (Read-only) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Rezervasyon Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Rezervasyon No</Label>
                  <p className="font-mono text-sm p-2 bg-muted rounded">
                    {reservation.id?.substring(0, 8).toUpperCase()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Hizmet</Label>
                  <div className="p-2 bg-muted rounded">
                    <p className="font-medium text-sm">{reservation.serviceName}</p>
                    <p className="text-xs text-muted-foreground">{reservation.companyName}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Kategori</Label>
                  <div className="p-2">
                    <Badge variant="outline">{getCategoryLabel(reservation.serviceCategory)}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Tarih & Saat</Label>
                  <div className="p-2 bg-muted rounded">
                    <p className="text-sm">{reservation.reservationDate.toLocaleDateString('tr-TR')}</p>
                    <p className="text-xs text-muted-foreground">
                      {reservation.timeSlot.startTime} - {reservation.timeSlot.endTime}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information (Editable) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Müşteri Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Ad *
                  </Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    className={errors.customerName ? "border-red-500" : ""}
                  />
                  {errors.customerName && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.customerName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerSurname" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Soyad *
                  </Label>
                  <Input
                    id="customerSurname"
                    value={formData.customerSurname}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerSurname: e.target.value }))}
                    className={errors.customerSurname ? "border-red-500" : ""}
                  />
                  {errors.customerSurname && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.customerSurname}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPhone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Telefon *
                </Label>
                <Input
                  id="customerPhone"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                  className={errors.customerPhone ? "border-red-500" : ""}
                />
                {errors.customerPhone && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.customerPhone}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="visitorNote" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Ziyaretçi Notu
                </Label>
                <Textarea
                  id="visitorNote"
                  value={formData.visitorNote}
                  disabled
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Status and Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Rezervasyon Durumu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Durum</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        Beklemede
                      </div>
                    </SelectItem>
                    <SelectItem value="confirmed">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Onaylandı
                      </div>
                    </SelectItem>
                    <SelectItem value="cancelled">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        İptal Edildi
                      </div>
                    </SelectItem>
                    <SelectItem value="completed">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                        Tamamlandı
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info (Read-only) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Ödeme Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Toplam Tutar</Label>
                  <p className="text-lg font-bold p-2 bg-muted rounded">{reservation.totalAmount} ₺</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Ödeme Yöntemi</Label>
                  <p className="p-2 bg-muted rounded text-sm">
                    {reservation.paymentMethod === 'full_start' ? 'Başlangıçta Tam Ödeme' : 'Ön Ödeme'}
                  </p>
                </div>
                {reservation.paymentMethod === 'prepayment' && (
                  <>
                    <div>
                      <Label className="text-sm font-medium">Ön Ödeme</Label>
                      <p className="p-2 bg-muted rounded text-sm">{reservation.prepaymentAmount} ₺</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Kalan Tutar</Label>
                      <p className="p-2 bg-muted rounded text-sm">{reservation.remainingAmount} ₺</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              İptal
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
