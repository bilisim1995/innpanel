"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download,
  Calendar, 
  RotateCcw, 
  CheckCircle,
  Eye,
  FileDown,
  FileText,
  Table as TableIcon,
  BarChart,
  User,
  Building2,
  CreditCard,
  Car
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getReservations, ReservationData } from "@/lib/reservations";
import { getServices, ServiceData } from "@/lib/services";
import { getLocations, LocationData } from "@/lib/locations";
import { getAssignments, AssignmentData } from "@/lib/assignments";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
// PDF export için dinamik importlar
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- FONT YÜKLEME FONKSİYONU ---
// Bu fonksiyon, font dosyasını URL'den alıp Base64 formatına çevirir.
// jsPDF'in özel fontları işlemesi için bu gereklidir.
const loadFontAsBase64 = async (url: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Font yüklenemedi: ${response.statusText}`);
    }
    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Font yükleme hatası:", error);
    // Yedek bir çözüm olarak boş string dönebilir veya hatayı yukarıya taşıyabilirsiniz.
    return '';
  }
};


export default function ReportsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("reservations");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [reservations, setReservations] = useState<ReservationData[]>([]);
  const [services, setServices] = useState<ServiceData[]>([]);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [assignments, setAssignments] = useState<AssignmentData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingFiltered, setLoadingFiltered] = useState<boolean>(false);
  
  // Filters
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  
  // View reservation modal
  const [viewingReservation, setViewingReservation] = useState<ReservationData | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  // Selection state for reservations list
  const [isExportPopoverOpen, setIsExportPopoverOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedReservations, setSelectedReservations] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  // Update available categories when location changes
  useEffect(() => {
    if (selectedLocation === "all") {
      const allCategories = Array.from(new Set(reservations.map(r => r.serviceCategory)));
      setAvailableCategories(allCategories.sort());
    } else {
      const location = locations.find(loc => loc.name === selectedLocation);
      if (location) {
        const locationAssignments = assignments.filter(a => 
          a.locationId === location.id && a.isActive
        );
        const locationCategories = Array.from(new Set(locationAssignments.map(a => a.serviceCategory)));
        setAvailableCategories(locationCategories.sort());
        if (selectedCategory !== "all" && !locationCategories.includes(selectedCategory)) {
          setSelectedCategory("all");
        }
      }
    }
  }, [selectedLocation, locations, assignments, reservations, selectedCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reservationsData, servicesData, locationsData, assignmentsData] = await Promise.all([
        getReservations(),
        getServices(),
        getLocations(),
        getAssignments()
      ]);
      
      setReservations(reservationsData);
      setServices(servicesData);
      setLocations(locationsData);
      setAssignments(assignmentsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = (location: string) => {
    setLoadingFiltered(true);
    setSelectedLocation(location);
    setTimeout(() => {
      setLoadingFiltered(false);
    }, 500);
  };
  
  const handleResetDates = () => {
    setStartDate("");
    setEndDate("");
  };

  const getFilteredReservations = () => {
    let filtered = reservations;
    if (startDate && endDate) {
      filtered = filtered.filter(reservation => {
        const reservationDate = new Date(reservation.reservationDate);
        const fromDate = new Date(startDate);
        fromDate.setHours(0, 0, 0, 0);
        const toDate = new Date(endDate);
        toDate.setHours(23, 59, 59, 999);
        return reservationDate >= fromDate && reservationDate <= toDate;
      });
    }
    if (selectedStatus !== "all") {
      filtered = filtered.filter(reservation => reservation.status === selectedStatus);
    }
    if (selectedLocation !== "all") {
      filtered = filtered.filter(reservation => reservation.locationName === selectedLocation);
    }
    if (selectedCategory !== "all") {
      filtered = filtered.filter(reservation => reservation.serviceCategory === selectedCategory);
    }
    return filtered;
  };

  const getUniqueLocations = () => {
    return locations.map(location => location.name).sort();
  };

  const getUniqueCategories = () => {
    const categories = Array.from(new Set(reservations.map(r => r.serviceCategory)));
    return categories;
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary' as const;
      case 'confirmed': return 'default' as const;
      case 'cancelled': return 'destructive' as const;
      case 'completed': return 'outline' as const;
      default: return 'secondary' as const;
    }
  };

  const handleReservationSelect = (reservationId: string, checked: boolean) => {
    const newSelected = new Set(selectedReservations);
    if (checked) {
      newSelected.add(reservationId);
    } else {
      newSelected.delete(reservationId);
    }
    setSelectedReservations(newSelected);
  };

  const handleSelectAllReservations = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(getFilteredReservations().map(r => r.id!));
      setSelectedReservations(allIds);
    } else {
      setSelectedReservations(new Set());
    }
  };

  const calculateSelectedTotals = () => {
    const filtered = getFilteredReservations();
    const selected = filtered.filter(r => selectedReservations.has(r.id!));
    const totalAmount = selected.reduce((sum, r) => sum + r.totalAmount, 0);
    const totalCommission = selected.reduce((sum, r) => sum + (r.commissionAmount || 0), 0);
    return { count: selected.length, totalAmount, totalCommission };
  };

  const calculateStats = () => {
    const filtered = getFilteredReservations();
    const totalPersonCount = filtered.reduce((sum, r) => {
      if (r.serviceCategory === "transfer") return sum + (r.personCountForTransfer || 0);
      else if (r.serviceCategory === "motor-tours") return sum + (r.vehicleCount || 0);
      else return sum + (r.personCount || 0);
    }, 0);
    const totalReservations = filtered.length;
    const pendingCount = filtered.filter(r => r.status === 'pending').length;
    const confirmedCount = filtered.filter(r => r.status === 'confirmed').length;
    const cancelledCount = filtered.filter(r => r.status === 'cancelled').length;
    const completedCount = filtered.filter(r => r.status === 'completed').length;
    const totalRevenue = filtered.reduce((sum, r) => sum + r.totalAmount, 0);
    const totalCommission = filtered.reduce((sum, r) => sum + (r.commissionAmount || 0), 0);
    return { totalPersonCount, totalReservations, pendingCount, confirmedCount, cancelledCount, completedCount, totalRevenue, totalCommission };
  };

  const getCategoryLabel = (category: string) => {
    const categories = { "region-tours": "Bölge Turları", "motor-tours": "Aktiviteler", "balloon": "Sıcak Balon", "transfer": "Transfer", "other": "Diğer" };
    return categories[category as keyof typeof categories] || category;
  };

  const getStatusLabel = (status: string) => {
    const statuses = { "pending": "Beklemede", "confirmed": "Onaylandı", "cancelled": "İptal Edildi", "completed": "Tamamlandı" };
    return statuses[status as keyof typeof statuses] || status;
  };

  // --- DÜZENLENMİŞ PDF EXPORT FONKSİYONU ---
  const exportToPDF = async (type: 'reservations' | 'statistics' | 'selected') => {
    try {
      setIsExporting(true);

      // Mevcut, güvenilir font yükleme fonksiyonunu kullan
      const fontBase64 = await loadFontAsBase64('/fonts/Roboto-Regular.ttf');
      
      // Font yüklenemezse işlemi durdur ve hata ver
      if (!fontBase64) {
        throw new Error("PDF için gerekli font dosyası yüklenemedi.");
      }

      const doc = new jsPDF();
      const fontName = 'Roboto';

      // Add Roboto font
      doc.addFileToVFS('Roboto-Regular.ttf', fontBase64);
      doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
      doc.setFont('Roboto'); // Fontu tüm doküman için varsayılan olarak ayarla

      const title = type === 'reservations' ? 'Rezervasyon Raporu' : 
                    type === 'statistics' ? 'İstatistik Raporu' : 
                    'Seçili Rezervasyonlar Raporu';
      
      const dateRange = startDate && endDate ? 
        `${new Date(startDate).toLocaleDateString('tr-TR')} - ${new Date(endDate).toLocaleDateString('tr-TR')}` : 
        'Tüm Tarihler';
      
      const location = selectedLocation === 'all' ? 'Tüm Hizmet Noktaları' : selectedLocation;
      
      doc.setFontSize(18);
      doc.text(title, 14, 20);
      
      // doc.setFont('Roboto'); // Zaten yukarıda ayarlandı, tekrar gerek yok
      doc.setFontSize(11);
      doc.text(`Tarih Aralığı: ${dateRange}`, 14, 30);
      doc.text(`Hizmet Noktası: ${location}`, 14, 37);
      doc.text(`Oluşturulma Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 14, 44);
      
      if (type === 'statistics') {
        const stats = calculateStats();
        
        doc.setFontSize(14);
        doc.text('Genel İstatistikler', 14, 60);
        
        const statData = [
          ['Toplam Rezervasyon', stats.totalReservations.toString()],
          ['Beklemede', stats.pendingCount.toString()],
          ['Onaylandı', stats.confirmedCount.toString()],
          ['İptal Edildi', stats.cancelledCount.toString()],
          ['Tamamlandı', stats.completedCount.toString()],
          ['Toplam Gelir', `${stats.totalRevenue.toLocaleString('tr-TR')} ₺`],
          ['Toplam Komisyon', `${stats.totalCommission.toLocaleString('tr-TR')} ₺`],
          ['Alacak Tutar', `${(stats.totalRevenue - stats.totalCommission).toLocaleString('tr-TR')} ₺`],
          ['Toplam Katılımcı', stats.totalPersonCount.toString()],
        ];
        
        autoTable(doc, {
          startY: 65,
          head: [['İstatistik', 'Değer']],
          body: statData,
          theme: 'striped',
          headStyles: { fillColor: [220, 38, 38] },
          styles: { font: fontName }, // autoTable için fontu belirtmek her zaman iyidir
        });
        
        const categoryStats = availableCategories.map(category => {
          const count = getFilteredReservations().filter(r => r.serviceCategory === category).length;
          return [getCategoryLabel(category), count.toString()];
        }).filter(stat => parseInt(stat[1]) > 0);
        
        if (categoryStats.length > 0) {
          doc.addPage();
          doc.setFontSize(14);
          doc.text('Kategori Bazında Rezervasyonlar', 14, 20);
          
          autoTable(doc, {
            startY: 25,
            head: [['Kategori', 'Rezervasyon Sayısı']],
            body: categoryStats,
            theme: 'striped',
            headStyles: { fillColor: [220, 38, 38] },
            styles: { font: fontName },
          });
        }
      } else {
        const reservationsToExport = type === 'selected' 
          ? getFilteredReservations().filter(r => selectedReservations.has(r.id!))
          : getFilteredReservations();
        
        if (reservationsToExport.length === 0) {
          doc.setFontSize(12);
          doc.text('Seçili kriterlerde rezervasyon bulunamadı.', 14, 60);
        } else {
          const tableData = reservationsToExport.map(r => [
            r.id?.substring(0, 8).toUpperCase() || '',
            `${r.customerName} ${r.customerSurname}`,
            r.serviceName,
            r.locationName,
            new Date(r.reservationDate).toLocaleDateString('tr-TR'),
            `${r.timeSlot.startTime} - ${r.timeSlot.endTime}`,
            r.serviceCategory === 'transfer' 
              ? `${r.personCountForTransfer || 0} kişi / ${r.vehicleCount || 0} araç`
              : r.serviceCategory === 'motor-tours'
                ? `${r.vehicleCount || 0} araç`
                : `${r.personCount || 0} kişi`,
            `${r.totalAmount.toLocaleString('tr-TR')} ₺`,
            `${(r.commissionAmount || 0).toLocaleString('tr-TR')} ₺`,
            getStatusLabel(r.status)
          ]);
          
          autoTable(doc, {
            startY: 55,
            head: [['Rezervasyon No', 'Müşteri', 'Hizmet', 'Hizmet Noktası', 'Tarih', 'Saat', 'Katılımcı', 'Tutar', 'Komisyon', 'Durum']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [220, 38, 38] },
            styles: { font: fontName, fontSize: 8 },
            columnStyles: {
              0: { cellWidth: 20 },
              7: { cellWidth: 20 },
              8: { cellWidth: 20 },
            },
          });
          
          const totalAmount = reservationsToExport.reduce((sum, r) => sum + r.totalAmount, 0);
          const totalCommission = reservationsToExport.reduce((sum, r) => sum + (r.commissionAmount || 0), 0);
          
          doc.addPage();
          doc.setFontSize(14);
          doc.text('Özet Bilgiler', 14, 20);
          
          const summaryData = [
            ['Toplam Rezervasyon', reservationsToExport.length.toString()],
            ['Toplam Tutar', `${totalAmount.toLocaleString('tr-TR')} ₺`],
            ['Toplam Komisyon', `${totalCommission.toLocaleString('tr-TR')} ₺`],
            ['Alacak Tutar', `${(totalAmount - totalCommission).toLocaleString('tr-TR')} ₺`],
          ];
          
          autoTable(doc, {
            startY: 25,
            head: [['Özet', 'Değer']],
            body: summaryData,
            theme: 'striped',
            headStyles: { fillColor: [220, 38, 38] },
            styles: { font: fontName },
          });
        }
      }
      
      const fileName = `${title.toLowerCase().replace(/\s+/g, '-')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      toast({
        title: "Başarılı",
        description: "Rapor PDF olarak indirildi",
      });
    } catch (error) {
      console.error('PDF export error:', error);
      const errorMessage = error instanceof Error ? error.message : "PDF oluşturulurken bir hata oluştu";
      toast({
        title: "Hata",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setIsExportPopoverOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Veriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Raporlar</h1>
          <p className="text-muted-foreground">Rezervasyon analizi</p>
        </div>
        <div className="flex flex-col sm:flex-row items-end gap-3">
          <div>
            <Label htmlFor="location" className="text-xs">Hizmet Noktası</Label>
            <Select value={selectedLocation} onValueChange={handleLocationChange}>
              <SelectTrigger id="location" className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Hizmet Noktaları</SelectItem>
                {getUniqueLocations().map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="startDate" className="text-xs">Başlangıç Tarihi</Label>
            <Input
              id="startDate"
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-36"
            />
          </div>
          <div>
            <Label htmlFor="endDate" className="text-xs">Bitiş Tarihi</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-36"
            />
          </div>
          <Button 
            variant="outline" 
            size="sm"
            disabled={!startDate || !endDate} 
            onClick={() => {
              if (startDate && endDate) {
                const fromDate = new Date(startDate);
                const toDate = new Date(endDate);
                if (fromDate > toDate) {
                  alert("Başlangıç tarihi bitiş tarihinden sonra olamaz!");
                  return;
                }
                setLoadingFiltered(true);
                setTimeout(() => { setLoadingFiltered(false); }, 500);
              }
            }}
            className="h-10"
          >
            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
            Onayla
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleResetDates}
            title="Tarihleri Sıfırla"
            className="h-10 w-10"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Popover open={isExportPopoverOpen} onOpenChange={setIsExportPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Dışa Aktar
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2">
              <div className="space-y-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start" 
                  onClick={() => exportToPDF('reservations')}
                  disabled={isExporting}
                >
                  <TableIcon className="h-4 w-4 mr-2" />
                  Tüm Rezervasyonlar
                </Button>
                {selectedReservations.size > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start" 
                    onClick={() => exportToPDF('selected')}
                    disabled={isExporting}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Seçili Rezervasyonlar
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start" 
                  onClick={() => exportToPDF('statistics')}
                  disabled={isExporting}
                >
                  <BarChart className="h-4 w-4 mr-2" />
                  İstatistikler
                </Button>
                {isExporting && (
                  <div className="text-center py-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto"></div>
                    <p className="text-xs text-muted-foreground mt-1">İşleniyor...</p>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-1 max-w-[200px]">
          <TabsTrigger value="reservations">Rezervasyon</TabsTrigger>
        </TabsList>
        <TabsContent value="reservations" className="space-y-4">
          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Toplam Rezervasyon
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loadingFiltered ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{calculateStats().totalReservations}</div>
                    <p className="text-xs text-muted-foreground">
                      {selectedLocation === "all" ? "Tüm hizmet noktaları" : selectedLocation}
                      {(startDate && endDate) && ` (${new Date(startDate).toLocaleDateString('tr-TR')} - ${new Date(endDate).toLocaleDateString('tr-TR')})`}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Toplam Gelir
                </CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loadingFiltered ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-green-600">
                      {calculateStats().totalRevenue.toLocaleString('tr-TR')} ₺
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Komisyon: <span className="text-blue-600 font-medium">{calculateStats().totalCommission.toLocaleString('tr-TR')} ₺</span><br />
                      Alacak Tutar: <span className="text-green-600 font-medium">{(calculateStats().totalRevenue - calculateStats().totalCommission).toLocaleString('tr-TR')} ₺</span>
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Toplam Komisyon
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loadingFiltered ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-blue-600">
                      {calculateStats().totalCommission.toLocaleString('tr-TR')} ₺
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Rezervasyonlardan elde edilen komisyon
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Reservations List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-medium">Tüm Rezervasyonlar</CardTitle>
                  <CardDescription>
                    Rezervasyonları seçerek toplam tutarı ve komisyonu hesaplayabilirsiniz
                  </CardDescription>
                </div>
                {selectedReservations.size > 0 && (
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      {calculateSelectedTotals().count} rezervasyon seçili
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      Toplam: {calculateSelectedTotals().totalAmount.toLocaleString('tr-TR')} ₺
                    </div>
                    <div className="text-sm font-medium text-blue-600">
                      Komisyon: {calculateSelectedTotals().totalCommission.toLocaleString('tr-TR')} ₺
                    </div>

                    Alacak Tutar: <span className="text-green-600 font-medium">{(calculateSelectedTotals().totalAmount - calculateSelectedTotals().totalCommission).toLocaleString('tr-TR')} ₺</span>
                    
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loadingFiltered ? (
                <div className="animate-pulse">
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center space-x-4 p-2">
                        <div className="h-4 w-4 bg-gray-200 rounded"></div>
                        <div className="flex-1 space-y-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedReservations.size === getFilteredReservations().length && getFilteredReservations().length > 0}
                            onCheckedChange={handleSelectAllReservations}
                          />
                        </TableHead>
                        <TableHead>Hizmet Adı</TableHead>
                        <TableHead>Hizmet Noktası</TableHead>
                        <TableHead>Etkinlik Tarihi</TableHead>
                        <TableHead>Rezervasyon Tarihi</TableHead>
                        <TableHead className="text-right">Toplam Tutar</TableHead>
                        <TableHead className="text-right">Komisyon</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        const filtered = getFilteredReservations();
                        const sorted = [...filtered].sort((a, b) => 
                          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                        );

                        if (sorted.length === 0) {
                          return (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-8">
                                Seçili kriterlerde rezervasyon bulunamadı
                              </TableCell>
                            </TableRow>
                          );
                        }

                        return sorted.map((reservation) => (
                          <TableRow key={reservation.id} className="hover:bg-muted/50">
                            <TableCell>
                              <Checkbox
                                checked={selectedReservations.has(reservation.id!)}
                                onCheckedChange={(checked) => 
                                  handleReservationSelect(reservation.id!, checked as boolean)
                                }
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              {reservation.serviceName}
                            </TableCell>
                            <TableCell>
                              {reservation.locationName}
                            </TableCell>
                            <TableCell>
                              {new Date(reservation.reservationDate).toLocaleDateString('tr-TR')}
                              <div className="text-xs text-muted-foreground">
                                {reservation.timeSlot.startTime} - {reservation.timeSlot.endTime}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {reservation.serviceCategory === "transfer" ? (
                                  <span className="text-sm">{reservation.personCountForTransfer || 0} kişi / {reservation.vehicleCount || 0} araç</span>
                                ) : reservation.serviceCategory === "motor-tours" ? (
                                  <span className="text-sm">{reservation.vehicleCount || 0} araç</span>
                                ) : (
                                  <span className="text-sm">{reservation.personCount || 0} kişi</span>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 w-6 p-0"
                                  onClick={() => {
                                    setViewingReservation(reservation);
                                    setIsViewModalOpen(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                </Button>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(reservation.createdAt).toLocaleDateString('tr-TR')} {new Date(reservation.createdAt).toLocaleTimeString('tr-TR', {hour: '2-digit', minute: '2-digit'})}
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {reservation.totalAmount.toLocaleString('tr-TR')} ₺
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="font-medium text-blue-600">
                                {(reservation.commissionAmount || 0).toLocaleString('tr-TR')} ₺
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {(() => {
                                  const count = reservation.serviceCategory === "transfer" 
                                    ? reservation.personCountForTransfer || 0
                                    : reservation.serviceCategory === "motor-tours"
                                      ? reservation.vehicleCount || 0
                                      : reservation.personCount || 0;
                                  
                                  return count > 0 
                                    ? `${Math.round((reservation.commissionAmount || 0) / count).toLocaleString('tr-TR')} ₺/${
                                        reservation.serviceCategory === "transfer" || reservation.serviceCategory === "motor-tours" 
                                          ? "araç" : "kişi"
                                      }`
                                    : "";
                                })()}
                              </div>
                            </TableCell>
                          </TableRow>
                        ));
                      })()}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
          {/* Status and Category Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Reservation Status Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Rezervasyon Durumları</CardTitle>
              </CardHeader>
              <CardContent className="pb-1">
                {loadingFiltered ? (
                  <div className="animate-pulse">
                    <div className="space-y-0.5">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex justify-between items-center">
                          <div className="h-3 bg-gray-200 rounded"></div>
                          <div className="h-3 bg-gray-200 rounded w-6"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-yellow-500"></div>
                        <span className="text-sm text-muted-foreground">Beklemede</span>
                      </div>
                      <div className="text-base font-bold text-yellow-600">
                        {calculateStats().pendingCount}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                        <span className="text-sm text-muted-foreground">Onaylandı</span>
                      </div>
                      <div className="text-base font-bold text-green-600">
                        {calculateStats().confirmedCount}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                        <span className="text-sm text-muted-foreground">İptal</span>
                      </div>
                      <div className="text-base font-bold text-red-600">
                        {calculateStats().cancelledCount}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                        <span className="text-sm text-muted-foreground">Tamamlandı</span>
                      </div>
                      <div className="text-base font-bold text-blue-600">
                        {calculateStats().completedCount}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Category Reservations Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Kategori Bazında Rezervasyonlar</CardTitle>
              </CardHeader>
              <CardContent className="pb-1">
                {loadingFiltered ? (
                  <div className="animate-pulse">
                    <div className="space-y-0.5">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex justify-between items-center">
                          <div className="h-3 bg-gray-200 rounded flex-1 mr-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-6"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {(() => {
                      const filtered = getFilteredReservations();
                      const categoryStats = availableCategories.map(category => {
                        const count = filtered.filter(r => r.serviceCategory === category).length;
                        return { category, count };
                      }).filter(stat => stat.count > 0);

                      if (categoryStats.length === 0) {
                        return (
                          <div className="text-center text-xs text-muted-foreground py-1">
                            Seçili kriterlerde rezervasyon bulunamadı
                          </div>
                        );
                      }

                      return categoryStats.map(({ category, count }) => (
                        <div key={category} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`h-1.5 w-1.5 rounded-full ${
                              category === 'region-tours' ? 'bg-purple-500' :
                              category === 'motor-tours' ? 'bg-orange-500' :
                              category === 'balloon' ? 'bg-pink-500' :
                              category === 'transfer' ? 'bg-cyan-500' :
                              'bg-gray-500'
                            }`}></div>
                            <span className="text-sm text-muted-foreground">
                              {getCategoryLabel(category)}
                            </span>
                          </div>
                          <div className="text-base font-bold text-gray-700">
                            {count}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Most Expensive 5 Reservations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">En Pahalı 5 Rezervasyon</CardTitle>
              </CardHeader>
              <CardContent className="max-h-48 overflow-y-auto">
                {loadingFiltered ? (
                  <div className="animate-pulse">
                    <div className="space-y-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex justify-between items-center p-1.5 border rounded">
                          <div className="flex-1">
                            <div className="h-3 bg-gray-200 rounded mb-1"></div>
                            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                          </div>
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {(() => {
                      const filtered = getFilteredReservations();
                      const sortedByPrice = [...filtered]
                        .sort((a, b) => b.totalAmount - a.totalAmount)
                        .slice(0, 5);

                      if (sortedByPrice.length === 0) {
                        return (
                          <div className="text-center text-xs text-muted-foreground py-1">
                            Seçili kriterlerde rezervasyon bulunamadı
                          </div>
                        );
                      }

                      return sortedByPrice.map((reservation, index) => (
                        <div key={reservation.id} className="flex items-center justify-between p-1.5 border rounded hover:bg-gray-50">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-gray-600">#{index + 1}</span>
                              <span className="text-xs font-medium">{reservation.serviceName}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {reservation.locationName}
                            </div>
                            <div className="text-xs text-blue-600 font-medium">
                              Komisyon: {(reservation.commissionAmount || 0).toLocaleString('tr-TR')} ₺ + Satış: {(reservation.totalAmount - (reservation.commissionAmount || 0)).toLocaleString('tr-TR')} ₺
                            </div>
                          </div>
                          <div className="text-sm font-bold text-green-600">
                            {reservation.totalAmount.toLocaleString('tr-TR')} ₺
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

      </Tabs>
      
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rezervasyon Detayları</DialogTitle>
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
                    <p className="font-medium">{new Date(viewingReservation.reservationDate).toLocaleDateString('tr-TR')}</p>
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
                    <Badge variant={getStatusVariant(viewingReservation.status)}>
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
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Komisyon</p>
                        <p className="font-medium">{viewingReservation.commissionAmount} ₺</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Alacak Tutar</p>
                        <p className="font-medium text-green-600">{viewingReservation.totalAmount - viewingReservation.commissionAmount} ₺</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}