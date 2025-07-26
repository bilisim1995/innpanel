"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { getServices, ServiceData } from '@/lib/services';
import { getLocations, LocationData } from '@/lib/locations';
import { getAssignments, saveAssignment, deleteAssignment, AssignmentData } from '@/lib/assignments';
import { Plus, Trash2, Link as LinkIcon } from 'lucide-react';
import { Combobox, ComboboxOption } from '@/components/ui/combobox';
import Link from 'next/link';

export default function AssignServicesPage() {
  const { toast } = useToast();
  const [services, setServices] = useState<ServiceData[]>([]);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [assignments, setAssignments] = useState<AssignmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<ComboboxOption | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<ComboboxOption | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [servicesData, locationsData, assignmentsData] = await Promise.all([
        getServices(),
        getLocations(),
        getAssignments(),
      ]);
      setServices(servicesData);
      setLocations(locationsData);
      setAssignments(assignmentsData);
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Veriler yüklenirken bir sorun oluştu.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const serviceOptions = useMemo(() =>
    services.map(s => ({ value: s.id!, label: `${s.serviceName} (${s.category})` }))
  , [services]);

  const locationOptions = useMemo(() =>
    locations.map(l => ({ value: l.id!, label: `${l.name} (${l.type})` }))
  , [locations]);

  const handleAssignService = async () => {
    if (!selectedService || !selectedLocation) {
      toast({
        title: 'Eksik Bilgi',
        description: 'Lütfen bir hizmet ve hizmet noktası seçin.',
        variant: 'destructive',
      });
      return;
    }

    const service = services.find(s => s.id === selectedService.value);
    const location = locations.find(l => l.id === selectedLocation.value);

    if (!service || !location) {
      toast({
        title: 'Hata',
        description: 'Seçilen hizmet veya hizmet noktası bulunamadı.',
        variant: 'destructive',
      });
      return;
    }

    setIsAssigning(true);
    try {
      const newAssignment: Omit<AssignmentData, 'id' | 'assignedAt'> = {
        serviceId: service.id!,
        serviceName: service.serviceName,
        serviceCategory: service.category,
        companyName: service.companyName,
        locationId: location.id!,
        locationName: location.name,
        locationType: location.type,
        locationSlug: location.slug,
        managerName: location.managerName || "",
        isActive: true,
        pricingSettings: {
          prepaymentEnabled: false,
          paymentMethods: {
            fullPayment: true,
            prePayment: false,
            fullAtLocation: false,
          },
          dateRanges: [],
        }
      };
      
      await saveAssignment(newAssignment);

      toast({
        title: 'Başarılı',
        description: `${service.serviceName} hizmeti ${location.name} noktasına atandı.`,
      });
      setSelectedService(null);
      setSelectedLocation(null);
      loadInitialData();
    } catch (error) {
       toast({
        title: 'Atama Başarısız',
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    try {
      await deleteAssignment(id);
      toast({
        title: 'Başarılı',
        description: 'Atama başarıyla silindi.',
      });
      loadInitialData();
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Atama silinirken bir sorun oluştu.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hizmet Ata</CardTitle>
          <CardDescription>
            Bir hizmeti, hizmet verilecek bir noktaya atayın. Atama sonrası fiyat ve zamanlama ayarlarını yapabilirsiniz.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="text-sm font-medium mb-1 block">Hizmet Seç</label>
            <Combobox
              options={serviceOptions}
              value={selectedService}
              onChange={setSelectedService}
              placeholder="Hizmet ara..."
              emptyMessage="Hizmet bulunamadı."
            />
          </div>
          <div className="flex-1 w-full">
            <label className="text-sm font-medium mb-1 block">Hizmet Noktası Seç</label>
             <Combobox
              options={locationOptions}
              value={selectedLocation}
              onChange={setSelectedLocation}
              placeholder="Hizmet noktası ara..."
              emptyMessage="Hizmet noktası bulunamadı."
            />
          </div>
          <Button onClick={handleAssignService} disabled={isAssigning || !selectedService || !selectedLocation}>
            <Plus className="mr-2 h-4 w-4" />
            {isAssigning ? 'Atanıyor...' : 'Ata'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mevcut Atamalar</CardTitle>
          <CardDescription>
            Yapılmış olan tüm hizmet atamalarını buradan yönetebilirsiniz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hizmet Adı</TableHead>
                  <TableHead>Hizmet Noktası</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Atama Tarihi</TableHead>
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
                ) : assignments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Henüz hiç atama yapılmamış.
                    </TableCell>
                  </TableRow>
                ) : (
                  assignments.map(assignment => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">{assignment.serviceName}</TableCell>
                      <TableCell>{assignment.locationName}</TableCell>
                      <TableCell>{assignment.serviceCategory}</TableCell>
                      <TableCell>{new Date(assignment.assignedAt).toLocaleDateString('tr-TR')}</TableCell>
                       <TableCell>{assignment.isActive ? 'Aktif' : 'Pasif'}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/dashboard/assignments/${assignment.id}/edit`}>
                           <Button variant="outline" size="sm">
                              <LinkIcon className="h-4 w-4" />
                           </Button>
                        </Link>
                         <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive">
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
                                onClick={() => handleDeleteAssignment(assignment.id!)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Sil
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}