"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ServiceModal } from "@/components/services/service-modal";
import { getServices, deleteService, updateService, ServiceData } from "@/lib/services";
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
import { Edit, Trash2, Eye } from "lucide-react";

export default function ServicesPage() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState<ServiceData | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();

  const loadServices = useCallback(async () => {
    try {
      setLoading(true);
      const servicesData = await getServices();
      setServices(servicesData);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Hizmetler yüklenirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const handleDelete = async (id: string) => {
    try {
      await deleteService(id);
      toast({
        title: "Başarılı",
        description: "Hizmet başarıyla silindi",
      });
      loadServices(); // Reload services
    } catch (error) {
      toast({
        title: "Hata",
        description: "Hizmet silinirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (service: ServiceData) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingService(null);
    loadServices(); // Reload services when modal closes
  };

  const handleStatusToggle = async (service: ServiceData) => {
    if (!service.id) return;
    
    setUpdatingStatus(prev => ({ ...prev, [service.id!]: true }));
    
    try {
      await updateService(service.id, { isActive: !service.isActive });
      toast({
        title: "Başarılı",
        description: `Hizmet ${!service.isActive ? 'aktif' : 'pasif'} hale getirildi`,
      });
      loadServices(); // Reload services
    } catch (error) {
      toast({
        title: "Hata",
        description: "Hizmet durumu güncellenirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [service.id!]: false }));
    }
  };

  const getCategoryLabel = (category: string) => {
    const categories = {
      "region-tours": "Bölge Turları",
      "motor-tours": "Aktiviteler",
      "balloon": "Sıcak Balon",
      "transfer": "Transfer",
      "other": "Diğer",
    };
    return categories[category as keyof typeof categories] || category;
  };

  const filteredServices = services.filter(service =>
    service.serviceName.toLowerCase().includes(search.toLowerCase()) ||
    service.companyName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Hizmetler</h1>
          <p className="text-muted-foreground">Tüm hizmetleri yönetin</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Hizmet Oluştur
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Hizmet ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hizmet Adı</TableHead>
                <TableHead>Firma</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Kontenjan</TableHead>
                <TableHead>Satış Durumu</TableHead>
                <TableHead>Görünürlük</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Yükleniyor...
                  </TableCell>
                </TableRow>
              ) : filteredServices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    {search ? "Arama kriterlerine uygun hizmet bulunamadı" : "Henüz aktif hizmet eklenmemiş"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.serviceName}</TableCell>
                    <TableCell>{service.companyName}</TableCell>
                    <TableCell>{getCategoryLabel(service.category)}</TableCell>
                    <TableCell>{service.quota}</TableCell>
                    <TableCell>
                      <Badge variant={service.isActive ? "default" : "secondary"}>
                        {service.isActive ? "Aktif" : "Pasif"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={service.isActive}
                        onCheckedChange={() => handleStatusToggle(service)}
                        disabled={updatingStatus[service.id!]}
                        className="data-[state=checked]:bg-green-600"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(service)}
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
                              <AlertDialogTitle>Hizmeti Sil</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bu hizmeti silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>İptal</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => service.id && handleDelete(service.id)}
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

      <ServiceModal 
        isOpen={isModalOpen}
        onClose={handleModalClose}
        editingService={editingService}
      />
    </div>
  );
}