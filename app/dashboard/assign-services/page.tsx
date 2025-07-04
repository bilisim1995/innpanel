"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Eye, Edit, Trash2, Link as LinkIcon, Building2, MapPin, Users, Calendar, Clock, CreditCard, Settings } from "lucide-react";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getServices, ServiceData } from "@/lib/services";
import { getLocations, LocationData } from "@/lib/locations";
import { saveAssignment, getAssignments, deleteAssignment, AssignmentData, updateAssignment } from "@/lib/assignments";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { AssignmentEditModal } from "@/components/assignments/assignment-edit-modal";

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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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
  };

  const handleServiceSelect = (service: ServiceData) => {
    setSelectedService(service);
  };

  const handleLocationSelect = (location: LocationData) => {
    setSelectedLocation(location);
  };

  const handleAssign = async () => {
    if (!selectedService || !selectedLocation) {
      toast({
        title: "Hata",
        description: "Lütfen hizmet ve hizmet noktası seçin",
        variant: "destructive",
      });
      return;
    }

    setIsAssigning(true);
    try {
      await saveAssignment({
        serviceId: selectedService.id!,
        serviceName: selectedService.serviceName,
        serviceCategory: selectedService.category,
        companyName: selectedService.companyName,
        locationId: selectedLocation.id!,
        locationSlug: selectedLocation.slug,
        locationName: selectedLocation.name,
        locationType: selectedLocation.type,
        managerName: selectedLocation.managerName,
        isActive: true,
        notes: "",
      });

      toast({
        title: "Başarılı",
        description: "Hizmet başarıyla atandı",
      });

      // Reset selections and reload data
      setSelectedService(null);
      setSelectedLocation(null);
      loadData();
    } catch (error) {
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Atama yapılırken bir hata oluştu",
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
    loadData(); // Reload data when modal closes
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

  const filteredServices = services.filter(service =>
    service.serviceName.toLowerCase().includes(serviceSearch.toLowerCase()) ||
    service.companyName.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(locationSearch.toLowerCase()) ||
    location.managerName.toLowerCase().includes(locationSearch.toLowerCase())
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Services Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Hizmetler
                </CardTitle>
                <CardDescription>
                  Atamak istediğiniz hizmeti seçin
                </CardDescription>
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Hizmet ara..."
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredServices.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      {serviceSearch ? "Arama kriterlerine uygun hizmet bulunamadı" : "Aktif hizmet bulunamadı"}
                    </p>
                  ) : (
                    filteredServices.map((service) => (
                      <div
                        key={service.id}
                        className={cn(
                          "p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted",
                          selectedService?.id === service.id && "border-primary bg-primary/5"
                        )}
                        onClick={() => handleServiceSelect(service)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{service.serviceName}</h4>
                            <p className="text-sm text-muted-foreground">{service.companyName}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {getCategoryLabel(service.category)}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Kontenjan: {service.quota}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle service view
                            }}
                            className="ml-2 flex-shrink-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Locations Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Hizmet Noktaları
                </CardTitle>
                <CardDescription>
                  Hizmetin atanacağı noktayı seçin
                </CardDescription>
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Hizmet noktası ara..."
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredLocations.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      {locationSearch ? "Arama kriterlerine uygun hizmet noktası bulunamadı" : "Aktif hizmet noktası bulunamadı"}
                    </p>
                  ) : (
                    filteredLocations.map((location) => (
                      <div
                        key={location.id}
                        className={cn(
                          "p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted",
                          selectedLocation?.id === location.id && "border-primary bg-primary/5"
                        )}
                        onClick={() => handleLocationSelect(location)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{location.name}</h4>
                            <p className="text-sm text-muted-foreground">{location.managerName}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {getFacilityTypeLabel(location.type)}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {location.address.substring(0, 50)}...
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle location view
                            }}
                            className="ml-2 flex-shrink-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Assignment Action */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Atama Yap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Seçili Hizmet</h4>
                    {selectedService ? (
                      <div>
                        <p className="font-medium">{selectedService.serviceName}</p>
                        <p className="text-sm text-muted-foreground">{selectedService.companyName}</p>
                        <Badge variant="outline" className="mt-1">
                          {getCategoryLabel(selectedService.category)}
                        </Badge>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Henüz hizmet seçilmedi</p>
                    )}
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Seçili Hizmet Noktası</h4>
                    {selectedLocation ? (
                      <div>
                        <p className="font-medium">{selectedLocation.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedLocation.managerName}</p>
                        <Badge variant="outline" className="mt-1">
                          {getFacilityTypeLabel(selectedLocation.type)}
                        </Badge>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Henüz hizmet noktası seçilmedi</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-center">
                  <Button
                    onClick={handleAssign}
                    disabled={!selectedService || !selectedLocation || isAssigning}
                    size="lg"
                    className="min-w-[200px]"
                  >
                    {isAssigning ? "Atanıyor..." : "Hizmeti Ata"}
                  </Button>
                </div>
              </div>
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
              <div className="flex items-center gap-2">
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
                      <TableHead>Firma</TableHead>
                      <TableHead>Hizmet Noktası</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Atama Tarihi</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssignments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          {assignmentSearch ? "Arama kriterlerine uygun atama bulunamadı" : "Henüz atama yapılmamış"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAssignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell className="font-medium">{assignment.serviceName}</TableCell>
                          <TableCell>{assignment.companyName}</TableCell>
                          <TableCell>{assignment.locationName}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getCategoryLabel(assignment.serviceCategory)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {assignment.assignedAt.toLocaleDateString('tr-TR')}
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
                                  <Button variant="ghost" size="sm">
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

      {/* View Assignment Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Atama Detayları</DialogTitle>
            <DialogDescription>
              Hizmet atama bilgilerini görüntüleyin
            </DialogDescription>
          </DialogHeader>
          {viewingAssignment && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Hizmet Bilgileri</h4>
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium">{viewingAssignment.serviceName}</p>
                    <p className="text-sm text-muted-foreground">{viewingAssignment.companyName}</p>
                    <Badge variant="outline" className="mt-1">
                      {getCategoryLabel(viewingAssignment.serviceCategory)}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Hizmet Noktası Bilgileri</h4>
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium">{viewingAssignment.locationName}</p>
                    <p className="text-sm text-muted-foreground">{viewingAssignment.managerName}</p>
                    <Badge variant="outline" className="mt-1">
                      {getFacilityTypeLabel(viewingAssignment.locationType)}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Atama Bilgileri</h4>
                <div className="p-3 border rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Atama Tarihi:</span>
                    <span className="text-sm">{viewingAssignment.assignedAt.toLocaleDateString('tr-TR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Durum:</span>
                    <Badge variant={viewingAssignment.isActive ? "default" : "secondary"}>
                      {viewingAssignment.isActive ? "Aktif" : "Pasif"}
                    </Badge>
                  </div>
                  {viewingAssignment.notes && (
                    <div>
                      <span className="text-sm text-muted-foreground">Notlar:</span>
                      <p className="text-sm mt-1">{viewingAssignment.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Assignment Modal */}
      {/* Assignment Edit Modal */}
      <AssignmentEditModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        assignment={editingAssignment}
      />
    </div>
  );
}