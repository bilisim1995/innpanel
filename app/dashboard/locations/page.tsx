"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LocationModal } from "@/components/locations/location-modal";
import { getLocations, deleteLocation, LocationData } from "@/lib/locations";
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
import { Edit, Trash2, MapPin, QrCode } from "lucide-react";
import { QrCodeModal } from "@/components/locations/qr-code-modal";

export default function LocationsPage() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLocation, setEditingLocation] = useState<LocationData | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const { toast } = useToast();

  const loadLocations = useCallback(async () => {
    try {
      setLoading(true);
      const locationsData = await getLocations();
      setLocations(locationsData);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Hizmet noktaları yüklenirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  const handleDelete = async (id: string) => {
    try {
      await deleteLocation(id);
      toast({
        title: "Başarılı",
        description: "Hizmet noktası başarıyla silindi",
      });
      loadLocations(); // Reload locations
    } catch (error) {
      toast({
        title: "Hata",
        description: "Hizmet noktası silinirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (location: LocationData) => {
    setEditingLocation(location);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingLocation(null);
    loadLocations(); // Reload locations when modal closes
  };

  const handleQrCodeView = (location: LocationData) => {
    setSelectedLocation(location);
    setIsQrModalOpen(true);
  };
  const getFacilityTypeLabel = (type: string) => {
    const types = {
      "hotel": "Otel",
      "cafe": "Cafe",
      "restaurant": "Restoran",
      "agency": "Acenta",
      "activity": "Aktivite Merkezi",
      "other": "Diğer",
    };
    return types[type as keyof typeof types] || type;
  };

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(search.toLowerCase()) ||
    location.managerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Hizmet Noktaları</h1>
          <p className="text-muted-foreground">Tüm hizmet noktalarını yönetin</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Hizmet Noktası Oluştur
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Hizmet noktası ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hizmet Noktası Adı</TableHead>
                <TableHead>Tür</TableHead>
                <TableHead>Yetkili</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Yükleniyor...
                  </TableCell>
                </TableRow>
              ) : filteredLocations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    {search ? "Arama kriterlerine uygun hizmet noktası bulunamadı" : "Henüz hizmet noktası eklenmemiş"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredLocations.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell className="font-medium">{location.name}</TableCell>
                    <TableCell>{getFacilityTypeLabel(location.type)}</TableCell>
                    <TableCell>{location.managerName}</TableCell>
                    <TableCell>{location.managerPhone}</TableCell>
                    <TableCell>
                      <Badge variant={location.isActive ? "default" : "secondary"}>
                        {location.isActive ? "Aktif" : "Pasif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleQrCodeView(location)}
                          title="QR Kod Oluştur"
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(location)}
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
                              <AlertDialogTitle>Hizmet Noktasını Sil</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bu hizmet noktasını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>İptal</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => location.id && handleDelete(location.id)}
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

      <LocationModal 
        isOpen={isModalOpen}
        onClose={handleModalClose}
        editingLocation={editingLocation}
      />

      <QrCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        location={selectedLocation}
      />
    </div>
  );
}