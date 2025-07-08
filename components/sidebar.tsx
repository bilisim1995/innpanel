"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  LayoutDashboard,
  MapPin,
  Car,
  Calendar,
  BarChart3,
  Settings,
  Users,
  FileText,
  ChevronLeft,
  ChevronRight,
  Cog
} from "lucide-react";


const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Hizmetler",
    href: "/dashboard/services",
    icon: Building2,
  },
  {
    name: "Hizmet Noktaları",
    href: "/dashboard/locations",
    icon: MapPin,
  },
  {
    name: "Hizmet Atamaları",
    href: "/dashboard/assign-services",
    icon: Users,
  },
  {
    name: "Rezervasyonlar",
    href: "/dashboard/reservations",
    icon: Calendar,
  },
  {
    name: "Raporlar",
    href: "/dashboard/reports",
    icon: BarChart3,
  },
  {
    name: "Ayarlar",
    href: "/dashboard/profile",
    icon: Cog,
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-card border-r transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">Inn Panel</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 p-0"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-10",
                    collapsed && "justify-center px-2",
                    isActive && "bg-primary/10 text-primary hover:bg-primary/20"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && (
                    <span className="truncate">{item.name}</span>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      {!collapsed && (
        <>
          <Separator />
          <div className="p-4">
            <div className="text-xs text-muted-foreground text-center">
              Inn Management System
            </div>
          </div>
        </>
      )}
    </div>
  );
}