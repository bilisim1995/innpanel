"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Eye, Edit, Trash2, Link as LinkIcon, Building2, MapPin, Users, Calendar, Clock, CreditCard, Settings, Package, Tag, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getServices, ServiceData } from "@/lib/services";
import { getLocations, LocationData } from "@/lib/locations";
import { saveAssignment, getAssignments, deleteAssignment, AssignmentData } from "@/lib/assignments";
import { useToast } from "@/hooks/use-toast";
import { AssignmentEditModal } from "@/components/assignments/assignment-edit-modal";
import { cn } from "@/lib/utils";

export default function AssignServicesPage() {
  const [activeTab, setActiveTab] = useState("assign");
  const [services, setServices] = useState<ServiceData[]>([]);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [assignments, setAssignments] = useState<AssignmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [serviceSearch, setServiceSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [assignmentSearch, setAssignmentSearch] = useState("");
  const [selectedService, setSelectedService] = useState<ServiceData | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [viewingAssignment, setViewingAssignment] = useState<AssignmentData | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<AssignmentData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { toast } = useToast();

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

  const getPaymentMethodLabel = (method: string) => {
    const methods = {
      "cash": "Nakit",
      "credit-card": "Kredi Kartı",
    };
    return methods[method as keyof typeof methods] || method;
  };
  
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [servicesData, locationsData, assignmentsData] = await Promise.all([
        getServices(),
        getLocations(),
        getAssignments(),
      ]);
      
      setServices(servicesData.filter(s => s.isActive));
      setLocations(locationsData.filter(l => l.isActive));
      setAssignments(assignmentsData);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Veriler yüklenirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAssign = async () => {
    if (!selectedService || !selectedLocation) {
      toast({
        title: "Eksik Seçim",
        description: "Lütfen bir hizmet ve bir hizmet noktası seçin.",
        variant: "destructive",
      });
      return;
    }

    const alreadyExists = assignments.some(
      a => a.serviceId === selectedService.id && a.locationId === selectedLocation.id
    );

    if (alreadyExists) {
      toast({
        title: "Mevcut Atama",
        description: "Bu hizmet bu noktaya zaten atanmış.",
        variant: "destructive",
      });
      return;
    }

    setIsAssigning(true);
    try {
      const newAssignment: Omit<AssignmentData, 'id' | 'assignedAt'> = {
        serviceId: selectedService.id!,
        serviceName: selectedService.serviceName,
        companyName: selectedService.companyName,
        serviceCategory: selectedService.category,
        locationId: selectedLocation.id!,
        locationName: selectedLocation.name,
        locationType: selectedLocation.type,
        managerName: selectedLocation.managerName || "",
        isActive: true,
        pricingSettings: {
            prepaymentEnabled: false,
            paymentMethods: {
                fullPayment: true,
                prePayment: true,
                fullAtLocation: true,
            },
            dateRanges: [],
        },
      };
      
      await saveAssignment(newAssignment);

      toast({
        title: "Başarılı",
        description: "Hizmet başarıyla atandı.",
      });

      setSelectedService(null);
      setSelectedLocation(null);
      await loadData();
      setActiveTab("manage");

    } catch (error) {
      toast({
        title: "Hata",
        description: "Hizmet atanırken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };


  const handleDeleteAssignment = async (id: string) => {
    try {
      await deleteAssignment(id);
      toast({
        title: "Başarılı",
        description: "Atama başarıyla silindi",
      });
      loadData();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Atama silinirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  const handleViewAssignment = (assignment: AssignmentData) => {
    setViewingAssignment(assignment);
    setIsViewModalOpen(true);
  };

  const handleEditAssignment = (assignment: AssignmentData) => {
    setEditingAssignment(assignment);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setEditingAssignment(null);
    loadData();
  };

  const filteredServices = services.filter(s => 
    s.serviceName.toLowerCase().includes(serviceSearch.toLowerCase()) || 
    s.companyName.toLowerCase().includes(serviceSearch.toLowerCase())
  );
  
  const filteredLocations = locations.filter(l => 
    l.name.toLowerCase().includes(locationSearch.toLowerCase())
  );

  const filteredAssignments = assignments.filter(assignment =>
    assignment.serviceName.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
    assignment.locationName.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
    assignment.companyName.toLowerCase().includes(assignmentSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Hizmet Atama</h1>
          <p className="text-muted-foreground">Hizmetleri hizmet noktalarına atayın ve yönetin</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assign" className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            Hizmet Ata
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Atamaları Yönet
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assign" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Hizmet Seç</CardTitle>
                <CardDescription>Atamak istediğiniz hizmeti listeden seçin.</CardDescription>
                <div className="flex items-center gap-2 pt-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Hizmetlerde ara..."
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                    className="w-full"
                  />
                </div>
              </CardHeader>
              <CardContent className="max-h-[400px] overflow-y-auto">
                <div className="space-y-2">
                  {filteredServices.length > 0 ? filteredServices.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => setSelectedService(service)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg border transition-colors",
                        selectedService?.id === service.id
                          ? "bg-primary/10 border-primary"
                          : "hover:bg-muted/50"
                      )}
                    >
                      <p className="font-semibold">{service.serviceName}</p>
                      <p className="text-sm text-muted-foreground">{service.companyName}</p>
                      <Badge variant="outline" className="mt-1">{getCategoryLabel(service.category)}</Badge>
                    </button>
                  )) : <p className="text-sm text-muted-foreground text-center py-4">Aktif hizmet bulunamadı.</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hizmet Noktası Seç</CardTitle>
                <CardDescription>Hizmetin atanacağı noktayı seçin.</CardDescription>
                <div className="flex items-center gap-2 pt-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Noktalarda ara..."
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    className="w-full"
                  />
                </div>
              </CardHeader>
              <CardContent className="max-h-[400px] overflow-y-auto">
                <div className="space-y-2">
                  {filteredLocations.length > 0 ? filteredLocations.map((location) => (
                    <button
                      key={location.id}
                      onClick={() => setSelectedLocation(location)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg border transition-colors",
                        selectedLocation?.id === location.id
                          ? "bg-primary/10 border-primary"
                          : "hover:bg-muted/50"
                      )}
                    >
                      <p className="font-semibold">{location.name}</p>
                      <p className="text-sm text-muted-foreground">{location.address}</p>
                    </button>
                  )) : <p className="text-sm text-muted-foreground text-center py-4">Aktif hizmet noktası bulunamadı.</p>}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Atama Özeti</CardTitle>
              <CardDescription>Seçilen hizmet ve hizmet noktasını kontrol edip atamayı tamamlayın.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-1">Seçilen Hizmet</h4>
                  {selectedService ? (
                    <div>
                      <p>{selectedService.serviceName}</p>
                      <p className="text-muted-foreground">{selectedService.companyName}</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Hizmet seçilmedi</p>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Seçilen Hizmet Noktası</h4>
                  {selectedLocation ? (
                    <div>
                      <p>{selectedLocation.name}</p>
                      <p className="text-muted-foreground">{selectedLocation.address}</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Nokta seçilmedi</p>
                  )}
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    className="w-full"
                    disabled={!selectedService || !selectedLocation || isAssigning}
                  >
                    {isAssigning ? "Atanıyor..." : "Hizmeti Ata"}
                    <LinkIcon className="ml-2 h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Atamayı Onayla</AlertDialogTitle>
                    <AlertDialogDescription>
                      {selectedService?.serviceName} hizmetini {selectedLocation?.name} noktasına atamak istediğinizden emin misiniz?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>İptal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleAssign}>Onayla</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Atanmış Hizmetler</CardTitle>
              <CardDescription>
                Mevcut hizmet atamalarını görüntüleyin ve yönetin
              </CardDescription>
              <div className="flex items-center gap-2 pt-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Atama ara..."
                  value={assignmentSearch}
                  onChange={(e) => setAssignmentSearch(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hizmet</TableHead>
                      <TableHead>Hizmet Noktası</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssignments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          {assignmentSearch ? "Arama kriterlerine uygun atama bulunamadı" : "Henüz atama yapılmamış"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAssignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell className="font-medium">
                            {assignment.serviceName}
                            <div className="text-xs text-muted-foreground">{assignment.companyName}</div>
                          </TableCell>
                          <TableCell>{assignment.locationName}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getCategoryLabel(assignment.serviceCategory)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={assignment.isActive ? "default" : "secondary"}>
                              {assignment.isActive ? "Aktif" : "Pasif"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleViewAssignment(assignment)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditAssignment(assignment)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Atamayı Sil</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Bu atamayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>İptal</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => assignment.id && handleDeleteAssignment(assignment.id)}
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

      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Atama Detayları</DialogTitle>
            <DialogDescription>
              Atanan hizmetin detaylı bilgileri.
            </DialogDescription>
          </DialogHeader>
          {viewingAssignment && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2"><Package className="h-4 w-4" /> Hizmet Bilgileri</h4>
                  <p className="text-sm"><span className="font-medium">Adı:</span> {viewingAssignment.serviceName}</p>
                  <p className="text-sm"><span className="font-medium">Firma:</span> {viewingAssignment.companyName}</p>
                  <p className="text-sm"><span className="font-medium">Kategori:</span> <Badge variant="outline">{getCategoryLabel(viewingAssignment.serviceCategory)}</Badge></p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2"><MapPin className="h-4 w-4" /> Hizmet Noktası</h4>
                  <p className="text-sm"><span className="font-medium">Adı:</span> {viewingAssignment.locationName}</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-semibold flex items-center gap-2 mb-2"><Settings className="h-4 w-4" /> Durum</h4>
                 <Badge variant={viewingAssignment.isActive ? "default" : "secondary"}>
                    {viewingAssignment.isActive ? "Aktif" : "Pasif"}
                  </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {editingAssignment && (
        <AssignmentEditModal
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          assignment={editingAssignment}
        />
      )}
    </div>
  );
}
