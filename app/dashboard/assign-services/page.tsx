"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Eye, Edit, Trash2, Link as LinkIcon, Building2, MapPin, Users, Calendar, Clock, CreditCard, Settings, Package, Tag, Coins, Check, X, Filter } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [filterService, setFilterService] = useState<string>("all");
  const [filterLocation, setFilterLocation] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedAssignmentIds, setSelectedAssignmentIds] = useState<Set<string>>(new Set());
  const [selectedServices, setSelectedServices] = useState<ServiceData[]>([]);
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
      "motor-tours": "Aktiviteler",
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

  const toggleServiceSelection = (service: ServiceData) => {
    setSelectedServices(prev => {
      const isSelected = prev.some(s => s.id === service.id);
      if (isSelected) {
        return prev.filter(s => s.id !== service.id);
      }
      return [...prev, service];
    });
  };

  const handleAssign = async () => {
    if (selectedServices.length === 0 || !selectedLocation) {
      toast({
        title: "Eksik Seçim",
        description: "Lütfen en az bir hizmet ve bir hizmet noktası seçin.",
        variant: "destructive",
      });
      return;
    }

    setIsAssigning(true);
    try {
      let successCount = 0;
      let skippedCount = 0;

      for (const service of selectedServices) {
        const alreadyExists = assignments.some(
          a => a.serviceId === service.id && a.locationId === selectedLocation.id
        );

        if (alreadyExists) {
          skippedCount++;
          continue;
        }

        const newAssignment: Omit<AssignmentData, 'id' | 'assignedAt'> = {
          serviceId: service.id!,
          serviceName: service.serviceName,
          companyName: service.companyName,
          serviceCategory: service.category,
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
        successCount++;
      }

      if (successCount > 0 && skippedCount > 0) {
        toast({
          title: "Atama Tamamlandı",
          description: `${successCount} hizmet başarıyla atandı, ${skippedCount} hizmet zaten atanmış olduğu için atlandı.`,
        });
      } else if (successCount > 0) {
        toast({
          title: "Başarılı",
          description: `${successCount} hizmet başarıyla atandı.`,
        });
      } else {
        toast({
          title: "Mevcut Atama",
          description: "Seçilen tüm hizmetler bu noktaya zaten atanmış.",
          variant: "destructive",
        });
      }

      setSelectedServices([]);
      setSelectedLocation(null);
      await loadData();
      if (successCount > 0) setActiveTab("manage");

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
      setSelectedAssignmentIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
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

  const handleDeleteSelectedAssignments = async () => {
    const ids = Array.from(selectedAssignmentIds);
    if (ids.length === 0) return;
    try {
      for (const id of ids) {
        await deleteAssignment(id);
      }
      toast({
        title: "Başarılı",
        description: `${ids.length} atama başarıyla silindi`,
      });
      setSelectedAssignmentIds(new Set());
      loadData();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Atamalar silinirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  const toggleAssignmentSelection = (id: string) => {
    setSelectedAssignmentIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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

  const searchFilteredAssignments = assignments.filter(assignment =>
    assignment.serviceName.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
    assignment.locationName.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
    assignment.companyName.toLowerCase().includes(assignmentSearch.toLowerCase())
  );

  const filteredAssignments = searchFilteredAssignments.filter(assignment => {
    if (filterService !== "all" && assignment.serviceName !== filterService) return false;
    if (filterLocation !== "all" && assignment.locationName !== filterLocation) return false;
    if (filterCategory !== "all" && assignment.serviceCategory !== filterCategory) return false;
    if (filterStatus === "active" && !assignment.isActive) return false;
    if (filterStatus === "inactive" && assignment.isActive) return false;
    return true;
  });

  const uniqueServiceNames = Array.from(new Set(assignments.map(a => a.serviceName))).sort();
  const uniqueLocationNames = Array.from(new Set(assignments.map(a => a.locationName))).sort();
  const categoryOptions = [
    { value: "region-tours", label: "Bölge Turları" },
    { value: "motor-tours", label: "Aktiviteler" },
    { value: "balloon", label: "Sıcak Balon" },
    { value: "transfer", label: "Transfer" },
    { value: "other", label: "Diğer" },
  ];

  const toggleAllAssignmentsSelection = (checked: boolean) => {
    if (checked) {
      setSelectedAssignmentIds(new Set(filteredAssignments.map(a => a.id!).filter(Boolean)));
    } else {
      setSelectedAssignmentIds(new Set());
    }
  };

  const isAllFilteredSelected = filteredAssignments.length > 0 && filteredAssignments.every(a => a.id && selectedAssignmentIds.has(a.id));
  const isSomeFilteredSelected = filteredAssignments.some(a => a.id && selectedAssignmentIds.has(a.id));

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
                <CardTitle className="flex items-center justify-between">
                  <span>Hizmet Seç</span>
                  {selectedServices.length > 0 && (
                    <Badge variant="default" className="text-xs">
                      {selectedServices.length} hizmet seçildi
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>Atamak istediğiniz hizmetleri listeden seçin. Birden fazla seçebilirsiniz.</CardDescription>
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
                  {filteredServices.length > 0 ? filteredServices.map((service) => {
                    const isSelected = selectedServices.some(s => s.id === service.id);
                    return (
                      <button
                        key={service.id}
                        onClick={() => toggleServiceSelection(service)}
                        className={cn(
                          "w-full text-left p-3 rounded-lg border transition-colors flex items-start gap-3",
                          isSelected
                            ? "bg-primary/10 border-primary"
                            : "hover:bg-muted/50"
                        )}
                      >
                        <div className={cn(
                          "mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                          isSelected ? "bg-primary border-primary" : "border-gray-300"
                        )}>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold">{service.serviceName}</p>
                          <p className="text-sm text-muted-foreground">{service.companyName}</p>
                          <Badge variant="outline" className="mt-1">{getCategoryLabel(service.category)}</Badge>
                        </div>
                      </button>
                    );
                  }) : <p className="text-sm text-muted-foreground text-center py-4">Aktif hizmet bulunamadı.</p>}
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
              <CardDescription>Seçilen hizmetleri ve hizmet noktasını kontrol edip atamayı tamamlayın.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Seçilen Hizmetler ({selectedServices.length})</h4>
                  {selectedServices.length > 0 ? (
                    <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                      {selectedServices.map((service) => (
                        <div key={service.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50 border">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">{service.serviceName}</p>
                            <p className="text-xs text-muted-foreground truncate">{service.companyName}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={() => toggleServiceSelection(service)}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Hizmet seçilmedi</p>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Seçilen Hizmet Noktası</h4>
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
                    disabled={selectedServices.length === 0 || !selectedLocation || isAssigning}
                  >
                    {isAssigning ? "Atanıyor..." : selectedServices.length > 1 ? `${selectedServices.length} Hizmeti Ata` : "Hizmeti Ata"}
                    <LinkIcon className="ml-2 h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Atamayı Onayla</AlertDialogTitle>
                    <AlertDialogDescription>
                      {selectedServices.length === 1
                        ? `${selectedServices[0].serviceName} hizmetini ${selectedLocation?.name} noktasına atamak istediğinizden emin misiniz?`
                        : `${selectedServices.length} hizmeti ${selectedLocation?.name} noktasına atamak istediğinizden emin misiniz?`
                      }
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
              <div className="flex items-center gap-2 pt-2 flex-wrap">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Atama ara..."
                  value={assignmentSearch}
                  onChange={(e) => setAssignmentSearch(e.target.value)}
                  className="max-w-sm"
                />
                {selectedAssignmentIds.size > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Seçilileri Sil ({selectedAssignmentIds.size})
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Seçili Atamaları Sil</AlertDialogTitle>
                        <AlertDialogDescription>
                          {selectedAssignmentIds.size} atamayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteSelectedAssignments}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Sil
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <div className="flex flex-col gap-1.5">
                          <Checkbox
                            checked={
                              isAllFilteredSelected
                                ? true
                                : isSomeFilteredSelected
                                  ? "indeterminate"
                                  : false
                            }
                            onCheckedChange={(checked) => toggleAllAssignmentsSelection(checked === true)}
                            aria-label="Tümünü seç"
                          />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex flex-col gap-1.5">
                          <span>Hizmet</span>
                          <Select value={filterService} onValueChange={setFilterService}>
                            <SelectTrigger className="h-8 w-full max-w-[180px]">
                              <Filter className="h-3.5 w-3.5 mr-1 opacity-70" />
                              <SelectValue placeholder="Filtrele" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Tümü</SelectItem>
                              {uniqueServiceNames.map(name => (
                                <SelectItem key={name} value={name}>{name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex flex-col gap-1.5">
                          <span>Hizmet Noktası</span>
                          <Select value={filterLocation} onValueChange={setFilterLocation}>
                            <SelectTrigger className="h-8 w-full max-w-[180px]">
                              <Filter className="h-3.5 w-3.5 mr-1 opacity-70" />
                              <SelectValue placeholder="Filtrele" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Tümü</SelectItem>
                              {uniqueLocationNames.map(name => (
                                <SelectItem key={name} value={name}>{name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex flex-col gap-1.5">
                          <span>Kategori</span>
                          <Select value={filterCategory} onValueChange={setFilterCategory}>
                            <SelectTrigger className="h-8 w-full max-w-[160px]">
                              <Filter className="h-3.5 w-3.5 mr-1 opacity-70" />
                              <SelectValue placeholder="Filtrele" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Tümü</SelectItem>
                              {categoryOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex flex-col gap-1.5">
                          <span>Durum</span>
                          <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="h-8 w-full max-w-[120px]">
                              <Filter className="h-3.5 w-3.5 mr-1 opacity-70" />
                              <SelectValue placeholder="Filtrele" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Tümü</SelectItem>
                              <SelectItem value="active">Aktif</SelectItem>
                              <SelectItem value="inactive">Pasif</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssignments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          {assignmentSearch || filterService !== "all" || filterLocation !== "all" || filterCategory !== "all" || filterStatus !== "all"
                            ? "Arama ve filtre kriterlerine uygun atama bulunamadı"
                            : "Henüz atama yapılmamış"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAssignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell className="w-12">
                            <Checkbox
                              checked={assignment.id ? selectedAssignmentIds.has(assignment.id) : false}
                              onCheckedChange={() => assignment.id && toggleAssignmentSelection(assignment.id)}
                              aria-label={`${assignment.serviceName} atamasını seç`}
                            />
                          </TableCell>
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
