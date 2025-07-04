'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { getReservations } from "@/lib/reservations";
import { getServices } from "@/lib/services";
import { getLocations } from "@/lib/locations";
import { getAssignments } from "@/lib/assignments";
import { Building2, MapPin, Calendar, Users, CreditCard, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    reservations: {
      total: 0,
      pending: 0,
      confirmed: 0,
      cancelled: 0,
      completed: 0
    },
    services: {
      total: 0,
      active: 0
    },
    locations: {
      total: 0,
      active: 0
    },
    assignments: {
      total: 0,
      active: 0
    },
    revenue: {
      total: 0,
      commission: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const [reservations, services, locations, assignments] = await Promise.all([
          getReservations(),
          getServices(),
          getLocations(),
          getAssignments()
        ]);

        setStats({
          reservations: {
            total: reservations.length,
            pending: reservations.filter(r => r.status === 'pending').length,
            confirmed: reservations.filter(r => r.status === 'confirmed').length,
            cancelled: reservations.filter(r => r.status === 'cancelled').length,
            completed: reservations.filter(r => r.status === 'completed').length
          },
          services: {
            total: services.length,
            active: services.filter(s => s.isActive).length
          },
          locations: {
            total: locations.length,
            active: locations.filter(l => l.isActive).length
          },
          assignments: {
            total: assignments.length,
            active: assignments.filter(a => a.isActive).length
          },
          revenue: {
            total: reservations.reduce((sum, r) => sum + r.totalAmount, 0),
            commission: reservations.reduce((sum, r) => sum + (r.commissionAmount || 0), 0)
          }
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Hoş Geldiniz</h1>
      <p className="text-muted-foreground">INN Panel yönetim sistemi ana sayfası</p>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Rezervasyon İstatistikleri */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam Rezervasyon
            </CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.reservations.total}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600 font-medium">{stats.reservations.confirmed}</span> onaylı, 
                  <span className="text-yellow-600 font-medium"> {stats.reservations.pending}</span> beklemede
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Toplam Gelir */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam Gelir
            </CardTitle>
            <CreditCard className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">
                  {stats.revenue.total.toLocaleString('tr-TR')} ₺
                </div>
                <p className="text-xs text-muted-foreground">
                  Komisyon: <span className="text-blue-600 font-medium">{stats.revenue.commission.toLocaleString('tr-TR')} ₺</span>
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Aktif Hizmetler */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aktif Hizmetler
            </CardTitle>
            <Building2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.services.active}</div>
                <p className="text-xs text-muted-foreground">
                  Toplam {stats.services.total} hizmet içerisinde
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Hizmet Noktaları */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Hizmet Noktaları
            </CardTitle>
            <MapPin className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.locations.active}</div>
                <p className="text-xs text-muted-foreground">
                  Aktif hizmet noktası sayısı
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* İkinci Satır */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Hizmet Atamaları */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Hizmet Atamaları</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.assignments.active}</div>
                <p className="text-xs text-muted-foreground">
                  Aktif atama sayısı (Toplam: {stats.assignments.total})
                </p>
                <div className="mt-2 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Atama Oranı</span>
                    <span className="text-sm font-medium">
                      {stats.services.total > 0 
                        ? Math.round((stats.assignments.total / stats.services.total) * 100) 
                        : 0}%
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Ortalama Rezervasyon Değeri */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Rezervasyon Değeri</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">
                  {stats.reservations.total > 0 
                    ? Math.round(stats.revenue.total / stats.reservations.total).toLocaleString('tr-TR')
                    : 0} ₺
                </div>
                <p className="text-xs text-muted-foreground">
                  Rezervasyon başına ortalama gelir
                </p>
                <div className="mt-2 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Ortalama Komisyon</span>
                    <span className="text-sm font-medium text-blue-600">
                      {stats.reservations.total > 0 
                        ? Math.round(stats.revenue.commission / stats.reservations.total).toLocaleString('tr-TR')
                        : 0} ₺
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}