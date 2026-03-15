"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ServiceModal } from "@/components/services/service-modal";
import { SortableServiceRow } from "@/components/services/SortableServiceRow";
import { getServices, deleteService, updateService, ServiceData } from "@/lib/services";
import { useToast } from "@/hooks/use-toast";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

export default function ServicesPage() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState<ServiceData | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<{[key: string]: boolean}>({});
  const [updatingOrder, setUpdatingOrder] = useState(false);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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

  const servicesByCategory = useMemo(() => {
    const map: Record<string, ServiceData[]> = {};
    filteredServices.forEach(service => {
      const cat = service.category || "other";
      if (!map[cat]) map[cat] = [];
      map[cat].push(service);
    });
    const order = ["region-tours", "motor-tours", "balloon", "transfer", "other"];
    const known = order.filter(c => map[c]).map(cat => ({ category: cat, items: map[cat] }));
    const unknown = Object.keys(map).filter(c => !order.includes(c)).map(cat => ({ category: cat, items: map[cat] }));
    return [...known, ...unknown];
  }, [filteredServices]);

  const handleDragEnd = useCallback(async (event: DragEndEvent, categoryItems: ServiceData[]) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categoryItems.findIndex(s => s.id === active.id);
    const newIndex = categoryItems.findIndex(s => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...categoryItems];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    setUpdatingOrder(true);
    try {
      await Promise.all(
        reordered.map((service, index) =>
          updateService(service.id!, { sortOrder: index })
        )
      );
      toast({ title: "Başarılı", description: "Sıralama güncellendi" });
      loadServices();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Sıralama güncellenirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setUpdatingOrder(false);
    }
  }, [loadServices, toast]);

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
                <TableHead className="w-10"></TableHead>
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
                  <TableCell colSpan={8} className="text-center py-8">
                    Yükleniyor...
                  </TableCell>
                </TableRow>
              ) : filteredServices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    {search ? "Arama kriterlerine uygun hizmet bulunamadı" : "Henüz aktif hizmet eklenmemiş"}
                  </TableCell>
                </TableRow>
              ) : (
                servicesByCategory.map(({ category, items }) => (
                  <DndContext
                    key={category}
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(e) => handleDragEnd(e, items)}
                  >
                    <SortableContext
                      items={items.map(s => s.id!)}
                      strategy={verticalListSortingStrategy}
                    >
                      {items.map((service) => (
                        <SortableServiceRow
                          key={service.id}
                          service={service}
                          getCategoryLabel={getCategoryLabel}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onStatusToggle={handleStatusToggle}
                          updatingStatus={updatingStatus[service.id!]}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
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