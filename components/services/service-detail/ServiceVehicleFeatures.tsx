"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ServiceData } from "@/lib/services";
import { CarFront, ChevronDown, ChevronUp } from 'lucide-react';

interface ServiceVehicleFeaturesProps {
  service: ServiceData;
  theme: any;
}

export function ServiceVehicleFeatures({
  service,
  theme,
}: ServiceVehicleFeaturesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const backgroundColor = theme?.customStyle?.backgroundColor || '#dc2626';
  const textColor = theme?.customStyle?.backgroundColor || '#dc2626';

  // Check if categoryDetails, vehicleDetails and features exists
  if (!service.categoryDetails?.vehicleDetails?.features) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card
        className="backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-500 animate-in fade-in-0 slide-in-from-left-4 delay-300 border-2"
        style={{
          backgroundColor: `${textColor}10`,
          borderColor: `${textColor}20`,
        }}
      >
        <CollapsibleTrigger asChild>
          <CardHeader className="relative overflow-hidden cursor-pointer hover:bg-white/20 transition-colors duration-200">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full -translate-y-10 translate-x-10"></div>
            <CardTitle
              className="flex items-center justify-between relative z-10 text-lg"
              style={{ color: textColor }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md animate-pulse"
                  style={{ background: backgroundColor }}
                >
                  <CarFront className="h-5 w-5 text-white" />
                </div>
                Araç Özellikleri
              </div>
              {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>
            {/* Değişiklik burada yapıldı */}
            <p
              className="leading-relaxed font-medium text-lg"
              style={{ color: 'red', fontFamily: 'Helvetica, Arial, sans-serif', fontSize: '1.1rem' }}
            >
              {service.categoryDetails.vehicleDetails.features}
            </p>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}