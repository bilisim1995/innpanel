"use client";

import { useState, useEffect, useCallback } from "react";
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
} from "@/components/ui/dialog";
import { getServices, ServiceData } from "@/lib/services";
import { getLocations, LocationData } from "@/lib/locations";
import { saveAssignment, getAssignments, deleteAssignment, AssignmentData } from "@/lib/assignments";
import { useToast } from "@/hooks/use-toast";
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

      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
      </Dialog>

      <AssignmentEditModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        assignment={editingAssignment}
      />
    </div>
  );
}
