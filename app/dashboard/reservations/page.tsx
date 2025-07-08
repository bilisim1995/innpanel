"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getReservations, updateReservation, deleteReservation, ReservationData } from "@/lib/reservations";
import { useToast } from "@/hooks/use-toast";
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
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Edit, Trash2, Eye, Search, Calendar, Users, Car, CreditCard, Phone, User, MapPin, Building2, Clock, MessageSquare } from "lucide-react";
import { ReservationEditModal } from "@/components/reservations/reservation-edit-modal";

export default function ReservationsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reservations, setReservations] = useState<ReservationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReservation, setEditingReservation] = useState<ReservationData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewingReservation, setViewingReservation] = useState<ReservationData | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const reservationsData = await getReservations();
      setReservations(reservationsData);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Rezervasyonlar yüklenirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteReservation(id);
      toast({
        title: "Başarılı",
        description: "Rezervasyon başarıyla silindi",
      });
      loadReservations();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Rezervasyon silinirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (reservation: ReservationData) => {
    setEditingReservation(reservation);
    setIsEditModalOpen(true);
  };

  const handleView = (reservation: ReservationData) => {
    setViewingReservation(reservation);
    setIsViewModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setEditingReservation(null);
    loadReservations();
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

  const getStatusVariant = (status: string) => {
    const variants = {
      "pending": "secondary",
      "confirmed": "default",
      "cancelled": "destructive",
      "completed": "outline",
    };
    return variants[status as keyof typeof variants] || "secondary";
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

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = 
      reservation.customerName.toLowerCase().includes(search.toLowerCase()) ||
      reservation.customerSurname.toLowerCase().includes(search.toLowerCase()) ||
      reservation.serviceName.toLowerCase().includes(search.toLowerCase()) ||
      reservation.companyName.toLowerCase().includes(search.toLowerCase()) ||
      reservation.locationName.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || reservation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Statistics
  const stats = {
    total: reservations.length,
    pending: reservations.filter(r => r.status === 'pending').length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length,
    completed: reservations.filter(r => r.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Rezervasyonlar</h1>
          <p className="text-muted-foreground">Tüm rezervasyonları görüntüleyin ve yönetin</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Toplam</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Beklemede</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Onaylandı</p>
                <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">İptal</p>
                <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Tamamlandı</p>
                <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rezervasyon ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Durum filtrele" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="pending">Beklemede</SelectItem>
              <SelectItem value="confirmed">Onaylandı</SelectItem>
              <SelectItem value="cancelled">İptal Edildi</SelectItem>
              <SelectItem value="completed">Tamamlandı</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reservations Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rezervasyon No</TableHead>
                <TableHead>Müşteri</TableHead>
                <TableHead>Hizmet</TableHead>
                <TableHead>Tarih & Saat</TableHead>
                <TableHead>Katılımcı</TableHead>
                <TableHead>Tutar</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Yükleniyor...
                  </TableCell>
                </TableRow>
              ) : filteredReservations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    {search || statusFilter !== "all" 
                      ? "Arama kriterlerine uygun rezervasyon bulunamadı" 
                      : "Henüz rezervasyon bulunmuyor"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredReservations.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell className="font-mono text-sm">
                      {reservation.id?.substring(0, 8).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{reservation.customerName} {reservation.customerSurname}</p>
                        <p className="text-sm text-muted-foreground">{reservation.customerPhone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{reservation.serviceName}</p>
                        <p className="text-sm text-muted-foreground">{reservation.companyName}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {getCategoryLabel(reservation.serviceCategory)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{reservation.reservationDate.toLocaleDateString('tr-TR')}</p>
                        <p className="text-sm text-muted-foreground">
                          {reservation.timeSlot.startTime} - {reservation.timeSlot.endTime}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {reservation.serviceCategory === "transfer" ? (
                        <div className="text-sm">
                          <p>{reservation.personCountForTransfer} kişi</p>
                          <p className="text-muted-foreground">{reservation.vehicleCount} araç</p>
                        </div>
                      ) : reservation.serviceCategory === "motor-tours" ? (
                        <div className="text-sm">
                          <p>{reservation.vehicleCount} araç</p>
                        </div>
                      ) : (
                        <div className="text-sm">
                          <p>{reservation.personCount} kişi</p>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{reservation.totalAmount} ₺</p>
                        {reservation.paymentMethod === 'prepayment' && (
                          <p className="text-xs text-muted-foreground">
                            Ön ödeme: {reservation.prepaymentAmount} ₺
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(reservation.status) as any}>
                        {getStatusLabel(reservation.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleView(reservation)}
                          title="Detayları Görüntüle"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(reservation)}
                          title="Düzenle"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" title="Sil">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Rezervasyonu Sil</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bu rezervasyonu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>İptal</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => reservation.id && handleDelete(reservation.id)}
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

      {/* Edit Modal */}
      <ReservationEditModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        reservation={editingReservation}
      />

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Rezervasyon Detayları
            </DialogTitle>
            <DialogDescription>
              Rezervasyon bilgilerini görüntüleyin
            </DialogDescription>
          </DialogHeader>
          {viewingReservation && (
            <div className="space-y-6">
              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Müşteri Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Ad Soyad</p>
                    <p className="font-medium">{viewingReservation.customerName} {viewingReservation.customerSurname}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Telefon</p>
                    <p className="font-medium">{viewingReservation.customerPhone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rezervasyon No</p>
                    <p className="font-mono font-medium">{viewingReservation.id?.substring(0, 8).toUpperCase()}</p>
                  </div>
                  {viewingReservation.visitorNote && (
                    <div className="md:col-span-3">
                      <p className="text-sm text-muted-foreground">Ziyaretçi Notu</p>
                      <p className="font-medium whitespace-pre-wrap">{viewingReservation.visitorNote}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Service Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Hizmet Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Hizmet Adı</p>
                    <p className="font-medium">{viewingReservation.serviceName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Firma</p>
                    <p className="font-medium">{viewingReservation.companyName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Kategori</p>
                    <Badge variant="outline">{getCategoryLabel(viewingReservation.serviceCategory)}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Hizmet Noktası</p>
                    <p className="font-medium">{viewingReservation.locationName}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Reservation Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Rezervasyon Detayları
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Tarih</p>
                    <p className="font-medium">{viewingReservation.reservationDate.toLocaleDateString('tr-TR')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Saat</p>
                    <p className="font-medium">{viewingReservation.timeSlot.startTime} - {viewingReservation.timeSlot.endTime}</p>
                  </div>
                  
                  {/* Category-specific details */}
                  {viewingReservation.serviceCategory === "transfer" && (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Kişi Sayısı</p>
                        <p className="font-medium">{viewingReservation.personCountForTransfer} kişi</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Araç Sayısı</p>
                        <p className="font-medium">{viewingReservation.vehicleCount} adet</p>
                      </div>
                      {viewingReservation.selectedVehicles && viewingReservation.selectedVehicles.length > 0 && (
                        <div className="col-span-full">
                          <p className="text-sm text-muted-foreground mb-2">Seçili Araçlar</p>
                          <div className="space-y-2">
                            {viewingReservation.selectedVehicles.map((vehicle, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 border rounded">
                                <Car className="h-4 w-4" />
                                <span>{vehicle.vehicleTypeName} ({vehicle.maxPassengerCapacity} kişi) - {vehicle.count} adet</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  
                  {viewingReservation.serviceCategory === "motor-tours" && (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Araç Sayısı</p>
                        <p className="font-medium">{viewingReservation.vehicleCount} adet</p>
                      </div>
                      {viewingReservation.selectedVehicle && (
                        <div>
                          <p className="text-sm text-muted-foreground">Seçili Araç</p>
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4" />
                            <span>{viewingReservation.selectedVehicle.vehicleTypeName} ({viewingReservation.selectedVehicle.maxPassengerCapacity} kişi)</span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  
                  {viewingReservation.serviceCategory !== "transfer" && viewingReservation.serviceCategory !== "motor-tours" && (
                    <div>
                      <p className="text-sm text-muted-foreground">Kişi Sayısı</p>
                      <p className="font-medium">{viewingReservation.personCount} kişi</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Durum</p>
                    <Badge variant={getStatusVariant(viewingReservation.status) as any}>
                      {getStatusLabel(viewingReservation.status)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Ödeme Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Birim Fiyat</p>
                    <p className="font-medium">{viewingReservation.unitPrice} ₺</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Toplam Tutar</p>
                    <p className="font-medium text-lg">{viewingReservation.totalAmount} ₺</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ödeme Yöntemi</p>
                    <p className="font-medium">
                      {viewingReservation.paymentMethod === 'full_start' ? 'Başlangıçta Tam Ödeme' : 'Ön Ödeme'}
                    </p>
                  </div>
                  {viewingReservation.paymentMethod === 'prepayment' && (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Ön Ödeme</p>
                        <p className="font-medium">{viewingReservation.prepaymentAmount} ₺</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Kalan Tutar</p>
                        <p className="font-medium">{viewingReservation.remainingAmount} ₺</p>
                      </div>
                    </>
                  )}
                  {viewingReservation.commissionAmount && viewingReservation.commissionAmount > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Komisyon</p>
                      <p className="font-medium">{viewingReservation.commissionAmount} ₺</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Timestamps */}
              <Card>
                <CardHeader>
                  <CardTitle>Zaman Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Oluşturulma Tarihi</p>
                    <p className="font-medium">{viewingReservation.createdAt.toLocaleString('tr-TR')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Son Güncelleme</p>
                    <p className="font-medium">{viewingReservation.updatedAt.toLocaleString('tr-TR')}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
